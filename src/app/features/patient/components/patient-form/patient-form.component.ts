import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DatabaseService } from '../../../../core/services/database.service';
import { Patient } from '../../models/patient.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';
  isEditMode = false;
  patientId: number | null = null;
  originalFormValue: any = null;
  formChanged = false;

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.noSpecialCharactersValidator(),
        this.noNumbersValidator()
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.noSpecialCharactersValidator(),
        this.noNumbersValidator()
      ]],
      dateOfBirth: ['', [
        Validators.required,
        this.dateOfBirthValidator()
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100),
        this.emailFormatValidator()
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        this.phoneFormatValidator()
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],
      medicalHistory: ['', [
        Validators.maxLength(1000)
      ]]
    });

    // Subscribe to form value changes
    this.patientForm.valueChanges.subscribe(() => {
      if (this.isEditMode && this.originalFormValue) {
        this.formChanged = this.hasFormChanged();
      }
    });
  }

  private hasFormChanged(): boolean {
    if (!this.originalFormValue) return false;
    
    const currentValue = this.patientForm.value;
    return Object.keys(this.originalFormValue).some(key => {
      // Compare values, handling date objects
      if (key === 'dateOfBirth') {
        return new Date(currentValue[key]).getTime() !== new Date(this.originalFormValue[key]).getTime();
      }
      return currentValue[key] !== this.originalFormValue[key];
    });
  }

  // Custom validators
  private noSpecialCharactersValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
      return hasSpecialChars ? { specialCharacters: true } : null;
    };
  }

  private noNumbersValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const hasNumbers = /[0-9]/.test(value);
      return hasNumbers ? { numbersNotAllowed: true } : null;
    };
  }

  private dateOfBirthValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const date = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120); // Maximum age of 120 years

      if (date > today) {
        return { futureDate: true };
      }
      if (date < minDate) {
        return { tooOld: true };
      }
      return null;
    };
  }

  private emailFormatValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // More comprehensive email regex pattern
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
      // Check for common email format issues
      if (!emailRegex.test(value)) {
        if (!value.includes('@')) {
          return { invalidEmailFormat: true, message: 'Email must contain @ symbol' };
        }
        if (!value.includes('.')) {
          return { invalidEmailFormat: true, message: 'Email must contain a domain' };
        }
        if (value.split('@')[1].split('.').length < 2) {
          return { invalidEmailFormat: true, message: 'Invalid domain format' };
        }
        return { invalidEmailFormat: true };
      }
      return null;
    };
  }

  private phoneFormatValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Remove any non-digit characters for validation
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        return { invalidPhoneLength: true };
      }
      return null;
    };
  }

  // Getter for easy access to form fields in template
  get f() { return this.patientForm.controls; }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.patientId = +params['id'];
        this.loadPatientData();
      }
    });

    // Subscribe to form value changes for debugging
    this.patientForm.valueChanges.subscribe(value => {
      console.log('Form values:', value);
    });

    // Subscribe to form status changes for debugging
    this.patientForm.statusChanges.subscribe(status => {
      console.log('Form status:', status);
      if (status === 'INVALID') {
        console.log('Form errors:', this.patientForm.errors);
        Object.keys(this.patientForm.controls).forEach(key => {
          const control = this.patientForm.get(key);
          if (control?.errors) {
            console.log(`${key} errors:`, control.errors);
          }
        });
      }
    });
  }

  private async loadPatientData(): Promise<void> {
    try {
      this.loading = true;
      const patient = await this.dbService.getPatientById(this.patientId!);
      if (patient) {
        this.patientForm.patchValue({
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          medicalHistory: patient.medicalHistory
        });
        // Store the original form value for change detection
        this.originalFormValue = { ...this.patientForm.value };
        this.formChanged = false;
      } else {
        this.errorMsg = 'Patient not found';
        setTimeout(() => {
          this.router.navigate(['/patients']);
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      this.errorMsg = 'Error loading patient data';
    } finally {
      this.loading = false;
    }
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      this.successMsg = '';

      // Log form values for debugging
      console.log('Form values:', this.patientForm.value);

      const patient: Patient = {
        ...this.patientForm.value,
        createdAt: new Date().toISOString()
      };

      // Only include id if we're in edit mode
      if (this.isEditMode && this.patientId) {
        patient.id = this.patientId;
      }

      const operation = this.isEditMode
        ? this.dbService.updatePatient(patient)
        : this.dbService.addPatient(patient);

      operation
        .then(() => {
          this.successMsg = this.isEditMode
            ? 'Patient updated successfully!'
            : 'Patient registered successfully!';
          if (!this.isEditMode) {
            this.patientForm.reset();
          } else {
            // Update the original form value after successful update
            this.originalFormValue = { ...this.patientForm.value };
            this.formChanged = false;
          }
          // Keep loading state active during navigation
          setTimeout(() => {
            this.router.navigate(['/patients']).then(() => {
              // Only set loading to false after navigation is complete
              this.loading = false;
            });
          }, 1000);
        })
        .catch((error: Error) => {
          console.error('Error saving patient:', error);
          this.errorMsg = error.message || 'Error saving patient. Please try again.';
          this.loading = false; // Set loading to false only on error
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.patientForm.controls).forEach(key => {
        const control = this.patientForm.get(key);
        control?.markAsTouched();
      });
      
      // Log form validation errors
      console.log('Form validation errors:', this.patientForm.errors);
      Object.keys(this.patientForm.controls).forEach(key => {
        const control = this.patientForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });
    }
  }
}
