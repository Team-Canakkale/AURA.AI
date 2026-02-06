# Backend Blood Analysis Service

Python-based blood analysis service with ML model and OpenAI integration.

## Installation

```bash
pip install -r requirements.txt
```

## Running

```bash
python -m uvicorn main:app --port 4004 --reload
```

## API Endpoints

### POST /analyze
Analyzes blood test PDF/image and returns diagnosis + diet plan.

**Request:**
- Multipart form data with `file` field

**Response:**
```json
{
  "diagnosis": "Disease name",
  "probability": "95.23%",
  "extracted_values": {
    "WBC": 7.2,
    "RBC": 4.5,
    ...
  },
  "diet_plan": "Personalized recommendations..."
}
```

## Environment Variables

Create `.env` file:
```
OPENAI_API_KEY=your_key_here
```

## Files

- `main.py` - FastAPI application
- `blood_analysis_model.h5` - Trained Keras model
- `scaler.pkl` - Feature scaler
- `label_encoder.pkl` - Label encoder
- `class_names.json` - Disease class mappings
