from sqlalchemy import Column, Integer, String, Date, DateTime, Text, JSON
from sqlalchemy.sql import func
from .database import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(255), nullable=False)
    doctor_name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    drugs = Column(JSON, nullable=False)  # [{"name": "Metformin", "dosage": "500mg"}]
    
    # AI Result — stored so we never re-call Claude for same combo
    drug_combination_key = Column(String(500), nullable=True, index=True)
    interaction_result = Column(Text, nullable=True)   # Formatted text from Claude
    severity = Column(String(50), nullable=True)       # Mild / Moderate / Severe / None
    ai_checked = Column(String(10), default="no")      # yes / no / skipped / error
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())