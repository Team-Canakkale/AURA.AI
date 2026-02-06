# 🩸 Blood Analysis Service - AURA.AI Integration

## Overview

Advanced blood test analysis using Machine Learning and OpenAI for personalized diet recommendations.

## Architecture

```
AURA.AI/
└── apps/
    ├── backend-blood-analysis/  # Python FastAPI (Port 4004)
    │   ├── main.py              # ML + OpenAI integration
    │   ├── blood_analysis_model.h5
    │   ├── scaler.pkl
    │   ├── label_encoder.pkl
    │   └── requirements.txt
    └── frontend/
        └── public/
            └── blood-analysis.html  # Standalone UI
```

## Installation

### 1. Install Python Dependencies

```bash
cd apps/backend-blood-analysis
pip install -r requirements.txt
```

### 2. Configure Environment

Create `apps/backend-blood-analysis/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Running

### Start Backend Only

```bash
npm run dev:blood-analysis
```

Or manually:

```bash
cd apps/backend-blood-analysis
python -m uvicorn main:app --port 4004 --reload
```

### Start All Services

```bash
npm run dev
```

## API Endpoints

### POST /analyze

Analyzes blood test PDF/image and returns diagnosis + diet plan.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF, JPG, PNG)

**Response:**
```json
{
  "diagnosis": "Anemia",
  "probability": "89.23%",
  "extracted_values": {
    "WBC": 7.2,
    "RBC": 3.8,
    "HGB": 10.5,
    ...
  },
  "diet_plan": "**Genel Durum Değerlendirmesi**:..."
}
```

## Accessing the UI

### Option 1: Standalone HTML

Open directly: `http://localhost:3000/blood-analysis.html`

### Option 2: Integrate into React App

Create a new React page or add to existing Health Dashboard.

## Features

- ✅ **EasyOCR** - Turkish & English text extraction
- ✅ **ML Model** - Keras Sequential (85% accuracy)
- ✅ **OpenAI GPT-4-mini** - Personalized diet recommendations
- ✅ **PDF & Image Support** - Multi-page PDF processing
- ✅ **Premium UI** - Glassmorphism dark theme

## Technology Stack

- **Backend**: Python, FastAPI, TensorFlow, EasyOCR
- **AI**: OpenAI GPT-4-mini
- **ML**: Keras, scikit-learn
- **OCR**: EasyOCR
- **PDF**: PyMuPDF (fitz)

## Port Allocation

| Service | Port |
|---------|------|
| Frontend | 3000 |
| Finance | 4001 |
| Habit | 4002 |
| Health | 4003 |
| **Blood Analysis (NEW)** | **4004** |

## Testing

1. Start backend: `npm run dev:blood-analysis`
2. Open: `http://localhost:3000/blood-analysis.html`
3. Upload a blood test PDF
4. View diagnosis + diet recommendations

## Notes

- First OCR run downloads models (~30-60s)
- Requires active internet for OpenAI API
- Only non-zero blood values sent to GPT
- Diet plan generation adds ~2-5s latency
