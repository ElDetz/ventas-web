import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Producto } from '../servicios/productos.service';
import { Categoria } from '../servicios/categorias.service';

@Component({
  selector: 'app-producto-form-modal',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule
  ],
  template: `
  <h2 class="modal-title">{{ data.producto ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
  <form [formGroup]="productoForm" (ngSubmit)="guardar()" class="producto-form-modal">
    <mat-form-field appearance="fill">
      <mat-label>Nombre</mat-label>
      <input matInput formControlName="nombre" required>
      <mat-error *ngIf="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched">Nombre requerido</mat-error>
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Descripción</mat-label>
      <input matInput formControlName="descripcion" required>
      <mat-error *ngIf="productoForm.get('descripcion')?.invalid && productoForm.get('descripcion')?.touched">Descripción requerida</mat-error>
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Precio</mat-label>
      <input matInput formControlName="precio" type="number" min="0" required>
      <mat-error *ngIf="productoForm.get('precio')?.invalid && productoForm.get('precio')?.touched">Precio válido requerido</mat-error>
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Stock</mat-label>
      <input matInput formControlName="cantidadStock" type="number" min="0" required>
      <mat-error *ngIf="productoForm.get('cantidadStock')?.invalid && productoForm.get('cantidadStock')?.touched">Stock válido requerido</mat-error>
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Categoría</mat-label>
      <mat-select formControlName="categoriaId" required>
        <mat-option *ngFor="let cat of data.categorias" [value]="cat.id">{{cat.nombre}}</mat-option>
      </mat-select>
      <mat-error *ngIf="productoForm.get('categoriaId')?.invalid && productoForm.get('categoriaId')?.touched">Seleccione una categoría</mat-error>
    </mat-form-field>
    <div class="modal-actions">
      <button mat-raised-button color="primary" type="submit" [disabled]="productoForm.invalid">
        <mat-icon>{{ data.producto ? 'edit' : 'add' }}</mat-icon> {{ data.producto ? 'Actualizar' : 'Crear' }}
      </button>
      <button mat-stroked-button color="warn" type="button" (click)="cerrar()">
        <mat-icon>close</mat-icon> Cancelar
      </button>
    </div>
  </form>
  `,
  styleUrl: './producto-form-modal.component.scss'
})
export class ProductoFormModalComponent {
  productoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductoFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { producto?: Producto, categorias: Categoria[] }
  ) {
    this.productoForm = this.fb.group({
      nombre: [data.producto?.nombre || '', Validators.required],
      descripcion: [data.producto?.descripcion || '', Validators.required],
      precio: [data.producto?.precio ?? 0, [Validators.required, Validators.min(0)]],
      cantidadStock: [data.producto?.cantidadStock ?? 0, [Validators.required, Validators.min(0)]],
      categoriaId: [data.producto?.categoriaId || (data.categorias[0]?.id ?? 1), Validators.required]
    });
  }

  guardar() {
    if (this.productoForm.invalid) return;
    this.dialogRef.close(this.productoForm.value);
  }

  cerrar() {
    this.dialogRef.close();
  }
} 