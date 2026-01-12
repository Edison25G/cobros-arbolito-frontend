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
	selector: 'amc-verify-code',
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
	templateUrl: './verify-code.component.html',
	styleUrls: ['./verify-code.component.css'],
})
export default class VerifyCodeComponent implements OnInit {
	codeForm!: FormGroup;
	isLoading = false;

	// --- Inyección de dependencias (Nuevo estilo) ---
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private errorService = inject(ErrorService);
	// private authService = inject(AuthService); // (Lo usaremos en el futuro)

	ngOnInit(): void {
		// Creamos el formulario
		this.codeForm = this.fb.group({
			code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
		});
	}

	/**
	 * Función de verificar código (SIMULADA)
	 */
	verify(): void {
		// 1. Validar si el formulario es inválido
		if (this.codeForm.invalid) {
			this.codeForm.markAllAsTouched();
			this.errorService.showError('Por favor, ingresa un código de 6 dígitos.');
			return;
		}

		// 2. Simular carga y envío
		this.isLoading = true;

		setTimeout(() => {
			this.isLoading = false;

			// Mostrar toast de éxito
			this.errorService.showSuccess('Código verificado correctamente.');

			// Guardamos el código para el siguiente paso (reset-password)
			// localStorage.setItem('resetCode', code); // (Lo activaremos con la API)

			// Redirigir a la pantalla de resetear contraseña
			setTimeout(() => this.router.navigate(['/auth/reset-password']), 1000);
		}, 1500); // Simulamos 1.5 segundos

		// --- ⛔️ LÓGICA REAL (COMENTADA POR AHORA) ⛔️ ---
		// const email = localStorage.getItem('resetEmail');
		// if (!email) { ... }
		// this.authService.verifyResetCode(email, code).subscribe({ ... });
		// --- ------------------------------------- ---
	}
}
