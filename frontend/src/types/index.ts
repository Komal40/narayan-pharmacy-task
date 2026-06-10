export interface DrugItem {
  name: string;
  dosage: string;
}

export interface PrescriptionCreatePayload {
  patient_name: string;
  doctor_name: string;
  date: string;
  drugs: DrugItem[];
}

export interface Interaction {
  drugs_involved: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  effect: string;
  recommendation: string;
}

export interface InteractionData {
  has_interactions: boolean;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  summary: string;
  interactions: Interaction[];
  general_advice: string;
  error?: string;
}

export type AiCheckedStatus = 'yes' | 'no' | 'skipped' | 'error';
export type SeverityLevel = 'None' | 'Mild' | 'Moderate' | 'Severe';

export interface PrescriptionListItem {
  id: number;
  patient_name: string;
  doctor_name: string;
  date: string;
  drug_count: number;
  severity: SeverityLevel | null;
  ai_checked: AiCheckedStatus;
  created_at: string;
}

export interface PrescriptionDetail {
  id: number;
  patient_name: string;
  doctor_name: string;
  date: string;
  drugs: DrugItem[];
  interaction_result: string | null;
  severity: SeverityLevel | null;
  ai_checked: AiCheckedStatus;
  created_at: string;
}