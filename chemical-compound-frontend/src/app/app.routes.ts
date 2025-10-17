import { Routes } from '@angular/router';
import { CompoundGalleryComponent } from './components/compound-gallery/compound-gallery.component';
import { CompoundDetailsComponent } from './components/compound-details/compound-details.component';
import { CompoundEditComponent } from './components/compound-edit/compound-edit.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CompoundDetailsGuard } from './guards/compound-details.guard';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RootGuard } from './guards/root.guard';

export const routes: Routes = [
  // Public routes (no authentication required)
  { 
    path: 'login', 
    component: LoginComponent,
    data: { title: 'Login' }
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    data: { title: 'Register' }
  },
  
  // Root route - redirects based on authentication status
  { 
    path: '', 
    canActivate: [RootGuard],
    children: []
  },
  { 
    path: 'compounds', 
    component: CompoundGalleryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Chemical Compounds Gallery' }
  },
  { 
    path: 'starred', 
    component: CompoundGalleryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Starred Compounds', isStarredView: true }
  },
  { 
    path: 'compounds/:id', 
    component: CompoundDetailsComponent,
    canActivate: [AuthGuard, CompoundDetailsGuard],
    data: { title: 'Compound Details' }
  },
  { 
    path: 'compounds/:id/edit', 
    component: CompoundEditComponent,
    canActivate: [AuthGuard, AdminGuard, CompoundDetailsGuard],
    data: { title: 'Edit Compound' }
  },
  {
    path: 'periodic-table',
    loadChildren: () => import('./periodic-table/periodic-table.module').then(m => m.PeriodicTableModule),
    canActivate: [AuthGuard],
    data: { title: 'Periodic Table' }
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { title: 'User Profile' }
  },
  
  // Fallback - redirect unauthenticated users to login
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];
