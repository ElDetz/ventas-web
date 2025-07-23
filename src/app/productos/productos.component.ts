import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductosService, Producto } from '../servicios/productos.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CategoriasService, Categoria } from '../servicios/categorias.service';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ProductoFormModalComponent } from './producto-form-modal.component';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, MatPaginatorModule, ProductoFormModalComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  displayedColumns = ['id', 'nombre', 'descripcion', 'precio', 'cantidadStock', 'categoria', 'acciones'];
  productoForm: FormGroup;
  editando: boolean = false;
  productoEditando: Producto | null = null;
  categorias: Categoria[] = [];
  filtro: string = '';
  productosFiltrados: Producto[] = [];
  pageSize = 10;
  pageIndex = 0;
  paginatedProductos: Producto[] = [];

  constructor(
    private productosService: ProductosService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private categoriasService: CategoriasService,
    public auth: AuthService
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      cantidadStock: [0, [Validators.required, Validators.min(0)]],
      categoriaId: [1, Validators.required]
    });
  }

  ngOnInit() {
    this.cargarProductos();
    this.categoriasService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: () => this.snackBar.open('Error al cargar categorías', 'Cerrar', { duration: 3000 })
    });
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        // Ordenar por ID descendente (más reciente primero)
        this.productos = data.sort((a, b) => b.id - a.id);
        this.aplicarFiltro();
      },
      error: () => this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 })
    });
  }

  aplicarFiltro() {
    const filtroLower = this.filtro.toLowerCase();
    const filtrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(filtroLower) ||
      p.descripcion.toLowerCase().includes(filtroLower)
    );
    this.productosFiltrados = filtrados;
    this.pageIndex = 0;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProductos = this.productosFiltrados.slice(start, end);
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

  eliminarProducto(id: number) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.productosService.eliminarProducto(id).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 2000 });
          this.cargarProductos();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }

  abrirFormulario(producto?: Producto) {
    const dialogRef = this.dialog.open(ProductoFormModalComponent, {
      width: '480px',
      data: { producto, categorias: this.categorias },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (producto) {
          this.productosService.actualizarProducto(producto.id, result).subscribe({
            next: () => {
              this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 2000 });
              this.cargarProductos();
            },
            error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 })
          });
        } else {
          this.productosService.crearProducto(result).subscribe({
            next: () => {
              this.snackBar.open('Producto creado', 'Cerrar', { duration: 2000 });
              this.cargarProductos();
            },
            error: () => this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 })
          });
        }
      }
    });
  }
}
