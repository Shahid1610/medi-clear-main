# HealthSense AI Backend

FastAPI backend for HealthSense AI medical assistant application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your environment variables to `.env`:
- `GOOGLE_API_KEY`: Your Google Gemini API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key

## Running the Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Symptom Checker
- `POST /api/v1/symptoms/analyze` - Analyze symptoms with AI

### Medical Records
- `POST /api/v1/records/upload` - Upload medical record
- `GET /api/v1/records` - List medical records
- `GET /api/v1/records/{record_id}` - Get record details

### Report Analysis
- `POST /api/v1/reports/explain` - Get AI explanation of report
- `GET /api/v1/reports/{record_id}/trends` - Get health trends

### Chat
- `POST /api/v1/chat/ask` - Ask health-related question
- `GET /api/v1/chat/history/{session_id}` - Get chat history

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## Implementation Notes

All endpoint handlers contain TODO comments indicating where to implement:
1. Gemini AI integration for symptom analysis and report explanations
2. File upload processing and OCR
3. Database queries using Supabase
4. Medical value parsing and analysis
5. Trend calculation and forecasting

## Directory Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Example environment variables
├── data/                  # Data storage
│   ├── uploads/          # Uploaded files
│   └── storage/          # Processed data
└── app/
    └── api/
        └── v1/           # API version 1 endpoints
            ├── symptom_checker.py
            ├── records.py
            ├── reports.py
            ├── chat.py
            └── dashboard.py
```

## Next Steps

To complete the backend implementation:

1. Add Gemini AI integration in each endpoint
2. Implement file processing (PDF extraction, OCR)
3. Add Supabase database queries
4. Implement medical value parsing logic
5. Add authentication middleware
6. Implement file storage management
7. Add error handling and logging
8. Add input validation
9. Implement rate limiting
10. Add unit tests
