import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ElementDataService } from '../services/element-data.service';
import { ElementCellComponent } from '../components/element-cell/element-cell.component';
import { ElementDetailsModalComponent } from '../components/element-details-modal/element-details-modal.component';
import { Element, ELEMENT_CATEGORIES } from '../models/element.interface';

@Component({
  selector: 'app-periodic-table',
  imports: [CommonModule, ElementCellComponent],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.scss'
})
export class PeriodicTableComponent implements OnInit {
  elements: Element[] = [];

  constructor(
    private elementDataService: ElementDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadElements();
  }

  /**
   * Load all elements from the data service
   */
  private loadElements(): void {
    this.elements = this.elementDataService.getAllElements();
    console.log(`Loaded ${this.elements.length} elements for periodic table`);
  }

  /**
   * Handle element click events
   */
  onElementClick(element: Element): void {
    this.openElementDetailsModal(element);
  }

  /**
   * Open the element details modal
   */
  private openElementDetailsModal(element: Element): void {
    const dialogRef = this.dialog.open(ElementDetailsModalComponent, {
      data: { element },
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: true,
      restoreFocus: true,
      disableClose: false,
      panelClass: 'element-details-dialog'
    });
  }

  /**
   * Get the category color for an element
   */
  getCategoryColor(element: Element): string {
    const categoryConfig = ELEMENT_CATEGORIES[element.category];
    return categoryConfig ? categoryConfig.color : '#f5f5f5';
  }

  /**
   * Track elements by atomic number for ngFor performance
   */
  trackByAtomicNumber(index: number, element: Element): number {
    return element.atomicNumber;
  }
}
