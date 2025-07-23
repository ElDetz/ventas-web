import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VentasService, Venta } from '../servicios/ventas.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetalleVentaModalComponent } from './detalle-venta-modal/detalle-venta-modal.component';
import { ProductosService, Producto } from '../servicios/productos.service';
import { MatSelectModule } from '@angular/material/select';
import { VentaFormModalComponent } from './venta-form-modal/venta-form-modal.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatFormFieldModule, FormsModule, MatIconModule, MatDialogModule, DetalleVentaModalComponent, MatSelectModule, VentaFormModalComponent, MatPaginatorModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  ventas: Venta[] = [];
  displayedColumns = ['id', 'usuario', 'fechaVenta', 'total', 'acciones'];
  ventaForm: FormGroup;
  editando: boolean = false;
  ventaEditando: Venta | null = null;
  filtro: string = '';
  ventasFiltradas: Venta[] = [];
  productos: Producto[] = [];
  detalleActual = { productoId: null, cantidad: 1, precio: 0 };
  detallesVenta: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  paginatedVentas: Venta[] = [];

  constructor(
    private ventasService: VentasService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private productosService: ProductosService,
    public auth: AuthService
  ) {
    this.ventaForm = this.fb.group({
      usuarioId: [1, Validators.required],
      fechaVenta: ['', Validators.required],
      total: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.cargarVentas();
    this.productosService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: () => this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 })
    });
  }

  cargarVentas() {
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        // Ordenar por fecha descendente (más reciente primero)
        this.ventas = data.sort((a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime());
        this.aplicarFiltro();
      },
      error: () => this.snackBar.open('Error al cargar ventas', 'Cerrar', { duration: 3000 })
    });
  }

  aplicarFiltro() {
    const filtroLower = this.filtro.toLowerCase();
    const filtradas = this.ventas.filter(v =>
      v.id.toString().includes(filtroLower) ||
      (v.usuario?.nombre?.toLowerCase().includes(filtroLower) || '')
    );
    this.ventasFiltradas = filtradas;
    this.pageIndex = 0;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedVentas = this.ventasFiltradas.slice(start, end);
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

  eliminarVenta(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta venta?')) {
      this.ventasService.eliminarVenta(id).subscribe({
        next: () => {
          this.snackBar.open('Venta eliminada', 'Cerrar', { duration: 2000 });
          this.cargarVentas();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }

  abrirFormulario(venta?: Venta) {
    const dialogRef = this.dialog.open(VentaFormModalComponent, {
      width: '800px',
      data: { venta },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.cargarVentas();
      }
    });
  }

  agregarDetalle() {
    const prod = this.productos.find(p => p.id === this.detalleActual.productoId);
    if (!prod) return;
    this.detallesVenta.push({
      productoId: prod.id,
      producto: prod,
      cantidad: this.detalleActual.cantidad,
      precio: this.detalleActual.precio || prod.precio
    });
    this.detalleActual = { productoId: null, cantidad: 1, precio: 0 };
    this.calcularTotal();
  }

  eliminarDetalle(index: number) {
    this.detallesVenta.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    const total = this.detallesVenta.reduce((sum, d) => sum + d.cantidad * d.precio, 0);
    this.ventaForm.patchValue({ total });
  }

  guardarVenta() {
    if (this.ventaForm.invalid || this.detallesVenta.length === 0) return;
    const datos = { ...this.ventaForm.value, detallesVenta: this.detallesVenta };
    if (this.editando && this.ventaEditando) {
      this.ventasService.actualizarVenta(this.ventaEditando.id, datos).subscribe({
        next: () => {
          this.snackBar.open('Venta actualizada', 'Cerrar', { duration: 2000 });
          this.cargarVentas();
          this.cancelar();
        },
        error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 })
      });
    } else {
      this.ventasService.crearVenta(datos).subscribe({
        next: () => {
          this.snackBar.open('Venta creada', 'Cerrar', { duration: 2000 });
          this.cargarVentas();
          this.cancelar();
        },
        error: () => this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 })
      });
    }
  }

  cancelar() {
    this.editando = false;
    this.ventaEditando = null;
    this.ventaForm.reset({ usuarioId: 1, total: 0 });
  }

  abrirDetalleVenta(venta: Venta) {
    this.dialog.open(DetalleVentaModalComponent, {
      width: '700px',
      data: { venta }
    });
  }
}
