import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap, map } from 'rxjs/operators';
import { 
  Compound, 
  PaginatedCompoundsResponse, 
  CompoundResponse, 
  UpdateCompoundRequest,
  PaginationParams,
  ApiError 
} from '../models/compound.interface';
import { ErrorDetails } from '../interceptors/error.interceptor';
import { environment } from '../../environments/environment';

// Backend API response interfaces
interface BackendPaginatedResponse {
  success: boolean;
  data: Compound[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface BackendCompoundResponse {
  success: boolean;
  data: Compound;
}

@Injectable({
  providedIn: 'root'
})
export class CompoundService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private compoundsCache = new BehaviorSubject<Compound[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public compounds$ = this.compoundsCache.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Get paginated list of compounds
   */
  getCompounds(params: PaginationParams & { element?: string; search?: string }): Observable<PaginatedCompoundsResponse> {
    this.loadingSubject.next(true);
    
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    // Add element filter if provided
    if (params.element) {
      httpParams = httpParams.set('element', params.element);
    }

    // Add search term if provided
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<BackendPaginatedResponse>(`${this.apiUrl}/compounds`, { params: httpParams })
      .pipe(
        retry(2),
        map(backendResponse => ({
          compounds: backendResponse.data,
          totalCount: backendResponse.pagination.totalCount,
          currentPage: backendResponse.pagination.currentPage,
          totalPages: backendResponse.pagination.totalPages
        })),
        tap(response => {
          this.compoundsCache.next(response.compounds);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get a single compound by ID
   */
  getCompound(id: number): Observable<CompoundResponse> {
    this.loadingSubject.next(true);
    
    return this.http.get<BackendCompoundResponse>(`${this.apiUrl}/compounds/${id}`)
      .pipe(
        retry(2),
        map(backendResponse => ({
          compound: backendResponse.data
        })),
        tap(() => this.loadingSubject.next(false)),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update a compound
   */
  updateCompound(id: number, compound: UpdateCompoundRequest): Observable<CompoundResponse> {
    this.loadingSubject.next(true);
    
    return this.http.put<BackendCompoundResponse>(`${this.apiUrl}/compounds/${id}`, compound)
      .pipe(
        retry(1),
        map(backendResponse => ({
          compound: backendResponse.data
        })),
        tap(response => {
          // Update the cached compounds list
          const currentCompounds = this.compoundsCache.value;
          const updatedCompounds = currentCompounds.map(c => 
            c.id === id ? response.compound : c
          );
          this.compoundsCache.next(updatedCompounds);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Delete a compound
   */
  deleteCompound(id: number): Observable<{ success: boolean; message: string }> {
    this.loadingSubject.next(true);
    
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/compounds/${id}`)
      .pipe(
        retry(1),
        tap(() => {
          // Remove the compound from the cached compounds list
          const currentCompounds = this.compoundsCache.value;
          const updatedCompounds = currentCompounds.filter(c => c.id !== id);
          this.compoundsCache.next(updatedCompounds);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get compounds containing a specific element
   */
  getCompoundsByElement(elementSymbol: string): Observable<Compound[]> {
    this.loadingSubject.next(true);
    
    const httpParams = new HttpParams()
      .set('element', elementSymbol)
      .set('limit', '1000'); // Get all compounds for counting

    return this.http.get<BackendPaginatedResponse>(`${this.apiUrl}/compounds`, { params: httpParams })
      .pipe(
        retry(2),
        map(backendResponse => backendResponse.data),
        tap(() => this.loadingSubject.next(false)),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Clear the compounds cache
   */
  clearCache(): void {
    this.compoundsCache.next([]);
  }

  /**
   * Get cached compounds
   */
  getCachedCompounds(): Compound[] {
    return this.compoundsCache.value;
  }

  /**
   * Handle HTTP errors (now handled by interceptor, but keeping for backward compatibility)
   */
  private handleError(error: ErrorDetails | HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if ('timestamp' in error) {
      // Error from interceptor
      apiError = {
        message: error.message,
        status: error.status,
        error: error.error
      };
    } else {
      // Direct HTTP error (fallback)
      apiError = {
        message: error.error?.message || `Server Error: ${error.status} ${error.statusText}`,
        status: error.status,
        error: error.error
      };
    }

    console.error('CompoundService Error:', apiError);
    return throwError(() => apiError);
  }
}
