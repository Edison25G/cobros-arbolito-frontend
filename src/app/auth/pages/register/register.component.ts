import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// --- Imports de PrimeNG ---
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

// --- Servicios ---
import { ErrorService } from '../../core/services/error.service';
// import { UserService } from '../../core/services/user.service'; // (Lo usaremos en el futuro)

@Component({
	selector: 'amc-register',
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		ReactiveFormsModule,
		InputTextModule,
		PasswordModule,
		FloatLabelModule,
		ButtonModule,
		DividerModule,
		MessageModule,
		ToastModule,
	],
	templateUrl: './register.component.html',
	styleUrl: './register.component.css',
})
export default class RegisterComponent implements OnInit {
	registerForm!: FormGroup;
	isLoading = false;

	// --- Inyección de dependencias (Nuevo estilo) ---
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private errorService = inject(ErrorService);
	// private userService = inject(UserService); // (Lo usaremos en el futuro)

	ngOnInit(): void {
		// Creamos el formulario de registro
		this.registerForm = this.fb.group({
			username: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
		});
	}

	/**
	 * Función de registro (SIMULADA POR AHORA)
	 */
	register(): void {
		// 1. Validar si el formulario es inválido
		if (this.registerForm.invalid) {
			this.registerForm.markAllAsTouched();
			this.errorService.requiredFields();
			return;
		}

		// 2. Validar si las contraseñas coinciden
		const { password, confirmPassword } = this.registerForm.value;
		if (password !== confirmPassword) {
			this.errorService.showError('Las contraseñas no coinciden.');
			return;
		}

		// 3. Simular carga y registro
		this.isLoading = true;

		setTimeout(() => {
			this.isLoading = false;

			// Mostrar toast de éxito
			this.errorService.showSuccess('¡Cuenta creada exitosamente!');

			// Limpiar formulario
			this.registerForm.reset();

			// Redirigir al login después de 1 segundo
			setTimeout(() => this.router.navigate(['/auth/login']), 1000);
		}, 1500); // Simulamos 1.5 segundos

		// --- ⛔️ LÓGICA REAL (COMENTADA POR AHORA) ⛔️ ---
		// const user: User = { ... };
		// this.userService.register(user).subscribe({ ... });
		// --- ------------------------------------- ---
	}
}
