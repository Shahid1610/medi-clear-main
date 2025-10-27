from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import symptom_checker, records, reports, chat, dashboard

app = FastAPI(
    title="HealthSense AI API",
    version="1.0.0",
    description="Backend API for HealthSense AI medical assistant application"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(symptom_checker.router, prefix="/api/v1", tags=["Symptom Checker"])
app.include_router(records.router, prefix="/api/v1", tags=["Records"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])

@app.get("/")
async def root():
    return {
        "message": "HealthSense AI API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
