import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeriodicTableComponent } from './periodic-table/periodic-table.component';

const routes: Routes = [
  {
    path: '',
    component: PeriodicTableComponent,
    data: { title: 'Periodic Table' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeriodicTableRoutingModule { }
