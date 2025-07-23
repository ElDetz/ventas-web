import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { VentasService, Venta } from '../../servicios/ventas.service';
import { ProductosService, Producto } from '../../servicios/productos.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UsuariosService, Usuario } from '../../servicios/usuarios.service';
import { DetalleVentasService } from '../../servicios/detalle-ventas.service';

@Component({
  selector: 'app-venta-form-modal',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTableModule, MatSelectModule, MatSnackBarModule, MatAutocompleteModule
  ],
  templateUrl: './venta-form-modal.component.html',
  styleUrl: './venta-form-modal.component.scss'
})
export class VentaFormModalComponent {
  ventaForm: FormGroup;
  productos: Producto[] = [];
  detalleActual: { productoId: number | null, cantidad: number, precio: number } = { productoId: null, cantidad: 1, precio: 0 };
  detallesVenta: any[] = [];
  editando: boolean = false;
  usuarios: Usuario[] = [];
  usuarioFiltrado: Usuario[] = [];
  filtroProducto: string = '';
  productosFiltrados: Producto[] = [];

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private detalleVentasService: DetalleVentasService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VentaFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { venta?: Venta }
  ) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fechaActual = `${yyyy}-${mm}-${dd}`;
    this.ventaForm = this.fb.group({
      usuarioId: [1, Validators.required],
      fechaVenta: [fechaActual, Validators.required],
      total: [0, [Validators.required, Validators.min(0)]]
    });
    this.productosService.getProductos().subscribe({
      next: (data) => this.productos = data
    });
    if (data.venta) {
      this.editando = true;
      this.ventaForm.patchValue({
        usuarioId: data.venta.usuarioId,
        fechaVenta: data.venta.fechaVenta,
        total: data.venta.total
      });
      this.detallesVenta = data.venta.detallesVenta ? [...data.venta.detallesVenta] : [];
    }
  }

  ngOnInit() {
    this.usuariosService.getUsuarios().subscribe(u => {
      this.usuarios = u;
      this.usuarioFiltrado = u;
    });
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
      }
    });
  }

  agregarDetalle() {
    const prod = this.productos.find(p => p.id === this.detalleActual.productoId);
    if (!prod) return;
    // Validar si el producto ya está en la venta
    if (this.detallesVenta.some(d => d.productoId === prod.id)) {
      this.snackBar.open('Este producto ya fue agregado a la venta', 'Cerrar', { duration: 2500 });
      return;
    }
    this.detallesVenta = [
      ...this.detallesVenta,
      {
        productoId: prod.id,
        producto: prod,
        cantidad: this.detalleActual.cantidad,
        precio: prod.precio
      }
    ];
    // Limpiar correctamente para permitir agregar otro producto
    this.detalleActual.productoId = null;
    this.detalleActual.cantidad = 1;
    this.detalleActual.precio = 0;
    this.calcularTotal();
  }

  eliminarDetalle(index: number) {
    this.detallesVenta = this.detallesVenta.filter((_, i) => i !== index);
    this.calcularTotal();
  }

  calcularTotal() {
    const total = this.detallesVenta.reduce((sum, d) => sum + d.cantidad * d.precio, 0);
    this.ventaForm.patchValue({ total });
  }

  async guardarVenta() {
    if (this.ventaForm.invalid || this.detallesVenta.length === 0) return;
    const datosVenta = { ...this.ventaForm.value };
    try {
      let ventaId: number;
      if (this.editando && this.data.venta) {
        // Actualizar venta principal
        await this.ventasService.actualizarVenta(this.data.venta.id, datosVenta).toPromise();
        ventaId = this.data.venta.id;
        // Obtener detalles originales (con id)
        const detallesOriginales = this.data.venta.detallesVenta || [];
        // Mapear ids de detalles actuales y originales
        const detallesActualesIds = this.detallesVenta.filter(d => d.id).map(d => d.id);
        // Eliminar detalles que ya no están
        const detallesAEliminar = detallesOriginales.filter((d: any) => !detallesActualesIds.includes(d.id));
        await Promise.all(detallesAEliminar.map((d: any) => this.detalleVentasService.eliminarDetalleVenta(d.id).toPromise()));
        // Crear o actualizar detalles
        await Promise.all(this.detallesVenta.map(async (det: any) => {
          if (det.id) {
            // Actualizar si cambió cantidad o precio
            const original = detallesOriginales.find((d: any) => d.id === det.id);
            if (!original || original.cantidad !== det.cantidad || original.precio !== det.precio || original.productoId !== det.productoId) {
              await this.detalleVentasService.actualizarDetalleVenta(det.id, {
                ventaId,
                productoId: det.productoId,
                cantidad: det.cantidad,
                precio: det.precio
              }).toPromise();
            }
          } else {
            // Crear nuevo detalle
            await this.detalleVentasService.crearDetalleVenta({
              ventaId,
              productoId: det.productoId,
              cantidad: det.cantidad,
              precio: det.precio
            }).toPromise();
          }
        }));
      } else {
        // Crear venta y detalles (como antes)
        const ventaCreada = await this.ventasService.crearVenta(datosVenta).toPromise();
        if (!ventaCreada || !ventaCreada.id) throw new Error('No se pudo crear la venta');
        ventaId = ventaCreada.id;
        await Promise.all(this.detallesVenta.map(det =>
          this.detalleVentasService.crearDetalleVenta({
            ventaId,
            productoId: det.productoId,
            cantidad: det.cantidad,
            precio: det.precio
          }).toPromise()
        ));
      }
      this.snackBar.open('Venta y detalles guardados', 'Cerrar', { duration: 2000 });
      this.dialogRef.close('refresh');
    } catch (error) {
      this.snackBar.open('Error al guardar la venta o detalles', 'Cerrar', { duration: 3000 });
    }
  }

  cerrar() {
    this.dialogRef.close();
  }

  getPrecioProductoSeleccionado(): number | '' {
    const prod = this.productos.find(p => p.id === this.detalleActual.productoId);
    return prod ? prod.precio : '';
  }
  getTotalDetalle(): number {
    const precio = this.getPrecioProductoSeleccionado();
    return typeof precio === 'number' && this.detalleActual.cantidad ? precio * this.detalleActual.cantidad : 0;
  }
  onProductoChange() {
    const prod = this.productos.find(p => p.id === this.detalleActual.productoId);
    this.detalleActual.cantidad = 1;
    this.detalleActual.precio = prod ? prod.precio : 0;
    this.filtroProducto = '';
    this.productosFiltrados = this.productos;
  }
  onCantidadChange() {
    const prod = this.productos.find(p => p.id === this.detalleActual.productoId);
    this.detalleActual.precio = prod ? prod.precio : 0;
  }
  filtrarUsuarios(valor: string) {
    const filtro = valor.toLowerCase();
    this.usuarioFiltrado = this.usuarios.filter(u => u.nombre.toLowerCase().includes(filtro));
  }
  onUsuarioInput(event: Event) {
    const value = (event.target && (event.target as HTMLInputElement).value) || '';
    this.filtrarUsuarios(value);
  }
  filtrarProductos(valor: string) {
    const filtro = valor.toLowerCase();
    this.productosFiltrados = this.productos.filter(p => p.nombre.toLowerCase().includes(filtro));
  }
  onProductoInput(event: Event) {
    const value = (event.target && (event.target as HTMLInputElement).value) || '';
    this.filtrarProductos(value);
  }
  onProductoSeleccionado(productoId: number) {
    this.detalleActual.productoId = productoId;
    this.filtroProducto = '';
    this.productosFiltrados = this.productos;
    this.onProductoChange();
  }
  getNombreUsuarioSeleccionado(): string {
    const usuarioId = Number(this.ventaForm.get('usuarioId')?.value);
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.nombre : '';
  }
  trackByIndex(index: number, item: any) {
    return index;
  }
}
