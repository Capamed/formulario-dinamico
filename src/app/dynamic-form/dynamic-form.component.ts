import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,  // Componente standalone
  imports: [
    SharedModule
  ],
  providers: [MessageService, HttpClient],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  dynamicForm!: FormGroup;
  formStructure: any = null;
  options: { [key: string]: any[] } = {}; // Para almacenar las opciones de los selects
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadFormStructure();
  }

  // Cargar la estructura del formulario desde el backend
  loadFormStructure() {
    this.http.get('http://localhost:3000/fields').subscribe((structure: any) => {
      this.formStructure = structure;
      this.buildForm();
    });
  }

  // Construir el formulario reactivo a partir de la estructura
  buildForm() {
    this.dynamicForm = this.fb.group({});
    console.log('asdasd', this.formStructure);

    this.formStructure.fields.forEach((field: any) => {
      const validators = [];
      if (field.validators && field.validators.includes('required')) validators.push(Validators.required);

      this.dynamicForm.addControl(
        field.name,
        this.fb.control({ value: null, disabled: !!field.dependsOn }, validators)
      );

      if (field.type === 'select' && field.optionsEndpoint) {
        this.loadOptions(field.name, field.optionsEndpoint); // Cargar las opciones para el campo select
      }
    });
  }

  // Cargar las opciones del select desde el backend

  
  loadOptions(fieldName: string, endpoint: string, parentId: number | null = null) {
    this.isLoading = true;
  
    // Si hay un parentId (dependencia), añadimos el filtro a la URL
    const url = parentId ? `${endpoint}?${fieldName === 'province' ? 'countryId' : 'provinceId'}=${parentId}` : endpoint;
    let number = (('/countries' === url) ? 1 : ('/provinces' === url) ? 2 : ('/cities' === url) ? 3 : 0)

    this.http.get<any[]>(`http://localhost:300${number}${url}`).subscribe({
      next: (options) => {
        this.options[fieldName] = options.map(option => ({
          label: option.name,
          value: option.id
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        console.error('Error al cargar las opciones.');
      }
    });
  }
  

  // Cambios en un campo, para manejar dependencias
  onFieldChange(field: any) {
    const value = this.dynamicForm.get(field.name)?.value; // Obtener el valor del campo
  
    if (field.dependsOn) {
      const dependentField = this.formStructure.fields.find((f: any) => f.dependsOn === field.name);
      
      if (dependentField) {
        const dependentControl = this.dynamicForm.get(dependentField.name);
        
        if (dependentControl) {
          dependentControl.reset(); // Resetear el campo dependiente
          dependentControl.disable(); // Deshabilitarlo mientras cargamos las opciones
  
          if (value) {
            // Llamar a loadOptions para cargar las opciones dependientes
            this.loadOptions(dependentField.name, dependentField.optionsEndpoint, value); // Cargar las opciones del campo dependiente
            dependentControl.enable(); // Habilitarlo después de cargar las opciones
          }
        }
      }
    }
  }
  

  // Enviar el formulario
  onSubmit() {
    if (this.dynamicForm.valid) {
      const formData = this.dynamicForm.value;

      this.http.post('http://localhost:3000/fields', formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Formulario enviado',
            detail: 'Los datos se han guardado correctamente.',
            life: 3000
          });
          this.resetForm();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: 'No se pudo guardar el formulario. Intenta de nuevo.',
            life: 3000
          });
        }
      });
    } else {
      this.dynamicForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Completa todos los campos obligatorios.',
        life: 3000
      });
    }
  }

  // Resetear el formulario
  resetForm() {
    this.dynamicForm.reset();
    this.formStructure.fields.forEach((field: any) => {
      const control = this.dynamicForm.get(field.name);
      if (control) {
        control.disable();
        if (!field.dependsOn) control.enable();
      }
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Formulario reiniciado',
      detail: 'Puedes comenzar de nuevo.',
      life: 3000
    });
  }
}
