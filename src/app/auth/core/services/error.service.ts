import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
	providedIn: 'root',
})
export class ErrorService {
	// ⚡ Usando inject() en vez de constructor
	private messageService = inject(MessageService);

	// === MENSAJES GENERALES ===
	requiredFields(): void {
		this.messageService.add({
			severity: 'warn',
			summary: 'Campos requeridos',
			detail: 'Por favor, completa todos los campos.',
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

	// === LOGIN ===
	loginSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Bienvenido',
			detail: 'Inicio de sesión exitoso',
		});
	}

	loginError(msg?: string): void {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: msg || 'No se pudo iniciar sesión. Comuníquese con el administrador.',
		});
	}
}
