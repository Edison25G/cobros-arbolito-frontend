// src/app/core/services/auth.service.ts

// =================================================================
// 1. IMPORTS CORREGIDOS
// =================================================================

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map, catchError, tap } from 'rxjs';

// ⬅️ Importación de environment (asume que el entorno base es el correcto)
import { environment } from './../../environments/environment.development';

// ⬅️ Asumo que el ErrorService está en /app/auth/services, ajustando la ruta
import { ErrorService } from '../../auth/core/services/error.service';

// ⬅️ Asumo que las interfaces están en /app/auth/core/interfaces/auth.interface
import { LoginRequest, LoginResponse, UserData } from '../../core/interfaces/auth.interface';

// =================================================================
// 2. SERVICE IMPLEMENTATION
// =================================================================

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	// Propiedades
	private currentUser: UserData | null = null;
	private http = inject(HttpClient);
	private errorService = inject(ErrorService);

	// CONSTRUCTOR: Carga el estado del usuario al iniciar la app
	constructor() {
		const userJson = localStorage.getItem('user');
		if (userJson) {
			this.currentUser = JSON.parse(userJson);
		}
	}

	// ---------------------------------------------------------------
	// MÉTODOS AUXILIARES (Necesarios para Guards y Dashboard)
	// ---------------------------------------------------------------

	isAuthenticated(): boolean {
		// Verifica si el usuario está en memoria o en localStorage
		return !!this.currentUser || !!localStorage.getItem('user');
	}

	getRole(): string | null {
		// Intenta obtener el rol de la memoria (currentUser)
		if (this.currentUser && this.currentUser.rol) {
			return this.currentUser.rol;
		}

		// Si la app se recargó, intenta cargarlo desde localStorage
		const userJson = localStorage.getItem('user');
		if (userJson) {
			const user = JSON.parse(userJson);
			return user.rol || null;
		}
		return null;
	}

	logout(): void {
		// Limpia el estado de la aplicación y el almacenamiento
		this.currentUser = null;
		localStorage.removeItem('user');
		// Normalmente aquí va la navegación a la página de login
	}

	// ---------------------------------------------------------------
	// MÉTODO PRINCIPAL DE LOGIN (Tu código original)
	// ---------------------------------------------------------------

	login(credentials: LoginRequest): Observable<UserData> {
		// Usa environment.apiUrl (el localhost:8000 de Django)
		const loginUrl = `${environment.apiUrl}/auth/login/`;

		return this.http.post<LoginResponse>(loginUrl, credentials).pipe(
			// 1. Mapeo de la respuesta
			map((response) => {
				// --- SIMULACIÓN TEMPORAL DEL ROL ---
				const rol = response.user.username === 'admin' ? 'Administrador' : 'Socio';

				this.currentUser = { ...response.user, rol: rol };
				localStorage.setItem('user', JSON.stringify(this.currentUser));

				return this.currentUser;
			}),

			// 2. Muestra mensaje de éxito (Tap)
			tap(() => {
				this.errorService.loginSuccess();
			}),

			// 3. Maneja los errores (CatchError)
			catchError((error: HttpErrorResponse) => {
				let errorMessage: string;

				if (error.status === 401) {
					errorMessage = 'Credenciales inválidas.';
				} else if (error.status === 400) {
					errorMessage = error.error?.detail || 'Faltan datos de login.';
				} else {
					errorMessage = 'Error de conexión al servidor.';
				}

				this.errorService.loginError(errorMessage);
				return throwError(() => new Error(errorMessage));
			}),
		);
	}
}
