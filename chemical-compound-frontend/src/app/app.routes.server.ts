import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'compounds',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'compounds/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'compounds/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
