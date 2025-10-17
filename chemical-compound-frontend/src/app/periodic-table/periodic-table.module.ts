import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { PeriodicTableRoutingModule } from './periodic-table-routing.module';
import { ElementDataService } from './services/element-data.service';
import { PeriodicTableService } from './services/periodic-table.service';
import { ElementDetailsModalComponent } from './components/element-details-modal/element-details-modal.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PeriodicTableRoutingModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    ElementDetailsModalComponent
  ],
  providers: [
    ElementDataService,
    PeriodicTableService
  ]
})
export class PeriodicTableModule { }
