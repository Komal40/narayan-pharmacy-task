from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from typing import Any


class CustomResponse(BaseModel):
    status: bool
    statusCode: int
    data: Any


class DrugItem(BaseModel):
    name: str
    dosage: str

class PrescriptionCreate(BaseModel):
    patient_name: str
    doctor_name: str
    date: date
    drugs: List[DrugItem]

class PrescriptionResponse(BaseModel):
    id: int
    patient_name: str
    doctor_name: str
    date: date
    drugs: List[DrugItem]
    interaction_result: Optional[str] = None
    severity: Optional[str] = None
    ai_checked: str
    created_at: datetime

    class Config:
        from_attributes = True

class PrescriptionListItem(BaseModel):
    id: int
    patient_name: str
    doctor_name: str
    date: date
    drug_count: int
    severity: Optional[str] = None
    ai_checked: str
    created_at: datetime