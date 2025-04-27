export type Analysis = {
  id?: string;
  name: string;
  laboratory: string;
  sector?: string;
  form?: string;
  sampleType?: string;
  device?: string;
  frequency?: string;
  tat?: string;
  units?: string;
  referenceValues?: string;
  stability?: string;
  inamiCode?: string;
};

export type Suggestion = {
  id: string;
  analysis: Analysis;
  type: 'add' | 'edit';
  author_name: string;
  author_lab: string;
  author_email: string;  // Nouveau champ
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};