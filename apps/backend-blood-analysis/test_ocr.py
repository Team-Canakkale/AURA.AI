import easyocr
print("Starting EasyOCR initialization...")
reader = easyocr.Reader(['tr', 'en'], gpu=False)
print("EasyOCR initialized successfully!")
