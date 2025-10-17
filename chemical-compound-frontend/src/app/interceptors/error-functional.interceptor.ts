import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, delay, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export interface ErrorDetails {
  message: string;
  status: number;
  error?: any;
  url?: string;
  timestamp: Date;
  userFriendly: boolean;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if we should retry the request
      if (shouldRetry(req) && isRetryableError(error)) {
        // Retry with delay for retryable errors
        return next(req).pipe(
          delay(1000),
          retry(1), // Retry once
          catchError((retryError: HttpErrorResponse) => {
            return handleError(retryError, req, notificationService);
          })
        );
      }
      
      return handleError(error, req, notificationService);
    })
  );
};

function handleError(error: HttpErrorResponse, req: any, notificationService: NotificationService) {
  const errorDetails = processError(error, req);

  // Log error for debugging
  logError(errorDetails);

  // Show user notification for certain errors
  if (shouldShowNotification(errorDetails)) {
    showErrorNotification(errorDetails, notificationService);
  }

  return throwError(() => errorDetails);
}

function processError(error: HttpErrorResponse, req: any): ErrorDetails {
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

function shouldRetry(req: any): boolean {
  // Only retry GET requests to avoid duplicate operations
  return req.method === 'GET';
}

function isRetryableError(error: HttpErrorResponse): boolean {
  // Retry on network errors or 5xx server errors
  return error.status === 0 || (error.status >= 500 && error.status < 600);
}

function shouldShowNotification(errorDetails: ErrorDetails): boolean {
  // Don't show notifications for 404 errors on compound details (handled by component)
  if (errorDetails.status === 404 && errorDetails.url?.includes('/compounds/')) {
    return false;
  }

  // Show notifications for most other errors
  return errorDetails.status !== 401; // Don't show for auth errors (handled separately)
}

function showErrorNotification(errorDetails: ErrorDetails, notificationService: NotificationService): void {
  let notificationMessage = errorDetails.message;

  // Customize notification message based on error type
  if (errorDetails.status >= 500) {
    notificationMessage = 'Server error occurred. Our team has been notified.';
  } else if (errorDetails.status === 0) {
    notificationMessage = 'Connection failed. Please check your internet connection.';
  }

  notificationService.showError(notificationMessage, 'Dismiss', {
    duration: errorDetails.status >= 500 ? 8000 : 6000
  });
}

function logError(errorDetails: ErrorDetails): void {
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