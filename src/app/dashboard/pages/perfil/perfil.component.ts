import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG Modules
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload'; // Nuevo para la foto
import { MessageService } from 'primeng/api';

// Servicios
import { AuthService } from '../../../core/services/auth.service';
import { SocioService } from '../../../core/services/socio.service'; // Asegúrate de tener este import

@Component({
	selector: 'app-perfil',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		PasswordModule,
		ButtonModule,
		InputTextModule,
		ToastModule,
		FileUploadModule,
	],
	providers: [MessageService],
	templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private socioService = inject(SocioService); // Inyectamos SocioService para actualizar datos
	private messageService = inject(MessageService);

	passwordForm: FormGroup;
	contactForm: FormGroup; // Nuevo formulario para datos de contacto

	currentUser = '';
	currentRole = '';
	socioData: any = {};
	photoUrl: string | null = null; // Para previsualizar la foto

	isSavingPassword = false;
	isSavingContact = false;

	constructor() {
		this.passwordForm = this.fb.group(
			{
				current: ['', [Validators.required]],
				password: ['', [Validators.required, Validators.minLength(6)]],
				confirm: ['', [Validators.required]],
			},
			{ validators: this.passwordMatchValidator },
		);

		// Formulario de datos editables
		this.contactForm = this.fb.group({
			email: ['', [Validators.email]],
			telefono: ['', [Validators.pattern('^[0-9]*$'), Validators.minLength(10)]],
			direccion: ['', [Validators.maxLength(200)]],
		});
	}

	ngOnInit(): void {
		this.cargarDatosUsuario();
	}

	cargarDatosUsuario() {
		this.currentUser = this.authService.getNombreCompleto();
		this.currentRole = this.authService.getRole() || 'SOCIO';

		this.authService.getProfile().subscribe({
			next: (data) => {
				this.socioData = data;
				// Si vienen datos nulos, evitar "undefined undefined"
				const fName = data.first_name || '';
				const lName = data.last_name || '';
				this.currentUser = fName || lName ? `${fName} ${lName}`.trim() : this.currentUser;
				this.photoUrl = data.foto || null;

				// Llenar formulario de contacto
				this.contactForm.patchValue({
					email: data.email,
					telefono: data.telefono,
					direccion: data.direccion,
				});
			},
			error: (err) => {
				console.error('Error cargando perfil', err);
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudieron cargar los datos del perfil.',
				});
			},
		});
	}

	onUpdateContact() {
		if (this.contactForm.invalid) return;

		this.isSavingContact = true;
		// Aquí llamamos al método de actualizar socio.
		// IMPORTANTE: El backend debe permitir que el propio usuario se edite (ej: PATCH /socios/me/)
		// O usamos el updateSocio del admin si tienes permisos, pero lo ideal es un endpoint propio.

		// Simulamos la actualización con el servicio de socio existente
		const updateData = this.contactForm.value;

		this.socioService.updateSocio(this.socioData.id, updateData).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Actualizado',
					detail: 'Información de contacto guardada.',
				});
				this.isSavingContact = false;
				// Actualizar vista local
				this.socioData.email = updateData.email;
				this.socioData.telefono = updateData.telefono;
			},
			error: (_err) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudo actualizar la información.',
				});
				this.isSavingContact = false;
			},
		});
	}

	onUpdatePassword() {
		if (this.passwordForm.invalid) return;
		this.isSavingPassword = true;

		const { current, password } = this.passwordForm.value;
		const payload = { old_password: current, new_password: password };

		this.authService.cambiarPassword(payload).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: 'Contraseña actualizada correctamente.',
				});
				this.passwordForm.reset();
				this.isSavingPassword = false;
			},
			error: (err) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: err.message || 'Error al cambiar contraseña.',
				});
				this.isSavingPassword = false;
			},
		});
	}

	// Manejo de subida de foto (Frontend preview + Backend upload)
	onPhotoSelect(event: any) {
		const file = event.files[0];
		if (file) {
			// 1. Previsualización inmediata
			const reader = new FileReader();
			reader.onload = (e: any) => (this.photoUrl = e.target.result);
			reader.readAsDataURL(file);

			// 2. Subida al backend (Form Data)
			const formData = new FormData();
			formData.append('foto', file);

			this.socioService.updateSocio(this.socioData.id, formData).subscribe({
				next: (_res: any) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Foto Actualizada',
						detail: 'Tu foto de perfil se ha guardado.',
					});
					// Si el backend devuelve la URL final, úsala: this.photoUrl = res.foto;
				},
				error: () => {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' });
				},
			});
		}
	}

	private passwordMatchValidator(g: FormGroup) {
		return g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };
	}
}
