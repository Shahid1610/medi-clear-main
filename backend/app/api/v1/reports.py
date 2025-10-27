from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class ExplainRequest(BaseModel):
    record_id: str

class KeyFinding(BaseModel):
    test_name: str
    your_value: str
    normal_range: str
    meaning: str
    severity: str
    action: str

class ReportExplanation(BaseModel):
    simple_summary: str
    key_findings: List[KeyFinding]
    overall_health_score: int
    risk_level: str
    positive_findings: List[str]
    concerns: List[str]
    next_steps: List[str]

class HistoricalValue(BaseModel):
    date: str
    value: float

class HealthTrend(BaseModel):
    test_name: str
    historical_values: List[HistoricalValue]
    trend_direction: str
    velocity: float
    forecast: float
    chart_data: List[Dict[str, Any]]

@router.post("/reports/explain")
async def explain_medical_report(data: ExplainRequest):
    """
    Generate simple explanation of medical report using AI.

    TODO: Implement Gemini AI explanation generation
    Steps to implement:
    1. Load report data from database using record_id
    2. Extract all medical test values and results
    3. Format prompt for Gemini AI:
       - Include all test values
       - Include normal ranges
       - Request layman's explanation
    4. Call Gemini API with structured prompt
    5. Parse AI response into structured format
    6. Calculate overall health score (0-100):
       - Consider how many values are out of range
       - Weight by importance of each test
       - Apply risk factors
    7. Categorize findings as positive vs concerns
    8. Generate actionable next steps
    9. Store explanation in database for caching
    10. Return formatted explanation

    Example Gemini prompt:
    "You are a medical AI assistant. Explain this medical report in simple terms:

    Test Results:
    - Hemoglobin: 12.5 g/dL (Normal: 12-16)
    - Cholesterol: 220 mg/dL (Normal: <200)

    Provide:
    1. Simple summary for non-medical person
    2. Explanation of each test result
    3. What values mean for health
    4. Risk level assessment
    5. Recommended actions"

    Health score calculation:
    - Start at 100
    - Subtract points for abnormal values:
      - Minor deviation: -5 points
      - Moderate: -15 points
      - Severe: -30 points
    - Bonus for excellent values: +5 points
    """

    return {
        "explanation": ReportExplanation(
            simple_summary="Your blood test results are mostly within normal ranges. Your cholesterol is slightly elevated, which suggests you may benefit from dietary changes.",
            key_findings=[
                KeyFinding(
                    test_name="Hemoglobin",
                    your_value="12.5 g/dL",
                    normal_range="12-16 g/dL",
                    meaning="Your hemoglobin level is normal, indicating healthy oxygen-carrying capacity in your blood",
                    severity="NORMAL",
                    action="No action needed. Continue healthy diet with iron-rich foods"
                ),
                KeyFinding(
                    test_name="Total Cholesterol",
                    your_value="220 mg/dL",
                    normal_range="<200 mg/dL",
                    meaning="Your cholesterol is slightly elevated, which increases cardiovascular risk",
                    severity="MONITOR",
                    action="Reduce saturated fats, increase fiber intake, and exercise regularly"
                )
            ],
            overall_health_score=85,
            risk_level="LOW",
            positive_findings=[
                "Blood sugar levels are excellent",
                "Kidney function is normal",
                "Liver enzymes are within healthy range"
            ],
            concerns=[
                "Cholesterol is slightly elevated and should be monitored"
            ],
            next_steps=[
                "Schedule follow-up cholesterol check in 3 months",
                "Consult with nutritionist about heart-healthy diet",
                "Increase physical activity to 150 minutes per week"
            ]
        )
    }

@router.get("/reports/{record_id}/trends")
async def get_health_trends(record_id: str):
    """
    Analyze trends from historical medical data.

    TODO: Calculate trends from historical data
    Steps to implement:
    1. Get current record details
    2. Query database for all records of same type from same user
    3. Extract same test values across all records
    4. Sort by date to create time series
    5. For each test parameter:
       - Calculate trend direction (improving/worsening/stable)
       - Use linear regression for trend line
       - Calculate velocity (rate of change)
       - Generate forecast for next expected value
       - Prepare data for charting
    6. Identify concerning trends (worsening values)
    7. Return trend data for visualization

    Example trend calculation:
    - If cholesterol was [200, 210, 220] over time
    - Trend: WORSENING
    - Velocity: +10 per measurement
    - Forecast: 230 for next test

    Database query:
    SELECT * FROM medical_records
    WHERE user_id = ? AND record_type = ?
    ORDER BY report_date ASC
    """

    return {
        "test_trends": [
            HealthTrend(
                test_name="Total Cholesterol",
                historical_values=[
                    HistoricalValue(date="2024-07-01", value=200),
                    HistoricalValue(date="2024-09-01", value=210),
                    HistoricalValue(date="2024-10-25", value=220)
                ],
                trend_direction="WORSENING",
                velocity=10.0,
                forecast=230.0,
                chart_data=[
                    {"date": "2024-07-01", "value": 200},
                    {"date": "2024-09-01", "value": 210},
                    {"date": "2024-10-25", "value": 220}
                ]
            ),
            HealthTrend(
                test_name="Hemoglobin",
                historical_values=[
                    HistoricalValue(date="2024-07-01", value=12.2),
                    HistoricalValue(date="2024-09-01", value=12.4),
                    HistoricalValue(date="2024-10-25", value=12.5)
                ],
                trend_direction="STABLE",
                velocity=0.15,
                forecast=12.6,
                chart_data=[
                    {"date": "2024-07-01", "value": 12.2},
                    {"date": "2024-09-01", "value": 12.4},
                    {"date": "2024-10-25", "value": 12.5}
                ]
            )
        ]
    }
