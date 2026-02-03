import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map, catchError, tap } from 'rxjs';
import { environment } from './../../environments/environment';
import { ErrorService } from '../../auth/core/services/error.service';
import { LoginRequest, UserData } from '../../core/interfaces/auth.interface';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private currentUser: UserData | null = null;
	private http = inject(HttpClient);
	private errorService = inject(ErrorService);

	constructor() {
		// 🛡️ SEGURIDAD MEJORADA:
		// Ya no confiamos en 'user' del localStorage porque el usuario puede editarlo.
		// Ahora reconstruimos el usuario decodificando el Token real.
		const token = localStorage.getItem('token');
		if (token) {
			const payload = this.decodeToken(token);
			// Verificamos si el token tiene contenido útil (ej. expiración)
			if (payload && payload.exp && Date.now() >= payload.exp * 1000) {
				console.warn('Token expirado al iniciar app. Cerrando sesión.');
				this.logout();
			} else if (payload && payload.user_id) {
				// Reconstruimos el usuario desde el Token
				this.currentUser = {
					id: payload.user_id,
					username: payload.username || '',
					first_name: payload.first_name || '',
					last_name: payload.last_name || '',
					email: payload.email || '',
					rol: payload.rol || payload.role || payload.tipo_usuario || 'SOCIO',
				};
			}
		}
	}

	// --- MÉTODOS DE ESTADO ---
	isAuthenticated(): boolean {
		return !!localStorage.getItem('token');
	}

	getRole(): string | null {
		if (this.currentUser && this.currentUser.rol) {
			return this.currentUser.rol;
		}
		return null;
	}

	// ✅ VITAL: Este método une lo que el Backend nos envió
	// El MedidorService usa esto para filtrar la lista.
	getNombreCompleto(): string {
		if (this.currentUser) {
			const nombre = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
			return nombre.trim();
		}
		return '';
	}

	logout(): void {
		this.currentUser = null;
		localStorage.removeItem('user');
		localStorage.removeItem('token');
	}

	// --- DECODIFICACIÓN JWT ---
	private decodeToken(token: string): any {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				window
					.atob(base64)
					.split('')
					.map(function (c) {
						return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
					})
					.join(''),
			);
			return JSON.parse(jsonPayload);
		} catch (e) {
			console.error('Error decodificando token', e);
			return {};
		}
	}

	// --- LOGIN ---
	login(credentials: LoginRequest): Observable<UserData> {
		const loginUrl = `${environment.apiUrl}/token/`;

		return this.http.post<any>(loginUrl, credentials).pipe(
			map((response) => {
				// 1. Guardamos el Token crudo
				if (response.access) {
					localStorage.setItem('token', response.access);
				}

				// 2. Leemos qué tiene adentro el token
				const payload = this.decodeToken(response.access);

				// 3. Obtenemos el Rol (con fallback por si acaso)
				const rolDelToken = payload.rol || payload.role || payload.tipo_usuario || 'SOCIO';

				// 4. CREAMOS EL USUARIO CON DATOS REALES DEL BACKEND
				// Ya no hay "if/else" manuales. Confiamos en que Django envía la data.
				this.currentUser = {
					id: payload.user_id || 0,
					username: payload.username || credentials.username,

					// ✅ AQUÍ LA MAGIA: Django ahora envía estos campos llenos
					first_name: payload.first_name || '',
					last_name: payload.last_name || '',

					email: payload.email || '',
					rol: rolDelToken,
				};

				localStorage.setItem('user', JSON.stringify(this.currentUser));
				return this.currentUser as UserData;
			}),

			tap(() => this.errorService.loginSuccess()),

			catchError((error: HttpErrorResponse) => {
				let errorMessage = 'Error de conexión.';
				if (error.status === 401) errorMessage = 'Credenciales inválidas.';
				this.errorService.loginError(errorMessage);
				return throwError(() => new Error(errorMessage));
			}),
		);
	}
}
