import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { API_BASE_URL } from '../../servicios/api.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, HttpClientModule, MatSnackBarModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { correo, contrasena } = this.loginForm.value;
      this.http.post<any>(`${API_BASE_URL}/Usuarios/login`, { correo, contrasena })
        .subscribe({
          next: (usuario) => {
            this.auth.login(usuario);
            this.snackBar.open('¡Bienvenido, ' + usuario.nombre + '!', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.snackBar.open('Credenciales incorrectas', 'Cerrar', { duration: 3000 });
            } else {
              this.snackBar.open('Error de conexión', 'Cerrar', { duration: 3000 });
            }
          }
        });
    }
  }
}
