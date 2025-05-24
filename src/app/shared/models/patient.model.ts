export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email?: string;
  phone?: string;
  address?: string;
  medicalHistory?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 