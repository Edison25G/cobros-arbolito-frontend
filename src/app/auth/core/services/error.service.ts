import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ApiError } from '../types';

@Injectable({
	providedIn: 'root',
})
export class ErrorService {
	private messageService = inject(MessageService);

	// === GENERALES ===
	requiredFields(): void {
		this.messageService.add({
			severity: 'warn',
			summary: 'Campos requeridos',
			detail: 'Por favor, completa todos los campos.',
		});
	}

	passwordsDoNotMatch(): void {
		this.messageService.add({
			severity: 'error',
			summary: 'Contraseña',
			detail: 'Las contraseñas no coinciden.',
		});
	}

	codeRequired(): void {
		this.messageService.add({
			severity: 'warn',
			summary: 'Código requerido',
			detail: 'Por favor, ingresa el código que recibiste por correo.',
		});
	}

	// === REGISTER ===
	registrationSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Registro exitoso',
			detail: '¡Ahora puedes iniciar sesión!',
		});
	}

	registrationError(error: ApiError | string): void {
		let msg = '';
		if (typeof error === 'string') {
			msg = error.toLowerCase();
		} else if (error?.error?.msg) {
			msg = error.error.msg.toLowerCase();
		}

		if (msg.includes('correo')) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Registro fallido',
				detail: 'El correo electrónico ya está registrado.',
			});
		} else if (msg.includes('usuario')) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Registro fallido',
				detail: 'El nombre de usuario ya está registrado.',
			});
		} else {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'No se pudo registrar. Comuníquese con el administrador.',
			});
		}
	}

	// === LOGIN ===
	loginSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Bienvenido',
			detail: 'Inicio de sesión exitoso',
		});
	}

	loginError(error: ApiError | string): void {
		let msg = 'No se pudo iniciar. Comuníquese con el administrador.';

		if (typeof error === 'string') {
			msg = error;
		} else if (error?.error?.msg) {
			msg = error.error.msg;
		}

		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: msg,
		});
	}

	// === FORGOT PASSWORD ===
	forgotSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Código enviado',
			detail: 'Revisa tu correo para recuperar la contraseña.',
		});
	}

	// === VERIFY CODE ===
	codeSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Código válido',
			detail: 'Ahora puedes cambiar tu contraseña.',
		});
	}

	codeError(): void {
		this.messageService.add({
			severity: 'error',
			summary: 'Código incorrecto',
			detail: 'El código ingresado no es válido.',
		});
	}

	// === RESET PASSWORD ===
	resetSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Contraseña actualizada',
			detail: 'Ahora puedes iniciar sesión con tu nueva contraseña.',
		});
	}

	resetError(msg: string): void {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: msg,
		});
	}

	invalidPasswordFormat(): void {
		this.messageService.add({
			severity: 'warn',
			summary: 'Contraseña insegura',
			detail: 'Debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.',
		});
	}

	invalidEmail(): void {
		this.messageService.add({
			severity: 'warn',
			summary: 'Correo inválido',
			detail: 'Por favor, ingresa un correo electrónico válido.',
		});
	}

	updateSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Usuario actualizado',
			detail: 'Los datos se guardaron correctamente.',
		});
	}

	userDeleted(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Usuario eliminado',
			detail: 'El usuario ha sido eliminado correctamente.',
		});
	}

	showError(msg: string): void {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: msg,
		});
	}

	showSuccess(msg: string): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Éxito',
			detail: msg,
		});
	}

	msjError(error: ApiError | string): void {
		let mensaje = 'Ocurrió un error inesperado.';

		if (typeof error === 'string') {
			mensaje = error;
		} else if (error?.error?.message) {
			mensaje = error.error.message;
		}

		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: mensaje,
		});
	}
}
