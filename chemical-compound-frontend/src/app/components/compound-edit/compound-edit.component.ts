import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { CompoundService } from '../../services/compound.service';
import { NotificationService } from '../../services/notification.service';
import { Compound, UpdateCompoundRequest } from '../../models/compound.interface';

@Component({
  selector: 'app-compound-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './compound-edit.component.html',
  styleUrl: './compound-edit.component.scss'
})
export class CompoundEditComponent implements OnInit, OnDestroy {
  editForm: FormGroup;
  compound: Compound | null = null;
  compoundId: number;
  isLoading = false;
  isSaving = false;
  imagePreviewUrl: string | null = null;
  imageLoadError = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private notificationService: NotificationService
  ) {
    this.compoundId = Number(this.route.snapshot.paramMap.get('id'));
    this.editForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCompound();
    this.setupImagePreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255)
      ]],
      image: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000)
      ]],
      imageAttribution: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value.trim() === '') {
            return null; // Valid if empty
          }
          const urlPattern = /^https?:\/\/.+/;
          return urlPattern.test(control.value) ? null : { invalidUrl: true };
        }
      ]],
      dateModified: ['']
    });
  }

  private loadCompound(): void {
    this.isLoading = true;
    
    this.compoundService.getCompound(this.compoundId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.compound = response.compound;
          this.populateForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading compound:', error);
          this.isLoading = false;
          
          if (error.status === 404) {
            this.notificationService.showError(
              'Compound not found. Redirecting to gallery.',
              'Dismiss',
              { duration: 5000 }
            );
          } else {
            this.notificationService.showError(
              'Failed to load compound data. Please try again.',
              'Dismiss'
            );
          }
          
          // Delay navigation to allow user to see the error
          setTimeout(() => {
            this.router.navigate(['/compounds']);
          }, 2000);
        }
      });
  }

  private populateForm(): void {
    if (this.compound) {
      this.editForm.patchValue({
        name: this.compound.name,
        image: this.compound.image,
        description: this.compound.description,
        imageAttribution: this.compound.imageAttribution || '',
        dateModified: this.compound.dateModified ? this.formatDateForInput(this.compound.dateModified) : ''
      });
      this.imagePreviewUrl = this.compound.image;
    }
  }

  private setupImagePreview(): void {
    this.editForm.get('image')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        if (url && this.isValidImageUrl(url)) {
          this.imagePreviewUrl = url;
          this.imageLoadError = false;
        } else {
          this.imagePreviewUrl = null;
          this.imageLoadError = false;
        }
      });
  }

  private isValidImageUrl(url: string): boolean {
    const pattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    return pattern.test(url);
  }

  onImageLoad(): void {
    this.imageLoadError = false;
  }

  onImageError(): void {
    this.imageLoadError = true;
  }

  onSubmit(): void {
    if (this.editForm.valid && !this.isSaving) {
      this.isSaving = true;
      
      const updateData: UpdateCompoundRequest = {
        name: this.editForm.value.name.trim(),
        image: this.editForm.value.image.trim(),
        description: this.editForm.value.description.trim(),
        imageAttribution: this.editForm.value.imageAttribution?.trim() || undefined,
        dateModified: this.editForm.value.dateModified ? new Date(this.editForm.value.dateModified) : undefined
      };

      this.compoundService.updateCompound(this.compoundId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.compound = response.compound;
            this.notificationService.showSuccess(
              'Compound updated successfully!',
              'View',
              { duration: 4000 }
            );
            this.isSaving = false;
            this.router.navigate(['/compounds', this.compoundId]);
          },
          error: (error) => {
            console.error('Error updating compound:', error);
            this.isSaving = false;
            
            if (error.status === 400 || error.status === 422) {
              this.notificationService.showError(
                error.message || 'Invalid data provided. Please check your input.',
                'Dismiss',
                { duration: 8000 }
              );
            } else if (error.status === 404) {
              this.notificationService.showError(
                'Compound not found. It may have been deleted.',
                'Dismiss',
                { duration: 6000 }
              );
              setTimeout(() => {
                this.router.navigate(['/compounds']);
              }, 3000);
            } else {
              this.notificationService.showError(
                'Failed to update compound. Please try again.',
                'Dismiss'
              );
            }
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/compounds', this.compoundId]);
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${maxLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)';
      }
      if (field.errors['invalidUrl']) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Name',
      image: 'Image URL',
      description: 'Description',
      imageAttribution: 'Image Attribution URL',
      dateModified: 'Date Modified'
    };
    return displayNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  private formatDateForInput(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
