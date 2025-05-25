export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  diagnosis?: string;
  admissionDate: string;
  dischargeDate?: string;
  roomNumber?: string;
  status: string;
} 