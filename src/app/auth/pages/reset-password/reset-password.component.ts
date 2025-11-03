import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// --- Imports de PrimeNG ---
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

// --- Servicios ---
import { ErrorService } from '../../core/services/error.service';
// import { AuthService } from '@auth/core/services/auth.service'; // (Lo usaremos en el futuro)

@Component({
	selector: 'amc-reset-password',
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		PasswordModule,
		FloatLabelModule,
		ButtonModule,
		ToastModule,
	],
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.css'],
})
export default class ResetPasswordComponent implements OnInit {
	resetForm!: FormGroup;
	isLoading = false;

	// --- Inyección de dependencias (Nuevo estilo) ---
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private errorService = inject(ErrorService);
	// private authService = inject(AuthService); // (Lo usaremos en el futuro)

	ngOnInit(): void {
		// Creamos el formulario
		this.resetForm = this.fb.group({
			newPassword: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
		});
	}

	/**
	 * Función de resetear contraseña (SIMULADA)
	 */
	resetPassword(): void {
		// 1. Validar si el formulario es inválido
		if (this.resetForm.invalid) {
			this.resetForm.markAllAsTouched();
			this.errorService.requiredFields();
			return;
		}

		// 2. Validar si las contraseñas coinciden
		const { newPassword, confirmPassword } = this.resetForm.value;
		if (newPassword !== confirmPassword) {
			this.errorService.showError('Las contraseñas no coinciden.');
			return;
		}

		// 3. Simular carga y reseteo
		this.isLoading = true;

		setTimeout(() => {
			this.isLoading = false;

			// Mostrar toast de éxito
			this.errorService.showSuccess('Contraseña actualizada con éxito.');

			// Limpiar formulario
			this.resetForm.reset();

			// Redirigir al login después de 1 segundo
			setTimeout(() => this.router.navigate(['/auth/login']), 1000);
		}, 1500); // Simulamos 1.5 segundos

		// --- ⛔️ LÓGICA REAL (COMENTADA POR AHORA) ⛔️ ---
		// const email = localStorage.getItem('resetEmail');
		// const code = localStorage.getItem('resetCode');
		// if (!email || !code) { ... }
		// this.authService.resetPassword(email, code, newPassword).subscribe({ ... });
		// --- ------------------------------------- ---
	}
}
