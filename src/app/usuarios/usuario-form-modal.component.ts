import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Usuario } from '../servicios/usuarios.service';

@Component({
  selector: 'app-usuario-form-modal',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule
  ],
  template: `
  <h2 class="modal-title">{{ data.usuario ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
  <form [formGroup]="usuarioForm" (ngSubmit)="guardar()" class="usuario-form-modal">
    <mat-form-field appearance="fill">
      <mat-label>Nombre</mat-label>
      <input matInput formControlName="nombre" required>
      <mat-error *ngIf="usuarioForm.get('nombre')?.invalid && usuarioForm.get('nombre')?.touched">Nombre requerido</mat-error>
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Correo</mat-label>
      <input matInput formControlName="correo" type="email" required>
      <mat-error *ngIf="usuarioForm.get('correo')?.invalid && usuarioForm.get('correo')?.touched">Correo válido requerido</mat-error>
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Contraseña</mat-label>
      <input matInput formControlName="contrasena" type="password" [required]="!data.usuario">
      <mat-error *ngIf="usuarioForm.get('contrasena')?.invalid && usuarioForm.get('contrasena')?.touched">Contraseña requerida</mat-error>
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Rol</mat-label>
      <mat-select formControlName="rol" required>
        <mat-option value="Admin">Admin</mat-option>
        <mat-option value="Vendedor">Vendedor</mat-option>
        <mat-option value="Usuario">Usuario</mat-option>
      </mat-select>
      <mat-error *ngIf="usuarioForm.get('rol')?.invalid && usuarioForm.get('rol')?.touched">Seleccione un rol</mat-error>
    </mat-form-field>
    <div class="modal-actions">
      <button mat-raised-button color="primary" type="submit" [disabled]="usuarioForm.invalid">
        <mat-icon>{{ data.usuario ? 'edit' : 'add' }}</mat-icon> {{ data.usuario ? 'Actualizar' : 'Crear' }}
      </button>
      <button mat-stroked-button color="warn" type="button" (click)="cerrar()">
        <mat-icon>close</mat-icon> Cancelar
      </button>
    </div>
  </form>
  `,
  styleUrl: './usuario-form-modal.component.scss'
})
export class UsuarioFormModalComponent {
  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UsuarioFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario?: Usuario }
  ) {
    this.usuarioForm = this.fb.group({
      nombre: [data.usuario?.nombre || '', Validators.required],
      correo: [data.usuario?.correo || '', [Validators.required, Validators.email]],
      contrasena: ['', data.usuario ? [] : [Validators.required]],
      rol: [data.usuario?.rol || '', Validators.required]
    });
  }

  guardar() {
    if (this.usuarioForm.invalid) return;
    this.dialogRef.close(this.usuarioForm.value);
  }

  cerrar() {
    this.dialogRef.close();
  }
} 