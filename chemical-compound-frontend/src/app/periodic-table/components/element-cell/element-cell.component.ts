import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Element, ELEMENT_CATEGORIES } from '../../models/element.interface';

@Component({
  selector: 'app-element-cell',
  imports: [CommonModule],
  templateUrl: './element-cell.component.html',
  styleUrl: './element-cell.component.scss'
})
export class ElementCellComponent {
  @Input() element!: Element;

  @Output() elementClick = new EventEmitter<Element>();

  /**
   * Handle click events
   */
  onElementClick(): void {
    this.elementClick.emit(this.element);
  }

  /**
   * Handle keyboard events
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onElementClick();
    }
  }

  /**
   * Get the background color for the element based on its category
   */
  getCategoryColor(): string {
    const categoryConfig = ELEMENT_CATEGORIES[this.element.category];
    return categoryConfig ? categoryConfig.color : '#f5f5f5';
  }

  /**
   * Get ARIA label for accessibility
   */
  getAriaLabel(): string {
    const categoryConfig = ELEMENT_CATEGORIES[this.element.category];
    const categoryName = categoryConfig ? categoryConfig.name : 'Unknown category';
    
    return `${this.element.name}, symbol ${this.element.symbol}, atomic number ${this.element.atomicNumber}, ${categoryName}`;
  }
}
