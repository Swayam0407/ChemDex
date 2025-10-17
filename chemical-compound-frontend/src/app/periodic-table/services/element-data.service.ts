import { Injectable } from '@angular/core';
import { Element, ElementCategory } from '../models/element.interface';
import elementsData from '../data/elements.json';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ElementDataService {
  private elements: Element[] = [];
  private elementsMap: Map<number, Element> = new Map();
  private isDataLoaded = false;

  constructor() {
    this.loadElementData();
  }

  /**
   * Load and validate element data from JSON file
   */
  private loadElementData(): void {
    try {
      this.elements = elementsData as Element[];
      this.buildElementsMap();
      this.validateElementData();
      this.isDataLoaded = true;
    } catch (error) {
      console.error('Failed to load element data:', error);
      this.elements = [];
      this.isDataLoaded = false;
    }
  }

  /**
   * Build a map for fast element lookup by atomic number
   */
  private buildElementsMap(): void {
    this.elementsMap.clear();
    this.elements.forEach(element => {
      this.elementsMap.set(element.atomicNumber, element);
    });
  }

  /**
   * Get all elements
   */
  getAllElements(): Element[] {
    return [...this.elements];
  }

  /**
   * Get element by atomic number
   */
  getElementById(atomicNumber: number): Element | undefined {
    return this.elementsMap.get(atomicNumber);
  }

  /**
   * Get elements by category
   */
  getElementsByCategory(category: ElementCategory): Element[] {
    return this.elements.filter(element => element.category === category);
  }

  /**
   * Search elements by name, symbol, or atomic number
   */
  searchElements(query: string): Element[] {
    if (!query || query.trim().length === 0) {
      return this.getAllElements();
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    return this.elements.filter(element => {
      return (
        element.name.toLowerCase().includes(normalizedQuery) ||
        element.symbol.toLowerCase().includes(normalizedQuery) ||
        element.atomicNumber.toString().includes(normalizedQuery)
      );
    });
  }



  /**
   * Get elements by group number
   */
  getElementsByGroup(group: number): Element[] {
    return this.elements.filter(element => element.group === group);
  }

  /**
   * Get elements by period number
   */
  getElementsByPeriod(period: number): Element[] {
    return this.elements.filter(element => element.period === period);
  }

  /**
   * Check if element data is loaded
   */
  isElementDataLoaded(): boolean {
    return this.isDataLoaded;
  }

  /**
   * Get total number of elements
   */
  getElementCount(): number {
    return this.elements.length;
  }

  /**
   * Validate element data integrity
   */
  validateElementData(): ValidationResult {
    const errors: string[] = [];

    // Check if elements array exists and has data
    if (!this.elements || this.elements.length === 0) {
      errors.push('No element data found');
      return { isValid: false, errors };
    }

    // Check for duplicate atomic numbers
    const atomicNumbers = new Set<number>();
    const duplicates = new Set<number>();
    
    this.elements.forEach(element => {
      if (atomicNumbers.has(element.atomicNumber)) {
        duplicates.add(element.atomicNumber);
      }
      atomicNumbers.add(element.atomicNumber);
    });

    if (duplicates.size > 0) {
      errors.push(`Duplicate atomic numbers found: ${Array.from(duplicates).join(', ')}`);
    }

    // Validate required fields for each element
    this.elements.forEach(element => {
      const elementErrors: string[] = [];

      if (!element.symbol || element.symbol.trim().length === 0) {
        elementErrors.push('missing symbol');
      }

      if (!element.name || element.name.trim().length === 0) {
        elementErrors.push('missing name');
      }

      if (typeof element.atomicNumber !== 'number' || element.atomicNumber <= 0) {
        elementErrors.push('invalid atomic number');
      }

      if (typeof element.atomicMass !== 'number' || element.atomicMass <= 0) {
        elementErrors.push('invalid atomic mass');
      }

      if (!element.category) {
        elementErrors.push('missing category');
      }

      if (typeof element.group !== 'number' || element.group < 1 || element.group > 18) {
        elementErrors.push('invalid group number');
      }

      if (typeof element.period !== 'number' || element.period < 1 || element.period > 7) {
        elementErrors.push('invalid period number');
      }

      if (!element.electronConfiguration || element.electronConfiguration.trim().length === 0) {
        elementErrors.push('missing electron configuration');
      }

      if (!element.gridPosition || 
          typeof element.gridPosition.row !== 'number' || 
          typeof element.gridPosition.column !== 'number') {
        elementErrors.push('invalid grid position');
      }

      if (elementErrors.length > 0) {
        errors.push(`Element ${element.atomicNumber} (${element.symbol}): ${elementErrors.join(', ')}`);
      }
    });

    // Check for sequential atomic numbers (allowing gaps for incomplete dataset)
    const sortedAtomicNumbers = Array.from(atomicNumbers).sort((a, b) => a - b);
    const minAtomic = sortedAtomicNumbers[0];
    const maxAtomic = sortedAtomicNumbers[sortedAtomicNumbers.length - 1];

    if (minAtomic !== 1) {
      errors.push('Element data should start with atomic number 1 (Hydrogen)');
    }

    // Validate grid positions are unique
    const gridPositions = new Set<string>();
    const duplicatePositions = new Set<string>();

    this.elements.forEach(element => {
      const posKey = `${element.gridPosition.row}-${element.gridPosition.column}`;
      if (gridPositions.has(posKey)) {
        duplicatePositions.add(posKey);
      }
      gridPositions.add(posKey);
    });

    if (duplicatePositions.size > 0) {
      errors.push(`Duplicate grid positions found: ${Array.from(duplicatePositions).join(', ')}`);
    }

    const isValid = errors.length === 0;
    
    if (!isValid) {
      console.warn('Element data validation failed:', errors);
    } else {
      console.log(`Element data validation passed. Loaded ${this.elements.length} elements.`);
    }

    return { isValid, errors };
  }

  /**
   * Get available element categories
   */
  getAvailableCategories(): ElementCategory[] {
    const categories = new Set<ElementCategory>();
    this.elements.forEach(element => categories.add(element.category));
    return Array.from(categories);
  }

  /**
   * Get elements in a specific atomic number range
   */
  getElementsByAtomicRange(min: number, max: number): Element[] {
    return this.elements.filter(element => 
      element.atomicNumber >= min && element.atomicNumber <= max
    );
  }
}
