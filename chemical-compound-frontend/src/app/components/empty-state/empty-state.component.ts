import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type EmptyStateType = 'starred' | 'starred-search' | 'general';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() type: EmptyStateType = 'general';
  @Input() searchTerm: string = '';
  @Output() browseAllClick = new EventEmitter<void>();

  getIcon(): string {
    switch (this.type) {
      case 'starred':
      case 'starred-search':
        return 'star_border';
      default:
        return 'science';
    }
  }

  getTitle(): string {
    switch (this.type) {
      case 'starred':
        return 'No Starred Compounds Yet';
      case 'starred-search':
        return 'No Starred Compounds Match Your Search';
      default:
        return 'No Compounds Found';
    }
  }

  getMessage(): string {
    switch (this.type) {
      case 'starred':
        return 'Star compounds from the "All Compounds" tab to see them here.';
      case 'starred-search':
        return 'Try adjusting your search terms or browse all compounds to find more to star.';
      default:
        return 'There are no compounds to display at the moment.';
    }
  }

  shouldShowBrowseButton(): boolean {
    return this.type === 'starred';
  }

  onBrowseAllClick(): void {
    this.browseAllClick.emit();
  }
}