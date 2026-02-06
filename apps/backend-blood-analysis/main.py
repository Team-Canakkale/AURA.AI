import os
# Disable OneDNN/MKLDNN optimizations
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager
import uvicorn
import numpy as np
# Removed tensorflow as it causes segfaults on Python 3.13 Mac
import joblib
import cv2
import re
import json
import fitz  # PyMuPDF
import easyocr
from openai import OpenAI

# Global variables
models = {}
ocr = None

REQUIRED_PARAMS = [
    'WBC', 'LYMp', 'NEUTp', 'LYMn', 'NEUTn', 'RBC', 'HGB', 
    'HCT', 'MCV', 'MCH', 'MCHC', 'PLT', 'PDW', 'PCT'
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load minimal artifacts (no heavy TF models)
    print("Loading OCR and artifacts...")
    global ocr
    try:
        # Initialize EasyOCR
        print("Initializing EasyOCR...")
        # Note: GPU=False because we are on Mac and want stability
        ocr = easyocr.Reader(['tr', 'en'], gpu=False) 
        print("EasyOCR initialized.")
        
    except Exception as e:
        print(f"Error during startup: {e}")
        # Don't fail the whole app if OCR fails, just log it
        
    yield
    models.clear()

app = FastAPI(lifespan=lifespan)

# Add CORS Middleware
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_value(val_str):
    """
    Cleans a numeric string: replaces ',' with '.', removes non-numeric chars except dot/minus.
    """
    if not val_str:
        return 0.0
    # Replace comma with dot
    val_str = val_str.replace(',', '.')
    # Keep only digits, dot, minus
    val_str = re.sub(r'[^\d.-]', '', val_str)
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def parse_ocr_output(ocr_result):
    """
    Parses OCR output (list of text blocks) to find required blood values.
    EasyOCR returns: [([[x1,y1],[x2,y2],...], text, confidence), ...]
    """
    if not ocr_result:
        return {param: 0.0 for param in REQUIRED_PARAMS}

    # Extract all text from EasyOCR result
    all_text = []
    for item in ocr_result:
        if len(item) >= 2:
            all_text.append(item[1])  # item[1] is the text
    
    full_text = " ".join(all_text)
    print(f"OCR Full Text: {full_text}") # Debug log

    extracted_values = {}
    
    for param in REQUIRED_PARAMS:
        pattern = r'(?:^|\s)' + re.escape(param) + r'[.:\s]+(\d+[.,]?\d*)'
        match = re.search(pattern, full_text, re.IGNORECASE)
        
        if match:
            value_str = match.group(1)
            value = clean_value(value_str)
            extracted_values[param] = value
        else:
            extracted_values[param] = 0.0
            
    return extracted_values

def generate_diet_plan(diagnosis: str, extracted_values: dict) -> str:
    """
    Generates a personalized diet plan using OpenAI GPT-4-mini
    based on diagnosis and blood test values.
    """
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Filter out zero values (not detected by OCR)
        valid_values = {param: value for param, value in extracted_values.items() if value > 0}
        
        # Format blood values for the prompt (only non-zero values)
        if not valid_values:
            return "Kan değerleri okunamadı. Lütfen daha net bir görüntü yükleyin."
        
        values_str = "\n".join([f"- {param}: {value}" for param, value in valid_values.items()])
        
        # Create prompt for GPT
        prompt = f"""Sen bir tıbbi beslenme uzmanısın. Aşağıdaki kan tahlili sonuçlarına göre kişiye özel bir diyet listesi oluştur.

Teşhis: {diagnosis}

Kan Değerleri:
{values_str}

Lütfen şu formatta bir cevap ver:
1. **Genel Durum Değerlendirmesi**: Kan değerlerinin genel yorumu
2. **Önerilen Besinler**: Hangi besinleri tüketmeli (en az 5 örnek)
3. **Kaçınılması Gerekenler**: Hangi besinlerden kaçınmalı (en az 3 örnek)
4. **Günlük Örnek Menü**: Kahvaltı, öğle, akşam için basit öneriler
5. **Ek Tavsiyeler**: Yaşam tarzı ve diğer öneriler

Yanıtını Türkçe ve anlaşılır bir dille ver."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # GPT-4-mini
            messages=[
                {"role": "system", "content": "Sen yardımsever bir tıbbi beslenme uzmanısın. Kan tahlili sonuçlarına göre kişiye özel diyet tavsiyeleri veriyorsun."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        diet_plan = response.choices[0].message.content
        return diet_plan
        
    except Exception as e:
        print(f"OpenAI Error: {str(e)}")
        return f"Diyet planı oluşturulurken hata oluştu: {str(e)}"

@app.post("/analyze")
async def analyze_blood_test(file: UploadFile = File(...)):
    if not ocr:
        raise HTTPException(status_code=500, detail="OCR Model not initialized")

    try:
        raw_filename = file.filename
        content_type = file.content_type
        contents = await file.read()
        
        print(f"DEBUG: Filename: {raw_filename}, Type: {content_type}, Size: {len(contents)}")
        
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Detect File Type via Magic Bytes, Extension, and Mime Type
        is_pdf = False
        if contents.startswith(b'%PDF'):
            is_pdf = True
            print("DEBUG: Detected PDF via Magic Bytes")
        elif raw_filename and raw_filename.lower().endswith('.pdf'):
             is_pdf = True
             print("DEBUG: Detected PDF via Extension")
        elif content_type == 'application/pdf':
             is_pdf = True
             print("DEBUG: Detected PDF via Content-Type")
             
        ocr_results = []
        
        if is_pdf:
            print("Processing as PDF...")
            try:
                doc = fitz.open(stream=contents, filetype="pdf")
                if doc.page_count == 0:
                     raise HTTPException(status_code=400, detail="PDF has 0 pages.")
                     
                for page_num in range(len(doc)):
                    print(f"Processing PDF page {page_num + 1}/{len(doc)}")
                    page = doc.load_page(page_num)
                    # Increase zoom for better OCR?
                    # default is 72 dpi. Let's do 2.0 zoom (144 dpi) -> better OCR
                    mat = fitz.Matrix(2, 2) 
                    pix = page.get_pixmap(matrix=mat)
                    
                    # Convert to numpy array safely
                    # pix.samples is bytes
                    img_data = np.frombuffer(pix.samples, dtype=np.uint8)
                    
                    if pix.n == 4: # RGBA
                        img_data = img_data.reshape(pix.h, pix.w, 4)
                        img_data = cv2.cvtColor(img_data, cv2.COLOR_RGBA2BGR)
                    elif pix.n == 3: # RGB
                        img_data = img_data.reshape(pix.h, pix.w, 3)
                        img_data = cv2.cvtColor(img_data, cv2.COLOR_RGB2BGR)
                    elif pix.n == 1: # Gray
                        img_data = img_data.reshape(pix.h, pix.w, 1)
                        img_data = cv2.cvtColor(img_data, cv2.COLOR_GRAY2BGR)
                    else:
                        print(f"Warning: Unknown pixmap format n={pix.n}")
                        continue # Skip weird formats
                    
                    # Run OCR on this page (EasyOCR)
                    result = ocr.readtext(img_data) 
                    if result:
                        ocr_results.extend(result)
            except Exception as pdf_err:
                print(f"PDF Processing Error: {pdf_err}")
                raise HTTPException(status_code=400, detail=f"Corrupt or unreadable PDF: {str(pdf_err)}")
                
        else:
            # Handle Image
            print("Processing as Image...")
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                # Debug info
                header_hex = contents[:10].hex()
                msg = f"Invalid file format. Filename: {raw_filename}, Type: {content_type}, Magic: {header_hex}. Please upload JPG, PNG, or PDF."
                print(f"ERROR: {msg}")
                raise HTTPException(status_code=400, detail=msg)

            # Run OCR (EasyOCR)
            result = ocr.readtext(img)
            if result:
                ocr_results.extend(result)
        
        # 2. Parsing
        if not ocr_results:
             print("Warning: No text found in OCR results.")
             
        parsed_data = parse_ocr_output(ocr_results)
        print("Parsed Data:", parsed_data)
        
        # 3. AI Analysis (Diagnosis & Insight)
        # Using LLM to interpret the values since local model is unavailable/unstable
        print("Interpreting blood values with AI...")
        
        try:
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            # Format results for the LLM
            detected_values = {k: v for k, v in parsed_data.items() if v > 0}
            formatted_values = json.dumps(detected_values, indent=2)
            
            # 3.1. Get Diagnosis
            diag_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional medical analyst. Given blood test values, provide a one-word or short phrase diagnosis (e.g., Anemia, Normal, Infection)."},
                    {"role": "user", "content": f"Values:\n{formatted_values}"}
                ],
                max_tokens=10
            )
            predicted_class_name = diag_response.choices[0].message.content.strip() or "Değerlendirilemedi"
            
            # 4. Generate Diet Plan
            diet_plan = generate_diet_plan(predicted_class_name, parsed_data)
            
            return {
                "diagnosis": predicted_class_name,
                "probability": "AI Interpretation",
                "extracted_values": parsed_data,
                "diet_plan": diet_plan
            }
        except Exception as ai_err:
            print(f"AI Analysis error: {ai_err}")
            return {
                "diagnosis": "Analiz Yapılamadı",
                "probability": "Error",
                "extracted_values": parsed_data,
                "diet_plan": f"Hata: {str(ai_err)}"
            }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=4004, reload=True)
