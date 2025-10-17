import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .subscribe(route => {
        this.updateBreadcrumbs(route);
        this.updatePageTitle(route);
      });
  }

  private updateBreadcrumbs(route: ActivatedRoute): void {
    const breadcrumbs: BreadcrumbItem[] = [];
    const url = this.router.url;

    // Always add home/gallery
    breadcrumbs.push({
      label: 'Gallery',
      url: '/compounds',
      active: url === '/compounds'
    });

    // Add compound-specific breadcrumbs
    if (url.includes('/compounds/') && route.snapshot.params['id']) {
      const compoundId = route.snapshot.params['id'];
      
      breadcrumbs.push({
        label: `Compound #${compoundId}`,
        url: `/compounds/${compoundId}`,
        active: url === `/compounds/${compoundId}`
      });

      if (url.includes('/edit')) {
        breadcrumbs.push({
          label: 'Edit',
          url: `/compounds/${compoundId}/edit`,
          active: true
        });
      }
    }

    this.breadcrumbsSubject.next(breadcrumbs);
  }

  private updatePageTitle(route: ActivatedRoute): void {
    const routeData = route.snapshot.data;
    const params = route.snapshot.params;
    
    let title = 'Chemical Compound Manager';
    
    if (routeData['title']) {
      title = routeData['title'];
      
      // Add compound ID to title if available
      if (params['id']) {
        title += ` - Compound #${params['id']}`;
      }
    }

    this.titleService.setTitle(title);
  }

  /**
   * Navigate to compound details with proper URL structure
   */
  navigateToCompound(id: number): void {
    this.router.navigate(['/compounds', id]);
  }

  /**
   * Navigate to compound edit with proper URL structure
   */
  navigateToCompoundEdit(id: number): void {
    this.router.navigate(['/compounds', id, 'edit']);
  }

  /**
   * Navigate to gallery with optional query parameters
   */
  navigateToGallery(queryParams?: any): void {
    this.router.navigate(['/compounds'], { queryParams });
  }

  /**
   * Get current compound ID from route
   */
  getCurrentCompoundId(): number | null {
    const url = this.router.url;
    const match = url.match(/\/compounds\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Check if current route is compound details
   */
  isCompoundDetailsRoute(): boolean {
    const url = this.router.url;
    return /^\/compounds\/\d+$/.test(url);
  }

  /**
   * Check if current route is compound edit
   */
  isCompoundEditRoute(): boolean {
    const url = this.router.url;
    return /^\/compounds\/\d+\/edit$/.test(url);
  }

  /**
   * Validate compound ID format
   */
  isValidCompoundId(id: string): boolean {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
  }
}