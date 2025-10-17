import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface NotificationConfig extends MatSnackBarConfig {
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  };

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success notification
   */
  showSuccess(message: string, action?: string, config?: NotificationConfig): void {
    this.show(message, action, {
      ...config,
      type: 'success',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error notification
   */
  showError(message: string, action?: string, config?: NotificationConfig): void {
    this.show(message, action, {
      ...config,
      type: 'error',
      panelClass: ['error-snackbar'],
      duration: config?.duration || 8000 // Longer duration for errors
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, action?: string, config?: NotificationConfig): void {
    this.show(message, action, {
      ...config,
      type: 'warning',
      panelClass: ['warning-snackbar']
    });
  }

  /**
   * Show info notification
   */
  showInfo(message: string, action?: string, config?: NotificationConfig): void {
    this.show(message, action, {
      ...config,
      type: 'info',
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Show generic notification
   */
  show(message: string, action?: string, config?: NotificationConfig): void {
    const finalConfig = {
      ...this.defaultConfig,
      ...config
    };

    this.snackBar.open(message, action || 'Dismiss', finalConfig);
  }

  /**
   * Dismiss all notifications
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}