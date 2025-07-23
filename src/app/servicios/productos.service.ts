import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidadStock: number;
  categoriaId: number;
  categoria?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${API_BASE_URL}/Productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizarProducto(id: number, producto: Omit<Producto, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
