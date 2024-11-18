import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule, // Para NgIf, NgFor, etc.
    ReactiveFormsModule, // Formularios reactivos
    DropdownModule, // Componentes de PrimeNG
    CheckboxModule,
    CalendarModule,
    ButtonModule,
    TableModule,
    ToastModule,
    HttpClientModule // Cliente HTTP
  ],
  exports: [
    CommonModule, 
    ReactiveFormsModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
    ButtonModule,
    TableModule,
    ToastModule,
    HttpClientModule
  ] // Exporta para que otros puedan usarlos
})
export class SharedModule {}
