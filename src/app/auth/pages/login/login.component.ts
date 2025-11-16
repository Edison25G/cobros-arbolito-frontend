// src/app/auth/components/login.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';

// Servicios y Tipos
import { ErrorService } from '../../core/services/error.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { RolUsuario } from '../../../core/models/role.enum'; // Asumimos esta ruta

@Component({
	selector: 'amc-login',
	standalone: true,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		InputTextModule,
		PasswordModule,
		FloatLabelModule,
		ButtonModule,
		DividerModule,
		ToastModule,
		MessageModule,
	],
})
export default class LoginComponent implements OnInit {
	loginForm!: FormGroup;
	// La variable isLoading se puede dejar, aunque LoadingService la gestiona globalmente
	isLoading = false;

	private fb = inject(FormBuilder);
	private router = inject(Router);
	private errorService = inject(ErrorService);
	private authService = inject(AuthService);
	private loadingService = inject(LoadingService); // ⬅️ Inyección del servicio

	ngOnInit(): void {
		this.loginForm = this.fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
		});
	}

	login(): void {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			this.errorService.requiredFields();
			return;
		}

		this.isLoading = true;
		this.loadingService.show();

		this.authService
			.login(this.loginForm.value)
			.pipe(
				finalize(() => {
					this.isLoading = false;
					this.loadingService.hide(); // Oculta el loading al finalizar (éxito o error)
				}),
			)
			.subscribe({
				next: (user) => {
					// ⬅️ LÓGICA CORREGIDA: El AuthService ya maneja el éxito y devuelve el usuario
					if (user && user.rol) {
						// Ya se mostró el mensaje de éxito en el AuthService
						this.redirectByRole(user.rol as RolUsuario); // Redirige usando el rol
					} else {
						// Esto solo ocurriría si el Backend devuelve un objeto vacío (caso raro)
						this.errorService.loginError('Respuesta de usuario incompleta.');
					}
				},
				error: (err) => {
					// El AuthService YA LLAMÓ a this.errorService.loginError() en el catchError.
					// Aquí solo necesitamos manejar la acción de reseteo si queremos.
					this.loginForm.reset();
					console.error('Error en el componente login:', err);
				},
			});
	}

	// src/app/auth/components/login/login.component.ts

	private redirectByRole(role: RolUsuario): void {
		switch (role) {
			case RolUsuario.ADMIN:
				// ⬅️ CAMBIO AQUÍ: Apunta a 'home' en lugar de 'reportes'
				this.router.navigate(['/dashboard/home']);
				break;
			case RolUsuario.TESORERO:
				this.router.navigate(['/dashboard/socios']);
				break;
			case RolUsuario.SOCIO:
				this.router.navigate(['/dashboard/pagos']);
				break;
			default:
				this.router.navigate(['/dashboard/home']);
		}
	}
}
