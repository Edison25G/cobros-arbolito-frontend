import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'amc-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  // Credenciales duras para pruebas
  private readonly CREDENTIALS = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Por favor completa los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { username, password } = this.loginForm.value as {
      username: string;
      password: string;
    };

    // Simulación: buscar en credenciales estáticas
    const found = this.CREDENTIALS.find(
      (c) => c.username === username && c.password === password,
    );

    setTimeout(() => {
      this.isLoading = false;
      if (found) {
        // Redirigir según rol
        const ruta =
          found.role === 'admin' ? '/dashboard/home' : '/dashboard/user-home';
        this.router.navigate([ruta]);
      } else {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        this.loginForm.get('password')?.reset();
      }
    }, 600);
  }
}
