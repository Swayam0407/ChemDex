import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RootGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // User is authenticated, redirect to compounds
          this.router.navigate(['/compounds']);
        } else {
          // User is not authenticated, redirect to login
          this.router.navigate(['/login']);
        }
        return false; // Always return false since we're redirecting
      })
    );
  }
}