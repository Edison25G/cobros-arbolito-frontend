import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map, catchError, tap } from 'rxjs';
import { environment } from './../../environments/environment';
import { ErrorService } from '../../auth/core/services/error.service';
import { LoginRequest, UserData } from '../../core/interfaces/auth.interface';

// Interfaz para respuestas genéricas del backend (ej: { "message": "Éxito" })
export interface ApiResponse {
	message: string;
	success?: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private currentUser: UserData | null = null;
	private http = inject(HttpClient);
	private errorService = inject(ErrorService);

	// URL Base para auth (Ajusta si tu backend usa prefijos diferentes)
	private apiUrl = environment.apiUrl;

	constructor() {
		// 🛡️ SEGURIDAD AL INICIO: Reconstruir usuario desde el Token
		const token = localStorage.getItem('token');
		if (token) {
			const payload = this.decodeToken(token);
			// Verificar expiración
			if (payload && payload.exp && Date.now() >= payload.exp * 1000) {
				console.warn('Token expirado al iniciar app. Cerrando sesión.');
				this.logout();
			} else if (payload && payload.user_id) {
				// Reconstruir usuario
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

	// =================================================================
	// 🔐 GESTIÓN DE SESIÓN (LOGIN / LOGOUT / ESTADO)
	// =================================================================

	isAuthenticated(): boolean {
		return !!localStorage.getItem('token');
	}

	getRole(): string | null {
		return this.currentUser?.rol || null;
	}

	getNombreCompleto(): string {
		if (this.currentUser) {
			return `${this.currentUser.first_name} ${this.currentUser.last_name}`.trim();
		}
		return '';
	}

	logout(): void {
		this.currentUser = null;
		localStorage.removeItem('user');
		localStorage.removeItem('token');
	}

	login(credentials: LoginRequest): Observable<UserData> {
		const loginUrl = `${this.apiUrl}/token/`;

		return this.http.post<any>(loginUrl, credentials).pipe(
			map((response) => {
				if (response.access) {
					localStorage.setItem('token', response.access);
				}

				const payload = this.decodeToken(response.access);
				const rolDelToken = payload.rol || payload.role || payload.tipo_usuario || 'SOCIO';

				this.currentUser = {
					id: payload.user_id || 0,
					username: payload.username || credentials.username,
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

	// =================================================================
	// 👤 PERFIL Y SEGURIDAD (AUTENTICADO)
	// =================================================================

	/**
	 * Obtiene los datos frescos del usuario logueado desde la BD.
	 * Útil si se editó el perfil en otro dispositivo.
	 */
	getProfile(): Observable<UserData> {
		// Asegúrate que tu backend tenga este endpoint (ej: /usuarios/me/ o /auth/me/)
		return this.http.get<UserData>(`${this.apiUrl}/usuarios/me/`);
	}

	/**
	 * Permite al usuario logueado cambiar su contraseña.
	 * @param data { old_password, new_password }
	 */
	cambiarPassword(data: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/usuarios/cambiar-password/`, data).pipe(
			catchError((error: HttpErrorResponse) => {
				let msg = 'No se pudo cambiar la contraseña.';
				if (error.status === 400) msg = 'La contraseña actual es incorrecta o la nueva no cumple los requisitos.';
				return throwError(() => new Error(msg));
			}),
		);
	}

	// =================================================================
	// 🆘 RECUPERACIÓN DE CONTRASEÑA (OLVIDÉ MI CLAVE)
	// =================================================================

	/**
	 * Paso 1: Enviar correo con código/link
	 */
	sendResetCode(email: string): Observable<ApiResponse> {
		return this.http.post<ApiResponse>(`${this.apiUrl}/auth/send-reset-code/`, { email });
	}

	/**
	 * Paso 2: Verificar si el código ingresado es válido
	 */
	verifyResetCode(email: string, code: string): Observable<ApiResponse> {
		return this.http.post<ApiResponse>(`${this.apiUrl}/auth/verify-reset-code/`, { email, code });
	}

	/**
	 * Paso 3: Establecer la nueva contraseña usando el código verificado
	 */
	resetPassword(email: string, code: string, newPassword: string): Observable<ApiResponse> {
		return this.http.post<ApiResponse>(`${this.apiUrl}/auth/reset-password/`, {
			email,
			code,
			newPassword,
		});
	}

	// =================================================================
	// 🛠️ UTILIDADES INTERNAS
	// =================================================================

	private decodeToken(token: string): any {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				window
					.atob(base64)
					.split('')
					.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join(''),
			);
			return JSON.parse(jsonPayload);
		} catch (e) {
			console.error('Error decodificando token', e);
			return {};
		}
	}
}
