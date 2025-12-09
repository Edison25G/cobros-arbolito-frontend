import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map, catchError, tap } from 'rxjs';
import { environment } from './../../environments/environment.development';
import { ErrorService } from '../../auth/core/services/error.service';
import { LoginRequest, UserData } from '../../core/interfaces/auth.interface';

// Nota: Ya no importamos RolUsuario para lógica, solo para tipado si es necesario.

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private currentUser: UserData | null = null;
	private http = inject(HttpClient);
	private errorService = inject(ErrorService);

	constructor() {
		const userJson = localStorage.getItem('user');
		if (userJson) {
			this.currentUser = JSON.parse(userJson);
		}
	}

	// --- MÉTODOS AUXILIARES ---
	isAuthenticated(): boolean {
		return !!localStorage.getItem('token');
	}

	getRole(): string | null {
		if (this.currentUser && this.currentUser.rol) {
			return this.currentUser.rol;
		}
		return null;
	}

	logout(): void {
		this.currentUser = null;
		localStorage.removeItem('user');
		localStorage.removeItem('token');
	}

	// 👇 1. FUNCIÓN PARA LEER EL INTERIOR DEL TOKEN
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
				// Guardamos Token
				if (response.access) {
					localStorage.setItem('token', response.access);
				}

				// 2. EXTRAEMOS LA INFORMACIÓN DEL TOKEN
				const payload = this.decodeToken(response.access);

				// 3. ASIGNAMOS DIRECTAMENTE LO QUE VIENE EN EL TOKEN
				// Intentamos leer 'rol', 'role' o 'tipo_usuario' por si acaso el nombre varía
				const rolDelToken = payload.rol || payload.role || payload.tipo_usuario || 'Socio';

				this.currentUser = {
					id: payload.user_id || 0,
					username: payload.username || credentials.username,
					first_name: payload.first_name || '', // Si el token lo trae, genial
					last_name: payload.last_name || '',
					email: payload.email || '',
					rol: rolDelToken, // ✅ AQUÍ SE ASIGNA EL ROL REAL
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
