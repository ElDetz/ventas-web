import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('usuario'));
  public isAuthenticated$: Observable<boolean> = this.authSubject.asObservable();

  login(usuario: any) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.authSubject.next(true);
  }

  logout() {
    localStorage.removeItem('usuario');
    this.authSubject.next(false);
  }

  hasRole(rol: string): boolean {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return false;
    const usuario = JSON.parse(usuarioStr);
    return usuario.rol === rol;
  }

  hasAnyRole(...roles: string[]): boolean {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return false;
    const usuario = JSON.parse(usuarioStr);
    return roles.includes(usuario.rol);
  }
}
