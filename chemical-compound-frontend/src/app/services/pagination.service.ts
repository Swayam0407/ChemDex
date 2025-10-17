import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { PaginationParams } from '../models/compound.interface';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly DEFAULT_PAGE = 1;

  private currentPageSubject = new BehaviorSubject<number>(this.DEFAULT_PAGE);
  private pageSizeSubject = new BehaviorSubject<number>(this.DEFAULT_PAGE_SIZE);
  private totalItemsSubject = new BehaviorSubject<number>(0);

  public currentPage$ = this.currentPageSubject.asObservable();
  public pageSize$ = this.pageSizeSubject.asObservable();
  public totalItems$ = this.totalItemsSubject.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeFromUrl();
  }

  /**
   * Get current pagination state as observable
   */
  getPaginationState(): Observable<PaginationState> {
    return combineLatest([
      this.currentPage$,
      this.pageSize$,
      this.totalItems$
    ]).pipe(
      map(([currentPage, pageSize, totalItems]) => {
        const totalPages = Math.ceil(totalItems / pageSize);
        return {
          currentPage,
          pageSize,
          totalItems,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrevious: currentPage > 1
        };
      }),
      distinctUntilChanged((prev, curr) => 
        prev.currentPage === curr.currentPage &&
        prev.pageSize === curr.pageSize &&
        prev.totalItems === curr.totalItems
      )
    );
  }

  /**
   * Get current pagination parameters
   */
  getCurrentParams(): PaginationParams {
    return {
      page: this.currentPageSubject.value,
      limit: this.pageSizeSubject.value
    };
  }

  /**
   * Set current page and update URL
   */
  setCurrentPage(page: number): void {
    if (page < 1) page = 1;
    
    this.currentPageSubject.next(page);
    this.updateUrl();
  }

  /**
   * Set page size and reset to first page
   */
  setPageSize(size: number): void {
    if (size < 1) size = this.DEFAULT_PAGE_SIZE;
    
    this.pageSizeSubject.next(size);
    this.currentPageSubject.next(1);
    this.updateUrl();
  }

  /**
   * Set total items count (used to calculate total pages)
   */
  setTotalItems(total: number): void {
    this.totalItemsSubject.next(Math.max(0, total));
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    const currentPage = this.currentPageSubject.value;
    const pageSize = this.pageSizeSubject.value;
    const totalItems = this.totalItemsSubject.value;
    const totalPages = Math.ceil(totalItems / pageSize);

    if (currentPage < totalPages) {
      this.setCurrentPage(currentPage + 1);
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    const currentPage = this.currentPageSubject.value;
    if (currentPage > 1) {
      this.setCurrentPage(currentPage - 1);
    }
  }

  /**
   * Navigate to first page
   */
  firstPage(): void {
    this.setCurrentPage(1);
  }

  /**
   * Navigate to last page
   */
  lastPage(): void {
    const pageSize = this.pageSizeSubject.value;
    const totalItems = this.totalItemsSubject.value;
    const totalPages = Math.ceil(totalItems / pageSize);
    this.setCurrentPage(totalPages);
  }

  /**
   * Reset pagination to defaults
   */
  reset(): void {
    this.currentPageSubject.next(this.DEFAULT_PAGE);
    this.pageSizeSubject.next(this.DEFAULT_PAGE_SIZE);
    this.totalItemsSubject.next(0);
    this.updateUrl();
  }

  /**
   * Initialize pagination from URL parameters
   */
  private initializeFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      const page = parseInt(params['page']) || this.DEFAULT_PAGE;
      const limit = parseInt(params['limit']) || this.DEFAULT_PAGE_SIZE;

      // Update subjects without triggering URL update to avoid infinite loop
      this.currentPageSubject.next(Math.max(1, page));
      this.pageSizeSubject.next(Math.max(1, limit));
    });
  }

  /**
   * Update URL with current pagination parameters
   */
  private updateUrl(): void {
    const currentPage = this.currentPageSubject.value;
    const pageSize = this.pageSizeSubject.value;

    const queryParams: any = {};
    
    // Only add page parameter if it's not the default
    if (currentPage !== this.DEFAULT_PAGE) {
      queryParams.page = currentPage;
    }
    
    // Only add limit parameter if it's not the default
    if (pageSize !== this.DEFAULT_PAGE_SIZE) {
      queryParams.limit = pageSize;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * Get page numbers for pagination display
   */
  getPageNumbers(maxVisible: number = 5): Observable<number[]> {
    return this.getPaginationState().pipe(
      map(state => {
        const { currentPage, totalPages } = state;
        const pages: number[] = [];

        if (totalPages <= maxVisible) {
          // Show all pages if total is less than max visible
          for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Calculate start and end pages
          let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
          let endPage = Math.min(totalPages, startPage + maxVisible - 1);

          // Adjust start page if we're near the end
          if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
          }

          for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
          }
        }

        return pages;
      })
    );
  }
}
