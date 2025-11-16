// src/app/interceptors/token-interceptor.ts

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment.development';
import { ErrorService } from '../auth/core/services/error.service';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
	const router = inject(Router);
	const errorService = inject(ErrorService);
	const token = localStorage.getItem('token');
	const isApiRequest = req.url.startsWith(environment.apiUrl);

	let request = req;

	if (token && isApiRequest) {
		request = req.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	return next(request).pipe(
		catchError((error: HttpErrorResponse) => {
			// 1. Verificamos si es un error 401
			if (error.status === 401) {
				// 2. ⬅️ ¡AQUÍ ESTÁ EL TRUCO!
				// Si la URL es la de login, NO hacemos nada en el interceptor.
				// Dejamos que el AuthService maneje el mensaje de "Credenciales inválidas".
				if (req.url.includes('/token/')) {
					return throwError(() => error);
				}

				// 3. Si NO es login (es decir, estaba navegando y caducó la sesión),
				// entonces sí mostramos el mensaje de sesión expirada.
				errorService.msjError('Sesión expirada. Inicie sesión nuevamente.');

				localStorage.removeItem('token');
				localStorage.removeItem('user');
				router.navigate(['/auth/login']);
			}

			return throwError(() => error);
		}),
	);
};
