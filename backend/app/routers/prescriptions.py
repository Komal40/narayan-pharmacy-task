from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from ..database import get_db
from ..models import Prescription
from ..schemas import PrescriptionCreate, PrescriptionResponse, PrescriptionListItem
from ..services.claude_service import check_drug_interactions, build_drug_combination_key

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


@router.post("/", response_model=PrescriptionResponse)
def create_prescription(payload: PrescriptionCreate, db: Session = Depends(get_db)):
    drugs_list = [{"name": d.name, "dosage": d.dosage} for d in payload.drugs]
    
    ai_checked = "no"
    severity = None
    interaction_result = None
    drug_combination_key = None

    if len(drugs_list) < 2:
        # Explicit requirement: skip API call for single drug
        ai_checked = "skipped"
    else:
        drug_combination_key = build_drug_combination_key(drugs_list)
        
        # Check cache first — never re-call Claude for same combo
        existing = db.query(Prescription).filter(
            Prescription.drug_combination_key == drug_combination_key,
            Prescription.ai_checked == "yes"
        ).first()
        
        if existing:
            # Reuse cached result
            interaction_result = existing.interaction_result
            severity = existing.severity
            ai_checked = "yes"
        else:
            # Call Claude
            ai_result = check_drug_interactions(drugs_list)
            
            if ai_result["success"]:
                interaction_result = json.dumps(ai_result["result"])
                severity = ai_result["severity"]
                ai_checked = "yes"
            else:
                ai_checked = "error"
                interaction_result = json.dumps({"error": ai_result["error"]})

    prescription = Prescription(
        patient_name=payload.patient_name,
        doctor_name=payload.doctor_name,
        date=payload.date,
        drugs=drugs_list,
        drug_combination_key=drug_combination_key,
        interaction_result=interaction_result,
        severity=severity,
        ai_checked=ai_checked,
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription


@router.get("/", response_model=List[PrescriptionListItem])
def list_prescriptions(db: Session = Depends(get_db)):
    prescriptions = db.query(Prescription).order_by(
        Prescription.created_at.desc()
    ).all()
    
    return [
        PrescriptionListItem(
            id=p.id,
            patient_name=p.patient_name,
            doctor_name=p.doctor_name,
            date=p.date,
            drug_count=len(p.drugs),
            severity=p.severity,
            ai_checked=p.ai_checked,
            created_at=p.created_at
        )
        for p in prescriptions
    ]


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(prescription_id: int, db: Session = Depends(get_db)):
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    return prescription