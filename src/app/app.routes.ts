import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ProductosComponent } from './productos/productos.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { VentasComponent } from './ventas/ventas.component';

export const authGuard: CanActivateFn = () => {
  const usuario = localStorage.getItem('usuario');
  return !!usuario;
};

export const adminGuard: CanActivateFn = () => {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) return false;
  const usuario = JSON.parse(usuarioStr);
  return usuario.rol === 'Admin';
};

export const vendedorOrAdminGuard: CanActivateFn = () => {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) return false;
  const usuario = JSON.parse(usuarioStr);
  return usuario.rol === 'Admin' || usuario.rol === 'Vendedor';
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [authGuard] },
  { path: 'categorias', component: CategoriasComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard, adminGuard] },
  { path: 'ventas', component: VentasComponent, canActivate: [authGuard, vendedorOrAdminGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
