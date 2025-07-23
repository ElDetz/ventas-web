import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface DetalleVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precio: number;
  venta?: any;
  producto?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DetalleVentasService {
  private apiUrl = `${API_BASE_URL}/DetalleVentas`;

  constructor(private http: HttpClient) {}

  getDetalleVentas(): Observable<DetalleVenta[]> {
    return this.http.get<DetalleVenta[]>(this.apiUrl);
  }

  getDetalleVenta(id: number): Observable<DetalleVenta> {
    return this.http.get<DetalleVenta>(`${this.apiUrl}/${id}`);
  }

  crearDetalleVenta(detalle: Omit<DetalleVenta, 'id'>): Observable<DetalleVenta> {
    return this.http.post<DetalleVenta>(this.apiUrl, detalle);
  }

  actualizarDetalleVenta(id: number, detalle: Omit<DetalleVenta, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, detalle);
  }

  eliminarDetalleVenta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
