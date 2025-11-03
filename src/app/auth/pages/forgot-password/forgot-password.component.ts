import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// --- Imports de PrimeNG ---
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

// --- Servicios ---
import { ErrorService } from '../../core/services/error.service';
// import { AuthService } from '../../core/services/auth.service'; // (Lo usaremos en el futuro)

@Component({
	selector: 'amc-forgot-password',
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		InputTextModule,
		FloatLabelModule,
		ButtonModule,
		ToastModule,
	],
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.css'],
})
export default class ForgotPasswordComponent implements OnInit {
	forgotForm!: FormGroup;
	isLoading = false;

	// --- Inyección de dependencias (Nuevo estilo) ---
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private errorService = inject(ErrorService);
	// private authService = inject(AuthService); // (Lo usaremos en el futuro)

	ngOnInit(): void {
		// Creamos el formulario
		this.forgotForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
		});
	}

	/**
	 * Función de recuperar contraseña (SIMULADA)
	 */
	recoverPassword(): void {
		// 1. Validar si el formulario es inválido
		if (this.forgotForm.invalid) {
			this.forgotForm.markAllAsTouched();
			this.errorService.showError('Por favor, ingresa un correo válido.');
			return;
		}

		// 2. Simular carga y envío
		this.isLoading = true;
		const email = this.forgotForm.value.email;
		console.log('Enviando instrucciones a (simulado):', email);

		setTimeout(() => {
			this.isLoading = false;

			// Mostrar toast de éxito
			this.errorService.showSuccess('Instrucciones enviadas a tu correo.');

			// Guardamos el email para el siguiente paso (verificar código)
			// localStorage.setItem('resetEmail', email); // (Lo activaremos con la API)

			// Redirigir a la pantalla de verificar código
			setTimeout(() => this.router.navigate(['/auth/verify-code']), 1000);
		}, 1500); // Simulamos 1.5 segundos

		// --- ⛔️ LÓGICA REAL (COMENTADA POR AHORA) ⛔️ ---
		// this.authService.sendResetCode(email).subscribe({ ... });
		// --- ------------------------------------- ---
	}
}
