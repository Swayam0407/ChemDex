import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Element, ElementCategory } from '../models/element.interface';
import { ElementDataService } from './element-data.service';

@Injectable({
  providedIn: 'root'
})
export class PeriodicTableService {
  private selectedElement$ = new BehaviorSubject<Element | null>(null);
  private searchQuery$ = new BehaviorSubject<string>('');
  private activeFilters$ = new BehaviorSubject<ElementCategory[]>([]);
  private highlightedElements$ = new BehaviorSubject<Element[]>([]);

  constructor(private elementDataService: ElementDataService) {}

  /**
   * Select an element
   */
  selectElement(element: Element | null): void {
    this.selectedElement$.next(element);
  }

  /**
   * Get the currently selected element
   */
  getSelectedElement(): Observable<Element | null> {
    return this.selectedElement$.asObservable();
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this.searchQuery$.next(query);
  }

  /**
   * Get current search query
   */
  getSearchQuery(): Observable<string> {
    return this.searchQuery$.asObservable();
  }

  /**
   * Toggle category filter
   */
  toggleCategoryFilter(category: ElementCategory): void {
    const currentFilters = this.activeFilters$.value;
    const index = currentFilters.indexOf(category);
    
    if (index > -1) {
      // Remove filter
      const newFilters = currentFilters.filter(f => f !== category);
      this.activeFilters$.next(newFilters);
    } else {
      // Add filter
      this.activeFilters$.next([...currentFilters, category]);
    }
  }

  /**
   * Set category filters
   */
  setCategoryFilters(categories: ElementCategory[]): void {
    this.activeFilters$.next([...categories]);
  }

  /**
   * Get active category filters
   */
  getActiveFilters(): Observable<ElementCategory[]> {
    return this.activeFilters$.asObservable();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.activeFilters$.next([]);
    this.searchQuery$.next('');
  }

  /**
   * Clear search query only
   */
  clearSearch(): void {
    this.searchQuery$.next('');
  }

  /**
   * Get filtered elements based on search and category filters
   */
  getFilteredElements(): Observable<Element[]> {
    return combineLatest([
      this.searchQuery$,
      this.activeFilters$
    ]).pipe(
      map(([searchQuery, activeFilters]) => {
        let elements = this.elementDataService.getAllElements();

        // Apply search filter
        if (searchQuery && searchQuery.trim().length > 0) {
          elements = this.elementDataService.searchElements(searchQuery);
        }

        // Apply category filters
        if (activeFilters.length > 0) {
          elements = elements.filter(element => 
            activeFilters.includes(element.category)
          );
        }

        return elements;
      })
    );
  }

  /**
   * Get elements that should be highlighted (search results)
   */
  getHighlightedElements(): Observable<Element[]> {
    return this.searchQuery$.pipe(
      map(searchQuery => {
        if (!searchQuery || searchQuery.trim().length === 0) {
          return [];
        }
        return this.elementDataService.searchElements(searchQuery);
      })
    );
  }

  /**
   * Get elements that should be dimmed (not matching current filters)
   */
  getDimmedElements(): Observable<Element[]> {
    return combineLatest([
      this.searchQuery$,
      this.activeFilters$
    ]).pipe(
      map(([searchQuery, activeFilters]) => {
        const allElements = this.elementDataService.getAllElements();
        
        // If no filters are active, don't dim any elements
        if ((!searchQuery || searchQuery.trim().length === 0) && activeFilters.length === 0) {
          return [];
        }

        let matchingElements = allElements;

        // Apply search filter
        if (searchQuery && searchQuery.trim().length > 0) {
          matchingElements = this.elementDataService.searchElements(searchQuery);
        }

        // Apply category filters
        if (activeFilters.length > 0) {
          matchingElements = matchingElements.filter(element => 
            activeFilters.includes(element.category)
          );
        }

        // Return elements that are NOT in the matching set
        const matchingAtomicNumbers = new Set(matchingElements.map(e => e.atomicNumber));
        return allElements.filter(element => !matchingAtomicNumbers.has(element.atomicNumber));
      })
    );
  }

  /**
   * Check if an element is currently highlighted
   */
  isElementHighlighted(element: Element): Observable<boolean> {
    return this.getHighlightedElements().pipe(
      map(highlightedElements => 
        highlightedElements.some(e => e.atomicNumber === element.atomicNumber)
      )
    );
  }

  /**
   * Check if an element is currently dimmed
   */
  isElementDimmed(element: Element): Observable<boolean> {
    return this.getDimmedElements().pipe(
      map(dimmedElements => 
        dimmedElements.some(e => e.atomicNumber === element.atomicNumber)
      )
    );
  }

  /**
   * Check if an element matches current filters
   */
  isElementVisible(element: Element): Observable<boolean> {
    return combineLatest([
      this.searchQuery$,
      this.activeFilters$
    ]).pipe(
      map(([searchQuery, activeFilters]) => {
        // Check search filter
        if (searchQuery && searchQuery.trim().length > 0) {
          const searchResults = this.elementDataService.searchElements(searchQuery);
          const matchesSearch = searchResults.some(e => e.atomicNumber === element.atomicNumber);
          if (!matchesSearch) {
            return false;
          }
        }

        // Check category filters
        if (activeFilters.length > 0) {
          return activeFilters.includes(element.category);
        }

        return true;
      })
    );
  }

  /**
   * Get element by atomic number
   */
  getElementById(atomicNumber: number): Element | undefined {
    return this.elementDataService.getElementById(atomicNumber);
  }

  /**
   * Get elements by category
   */
  getElementsByCategory(category: ElementCategory): Element[] {
    return this.elementDataService.getElementsByCategory(category);
  }

  /**
   * Get all available categories
   */
  getAvailableCategories(): ElementCategory[] {
    return this.elementDataService.getAvailableCategories();
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.selectedElement$.next(null);
    this.searchQuery$.next('');
    this.activeFilters$.next([]);
    this.highlightedElements$.next([]);
  }
}