import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Categoria } from '../servicios/categorias.service';

@Component({
  selector: 'app-categoria-form-modal',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  template: `
  <h2 class="modal-title">{{ data.categoria ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
  <form [formGroup]="categoriaForm" (ngSubmit)="guardar()" class="categoria-form-modal">
    <mat-form-field appearance="fill">
      <mat-label>Nombre</mat-label>
      <input matInput formControlName="nombre" required>
      <mat-error *ngIf="categoriaForm.get('nombre')?.invalid && categoriaForm.get('nombre')?.touched">Nombre requerido</mat-error>
    </mat-form-field>
    <div class="modal-actions">
      <button mat-raised-button color="primary" type="submit" [disabled]="categoriaForm.invalid">
        <mat-icon>{{ data.categoria ? 'edit' : 'add' }}</mat-icon> {{ data.categoria ? 'Actualizar' : 'Crear' }}
      </button>
      <button mat-stroked-button color="warn" type="button" (click)="cerrar()">
        <mat-icon>close</mat-icon> Cancelar
      </button>
    </div>
  </form>
  `,
  styleUrl: './categoria-form-modal.component.scss'
})
export class CategoriaFormModalComponent {
  categoriaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoriaFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categoria?: Categoria }
  ) {
    this.categoriaForm = this.fb.group({
      nombre: [data.categoria?.nombre || '', Validators.required]
    });
  }

  guardar() {
    if (this.categoriaForm.invalid) return;
    this.dialogRef.close(this.categoriaForm.value);
  }

  cerrar() {
    this.dialogRef.close();
  }
} 