export interface Patient {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  bloodType?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
} 