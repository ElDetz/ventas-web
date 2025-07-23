import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './servicios/auth.service';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, RouterModule, MatIconModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isAuthenticated$: Observable<boolean>;
  usuario: any = null;

  constructor(public auth: AuthService, public router: Router) {
    this.isAuthenticated$ = this.auth.isAuthenticated$;
    this.setUsuario();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setUsuario();
      }
    });
  }

  setUsuario() {
    const usuarioStr = localStorage.getItem('usuario');
    this.usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  }

  showToolbar(): boolean {
    return this.router.url !== '/login' && !!localStorage.getItem('usuario');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
