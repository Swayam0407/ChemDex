import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Compound } from '../../models/compound.interface';
import { NavigationService } from '../../services/navigation.service';
import { StarButtonComponent } from '../star-button/star-button.component';
import { StarredCompoundsService } from '../../services/starred-compounds.service';
import { AuthService } from '../../services/auth.service';
import { AdminOnlyDialogComponent } from '../compound-details/compound-details.component';

@Component({
  selector: 'app-compound-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RouterLink,
    StarButtonComponent
  ],
  templateUrl: './compound-card.component.html',
  styleUrl: './compound-card.component.scss'
})
export class CompoundCardComponent implements OnInit, OnDestroy {
  @Input() compound!: Compound;
  @Output() cardClick = new EventEmitter<Compound>();

  imageError = false;
  isStarred = false;
  private destroy$ = new Subject<void>();

  constructor(
    private navigationService: NavigationService,
    private starredCompoundsService: StarredCompoundsService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.compound) {
      // Subscribe to starred status changes
      this.starredCompoundsService.isStarred(this.compound.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(starred => {
          this.isStarred = starred;
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCardClick(): void {
    this.cardClick.emit(this.compound);
    this.navigationService.navigateToCompound(this.compound.id);
  }

  onImageError(): void {
    this.imageError = true;
  }

  onImageLoad(): void {
    this.imageError = false;
  }

  getStarOverlayClasses(): string {
    return this.isStarred ? 'star-button-overlay starred' : 'star-button-overlay';
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      // Show admin-only popup
      this.dialog.open(AdminOnlyDialogComponent, {
        width: '400px',
        disableClose: false,
        autoFocus: true
      });
      return;
    }

    // If admin, navigate to edit
    this.navigationService.navigateToCompoundEdit(this.compound.id);
  }
}