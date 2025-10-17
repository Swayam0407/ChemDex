import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginationService, PaginationState } from '../../services/pagination.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pagination',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnInit, OnDestroy {
  @Input() showPageSizeSelector = true;
  @Input() pageSizeOptions = [5, 10, 20, 50];
  @Input() maxVisiblePages = 5;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  paginationState$: Observable<PaginationState>;
  pageNumbers$: Observable<number[]>;
  
  // Make Math available in template
  Math = Math;
  
  private destroy$ = new Subject<void>();

  constructor(private paginationService: PaginationService) {
    this.paginationState$ = this.paginationService.getPaginationState();
    this.pageNumbers$ = this.paginationService.getPageNumbers(this.maxVisiblePages);
  }

  ngOnInit(): void {
    // Emit page changes to parent component
    this.paginationService.currentPage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(page => this.pageChange.emit(page));

    this.paginationService.pageSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(size => this.pageSizeChange.emit(size));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageClick(page: number): void {
    this.paginationService.setCurrentPage(page);
  }

  onPreviousClick(): void {
    this.paginationService.previousPage();
  }

  onNextClick(): void {
    this.paginationService.nextPage();
  }

  onFirstClick(): void {
    this.paginationService.firstPage();
  }

  onLastClick(): void {
    this.paginationService.lastPage();
  }

  onPageSizeChange(newSize: number): void {
    this.paginationService.setPageSize(newSize);
  }
}
