// src/app/core/services/auth.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, NgZone } from '@angular/core';
import { Observable, throwError, BehaviorSubject, merge, fromEvent, timer, Subscription } from 'rxjs';
import { map, catchError, tap, switchMap, startWith } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { joinApiUrl } from '../utils/url';
import { ErrorService } from '../../auth/core/services/error.service';
import { LoginRequest, UserData } from '../../core/interfaces/auth.interface';
import { Router } from '@angular/router';

export interface ApiResponse {
	message: string;
	success?: boolean;
}

export interface UserProfile {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	id_socio: number | null;
	identificacion: string;
	direccion: string;
	telefono: string;
	foto: string | null;
	barrio: string;
	rol: string;
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private http = inject(HttpClient);
	private errorService = inject(ErrorService);
	private router = inject(Router);
	private ngZone = inject(NgZone); // Para ejecutar el timer fuera de Angular y no afectar rendimiento

	private apiUrl = environment.apiUrl;

	// 1. ESTADO REACTIVO
	private currentUserSubject = new BehaviorSubject<UserData | null>(null);
	public currentUser$ = this.currentUserSubject.asObservable(); // Observable público

	// 2. IDLE TIMEOUT (Configurable para pruebas)
	// PROD: 20 * 60 * 1000 (20 min) | TEST: 10 * 1000 (10 seg)
	public IDLE_TIMEOUT_MS = 20 * 60 * 1000;
	private idleSubscription?: Subscription;

	constructor() {
		this.initAuth();
	}

	private initAuth(): void {
		const token = localStorage.getItem('token');
		if (token) {
			const payload = this.decodeToken(token);
			if (payload && payload.exp && Date.now() >= payload.exp * 1000) {
				console.warn('Token expirado al iniciar. Limpiando sesión.');
				this.logout();
			} else if (payload && payload.user_id) {
				const user = this.buildUserFromPayload(payload);
				this.currentUserSubject.next(user);
				this.initIdleListener(); // Iniciar listener de inactividad
			}
		}
	}

	// =================================================================
	// 🔐 GESTIÓN DE SESIÓN
	// =================================================================

	/**
	 * Login: Autentica, guarda tokens, actualiza estado e inicia el listener de inactividad.
	 */
	login(credentials: LoginRequest): Observable<UserData> {
		return this.http.post<any>(joinApiUrl(this.apiUrl, 'token'), credentials).pipe(
			map((response) => {
				if (response.access) {
					localStorage.setItem('token', response.access);
					if (response.refresh) {
						localStorage.setItem('refresh_token', response.refresh);
					}
				}
				const payload = this.decodeToken(response.access);
				const user = this.buildUserFromPayload(payload);

				this.currentUserSubject.next(user);
				localStorage.setItem('user', JSON.stringify(user));

				this.initIdleListener(); // <--- INICIAR TIMER
				return user;
			}),
			tap(() => this.errorService.loginSuccess()),
			catchError((error: HttpErrorResponse) => {
				const msg = error.status === 401 ? 'Credenciales inválidas.' : 'Error de conexión.';
				this.errorService.loginError(msg);
				return throwError(() => new Error(msg));
			}),
		);
	}

	/**
	 * Logout: Limpia TODO (State, LocalStorage, Timers) y redirige.
	 */
	logout(): void {
		this.currentUserSubject.next(null);
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		localStorage.removeItem('refresh_token');

		if (this.idleSubscription) {
			this.idleSubscription.unsubscribe(); // Detener timer
		}

		this.router.navigate(['/auth/login']);
	}

	/**
	 * Refresh Token: Usa el refresh_token para obtener un nuevo access_token.
	 */
	refreshToken(): Observable<any> {
		const refreshToken = localStorage.getItem('refresh_token');
		if (!refreshToken) {
			return throwError(() => new Error('No refresh token available'));
		}

		return this.http.post<any>(joinApiUrl(this.apiUrl, 'token/refresh'), { refresh: refreshToken }).pipe(
			tap((response) => {
				if (response.access) {
					localStorage.setItem('token', response.access);
					// Si el backend devuelve un nuevo refresh token (rotación), guárdalo tambien
					if (response.refresh) {
						localStorage.setItem('refresh_token', response.refresh);
					}
				}
			}),
			catchError((err) => {
				this.logout();
				return throwError(() => err);
			}),
		);
	}

	isAuthenticated(): boolean {
		return !!this.currentUserSubject.value;
	}

	// =================================================================
	// 💤 IDLE TIMEOUT LISTENER
	// =================================================================
	private initIdleListener(): void {
		if (this.idleSubscription) {
			this.idleSubscription.unsubscribe();
		}

		this.ngZone.runOutsideAngular(() => {
			const events$ = merge(
				fromEvent(document, 'click'),
				fromEvent(document, 'mousemove'),
				fromEvent(document, 'keydown'),
				fromEvent(document, 'scroll'),
			);

			this.idleSubscription = events$
				.pipe(
					startWith(null), // Empezar timer inmediatamente
					switchMap(() => timer(this.IDLE_TIMEOUT_MS)), // Reiniciar timer con cada evento
				)
				.subscribe(() => {
					this.ngZone.run(() => {
						console.warn('💤 Inactividad detectada. Cerrando sesión.');
						this.logout();
					});
				});
		});
	}

	// =================================================================
	// 👤 PERFIL Y UTILIDADES
	// =================================================================

	getRole(): string | null {
		return this.currentUserSubject.value?.rol || null;
	}

	getNombreCompleto(): string {
		const u = this.currentUserSubject.value;
		return u ? `${u.first_name} ${u.last_name}`.trim() : '';
	}

	/**
	 * Obtiene los datos frescos del usuario logueado desde la BD.
	 * Útil si se editó el perfil en otro dispositivo.
	 */
	getProfile(): Observable<UserProfile> {
		// ✅ CAMBIO: Quitamos el '/' del inicio y lo ponemos al final
		return this.http.get<UserProfile>(joinApiUrl(this.apiUrl, 'users/profile/'));
	}

	/**
	 * Permite al usuario logueado cambiar su contraseña.
	 * @param data { old_password, new_password }
	 */
	cambiarPassword(data: any): Observable<any> {
		return this.http.post(joinApiUrl(this.apiUrl, 'users/change-password'), data).pipe(
			catchError((error: HttpErrorResponse) => {
				let msg = 'No se pudo cambiar la contraseña.';
				if (error.status === 400) msg = 'La contraseña actual es incorrecta o la nueva no cumple los requisitos.';
				return throwError(() => new Error(msg));
			}),
		);
	}

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
		} catch (_e) {
			return {};
		}
	}

	private buildUserFromPayload(payload: any): UserData {
		return {
			id: payload.user_id || 0,
			username: payload.username || '',
			first_name: payload.first_name || '',
			last_name: payload.last_name || '',
			email: payload.email || '',
			rol: payload.rol || payload.role || payload.tipo_usuario || 'SOCIO',
		};
	}
}
