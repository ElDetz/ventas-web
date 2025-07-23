import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../servicios/usuarios.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioFormModalComponent } from './usuario-form-modal.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatFormFieldModule, FormsModule, MatIconModule, MatPaginatorModule, UsuarioFormModalComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  displayedColumns = ['id', 'nombre', 'correo', 'fechaRegistro', 'acciones'];
  usuarioForm: FormGroup;
  editando: boolean = false;
  usuarioEditando: Usuario | null = null;
  filtro: string = '';
  usuariosFiltrados: Usuario[] = [];
  pageSize = 10;
  pageIndex = 0;
  paginatedUsuarios: Usuario[] = [];

  constructor(
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        // Ordenar por ID descendente (más reciente primero)
        this.usuarios = data.sort((a, b) => b.id - a.id);
        this.aplicarFiltro();
      },
      error: () => this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 })
    });
  }

  aplicarFiltro() {
    const filtroLower = this.filtro.toLowerCase();
    const filtrados = this.usuarios.filter(u =>
      u.nombre.toLowerCase().includes(filtroLower) ||
      u.correo.toLowerCase().includes(filtroLower)
    );
    this.usuariosFiltrados = filtrados;
    this.pageIndex = 0;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsuarios = this.usuariosFiltrados.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.actualizarPaginacion();
  }

  limpiarFiltro() {
    this.filtro = '';
    this.aplicarFiltro();
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 2000 });
          this.cargarUsuarios();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }

  abrirFormulario(usuario?: Usuario) {
    const dialogRef = this.dialog.open(UsuarioFormModalComponent, {
      width: '340px',
      data: { usuario },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (usuario) {
          this.usuariosService.actualizarUsuario(usuario.id, result).subscribe({
            next: () => {
              this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 2000 });
              this.cargarUsuarios();
            },
            error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 })
          });
        } else {
          this.usuariosService.crearUsuario(result).subscribe({
            next: () => {
              this.snackBar.open('Usuario creado', 'Cerrar', { duration: 2000 });
              this.cargarUsuarios();
            },
            error: () => this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 })
          });
        }
      }
    });
  }

  cancelar() {
    this.editando = false;
    this.usuarioEditando = null;
    this.usuarioForm.reset();
  }
}
