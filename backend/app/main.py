from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import prescriptions

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Narayan Pharmacy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prescriptions.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Narayan Pharmacy API"}