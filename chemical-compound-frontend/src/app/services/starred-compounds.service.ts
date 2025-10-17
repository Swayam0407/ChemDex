import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Compound } from '../models/compound.interface';
import { NotificationService } from './notification.service';

export interface StarredCompound {
  id: string;
  compound: Compound;
  starredAt: Date;
}

export interface StarredCompoundsStorage {
  version: string;
  compounds: {
    [compoundId: string]: {
      compound: Compound;
      starredAt: string; // ISO date string
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class StarredCompoundsService {
  private readonly STORAGE_KEY = 'starred-compounds';
  private readonly STORAGE_VERSION = '1.0.0';
  
  private starredCompoundsSubject = new BehaviorSubject<StarredCompound[]>([]);
  private storageType: 'localStorage' | 'sessionStorage' | 'memory' = 'localStorage';
  private memoryStorage: StarredCompoundsStorage | null = null;
  private operationInProgress = new Set<string>(); // Track ongoing operations

  constructor(private notificationService: NotificationService) {
    this.initializeStorage();
    this.loadStarredCompounds();
  }

  /**
   * Get observable of all starred compounds
   */
  getStarredCompounds(): Observable<StarredCompound[]> {
    return this.starredCompoundsSubject.asObservable();
  }

  /**
   * Get observable of starred compounds count
   */
  getStarredCount(): Observable<number> {
    return this.starredCompoundsSubject.pipe(
      map(compounds => compounds.length)
    );
  }

  /**
   * Check if a compound is starred
   */
  isStarred(compoundId: string | number): Observable<boolean> {
    const id = compoundId.toString();
    return this.starredCompoundsSubject.pipe(
      map(compounds => compounds.some(starred => starred.id === id))
    );
  }

  /**
   * Toggle starred status of a compound with optimistic updates and rollback capability
   */
  toggleStar(compound: Compound): Observable<boolean> {
    const compoundId = compound.id.toString();
    
    // Prevent concurrent operations on the same compound
    if (this.operationInProgress.has(compoundId)) {
      return throwError(() => new Error('Operation already in progress for this compound'));
    }

    try {
      this.operationInProgress.add(compoundId);
      const currentStarred = this.starredCompoundsSubject.value;
      const isCurrentlyStarred = currentStarred.some(starred => starred.id === compoundId);

      if (isCurrentlyStarred) {
        return this.unstarCompoundWithOptimisticUpdate(compoundId);
      } else {
        return this.starCompoundWithOptimisticUpdate(compound);
      }
    } catch (error) {
      this.operationInProgress.delete(compoundId);
      console.error('Error toggling star status:', error);
      this.notificationService.showError('Failed to update favorites. Please try again.');
      return throwError(() => new Error('Failed to toggle star status'));
    }
  }

  /**
   * Star a compound with optimistic update and rollback capability
   */
  private starCompoundWithOptimisticUpdate(compound: Compound): Observable<boolean> {
    const compoundId = compound.id.toString();
    const currentStarred = this.starredCompoundsSubject.value;
    
    // Check if already starred
    if (currentStarred.some(starred => starred.id === compoundId)) {
      this.operationInProgress.delete(compoundId);
      return of(true);
    }

    const starredCompound: StarredCompound = {
      id: compoundId,
      compound: compound,
      starredAt: new Date()
    };

    // Optimistic update - immediately update UI
    const optimisticStarred = [...currentStarred, starredCompound];
    this.starredCompoundsSubject.next(optimisticStarred);

    return new Observable(observer => {
      try {
        // Attempt to persist to storage
        this.persistToStorage(optimisticStarred);
        this.operationInProgress.delete(compoundId);
        observer.next(true);
        observer.complete();
      } catch (error) {
        // Rollback on failure
        this.starredCompoundsSubject.next(currentStarred);
        this.operationInProgress.delete(compoundId);
        console.error('Error starring compound:', error);
        this.handleStorageError(error);
        observer.error(new Error('Failed to star compound'));
      }
    });
  }

  /**
   * Star a compound (legacy method for backward compatibility)
   */
  starCompound(compound: Compound): Observable<boolean> {
    return this.starCompoundWithOptimisticUpdate(compound);
  }

  /**
   * Unstar a compound with optimistic update and rollback capability
   */
  private unstarCompoundWithOptimisticUpdate(compoundId: string | number): Observable<boolean> {
    const id = compoundId.toString();
    const currentStarred = this.starredCompoundsSubject.value;
    const updatedStarred = currentStarred.filter(starred => starred.id !== id);
    
    // Optimistic update - immediately update UI
    this.starredCompoundsSubject.next(updatedStarred);

    return new Observable(observer => {
      try {
        // Attempt to persist to storage
        this.persistToStorage(updatedStarred);
        this.operationInProgress.delete(id);
        observer.next(false);
        observer.complete();
      } catch (error) {
        // Rollback on failure
        this.starredCompoundsSubject.next(currentStarred);
        this.operationInProgress.delete(id);
        console.error('Error unstarring compound:', error);
        this.handleStorageError(error);
        observer.error(new Error('Failed to unstar compound'));
      }
    });
  }

  /**
   * Unstar a compound (legacy method for backward compatibility)
   */
  unstarCompound(compoundId: string | number): Observable<boolean> {
    return this.unstarCompoundWithOptimisticUpdate(compoundId);
  }

  /**
   * Clear all starred compounds with error handling
   */
  clearAllStarred(): Observable<boolean> {
    const currentStarred = this.starredCompoundsSubject.value;
    
    // Optimistic update
    this.starredCompoundsSubject.next([]);

    return new Observable(observer => {
      try {
        this.persistToStorage([]);
        this.notificationService.showSuccess('All favorites cleared');
        observer.next(true);
        observer.complete();
      } catch (error) {
        // Rollback on failure
        this.starredCompoundsSubject.next(currentStarred);
        console.error('Error clearing starred compounds:', error);
        this.handleStorageError(error);
        observer.error(new Error('Failed to clear favorites'));
      }
    });
  }

  /**
   * Get starred compounds as a synchronous array (for filtering)
   */
  getStarredCompoundsSync(): StarredCompound[] {
    return this.starredCompoundsSubject.value;
  }

  /**
   * Initialize storage type based on availability
   */
  private initializeStorage(): void {
    try {
      // Test localStorage availability
      const testKey = '__starred_compounds_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.storageType = 'localStorage';
    } catch (error) {
      try {
        // Fallback to sessionStorage
        const testKey = '__starred_compounds_test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        this.storageType = 'sessionStorage';
        console.warn('localStorage unavailable, using sessionStorage for starred compounds');
      } catch (sessionError) {
        // Fallback to memory storage
        this.storageType = 'memory';
        this.memoryStorage = {
          version: this.STORAGE_VERSION,
          compounds: {}
        };
        console.warn('Both localStorage and sessionStorage unavailable, using memory storage for starred compounds');
      }
    }
  }

  /**
   * Load starred compounds from storage
   */
  private loadStarredCompounds(): void {
    try {
      let storageData: string | null = null;

      switch (this.storageType) {
        case 'localStorage':
          storageData = localStorage.getItem(this.STORAGE_KEY);
          break;
        case 'sessionStorage':
          storageData = sessionStorage.getItem(this.STORAGE_KEY);
          break;
        case 'memory':
          storageData = this.memoryStorage ? JSON.stringify(this.memoryStorage) : null;
          break;
      }

      if (!storageData) {
        this.starredCompoundsSubject.next([]);
        return;
      }

      const parsedData: StarredCompoundsStorage = JSON.parse(storageData);
      
      // Validate storage version and structure
      if (!parsedData.version || !parsedData.compounds) {
        console.warn('Invalid starred compounds storage format, resetting');
        this.clearAllStarred();
        return;
      }

      // Convert storage format to StarredCompound array
      const starredCompounds: StarredCompound[] = Object.entries(parsedData.compounds).map(([id, data]) => ({
        id,
        compound: data.compound,
        starredAt: new Date(data.starredAt)
      }));

      this.starredCompoundsSubject.next(starredCompounds);
    } catch (error) {
      console.error('Error loading starred compounds from storage:', error);
      this.starredCompoundsSubject.next([]);
    }
  }

  /**
   * Update starred compounds and persist to storage
   */
  private updateStarredCompounds(starredCompounds: StarredCompound[]): void {
    try {
      // Update the BehaviorSubject
      this.starredCompoundsSubject.next(starredCompounds);

      // Prepare storage format
      const storageData: StarredCompoundsStorage = {
        version: this.STORAGE_VERSION,
        compounds: {}
      };

      starredCompounds.forEach(starred => {
        storageData.compounds[starred.id] = {
          compound: starred.compound,
          starredAt: starred.starredAt.toISOString()
        };
      });

      const serializedData = JSON.stringify(storageData);

      // Persist to storage
      switch (this.storageType) {
        case 'localStorage':
          localStorage.setItem(this.STORAGE_KEY, serializedData);
          break;
        case 'sessionStorage':
          sessionStorage.setItem(this.STORAGE_KEY, serializedData);
          break;
        case 'memory':
          this.memoryStorage = storageData;
          break;
      }
    } catch (error) {
      console.error('Error persisting starred compounds to storage:', error);
      
      // If storage fails, try to fallback to a different storage type
      if (this.storageType === 'localStorage') {
        console.warn('localStorage failed, attempting fallback to sessionStorage');
        this.storageType = 'sessionStorage';
        this.updateStarredCompounds(starredCompounds);
      } else if (this.storageType === 'sessionStorage') {
        console.warn('sessionStorage failed, falling back to memory storage');
        this.storageType = 'memory';
        this.memoryStorage = {
          version: this.STORAGE_VERSION,
          compounds: {}
        };
        this.updateStarredCompounds(starredCompounds);
      }
    }
  }

  /**
   * Get current storage type (for debugging/testing)
   */
  getStorageType(): 'localStorage' | 'sessionStorage' | 'memory' {
    return this.storageType;
  }

  /**
   * Check if an operation is in progress for a compound
   */
  isOperationInProgress(compoundId: string | number): boolean {
    return this.operationInProgress.has(compoundId.toString());
  }

  /**
   * Persist starred compounds to storage with error handling
   */
  private persistToStorage(starredCompounds: StarredCompound[]): void {
    // Prepare storage format
    const storageData: StarredCompoundsStorage = {
      version: this.STORAGE_VERSION,
      compounds: {}
    };

    starredCompounds.forEach(starred => {
      storageData.compounds[starred.id] = {
        compound: starred.compound,
        starredAt: starred.starredAt.toISOString()
      };
    });

    const serializedData = JSON.stringify(storageData);

    // Attempt to persist to storage with fallback handling
    try {
      switch (this.storageType) {
        case 'localStorage':
          localStorage.setItem(this.STORAGE_KEY, serializedData);
          break;
        case 'sessionStorage':
          sessionStorage.setItem(this.STORAGE_KEY, serializedData);
          break;
        case 'memory':
          this.memoryStorage = storageData;
          break;
      }
    } catch (error) {
      // Handle storage quota exceeded or other storage errors
      this.handleStorageFailure(error, starredCompounds);
      throw error; // Re-throw to trigger rollback
    }
  }

  /**
   * Handle storage failures with fallback strategies
   */
  private handleStorageFailure(error: any, starredCompounds: StarredCompound[]): void {
    console.error('Storage operation failed:', error);

    // Try to fallback to a different storage type
    if (this.storageType === 'localStorage') {
      console.warn('localStorage failed, attempting fallback to sessionStorage');
      try {
        this.storageType = 'sessionStorage';
        this.persistToStorage(starredCompounds);
        this.notificationService.showWarning(
          'Favorites will only be saved for this session due to storage limitations',
          'Dismiss',
          { duration: 8000 }
        );
        return;
      } catch (sessionError) {
        console.error('sessionStorage also failed:', sessionError);
      }
    }

    if (this.storageType === 'sessionStorage' || this.storageType === 'localStorage') {
      console.warn('Both localStorage and sessionStorage failed, falling back to memory storage');
      this.storageType = 'memory';
      this.memoryStorage = {
        version: this.STORAGE_VERSION,
        compounds: {}
      };
      try {
        this.persistToStorage(starredCompounds);
        this.notificationService.showWarning(
          'Favorites will not persist after closing the browser due to storage limitations',
          'Dismiss',
          { duration: 8000 }
        );
        return;
      } catch (memoryError) {
        console.error('Memory storage also failed:', memoryError);
      }
    }

    // If all storage methods fail, show error
    this.handleStorageError(error);
  }

  /**
   * Handle storage errors with user feedback
   */
  private handleStorageError(error: any): void {
    let errorMessage = 'Failed to save favorites';
    
    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      errorMessage = 'Storage quota exceeded. Please clear some browser data and try again';
    } else if (error?.name === 'SecurityError') {
      errorMessage = 'Storage access denied. Please check your browser settings';
    } else if (error?.message?.includes('storage')) {
      errorMessage = 'Storage is not available. Favorites may not persist';
    }

    this.notificationService.showError(errorMessage, 'Dismiss', { duration: 8000 });
  }
}