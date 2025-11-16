import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map, catchError, tap } from 'rxjs';
import { environment } from './../../environments/environment.development';
import { ErrorService } from '../../auth/core/services/error.service';

// ⬅️ CAMBIO: Importamos 'TokenResponse' y quitamos 'LoginResponse'
import { LoginRequest, TokenResponse, UserData } from '../../core/interfaces/auth.interface';

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
	// MÉTODOS AUXILIARES (Actualizados para JWT)
	// ---------------------------------------------------------------

	isAuthenticated(): boolean {
		// ⬅️ CAMBIO: Es más seguro verificar la existencia del token
		return !!localStorage.getItem('token');
	}

	getRole(): string | null {
		// (Este método sigue funcionando porque 'login' sigue guardando 'user')
		if (this.currentUser && this.currentUser.rol) {
			return this.currentUser.rol;
		}
		const userJson = localStorage.getItem('user');
		if (userJson) {
			const user = JSON.parse(userJson);
			return user.rol || null;
		}
		return null;
	}

	logout(): void {
		this.currentUser = null;
		localStorage.removeItem('user');
		localStorage.removeItem('token'); // ⬅️ CAMBIO: Asegúrate de borrar el token
	}

	// ---------------------------------------------------------------
	// MÉTODO PRINCIPAL DE LOGIN (Actualizado para JWT)
	// ---------------------------------------------------------------

	login(credentials: LoginRequest): Observable<UserData> {
		// ⬅️ CAMBIO: Apunta al endpoint de JWT
		const loginUrl = `${environment.apiUrl}/token/`;

		// ⬅️ CAMBIO: Espera una TokenResponse
		return this.http.post<TokenResponse>(loginUrl, credentials).pipe(
			// 1. Mapeo de la respuesta
			map((response) => {
				// ⬅️ CAMBIO: Guardamos el token real
				localStorage.setItem('token', response.access);

				// --- SIMULACIÓN DE USUARIO Y ROL ---
				// (Usamos 'credentials' porque 'response' ya no trae el 'user')
				const rol = credentials.username === 'admin' ? 'Administrador' : 'Socio';

				// (Creamos un usuario simulado para que getRole() siga funcionando)
				this.currentUser = {
					id: 0, // No lo tenemos, pero lo simulamos
					username: credentials.username,
					first_name: '',
					last_name: '',
					email: '',
					rol: rol,
				};
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

				// 1. Si es error 401 (Fallo de autenticación)
				if (error.status === 401) {
					// NO leemos error.error.detail. FORZAMOS nuestro mensaje.
					errorMessage = 'Credenciales inválidas.';
				}
				// 2. Si es error 400 (Petición mal formada)
				else if (error.status === 400) {
					errorMessage = 'Faltan datos de usuario o contraseña.';
				}
				// 3. Cualquier otro error (Servidor caído, sin internet, 500)
				else {
					errorMessage = 'Error de conexión con el servidor.';
				}

				// Mostramos la notificación con TU mensaje personalizado
				this.errorService.loginError(errorMessage);

				// Devolvemos el error para que el componente detenga el "Loading..."
				return throwError(() => new Error(errorMessage));
			}),
		);
	}
}
