import os
import re
import json
import uuid
import shutil
import fitz  # PyMuPDF for PDF text extraction
from PIL import Image # For image handling
import pytesseract # For OCR (Ensure tesseract is installed on your system/container)
from io import BytesIO
from datetime import datetime, date
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx

# --- Configuration & Initialization ---
LOCAL_STORAGE_DIR = "medical_records_storage"
RECORDS_DIR = os.path.join(LOCAL_STORAGE_DIR, "files")
DATABASE_FILE = os.path.join(LOCAL_STORAGE_DIR, "records_db.json")
MAX_FILE_SIZE_MB = 10

# GLM configuration via OpenRouter
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Create storage directories if they don't exist
Path(LOCAL_STORAGE_DIR).mkdir(parents=True, exist_ok=True)
Path(RECORDS_DIR).mkdir(parents=True, exist_ok=True)

# Initialize database file if it doesn't exist
if not os.path.exists(DATABASE_FILE):
    with open(DATABASE_FILE, 'w') as f:
        json.dump({"medical_records": [], "report_explanations": []}, f)

# --- FastAPI Router and Pydantic Models ---

router = APIRouter(tags=["Medical Records"])

class TestData(BaseModel):
    value: float
    unit: str
    normal_range: Optional[List[float]] = None
    status: str

class MedicalRecord(BaseModel):
    record_id: str
    record_type: str
    report_date: str
    lab_name: str
    status: str
    created_at: str

class RecordDetails(BaseModel):
    record_id: str
    record_type: str
    report_date: str
    lab_name: str
    extracted_text: str
    parsed_data: Dict[str, TestData]
    analysis: Optional[Dict[str, Any]] = None

class ExplainRequest(BaseModel):
    record_id: str

class ReportExplanation(BaseModel):
    record_id: str
    simple_summary: str
    key_findings: List[str]
    overall_health_score: int
    risk_level: str
    concerns: List[str]
    next_steps: List[str]
    explanation_generated_at: str

# --- GLM API Helper Function ---

async def call_glm_for_analysis(extracted_text: str, parsed_data: Dict[str, TestData]) -> Dict[str, Any]:
    """
    Call GLM model via OpenRouter to analyze medical report.
    
    Args:
        extracted_text: Full text extracted from medical report
        parsed_data: Parsed test data with values and units
    
    Returns:
        Analysis results as dictionary
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY not configured"
        )
    
    # Format parsed data for prompt
    parsed_summary = "\n".join([
        f"- {test_name}: {data.value} {data.unit} (Status: {data.status})"
        for test_name, data in parsed_data.items()
    ])
    
    system_prompt = """You are a medical AI assistant that explains lab reports in simple, patient-friendly language.
Analyze the medical report and provide a comprehensive explanation in JSON format.

Your response MUST be valid JSON with this exact structure:
{
  "simple_summary": "2-3 sentence overview in simple language",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "overall_health_score": number (1-100),
  "risk_level": "LOW or MODERATE or HIGH",
  "concerns": ["concern 1", "concern 2"],
  "next_steps": ["step 1", "step 2", "step 3"]
}

Guidelines:
- Use simple, non-technical language
- Be compassionate and clear
- Focus on actionable insights
- Always recommend consulting a doctor for medical decisions
- Return ONLY valid JSON, no markdown or extra text"""

    user_prompt = f"""Analyze this medical report:

EXTRACTED TEXT:
{extracted_text[:2000]}

PARSED TEST RESULTS:
{parsed_summary}

Provide your analysis as valid JSON only."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    # Try multiple GLM models
    models_to_try = [
        "zhipuai/glm-4-plus",
        "zhipuai/glm-4-0520",
        "zhipuai/glm-4",
        "openai/gpt-3.5-turbo",
    ]
    
    last_error = None
    
    for model_name in models_to_try:
        try:
            print(f"Trying model: {model_name}")
            
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "MediClear Report Analysis"
            }
            
            payload = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1500,
            }
            
            timeout = httpx.Timeout(60.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                
                raw_content = result["choices"][0]["message"]["content"]
                print(f"✓ Successfully used model: {model_name}")
                
                # Clean markdown code blocks if present
                if raw_content.strip().startswith("```"):
                    raw_content = raw_content.strip()
                    if raw_content.startswith("```json"):
                        raw_content = raw_content[7:]
                    elif raw_content.startswith("```"):
                        raw_content = raw_content[3:]
                    if raw_content.endswith("```"):
                        raw_content = raw_content[:-3]
                    raw_content = raw_content.strip()
                
                analysis = json.loads(raw_content)
                return analysis
                
        except httpx.HTTPStatusError as e:
            last_error = e
            error_text = e.response.text if hasattr(e.response, 'text') else str(e)
            print(f"✗ Model {model_name} failed: {error_text[:300]}")
            continue
            
        except json.JSONDecodeError as e:
            last_error = e
            print(f"✗ Model {model_name} returned invalid JSON: {str(e)[:200]}")
            continue
            
        except Exception as e:
            last_error = e
            print(f"✗ Model {model_name} error: {str(e)[:200]}")
            continue
    
    # All models failed
    raise HTTPException(
        status_code=500,
        detail=f"All GLM models failed to analyze report. Last error: {str(last_error)}"
    )

# --- Local Database Helper Functions ---

def load_database() -> Dict:
    """Load the JSON database from file."""
    try:
        with open(DATABASE_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading database: {e}")
        return {"medical_records": [], "report_explanations": []}

def save_database(data: Dict):
    """Save the JSON database to file."""
    try:
        with open(DATABASE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving database: {e}")
        raise

def insert_record(record_data: Dict) -> Dict:
    """Insert a new medical record into the local database."""
    db = load_database()
    db["medical_records"].append(record_data)
    save_database(db)
    return record_data

def insert_explanation(explanation_data: Dict) -> Dict:
    """Insert a new report explanation into the local database."""
    db = load_database()
    
    # Remove existing explanation for this record if it exists
    db["report_explanations"] = [
        exp for exp in db["report_explanations"] 
        if exp.get("record_id") != explanation_data["record_id"]
    ]
    
    db["report_explanations"].append(explanation_data)
    save_database(db)
    return explanation_data

def get_records(limit: int = 10, offset: int = 0, record_type: Optional[str] = None, user_id: str = None) -> tuple:
    """Get medical records with pagination and filtering."""
    db = load_database()
    records = db["medical_records"]
    
    # Filter by user_id if provided
    if user_id:
        records = [r for r in records if r.get("user_id") == user_id]
    
    # Filter by record_type if provided
    if record_type:
        records = [r for r in records if r.get("record_type") == record_type]
    
    # Sort by report_date descending
    records = sorted(records, key=lambda x: x.get("report_date", ""), reverse=True)
    
    total = len(records)
    paginated_records = records[offset:offset + limit]
    
    return paginated_records, total

def get_record_by_id(record_id: str) -> Optional[Dict]:
    """Get a specific medical record by ID."""
    db = load_database()
    for record in db["medical_records"]:
        if record.get("id") == record_id:
            return record
    return None

def get_explanation_by_record_id(record_id: str) -> Optional[Dict]:
    """Get explanation for a specific record."""
    db = load_database()
    for explanation in db["report_explanations"]:
        if explanation.get("record_id") == record_id:
            return explanation
    return None

# --- Utility Functions for File Processing and Parsing ---

def extract_text_from_file(file_content: bytes, file_type: str) -> str:
    """Extract text from PDF or image using appropriate libraries."""
    try:
        if file_type == 'application/pdf':
            doc = fitz.open(stream=file_content, filetype="pdf")
            text = "".join(page.get_text() for page in doc)
            doc.close()
            return text
        elif file_type in ['image/jpeg', 'image/png']:
            image = Image.open(BytesIO(file_content))
            text = pytesseract.image_to_string(image)
            return text
        else:
            return ""
    except Exception as e:
        print(f"Error during text extraction: {e}")
        return ""

def parse_medical_values(text: str) -> Dict[str, TestData]:
    """
    Parses common test names, values, and units from extracted text.
    NOTE: This is a highly simplified parser.
    """
    parsed_data = {}
    
    test_pattern = r"([A-Za-z\s]+):\s*(\d+\.?\d*)\s*([a-zA-Z/%]+)"
    matches = re.findall(test_pattern, text)
    
    for match in matches:
        test_name = match[0].strip()
        try:
            value = float(match[1])
            unit = match[2].strip()
        except ValueError:
            continue
            
        normal_range: List[float] = [] 
        status = "NORMAL"

        if "Sugar" in test_name:
            normal_range = [70.0, 100.0]
            if value > 125.0:
                status = "URGENT"
            elif value > 100.0:
                status = "MONITOR"

        parsed_data[test_name] = TestData(
            value=value,
            unit=unit,
            normal_range=normal_range,
            status=status
        )
        
    return parsed_data

def determine_overall_status(parsed_data: Dict[str, TestData]) -> str:
    """Determines overall record status based on parsed values."""
    if any(data.status == "URGENT" for data in parsed_data.values()):
        return "URGENT"
    if any(data.status == "MONITOR" for data in parsed_data.values()):
        return "MONITOR"
    return "NORMAL"

# --- API Endpoints ---

@router.post("/records/upload", status_code=status.HTTP_201_CREATED)
async def upload_medical_record(
    file: UploadFile = File(...),
    record_type: str = Form(...),
    report_date: str = Form(...),
    lab_name: str = Form(...),
    notes: Optional[str] = Form(None)
):
    """
    Upload and process medical record files, store file locally,
    extract and parse data, and optionally analyze with GLM.
    """
    # 1. Validation
    file_content = await file.read()
    file_size_mb = len(file_content) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE_MB}MB."
        )
    
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF, JPG, and PNG are allowed."
        )

    try:
        report_date_obj = date.fromisoformat(report_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="report_date must be in YYYY-MM-DD format."
        )

    record_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1] if file.filename else "pdf"
    storage_file_name = f"{record_id}.{file_extension}"
    file_path = os.path.join(RECORDS_DIR, storage_file_name)
    
    # Placeholder for authenticated user_id
    user_id = "00000000-0000-0000-0000-000000000001" 
    
    try:
        # 2. Save file to local storage
        with open(file_path, 'wb') as f:
            f.write(file_content)

        # 3. Extract text
        extracted_text = extract_text_from_file(file_content, file.content_type)
        
        # 4. Parse medical values
        parsed_data = parse_medical_values(extracted_text)

        # 5. Calculate initial status
        initial_status = determine_overall_status(parsed_data)
        
        # 6. Store record metadata in local database
        record_data = {
            "id": record_id,
            "user_id": user_id,
            "record_type": record_type,
            "report_date": report_date_obj.isoformat(),
            "lab_name": lab_name,
            "file_path": file_path,
            "extracted_text": extracted_text,
            "parsed_data": {k: v.dict() for k, v in parsed_data.items()},
            "notes": notes,
            "status": initial_status,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        insert_record(record_data)
        
    except Exception as e:
        # Clean up file if database insert fails
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

        print(f"Upload and processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Record processing failed: {e}"
        )

    # 7. Return structured data
    return {
        "record_id": record_id,
        "status": "success",
        "message": "File uploaded and processed successfully",
        "initial_status": initial_status,
        "extracted_text": extracted_text,
        "parsed_data": parsed_data
    }

@router.post("/records/explain", response_model=ReportExplanation)
async def explain_medical_report(data: ExplainRequest):
    """
    Generate AI-powered explanation for a medical report using GLM model.
    """
    # 1. Fetch the record
    record = get_record_by_id(data.record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record with ID {data.record_id} not found."
        )
    
    # 2. Check if explanation already exists
    existing_explanation = get_explanation_by_record_id(data.record_id)
    if existing_explanation:
        return ReportExplanation(**existing_explanation)
    
    # 3. Prepare data for GLM analysis
    extracted_text = record.get('extracted_text', '')
    parsed_data_raw = record.get('parsed_data', {})
    parsed_data = {k: TestData(**v) for k, v in parsed_data_raw.items()}
    
    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No text extracted from this record. Cannot generate explanation."
        )
    
    # 4. Call GLM for analysis
    try:
        analysis = await call_glm_for_analysis(extracted_text, parsed_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate explanation: {str(e)}"
        )
    
    # 5. Save explanation to database
    explanation_data = {
        "record_id": data.record_id,
        "simple_summary": analysis.get("simple_summary", ""),
        "key_findings": analysis.get("key_findings", []),
        "overall_health_score": analysis.get("overall_health_score", 50),
        "risk_level": analysis.get("risk_level", "MODERATE"),
        "concerns": analysis.get("concerns", []),
        "next_steps": analysis.get("next_steps", []),
        "explanation_generated_at": datetime.now().isoformat()
    }
    
    insert_explanation(explanation_data)
    
    # 6. Return explanation
    return ReportExplanation(**explanation_data)

@router.get("/records")
async def get_medical_records(
    limit: int = 10,
    offset: int = 0,
    record_type: Optional[str] = None
):
    """
    Retrieve medical records with pagination and filtering from local storage.
    """
    # Placeholder for authenticated user_id
    user_id = "00000000-0000-0000-0000-000000000001"
    
    try:
        data, count = get_records(limit, offset, record_type, user_id)

        records = [
            MedicalRecord(
                record_id=item['id'],
                record_type=item['record_type'],
                report_date=item['report_date'],
                lab_name=item['lab_name'],
                status=item['status'],
                created_at=item['created_at']
            ) for item in data
        ]
        
        return {
            "total": count,
            "records": records
        }

    except Exception as e:
        print(f"Database query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve medical records."
        )

@router.get("/records/{record_id}", response_model=RecordDetails)
async def get_record_details(record_id: str):
    """
    Retrieve detailed information for a specific record from local storage.
    """
    try:
        record_data = get_record_by_id(record_id)
        
        if not record_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Record with ID {record_id} not found."
            )
        
        # Process parsed_data for Pydantic model
        parsed_data = {
            k: TestData(**v) for k, v in record_data.get('parsed_data', {}).items()
        }
        
        # Get associated explanation if exists
        analysis_data = None
        explanation = get_explanation_by_record_id(record_id)
        if explanation:
            analysis_data = {
                "simple_summary": explanation.get('simple_summary'),
                "key_findings": explanation.get('key_findings'),
                "overall_health_score": explanation.get('overall_health_score'),
                "risk_level": explanation.get('risk_level'),
                "concerns": explanation.get('concerns'),
                "next_steps": explanation.get('next_steps'),
            }

        return RecordDetails(
            record_id=record_data['id'],
            record_type=record_data['record_type'],
            report_date=record_data['report_date'],
            lab_name=record_data['lab_name'],
            extracted_text=record_data.get('extracted_text', ''),
            parsed_data=parsed_data,
            analysis=analysis_data
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Record retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve record details."
        )

# Example usage:
# from fastapi import FastAPI
# app = FastAPI()
# app.include_router(router, prefix="/api/v1")