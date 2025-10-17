import { Component, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Element, ELEMENT_CATEGORIES } from '../../models/element.interface';

export interface ElementDetailsModalData {
  element: Element;
}

@Component({
  selector: 'app-element-details-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './element-details-modal.component.html',
  styleUrl: './element-details-modal.component.scss'
})
export class ElementDetailsModalComponent {
  element: Element;
  categoryInfo: any;

  constructor(
    public dialogRef: MatDialogRef<ElementDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ElementDetailsModalData
  ) {
    this.element = data.element;
    this.categoryInfo = ELEMENT_CATEGORIES[this.element.category];
  }

  /**
   * Close the modal
   */
  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Handle keyboard navigation
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onClose();
      event.preventDefault();
    }
  }

  /**
   * Get formatted atomic mass
   */
  getFormattedAtomicMass(): string {
    return this.element.atomicMass.toFixed(3);
  }

  /**
   * Get formatted temperature with unit
   */
  getFormattedTemperature(temp: number | undefined, unit: string = '°C'): string {
    return temp !== undefined ? `${temp}${unit}` : 'Unknown';
  }

  /**
   * Get formatted density
   */
  getFormattedDensity(): string {
    return this.element.density !== undefined 
      ? `${this.element.density} g/cm³` 
      : 'Unknown';
  }
}