import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(private authService: AuthService) {}

  /**
   * Initialize the application
   * This runs after all services are constructed to avoid circular dependencies
   */
  initialize(): Promise<void> {
    return new Promise((resolve) => {
      // Validate stored token if it exists
      if (this.authService.getToken()) {
        this.authService.validateStoredToken();
      }
      resolve();
    });
  }
}

/**
 * Factory function for APP_INITIALIZER
 */
export function appInitializerFactory(appInitService: AppInitService) {
  return () => appInitService.initialize();
}