import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, delay } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

export interface ErrorDetails {
  message: string;
  status: number;
  error?: any;
  url?: string;
  timestamp: Date;
  userFriendly: boolean;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private notificationService: NotificationService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if we should retry the request
        if (this.shouldRetry(req) && this.isRetryableError(error)) {
          // Retry with delay for retryable errors
          return next.handle(req).pipe(
            delay(1000),
            retry(1), // Retry once
            catchError((retryError: HttpErrorResponse) => {
              return this.handleError(retryError, req);
            })
          );
        }
        
        return this.handleError(error, req);
      })
    );
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>): Observable<never> {
    const errorDetails = this.processError(error, req);

    // Log error for debugging
    this.logError(errorDetails);

    // Show user notification for certain errors
    if (this.shouldShowNotification(errorDetails)) {
      this.showErrorNotification(errorDetails);
    }

    return throwError(() => errorDetails);
  }

  private processError(error: HttpErrorResponse, req: HttpRequest<any>): ErrorDetails {
    let message = 'An unexpected error occurred';
    let userFriendly = true;

    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      message = 'Network error. Please check your connection and try again.';
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          message = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          message = error.error?.message || 'Invalid request. Please check your input and try again.';
          break;
        case 401:
          message = 'You are not authorized to perform this action.';
          break;
        case 403:
          message = 'Access denied. You do not have permission to access this resource.';
          break;
        case 404:
          message = error.error?.message || 'The requested resource was not found.';
          break;
        case 409:
          message = error.error?.message || 'Conflict: The resource already exists or is in use.';
          break;
        case 422:
          message = error.error?.message || 'Validation failed. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        case 502:
          message = 'Server is temporarily unavailable. Please try again later.';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
        case 504:
          message = 'Request timeout. Please try again.';
          break;
        default:
          message = error.error?.message || `Server error (${error.status}). Please try again later.`;
          userFriendly = false;
      }
    }

    return {
      message,
      status: error.status || 0,
      error: error.error,
      url: req.url,
      timestamp: new Date(),
      userFriendly
    };
  }

  private shouldRetry(req: HttpRequest<any>): boolean {
    // Only retry GET requests to avoid duplicate operations
    return req.method === 'GET';
  }

  private isRetryableError(error: HttpErrorResponse): boolean {
    // Retry on network errors or 5xx server errors
    return error.status === 0 || (error.status >= 500 && error.status < 600);
  }

  private shouldShowNotification(errorDetails: ErrorDetails): boolean {
    // Don't show notifications for 404 errors on compound details (handled by component)
    if (errorDetails.status === 404 && errorDetails.url?.includes('/compounds/')) {
      return false;
    }

    // Show notifications for most other errors
    return errorDetails.status !== 401; // Don't show for auth errors (handled separately)
  }

  private showErrorNotification(errorDetails: ErrorDetails): void {
    let notificationMessage = errorDetails.message;

    // Customize notification message based on error type
    if (errorDetails.status >= 500) {
      notificationMessage = 'Server error occurred. Our team has been notified.';
    } else if (errorDetails.status === 0) {
      notificationMessage = 'Connection failed. Please check your internet connection.';
    }

    this.notificationService.showError(notificationMessage, 'Dismiss', {
      duration: errorDetails.status >= 500 ? 8000 : 6000
    });
  }

  private logError(errorDetails: ErrorDetails): void {
    console.group('🚨 HTTP Error Details');
    console.error('Status:', errorDetails.status);
    console.error('Message:', errorDetails.message);
    console.error('URL:', errorDetails.url);
    console.error('Timestamp:', errorDetails.timestamp.toISOString());
    console.error('User Friendly:', errorDetails.userFriendly);
    if (errorDetails.error) {
      console.error('Raw Error:', errorDetails.error);
    }
    console.groupEnd();
  }
}