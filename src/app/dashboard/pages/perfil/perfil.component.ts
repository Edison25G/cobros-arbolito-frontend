// src/app/dashboard/pages/perfil/perfil.component.ts
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
import { AuthService, UserProfile } from '../../../core/services/auth.service';
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
	socioData: UserProfile | null = null;
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
			next: (data: any) => {
				// Usamos 'any' o actualiza tu interface UserProfile
				this.socioData = data;

				const fName = data.first_name || '';
				const lName = data.last_name || '';
				this.currentUser = fName || lName ? `${fName} ${lName}`.trim() : this.currentUser;
				this.photoUrl = data.foto || null;

				// Ahora sabemos que los nombres coinciden 100% con Python
				this.contactForm.patchValue({
					email: data.email || '',
					telefono: data.telefono || '',
					direccion: data.direccion || '',
				});
			},
			error: (err: any) => {
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

		// 🚨 Usamos id_socio (el ID del modelo Socio), NO el id del modelo User
		const socioId = this.socioData?.id_socio;

		if (!socioId) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Sin perfil de socio',
				detail: 'Como Operador/Admin, no tienes un perfil de socio vinculado para guardar dirección o teléfono.',
			});
			return;
		}

		this.isSavingContact = true;
		const updateData = this.contactForm.value;

		this.socioService.updateSocio(socioId, updateData).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Actualizado',
					detail: 'Información de contacto guardada.',
				});
				this.isSavingContact = false;
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
			error: (err: any) => {
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
			// 1. Verificación crucial: Usar el ID del Socio (NO el del User)
			const socioId = this.socioData?.id_socio;

			if (!socioId) {
				this.messageService.add({
					severity: 'warn',
					summary: 'Acción no permitida',
					detail: 'Tu cuenta actual no tiene un perfil de socio vinculado para subir una foto.',
				});
				return;
			}

			// 2. Previsualización inmediata en la interfaz
			const reader = new FileReader();
			reader.onload = (e: any) => (this.photoUrl = e.target.result);
			reader.readAsDataURL(file);

			// 3. Empaquetar el archivo para enviarlo a Python
			const formData = new FormData();
			formData.append('foto', file);

			// 4. Subida al backend al endpoint PATCH /socios/<socioId>/
			this.socioService.updateSocio(socioId, formData).subscribe({
				next: (res: any) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Foto Actualizada',
						detail: 'Tu foto de perfil se ha guardado correctamente.',
					});

					// Si la API de Python devuelve el objeto actualizado con la ruta de la imagen, la usamos:
					if (res && res.foto) {
						this.photoUrl = res.foto;
					}
				},
				error: (err) => {
					console.error('Error subiendo foto:', err);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'No se pudo guardar la imagen en el servidor. Inténtalo de nuevo.',
					});
				},
			});
		}
	}

	private passwordMatchValidator(g: FormGroup) {
		return g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };
	}
}
