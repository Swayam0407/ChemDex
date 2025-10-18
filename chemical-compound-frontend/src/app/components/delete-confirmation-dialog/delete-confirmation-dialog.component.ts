import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Compound } from '../../models/compound.interface';

export interface DeleteConfirmationData {
  compound: Compound;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Delete Compound</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p>Are you sure you want to delete <strong>{{ data.compound.name }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-button">
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="warn" 
          (click)="onConfirm()"
          class="delete-button">
          <mat-icon>delete</mat-icon>
          Delete
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog {
      min-width: 400px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .dialog-content {
      margin-bottom: 24px;
    }

    .dialog-content p {
      margin: 8px 0;
    }

    .warning-text {
      color: #666;
      font-size: 14px;
      font-style: italic;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin: 0;
      padding: 0;
    }

    .cancel-button {
      color: #666;
    }

    .delete-button {
      background-color: #f44336;
      color: white;
    }

    .delete-button:hover {
      background-color: #d32f2f;
    }

    .delete-button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class DeleteConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}