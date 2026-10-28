import { DiseaseReferenceImage } from '../../types';

export type ProblemType = 'disease' | 'pest' | 'nematode' | 'weed' | 'nutrient';
export type SeverityLevel = 'Low' | 'Medium' | 'High';

export interface Treatment {
  product_en: string;
  product_or: string;
  active_ingredient: string;
  dose_per_litre: string;
  dose_per_200L: string;
  type: 'chemical' | 'organic' | 'bio' | 'cultural';
  organic_alternative_en?: string;
  organic_alternative_or?: string;
  phi_days: number; // Pre-Harvest Interval in days
  safety_note_en?: string;
  safety_note_or?: string;
  source?: string;
  verified_by?: string | null;
  verified_date?: string | null;
}

export interface CropProblem {
  id: string;
  type: ProblemType;
  name_en: string;
  name_or: string;
  name_hi?: string;
  severity: SeverityLevel;
  symptoms_en: string;
  symptoms_or: string;
  symptoms_hi?: string;
  image?: string; // base64 or fallback svg identifier
  reference_images?: DiseaseReferenceImage[];
  verified_by?: string | null;
  verified_date?: string | null;
  treatments: Treatment[];
}

export interface CropItem {
  id: string;
  category: string;
  name_en: string;
  name_or: string;
  name_hi?: string;
  scientific_name: string;
  icon: string;
  soil_type_en: string;
  soil_type_or: string;
  duration_days: string;
  water_requirement: 'Low' | 'Medium' | 'High';
  water_requirement_or: string;
  season?: string;
  problems: CropProblem[];
}

export interface CategoryMeta {
  id: string;
  name_en: string;
  name_or: string;
  name_hi?: string;
  icon: string;
}
