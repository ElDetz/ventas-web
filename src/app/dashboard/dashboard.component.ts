import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VentasService } from '../servicios/ventas.service';
import { ProductosService } from '../servicios/productos.service';
import { UsuariosService } from '../servicios/usuarios.service';
import { CategoriasService } from '../servicios/categorias.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  usuario: any = null;
  totalVentas = 0;
  totalProductos = 0;
  totalUsuarios = 0;
  totalCategorias = 0;

  constructor(
    private router: Router,
    private ventasService: VentasService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    this.usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    this.ventasService.getVentas().subscribe(vs => this.totalVentas = vs.length);
    this.productosService.getProductos().subscribe(ps => this.totalProductos = ps.length);
    this.usuariosService.getUsuarios().subscribe(us => this.totalUsuarios = us.length);
    this.categoriasService.getCategorias().subscribe(cs => this.totalCategorias = cs.length);
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
