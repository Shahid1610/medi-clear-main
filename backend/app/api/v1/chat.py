from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import httpx
import os
import uuid
import json
from pathlib import Path
import base64

router = APIRouter()

# GLM configuration via OpenRouter
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Medical records storage path
MEDICAL_RECORDS_PATH = Path("medical_records_storage/files")

# --- REQUEST/RESPONSE MODELS ---

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    
class ChatResponse(BaseModel):
    answer: str
    referenced_records: List[str]
    confidence_score: float
    follow_up_suggestions: List[str]
    session_id: str

class ChatMessage(BaseModel):
    timestamp: str
    role: str
    content: str

# --- CORE LOGIC FUNCTIONS ---

async def call_glm_model(messages: List[dict]) -> str:
    """ Calls GLM model via OpenRouter API. """
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY not configured"
        )
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "MediClear Chat"
    }
    
    models_to_try = [
        "zhipuai/glm-4-plus",
        "zhipuai/glm-4-0520",
        "zhipuai/glm-4",
        "openai/gpt-4o",
        "openai/gpt-3.5-turbo",
    ]
    
    last_error = None
    
    for model_name in models_to_try:
        try:
            payload = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
                "stream": False
            }
            
            timeout = httpx.Timeout(60.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                return data["choices"][0]["message"]["content"]
                
        except httpx.HTTPStatusError as e:
            last_error = e
            continue
            
        except Exception as e:
            last_error = e
            continue
    
    raise HTTPException(
        status_code=500,
        detail=f"All GLM models failed. Last error: {str(last_error)}"
    )

# --- OCR AND FILE PROCESSING FUNCTIONS ---

def encode_image_to_base64(image_path: Path) -> str:
    """Encode image to base64 for GLM vision API."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

async def extract_text_from_image_with_glm(image_path: Path) -> str:
    """Use GLM-4V to extract text from medical record images."""
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY not configured"
        )
    
    # Encode image
    base64_image = encode_image_to_base64(image_path)
    image_ext = image_path.suffix.lower()
    mime_type = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }.get(image_ext, 'image/jpeg')
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "MediClear OCR"
    }
    
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """Extract all text and medical information from this medical record image. 
                    Please provide:
                    1. Patient information (if visible)
                    2. Test/procedure type
                    3. Date of test/procedure
                    4. All test results with values and ranges
                    5. Findings and observations
                    6. Diagnosis or impressions
                    7. Any recommendations
                    
                    Format the extracted information clearly and completely."""
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{base64_image}"
                    }
                }
            ]
        }
    ]
    
    # Try vision-capable models
    vision_models = [
        "openai/gpt-4o",
        "openai/gpt-4-turbo",
        "anthropic/claude-3.5-sonnet",
    ]
    
    for model_name in vision_models:
        try:
            payload = {
                "model": model_name,
                "messages": messages,
                "max_tokens": 2000
            }
            
            timeout = httpx.Timeout(90.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                return data["choices"][0]["message"]["content"]
                
        except Exception as e:
            continue
    
    raise HTTPException(
        status_code=500,
        detail="Failed to extract text from image using vision models"
    )

async def process_medical_records_from_storage(session_id: Optional[str] = None) -> List[dict]:
    """
    Process all medical records from the storage directory.
    Reads images and text files, performs OCR on images, and structures the data.
    """
    if not MEDICAL_RECORDS_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Medical records storage directory not found"
        )
    
    medical_records = []
    
    # Get all files in the directory
    files = list(MEDICAL_RECORDS_PATH.glob("*"))
    
    if not files:
        raise HTTPException(
            status_code=404,
            detail="No medical records found in storage"
        )
    
    for file_path in files:
        if file_path.is_file():
            record_id = file_path.stem
            file_ext = file_path.suffix.lower()
            
            # Process image files (OCR)
            if file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']:
                try:
                    extracted_text = await extract_text_from_image_with_glm(file_path)
                    
                    medical_records.append({
                        "id": record_id,
                        "source_file": file_path.name,
                        "file_type": "image",
                        "content": extracted_text,
                        "processed_date": datetime.now().isoformat()
                    })
                except Exception as e:
                    print(f"Error processing image {file_path.name}: {str(e)}")
                    continue
            
            # Process text files
            elif file_ext in ['.txt', '.json']:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        if file_ext == '.json':
                            content = json.load(f)
                            content = json.dumps(content, indent=2)
                        else:
                            content = f.read()
                    
                    medical_records.append({
                        "id": record_id,
                        "source_file": file_path.name,
                        "file_type": "text",
                        "content": content,
                        "processed_date": datetime.now().isoformat()
                    })
                except Exception as e:
                    print(f"Error processing text file {file_path.name}: {str(e)}")
                    continue
    
    if not medical_records:
        raise HTTPException(
            status_code=404,
            detail="No medical records could be processed"
        )
    
    return medical_records

def build_medical_context(medical_records: List[dict]) -> str:
    """
    Build a formatted string of the medical data for context.
    
    Args:
        medical_records: List of structured record dicts.
    """
    if not medical_records:
        return "No medical data available."
    
    context = "User's Medical Records:\n\n"
    for idx, record in enumerate(medical_records, 1):
        context += f"=== Record {idx} ===\n"
        context += f"Record ID: {record.get('id')}\n"
        context += f"Source File: {record.get('source_file')}\n"
        context += f"File Type: {record.get('file_type')}\n"
        context += f"Processed Date: {record.get('processed_date')}\n\n"
        context += f"Content:\n{record.get('content')}\n"
        context += "\n" + "="*50 + "\n\n"
    
    return context

def extract_referenced_records(
    answer: str,
    medical_records: List[dict]
) -> List[str]:
    """ Identify which medical records were referenced in the AI response. """
    referenced = []
    answer_lower = answer.lower()
    
    for record in medical_records:
        record_id = record.get('id', '')
        source_file = record.get('source_file', '')
        content = record.get('content', '').lower()
        
        # Check if record ID is mentioned
        if record_id and record_id.lower() in answer_lower:
            referenced.append(record_id)
            continue
        
        # Check if source file is mentioned
        if source_file and source_file.lower() in answer_lower:
            referenced.append(record_id)
            continue
        
        # Check for common medical terms from the content
        content_words = set(content.split())
        answer_words = set(answer_lower.split())
        common_words = content_words.intersection(answer_words)
        
        # If significant overlap (more than 5 common words), consider it referenced
        if len(common_words) > 5:
            referenced.append(record_id)
    
    return list(set(referenced))

def calculate_confidence(
    question: str,
    medical_records: List[dict],
    answer: str
) -> float:
    """ Calculate confidence score for the answer based on data availability. """
    confidence = 0.3
    
    if medical_records:
        confidence += 0.3
    
    if any(char.isdigit() for char in answer):
        confidence += 0.2
    
    uncertain_phrases = [
        "may", "might", "possibly", "unclear", "uncertain",
        "don't have enough", "cannot determine", "insufficient data",
        "would need more", "consult with", "speak to your doctor"
    ]
    if any(phrase in answer.lower() for phrase in uncertain_phrases):
        confidence -= 0.25
    
    medical_terms = ["diagnosis", "test result", "level", "range", "normal", "abnormal"]
    if any(term in answer.lower() for term in medical_terms):
        confidence += 0.15
    
    return max(0.1, min(1.0, confidence))

def generate_follow_ups(
    question: str,
    answer: str,
    medical_records: List[dict]
) -> List[str]:
    """ Generate relevant follow-up question suggestions. """
    suggestions = []
    
    if medical_records:
        suggestions.append("Can you explain the most recent test results?")
        suggestions.append("What do these findings mean for my health?")
    
    suggestions.extend([
        "What lifestyle changes should I consider based on this data?",
        "Are there any concerning trends in my records?",
        "What should I discuss with my doctor about these results?",
        "When should I schedule my next check-up?"
    ])
    
    return suggestions[:4]

# --- DATABASE / HISTORY FUNCTIONS ---

async def get_conversation_history(session_id: str) -> List[dict]:
    """ Fetch conversation history from database. (PLACEHOLDER) """
    # TODO: Implement actual database query
    return []

async def save_chat_message(
    session_id: str,
    role: str,
    content: str,
    referenced_records: Optional[List[str]] = None
):
    """ Save chat message to database. (PLACEHOLDER) """
    # TODO: Implement actual database insertion
    pass

# --- API ENDPOINT ---

@router.post("/chat/ask", response_model=ChatResponse)
async def chat_ask_question(data: ChatRequest):
    """
    Context-aware Q&A using OCR-derived medical data and GLM model.
    """
    
    # Step 1: Process medical records from storage (OCR + text extraction)
    try:
        medical_records = await process_medical_records_from_storage(data.session_id)
    except HTTPException as e:
        raise e
    
    # Step 2: Load conversation history if session exists
    conversation_history = []
    if data.session_id:
        conversation_history = await get_conversation_history(data.session_id)
    
    # Step 3: Build context prompt from processed records
    medical_context = build_medical_context(medical_records)
    
    # Build messages for GLM model
    messages = [
        {
            "role": "system",
            "content": f"""You are a helpful medical AI assistant with access to the user's health records, 
which were extracted from their medical documents using OCR and text processing. Provide accurate, 
personalized answers based on this medical data. Always reference specific values, dates, and record IDs 
when available. Be clear, compassionate, and professional.

IMPORTANT: Base your answers ONLY on the medical records provided below. Do not make assumptions 
about data that is not present in the records.

{medical_context}

When answering:
- Reference specific test results and dates
- Mention record IDs or source files when relevant
- Explain medical terms in simple language
- Suggest when to consult a healthcare provider
- Be honest if information is insufficient
- If you see concerning results, clearly explain why they're concerning"""
        }
    ]
    
    # Add conversation history
    for msg in conversation_history:
        messages.append({
            "role": msg.get("role"),
            "content": msg.get("content")
        })
    
    # Add current question
    messages.append({
        "role": "user",
        "content": data.question
    })
    
    # Step 4: Call GLM model
    try:
        ai_answer = await call_glm_model(messages)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error calling GLM model: {str(e)}"
        )
    
    # Step 5-7: Processing and Suggestions
    referenced = extract_referenced_records(ai_answer, medical_records)
    confidence = calculate_confidence(data.question, medical_records, ai_answer)
    follow_ups = generate_follow_ups(data.question, ai_answer, medical_records)
    
    # Step 8: Save to database
    session_id = data.session_id or str(uuid.uuid4())
    await save_chat_message(session_id, "user", data.question)
    await save_chat_message(session_id, "assistant", ai_answer, referenced)
    
    # Step 9: Return response
    return ChatResponse(
        answer=ai_answer,
        referenced_records=referenced,
        confidence_score=confidence,
        follow_up_suggestions=follow_ups,
        session_id=session_id
    )