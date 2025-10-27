from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SymptomRequest(BaseModel):
    symptoms: str
    age: int
    gender: str
    duration: str
    severity: int

class PossibleCondition(BaseModel):
    condition: str
    probability: int
    description: str

class SymptomAssessment(BaseModel):
    assessment_id: str
    urgency_level: str
    urgency_score: int
    possible_conditions: List[PossibleCondition]
    recommended_tests: List[str]
    action_items: List[str]
    warning_signs: List[str]
    when_to_seek_care: str

@router.post("/symptoms/analyze", response_model=SymptomAssessment)
async def analyze_symptoms(data: SymptomRequest):
    """
    Analyze symptoms using AI and provide assessment.

    TODO: Implement Gemini AI integration here
    Steps to implement:
    1. Format prompt with symptom data including:
       - Symptoms description
       - Patient age and gender
       - Duration of symptoms
       - Severity level (1-10)
    2. Call Gemini API with structured prompt
    3. Parse response into structured format
    4. Calculate urgency score based on symptoms
    5. Extract possible conditions with probabilities
    6. Generate recommended tests
    7. Provide action items and warning signs
    8. Store assessment in database for future reference
    9. Return formatted assessment

    Example Gemini prompt structure:
    "You are a medical AI assistant. Analyze the following symptoms:
    Symptoms: {symptoms}
    Age: {age}, Gender: {gender}
    Duration: {duration}
    Severity: {severity}/10

    Provide:
    1. Urgency level (NORMAL/MODERATE/URGENT)
    2. Possible conditions with probabilities
    3. Recommended tests
    4. Warning signs to watch for
    5. When to seek immediate care"
    """

    return SymptomAssessment(
        assessment_id="ASSESS_001",
        urgency_level="MODERATE",
        urgency_score=45,
        possible_conditions=[
            PossibleCondition(
                condition="Common Cold",
                probability=70,
                description="Viral infection of upper respiratory tract"
            ),
            PossibleCondition(
                condition="Influenza",
                probability=25,
                description="Viral infection affecting respiratory system"
            )
        ],
        recommended_tests=["Complete Blood Count", "Throat Culture"],
        action_items=[
            "Rest and stay hydrated",
            "Monitor temperature regularly",
            "Take over-the-counter pain relievers if needed"
        ],
        warning_signs=[
            "Difficulty breathing or shortness of breath",
            "Chest pain or pressure",
            "Persistent high fever above 103°F"
        ],
        when_to_seek_care="If symptoms worsen or persist beyond 7 days, seek medical attention"
    )
