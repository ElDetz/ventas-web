import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Venta {
  id: number;
  usuarioId: number;
  fechaVenta: string;
  total: number;
  usuario?: any;
  detallesVenta?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${API_BASE_URL}/Ventas`;

  constructor(private http: HttpClient) {}

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  getVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  crearVenta(venta: Omit<Venta, 'id'>): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }

  actualizarVenta(id: number, venta: Omit<Venta, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, venta);
  }

  eliminarVenta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
