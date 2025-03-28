import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranscriptService } from '../../services/transcript.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class HomeComponent {
  private formBuilder = inject(FormBuilder);
  private transcriptService = inject(TranscriptService);
  private router = inject(Router);
  
  meetingForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor() {
    this.meetingForm = this.formBuilder.group({
      meetingId: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.meetingForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const meetingId = this.meetingForm.get('meetingId')?.value;
    
    this.transcriptService.uploadByMeetingId(meetingId)
      .subscribe(
        response => {
          this.loading = false;
          this.success = 'Transcript processed successfully';
          // Navigate to review page after a short delay
          setTimeout(() => {
            this.router.navigate(['/review']);
          }, 1500);
        },
        error => {
          this.loading = false;
          this.error = error.message || 'An error occurred while processing the transcript';
        }
      );
  }
}