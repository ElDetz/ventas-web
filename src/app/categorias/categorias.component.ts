import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriasService, Categoria } from '../servicios/categorias.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CategoriaFormModalComponent } from './categoria-form-modal.component';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, FormsModule, MatIconModule, MatPaginatorModule, CategoriaFormModalComponent],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  displayedColumns = ['id', 'nombre', 'acciones'];
  categoriaForm: FormGroup;
  editando: boolean = false;
  categoriaEditando: Categoria | null = null;
  filtro: string = '';
  categoriasFiltradas: Categoria[] = [];
  pageSize = 10;
  pageIndex = 0;
  paginatedCategorias: Categoria[] = [];

  constructor(
    private categoriasService: CategoriasService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public auth: AuthService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriasService.getCategorias().subscribe({
      next: (data) => {
        // Ordenar por ID descendente (más reciente primero)
        this.categorias = data.sort((a, b) => b.id - a.id);
        this.aplicarFiltro();
      },
      error: () => this.snackBar.open('Error al cargar categorías', 'Cerrar', { duration: 3000 })
    });
  }

  aplicarFiltro() {
    const filtroLower = this.filtro.toLowerCase();
    const filtradas = this.categorias.filter(c =>
      c.nombre.toLowerCase().includes(filtroLower)
    );
    this.categoriasFiltradas = filtradas;
    this.pageIndex = 0;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedCategorias = this.categoriasFiltradas.slice(start, end);
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

  eliminarCategoria(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      this.categoriasService.eliminarCategoria(id).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 2000 });
          this.cargarCategorias();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }

  abrirFormulario(categoria?: Categoria) {
    const dialogRef = this.dialog.open(CategoriaFormModalComponent, {
      width: '340px',
      data: { categoria },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (categoria) {
          this.categoriasService.actualizarCategoria(categoria.id, result).subscribe({
            next: () => {
              this.snackBar.open('Categoría actualizada', 'Cerrar', { duration: 2000 });
              this.cargarCategorias();
            },
            error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 })
          });
        } else {
          this.categoriasService.crearCategoria(result).subscribe({
            next: () => {
              this.snackBar.open('Categoría creada', 'Cerrar', { duration: 2000 });
              this.cargarCategorias();
            },
            error: () => this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 })
          });
        }
      }
    });
  }

  cancelar() {
    this.editando = false;
    this.categoriaEditando = null;
    this.categoriaForm.reset();
  }
}
