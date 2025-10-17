import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { CompoundService } from '../../services/compound.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { StarredCompoundsService } from '../../services/starred-compounds.service';
import { AuthService } from '../../services/auth.service';
import { StarButtonComponent } from '../star-button/star-button.component';
import { Compound, ApiError } from '../../models/compound.interface';

@Component({
  selector: 'app-compound-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    StarButtonComponent
  ],
  templateUrl: './compound-details.component.html',
  styleUrl: './compound-details.component.scss'
})
export class CompoundDetailsComponent implements OnInit, OnDestroy {
  compound: Compound | null = null;
  loading = false;
  error: string | null = null;
  compoundId: number | null = null;
  imageError = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compoundService: CompoundService,
    private navigationService: NavigationService,
    private notificationService: NotificationService,
    private starredCompoundsService: StarredCompoundsService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const idParam = params['id'];
        
        // Validate ID using navigation service
        if (!this.navigationService.isValidCompoundId(idParam)) {
          this.handleInvalidId();
          return;
        }
        
        const id = parseInt(idParam, 10);
        this.compoundId = id;
        this.loadCompound(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCompound(id: number): void {
    this.loading = true;
    this.error = null;
    this.imageError = false;

    this.compoundService.getCompound(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.compound = response.compound;
          this.loading = false;
        },
        error: (error: ApiError) => {
          this.loading = false;
          this.error = error.message;
          
          if (error.status === 404) {
            this.notificationService.showError(
              'Compound not found. It may have been removed or the ID is invalid.',
              'Dismiss',
              { duration: 8000 }
            );
          } else if (error.status === 0) {
            this.notificationService.showError(
              'Unable to connect to server. Please check your internet connection.',
              'Dismiss',
              { duration: 0 }
            );
          } else {
            this.notificationService.showError(
              'Failed to load compound details. Please try again.',
              'Dismiss'
            );
          }
        }
      });
  }

  private handleInvalidId(): void {
    this.error = 'Invalid compound ID format';
    this.notificationService.showError(
      'Invalid compound ID format. Redirecting to gallery.',
      'Dismiss',
      { duration: 5000 }
    );
    
    // Delay navigation to allow user to see the error
    setTimeout(() => {
      this.navigationService.navigateToGallery();
    }, 2000);
  }

  onImageError(): void {
    this.imageError = true;
  }

  onImageLoad(): void {
    this.imageError = false;
  }

  navigateToEdit(): void {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      // Show admin-only popup
      this.showAdminOnlyDialog();
      return;
    }

    if (this.compoundId) {
      this.navigationService.navigateToCompoundEdit(this.compoundId);
    }
  }

  private showAdminOnlyDialog(): void {
    const dialogRef = this.dialog.open(AdminOnlyDialogComponent, {
      width: '400px',
      disableClose: false,
      autoFocus: true
    });
  }

  navigateToGallery(): void {
    this.navigationService.navigateToGallery();
  }

  retryLoad(): void {
    if (this.compoundId) {
      this.loadCompound(this.compoundId);
    }
  }

  getDisplayUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    } catch {
      return url;
    }
  }
}

// Admin Only Dialog Component
@Component({
  selector: 'app-admin-only-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="admin-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">admin_panel_settings</mat-icon>
        <h2 mat-dialog-title>Admin Access Required</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p>Only administrators are allowed to edit compound settings.</p>
        <p>Please contact your system administrator if you need to make changes.</p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-raised-button color="primary" (click)="close()">
          <mat-icon>check</mat-icon>
          Understood
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .admin-dialog {
      padding: 20px;
      text-align: center;
    }
    
    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .warning-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ff9800;
      margin-bottom: 16px;
    }
    
    h2 {
      margin: 0;
      color: #333;
      font-weight: 600;
    }
    
    .dialog-content {
      margin: 20px 0;
    }
    
    .dialog-content p {
      margin: 12px 0;
      color: #666;
      line-height: 1.5;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }
    
    .dialog-actions button {
      min-width: 120px;
    }
  `]
})
export class AdminOnlyDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AdminOnlyDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
