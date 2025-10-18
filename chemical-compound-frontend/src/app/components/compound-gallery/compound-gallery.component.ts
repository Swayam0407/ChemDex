import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil, combineLatest, startWith, distinctUntilChanged } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';

import { CompoundService } from '../../services/compound.service';
import { PaginationService, PaginationState } from '../../services/pagination.service';
import { NotificationService } from '../../services/notification.service';
import { StarredCompoundsService } from '../../services/starred-compounds.service';
import { CompoundCardComponent } from '../compound-card/compound-card.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SearchCardComponent } from '../search-card/search-card.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { Compound, ApiError } from '../../models/compound.interface';

@Component({
  selector: 'app-compound-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CompoundCardComponent,
    PaginationComponent,
    SearchCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './compound-gallery.component.html',
  styleUrl: './compound-gallery.component.scss'
})
export class CompoundGalleryComponent implements OnInit, OnDestroy {
  compounds: Compound[] = [];
  loading = false;
  error: string | null = null;
  errorType: 'network' | 'server' | 'unknown' = 'unknown';
  paginationState: PaginationState | null = null;
  retryCount = 0;
  maxRetries = 3;
  elementFilter: string | null = null;
  searchTerm: string = '';
  totalResults: number = 0;
  
  // View mode
  isStarredView = false;
  
  // Starred compounds specific properties
  starredCompounds: Compound[] = [];
  filteredStarredCompounds: Compound[] = [];
  starredPaginationState: PaginationState | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new BehaviorSubject<string>('');

  constructor(
    private compoundService: CompoundService,
    private paginationService: PaginationService,
    private notificationService: NotificationService,
    private starredCompoundsService: StarredCompoundsService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Check if this is the starred view from route data
      this.isStarredView = this.route.snapshot.data['isStarredView'] || false;
      
      this.setupStarredCompoundsSubscription();
      this.setupPaginationSubscription();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupStarredCompoundsSubscription(): void {
    // Subscribe to starred compounds and handle filtering/pagination with error handling
    combineLatest([
      this.starredCompoundsService.getStarredCompounds().pipe(
        catchError(error => {
          console.error('Error loading starred compounds:', error);
          this.notificationService.showError(
            'Failed to load starred compounds. Some features may not work correctly.',
            'Dismiss',
            { duration: 6000 }
          );
          return of([]); // Return empty array on error
        })
      ),
      this.searchSubject.pipe(distinctUntilChanged())
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([starredCompounds, searchTerm]) => {
        try {
          // Extract compounds from starred compounds
          this.starredCompounds = starredCompounds.map(starred => starred.compound);
          
          // Apply search filter to starred compounds if search term exists
          if (searchTerm && searchTerm.trim()) {
            this.filteredStarredCompounds = this.starredCompounds.filter(compound => 
              this.matchesSearchTerm(compound, searchTerm.trim().toLowerCase())
            );
          } else {
            this.filteredStarredCompounds = [...this.starredCompounds];
          }
          
          // Update starred pagination state
          this.updateStarredPagination();
          
          // If we're on the starred view, update the display
          if (this.isStarredView) {
            this.updateStarredDisplay();
          }
        } catch (error) {
          console.error('Error processing starred compounds:', error);
          this.notificationService.showError(
            'Error processing starred compounds data',
            'Dismiss',
            { duration: 5000 }
          );
        }
      },
      error: (error) => {
        console.error('Critical error in starred compounds subscription:', error);
        this.notificationService.showError(
          'Critical error loading starred compounds. Please refresh the page.',
          'Refresh',
          { duration: 0 }
        );
      }
    });
  }

  private matchesSearchTerm(compound: Compound, searchTerm: string): boolean {
    const searchableFields = [
      compound.name?.toLowerCase() || '',
      compound.description?.toLowerCase() || ''
    ];
    
    return searchableFields.some(field => field.includes(searchTerm));
  }

  private updateStarredPagination(): void {
    const totalStarredItems = this.filteredStarredCompounds.length;
    const pageSize = this.paginationService.getCurrentParams().limit;
    const totalPages = Math.ceil(totalStarredItems / pageSize);
    const currentPage = this.starredPaginationState?.currentPage || 1;
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    
    this.starredPaginationState = {
      currentPage: validCurrentPage,
      pageSize: pageSize,
      totalItems: totalStarredItems,
      totalPages: totalPages,
      hasNext: validCurrentPage < totalPages,
      hasPrevious: validCurrentPage > 1
    };
    
    // Update pagination service if we're on starred view
    if (this.isStarredView) {
      this.paginationService.setTotalItems(totalStarredItems);
      if (validCurrentPage !== currentPage) {
        this.paginationService.setCurrentPage(validCurrentPage);
      }
    }
  }

  private updateStarredDisplay(): void {
    if (!this.starredPaginationState) {
      return;
    }
    
    const startIndex = (this.starredPaginationState.currentPage - 1) * this.starredPaginationState.pageSize;
    const endIndex = startIndex + this.starredPaginationState.pageSize;
    
    this.compounds = this.filteredStarredCompounds.slice(startIndex, endIndex);
    this.totalResults = this.filteredStarredCompounds.length;
    this.paginationState = this.starredPaginationState;
  }

  private setupPaginationSubscription(): void {
    // Combine pagination parameters with pagination state, query parameters, and search
    combineLatest([
      this.paginationService.currentPage$.pipe(startWith(1)),
      this.paginationService.pageSize$.pipe(startWith(10)),
      this.paginationService.getPaginationState(),
      this.route.queryParams.pipe(
        map(params => ({
          element: params['element'] || null
        })),
        startWith({ element: null })
      ),
      this.searchSubject.pipe(
        distinctUntilChanged()
      )
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([currentPage, pageSize, paginationState, queryParams, searchTerm]) => {
        // If we're on the starred view, handle it separately
        if (this.isStarredView) {
          this.handleStarredViewPagination(currentPage, pageSize);
          return of(null); // Don't make API call for starred view
        }
        
        // Handle regular compounds view
        this.paginationState = paginationState;
        this.elementFilter = queryParams.element;
        this.searchTerm = searchTerm;
        this.loading = true;
        this.error = null;

        // Reset to page 1 when search changes
        if (searchTerm !== this.searchTerm) {
          this.paginationService.setCurrentPage(1);
        }

        const requestParams: any = {
          page: currentPage,
          limit: pageSize
        };

        if (queryParams.element) {
          requestParams.element = queryParams.element;
        }

        if (searchTerm) {
          requestParams.search = searchTerm;
        }

        return this.compoundService.getCompounds(requestParams).pipe(
          catchError((error: ApiError) => {
            this.handleError(error);
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      this.loading = false;
      
      if (response) {
        this.compounds = response.compounds;
        this.totalResults = response.totalCount;
        this.paginationService.setTotalItems(response.totalCount);
        this.error = null;
      }
    });
  }

  private handleStarredViewPagination(currentPage: number, pageSize: number): void {
    if (!this.starredPaginationState) {
      return;
    }
    
    // Update starred pagination state with current page
    this.starredPaginationState = {
      ...this.starredPaginationState,
      currentPage: currentPage,
      pageSize: pageSize,
      hasNext: currentPage < this.starredPaginationState.totalPages,
      hasPrevious: currentPage > 1
    };
    
    // Update display with new pagination
    this.updateStarredDisplay();
    this.loading = false;
    this.error = null;
  }

  onCardClick(compound: Compound): void {
    this.router.navigate(['/compounds', compound.id]);
  }

  onRetry(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.error = null;
      this.setupPaginationSubscription();
    } else {
      this.notificationService.showWarning(
        'Maximum retry attempts reached. Please refresh the page.',
        'Dismiss'
      );
    }
  }

  getErrorTitle(): string {
    switch (this.errorType) {
      case 'network':
        return 'Connection Problem';
      case 'server':
        return 'Server Error';
      default:
        return 'Loading Error';
    }
  }

  getErrorMessage(): string {
    switch (this.errorType) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 'server':
        return 'The server is experiencing issues. Please try again in a few moments.';
      default:
        return this.error || 'An unexpected error occurred while loading compounds.';
    }
  }

  getErrorIcon(): string {
    switch (this.errorType) {
      case 'network':
        return 'wifi_off';
      case 'server':
        return 'dns';
      default:
        return 'error_outline';
    }
  }

  trackByCompoundId(index: number, compound: Compound): number {
    return compound.id;
  }

  refreshPage(): void {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  /**
   * Clear element filter
   */
  clearElementFilter(): void {
    this.router.navigate(['/compounds'], { 
      queryParams: {} 
    });
  }

  /**
   * Get display text for element filter
   */
  getElementFilterText(): string {
    return this.elementFilter ? `Compounds containing ${this.elementFilter}` : '';
  }

  /**
   * Check if element filter is active
   */
  hasElementFilter(): boolean {
    return !!this.elementFilter;
  }

  /**
   * Handle search input change
   */
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  /**
   * Clear search
   */
  onClearSearch(): void {
    this.searchSubject.next('');
  }

  /**
   * Get the appropriate pagination state based on active view
   */
  getCurrentPaginationState(): PaginationState | null {
    return this.isStarredView ? this.starredPaginationState : this.paginationState;
  }

  /**
   * Get the appropriate empty state type based on current context
   */
  getEmptyStateType(): 'starred' | 'starred-search' | 'general' {
    if (this.isStarredView) {
      return this.searchTerm ? 'starred-search' : 'starred';
    }
    return 'general';
  }

  /**
   * Handle browse all compounds click from empty state
   */
  onBrowseAllCompounds(): void {
    this.router.navigate(['/compounds']);
  }

  /**
   * Clear all starred compounds with error handling
   */
  onClearAllStarred(): void {
    if (this.starredCompounds.length === 0) {
      return;
    }

    // Show loading state
    this.loading = true;

    this.starredCompoundsService.clearAllStarred().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.loading = false;
        // Navigate to all compounds view if we're on starred view
        if (this.isStarredView) {
          this.router.navigate(['/compounds']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error clearing all starred compounds:', error);
        // Error notification is handled by the service
      }
    });
  }



  private handleError(error: ApiError): void {
    this.loading = false;
    this.error = error.message || 'Failed to load compounds';
    
    // Determine error type for better user experience
    if (error.status === 0) {
      this.errorType = 'network';
    } else if (error.status >= 500) {
      this.errorType = 'server';
    } else {
      this.errorType = 'unknown';
    }

    // Only show notification if we haven't exceeded retry limit
    if (this.retryCount < this.maxRetries) {
      this.notificationService.showError(
        'Failed to load compounds. Please try again.',
        'Retry',
        { duration: 6000 }
      );
    } else {
      this.notificationService.showError(
        'Unable to load compounds after multiple attempts. Please check your connection.',
        'Dismiss',
        { duration: 0 } // Don't auto-dismiss
      );
    }
  }
}
