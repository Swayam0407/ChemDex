import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, distinctUntilChanged } from 'rxjs/operators';

import { Compound } from '../../models/compound.interface';
import { StarredCompoundsService } from '../../services/starred-compounds.service';
import { NotificationService } from '../../services/notification.service';

export type StarButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-star-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './star-button.component.html',
  styleUrl: './star-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarButtonComponent implements OnInit, OnDestroy {
  @Input() compound!: Compound;
  @Input() size: StarButtonSize = 'medium';

  private destroy$ = new Subject<void>();
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observable streams
  isStarred$!: Observable<boolean>;
  isLoading$ = this.loadingSubject.asObservable();
  
  // Combined state for template
  buttonState$!: Observable<{
    isStarred: boolean;
    isLoading: boolean;
    icon: string;
    ariaLabel: string;
    tooltip: string;
  }>;

  constructor(
    private starredCompoundsService: StarredCompoundsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (!this.compound) {
      console.error('StarButtonComponent: compound input is required');
      return;
    }

    // Set up reactive streams
    this.isStarred$ = this.starredCompoundsService.isStarred(this.compound.id).pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    // Combine all state into a single observable for the template
    this.buttonState$ = combineLatest([
      this.isStarred$,
      this.isLoading$
    ]).pipe(
      map(([isStarred, isLoading]) => ({
        isStarred,
        isLoading,
        icon: isStarred ? 'star' : 'star_border',
        ariaLabel: isLoading 
          ? 'Processing...' 
          : isStarred 
            ? `Remove ${this.compound.name} from favorites`
            : `Add ${this.compound.name} to favorites`,
        tooltip: isLoading
          ? 'Processing...'
          : isStarred
            ? 'Remove from favorites'
            : 'Add to favorites'
      })),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle star button click
   */
  onStarClick(event: Event): void {
    // Prevent event bubbling to parent elements
    event.stopPropagation();
    event.preventDefault();

    if (this.loadingSubject.value) {
      return; // Prevent multiple clicks while loading
    }

    this.toggleStar();
  }

  /**
   * Handle keyboard events for accessibility
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.onStarClick(event);
    }
  }

  /**
   * Toggle the starred status of the compound with optimistic UI updates
   */
  private toggleStar(): void {
    // Check if operation is already in progress
    if (this.starredCompoundsService.isOperationInProgress(this.compound.id)) {
      return;
    }

    this.loadingSubject.next(true);

    this.starredCompoundsService.toggleStar(this.compound).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (isNowStarred: boolean) => {
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.loadingSubject.next(false);
        
        // Error notifications are now handled by the service
        // Just log the error for debugging
        console.error('Error toggling star status:', error);
      }
    });
  }

  /**
   * Get CSS classes for the button based on size
   */
  getButtonClasses(): string {
    const baseClasses = 'star-button';
    const sizeClass = `star-button--${this.size}`;
    return `${baseClasses} ${sizeClass}`;
  }

  /**
   * Get icon size based on button size
   */
  getIconSize(): string {
    switch (this.size) {
      case 'small':
        return '18px';
      case 'large':
        return '32px';
      case 'medium':
      default:
        return '24px';
    }
  }

  /**
   * Get spinner diameter based on button size
   */
  getSpinnerDiameter(): number {
    switch (this.size) {
      case 'small':
        return 16;
      case 'large':
        return 28;
      case 'medium':
      default:
        return 20;
    }
  }
}