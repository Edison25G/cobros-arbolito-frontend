import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';

// Servicios
import { ErrorService } from '../../core/services/error.service';

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
	isLoading = false;

	private fb = inject(FormBuilder);
	private router = inject(Router);
	private errorService = inject(ErrorService);

	// Usuario simulado
	private readonly mockUser = {
		username: 'admin',
		password: '123456',
	};

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

		const { username, password } = this.loginForm.value;

		this.isLoading = true;

		// Simulamos petición al backend
		setTimeout(() => {
			this.isLoading = false;

			if (username === this.mockUser.username && password === this.mockUser.password) {
				this.errorService.loginSuccess();
				// Redirección al home
				this.router.navigate(['/dashboard/home']);
			} else {
				this.errorService.loginError('Usuario o contraseña incorrectos.');
				// Limpiar inputs si falla
				this.loginForm.reset();
			}
		}, 1000); // simulamos 1s de carga
	}
}
