import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CompoundService } from '../services/compound.service';

@Injectable({
  providedIn: 'root'
})
export class CompoundDetailsGuard implements CanActivate {

  constructor(
    private compoundService: CompoundService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const id = route.params['id'];
    
    // Validate ID format
    const compoundId = parseInt(id, 10);
    if (isNaN(compoundId) || compoundId <= 0) {
      this.handleInvalidRoute('Invalid compound ID format');
      return of(false);
    }

    // Check if compound exists
    return this.compoundService.getCompound(compoundId).pipe(
      map(() => true), // Compound exists, allow navigation
      catchError((error) => {
        if (error.status === 404) {
          this.handleInvalidRoute(`Compound with ID ${compoundId} not found`);
        } else {
          this.handleInvalidRoute('Unable to verify compound existence');
        }
        return of(false);
      })
    );
  }

  private handleInvalidRoute(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    this.router.navigate(['/compounds']);
  }
}