import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Categoria {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = `${API_BASE_URL}/Categorias`;

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  crearCategoria(categoria: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  actualizarCategoria(id: number, categoria: Omit<Categoria, 'id'>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categoria);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
