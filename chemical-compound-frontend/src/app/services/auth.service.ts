import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check token validity on service initialization
    this.validateStoredToken();
  }

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data.user, response.data.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Login user
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data.user, response.data.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get user profile
   */
  getProfile(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/auth/profile`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUserSubject.next(response.data.user);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update user profile
   */
  updateProfile(request: ProfileUpdateRequest): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.put<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/auth/profile`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUserSubject.next(response.data.user);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Change password
   */
  changePassword(request: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/auth/change-password`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set authentication data
   */
  private setAuthData(user: User, token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Get user from local storage
   */
  private getUserFromStorage(): User | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if stored token exists
   */
  private hasValidToken(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = this.getUserFromStorage();
    return !!(token && user);
  }

  /**
   * Validate stored token by making a profile request
   */
  private validateStoredToken(): void {
    if (this.hasValidToken()) {
      this.getProfile().subscribe({
        next: () => {
          // Token is valid, user data updated
        },
        error: () => {
          // Token is invalid, clear auth data
          this.logout();
        }
      });
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Auth Service Error:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}