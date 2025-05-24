import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h2 class="mb-0">Patient Registration</h2>
            </div>
            <div class="card-body">
              <form [formGroup]="patientForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="firstName"
                      formControlName="firstName"
                      [ngClass]="{'is-invalid': submitted && f['firstName'].errors}"
                      [disabled]="isSubmitting"
                    >
                    <div class="invalid-feedback" *ngIf="submitted && f['firstName'].errors">
                      <div *ngIf="f['firstName'].errors['required']">First name is required</div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="lastName"
                      formControlName="lastName"
                      [ngClass]="{'is-invalid': submitted && f['lastName'].errors}"
                      [disabled]="isSubmitting"
                    >
                    <div class="invalid-feedback" *ngIf="submitted && f['lastName'].errors">
                      <div *ngIf="f['lastName'].errors['required']">Last name is required</div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="dateOfBirth" class="form-label">Date of Birth</label>
                  <input
                    type="date"
                    class="form-control"
                    id="dateOfBirth"
                    formControlName="dateOfBirth"
                    [ngClass]="{'is-invalid': submitted && f['dateOfBirth'].errors}"
                    [disabled]="isSubmitting"
                  >
                  <div class="invalid-feedback" *ngIf="submitted && f['dateOfBirth'].errors">
                    <div *ngIf="f['dateOfBirth'].errors['required']">Date of birth is required</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                    [disabled]="isSubmitting"
                  >
                  <div class="invalid-feedback" *ngIf="submitted && f['email'].errors">
                    <div *ngIf="f['email'].errors['email']">Please enter a valid email address</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Phone</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="phone"
                    formControlName="phone"
                    [ngClass]="{'is-invalid': submitted && f['phone'].errors}"
                    [disabled]="isSubmitting"
                  >
                  <div class="invalid-feedback" *ngIf="submitted && f['phone'].errors">
                    <div *ngIf="f['phone'].errors['pattern']">Please enter a valid phone number</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <textarea
                    class="form-control"
                    id="address"
                    rows="3"
                    formControlName="address"
                    [disabled]="isSubmitting"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="medicalHistory" class="form-label">Medical History</label>
                  <textarea
                    class="form-control"
                    id="medicalHistory"
                    rows="4"
                    formControlName="medicalHistory"
                    [disabled]="isSubmitting"
                  ></textarea>
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                    <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isSubmitting ? 'Registering...' : 'Register Patient' }}
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isSubmitting">Cancel</button>
                </div>

                <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                  {{ errorMessage }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
  `]
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  submitted = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.patientForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern('^[0-9-+() ]*$')]],
      address: [''],
      medicalHistory: ['']
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.patientForm.controls; }

  async onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.patientForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const patient: Patient = {
        ...this.patientForm.value,
        dateOfBirth: new Date(this.patientForm.value.dateOfBirth)
      };

      await this.patientService.createPatient(patient);
      this.router.navigate(['/patients']);
    } catch (error) {
      console.error('Error creating patient:', error);
      this.errorMessage = 'Failed to register patient. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.router.navigate(['/patients']);
  }
}
