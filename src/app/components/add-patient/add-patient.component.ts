import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm, Validators } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss']
})
export class AddPatientComponent implements AfterViewInit, OnInit {
  @ViewChild('patientForm') patientForm!: NgForm;
  formErrors: any = {};
  duplicateEmailError: string | null = null;

  // Initialize form data with default or empty values
  patientData: Omit<Patient, 'id'> = {
    name: '',
    gender: '',
    dateOfBirth: '',
    bloodType: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    emergencyContact: undefined
  };

  today = new Date();
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  isEditMode = false; // Track whether in add or edit mode
  patientId: number | null = null; // Store patient ID in edit mode

  constructor(private patientService: PatientService, private router: Router, private route: ActivatedRoute) {}

  ngAfterViewInit() {
    // Use Angular's built-in form status changes
    this.patientForm.statusChanges?.subscribe(status => {
      console.log('Form status changed:', status);
      console.log('Form valid (patientForm.valid):', this.patientForm.valid);
      // No longer need custom checkFormValidity method subscribing to valueChanges
    });
  }

  async ngOnInit() { // Implement OnInit to fetch data on component initialization
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.patientId = +id; // Convert string id to number
      try {
        const patient = await this.patientService.getPatientById(this.patientId);
        if (patient) {
          // Populate form with patient data
          this.patientData = { // Omit id when populating form data
            name: patient.name,
            gender: patient.gender,
            dateOfBirth: patient.dateOfBirth, // Assuming dateOfBirth is in 'yyyy-MM-dd' format
            bloodType: patient.bloodType,
            email: patient.email,
            phone: patient.phone,
            address: patient.address,
            emergencyContact: patient.emergencyContact
          };
        } else {
          console.error('Patient not found for editing:', this.patientId);
          // Optionally navigate back to list or show an error
          this.router.navigate(['/patients']);
        }
      } catch (error) {
        console.error('Error fetching patient for editing:', error);
        // Optionally show an error message
      }
    }

    // Call checkFormValidity initially to set the button state
    // this.checkFormValidity(); // Removed as we rely on form.statusChanges
  }

  onDateOfBirthChange() {
    if (!this.patientData.dateOfBirth) {
      // If date of birth is cleared, remove the custom 'tooOld' error
      if (this.patientForm.controls['dateOfBirth']) {
        this.patientForm.controls['dateOfBirth'].setErrors(null);
      }
      return;
    }

    const dob = new Date(this.patientData.dateOfBirth);
    const date120YearsAgo = this.getDate120YearsAgo();
    const today = new Date(); // Get today's date here for comparison

    // Set Angular's built-in 'max' error if date is in the future
    // This is already handled by [max] in the template, but good to be explicit
    if (dob > today) {
       // Angular template binding [max] should handle this and set 'max' error
       // No manual error setting needed here for future date due to template validation
    } else if (dob < date120YearsAgo) {
      // Manually set 'tooOld' error if date is older than 120 years
      if (this.patientForm.controls['dateOfBirth']) {
         this.patientForm.controls['dateOfBirth'].setErrors({ ...this.patientForm.controls['dateOfBirth'].errors, 'tooOld': true });
      }
    } else {
      // If the date is valid (not in future and not too old), ensure 'tooOld' error is null
       if (this.patientForm.controls['dateOfBirth'] && this.patientForm.controls['dateOfBirth'].errors?.['tooOld']) {
          const errors = { ...this.patientForm.controls['dateOfBirth'].errors };
          delete errors['tooOld'];
          this.patientForm.controls['dateOfBirth'].setErrors(Object.keys(errors).length > 0 ? errors : null);
       }
    }
    // Angular form status will update automatically based on control errors
  }

  async onSubmit(): Promise<void> {
    // Mark all controls as touched to display validation messages
    this.patientForm.form.markAllAsTouched();
    this.duplicateEmailError = null; // Reset duplicate email error on submit attempt

    // Check Angular's overall form validity
    if (this.patientForm.invalid) {
       console.log('Form is invalid based on template validation.');
       // Log form errors for debugging
       Object.keys(this.patientForm.controls).forEach(key => {
         const control = this.patientForm.controls[key];
         if (control.invalid) {
           console.log(`Control '${key}' is invalid. Errors:`, control.errors);
         }
       });
       return;
    }

    try {
      if (this.isEditMode && this.patientId !== null) {
        // Call updatePatient in edit mode
        await this.patientService.updatePatient(this.patientId, this.patientData);
        console.log('Patient updated successfully');
      } else {
        // Call addPatient in add mode
        await this.patientService.addPatient(this.patientData);
        console.log('Patient added successfully');
      }
      this.router.navigate(['/patients']);
    } catch (error: any) {
      console.error('Error adding patient:', error);
      if (error.message && error.message.includes('Email ') && error.message.includes(' already exists.')) {
        this.duplicateEmailError = error.message;
      } else {
        // Handle other potential errors with a generic message if needed
        // this.formErrors.general = 'An unexpected error occurred.';
      }
    }
  }

  onCancel() {
    // Navigate back to the patient list
    this.router.navigate(['/patients']);
  }

  private getDate120YearsAgo(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    // Set time to beginning of the day to ensure correct comparison
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
