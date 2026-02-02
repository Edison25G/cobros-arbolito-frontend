import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
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
			if (error.status === 401) {
				if (req.url.includes('/token/')) {
					return throwError(() => error);
				}

				errorService.msjError('Sesión expirada. Inicie sesión nuevamente.');
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				router.navigate(['/auth/login']);
			}
			return throwError(() => error);
		}),
	);
};
