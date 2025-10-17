import { Component, EventEmitter, Output, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Removed MatCardModule - no longer using mat-card
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-search-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule
  ],
  templateUrl: './search-card.component.html',
  styleUrl: './search-card.component.scss'
})
export class SearchCardComponent implements AfterViewChecked {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @Input() searchTerm: string = '';
  @Input() totalResults: number = 0;
  @Input() currentResults: number = 0;
  @Input() loading: boolean = false;
  @Output() searchChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  private shouldMaintainFocus = false;
  private currentInputValue: string = '';

  ngAfterViewChecked(): void {
    // Restore focus if it was lost during change detection
    if (this.shouldMaintainFocus && this.searchInput && document.activeElement !== this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
      this.shouldMaintainFocus = false;
    }
  }

  onSearchInput(value: string): void {
    this.shouldMaintainFocus = true;
    this.currentInputValue = value;
    // Don't emit search change on input, only on Enter or search button click
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  onSearchClick(): void {
    this.performSearch();
  }

  private performSearch(): void {
    this.searchChange.emit(this.currentInputValue);
  }

  onFocus(): void {
    this.shouldMaintainFocus = true;
  }

  onBlur(): void {
    this.shouldMaintainFocus = false;
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.currentInputValue = '';
    this.shouldMaintainFocus = true;
    this.clearSearch.emit();
  }
}