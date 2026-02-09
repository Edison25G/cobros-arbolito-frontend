// src/app/core/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError, filter, take, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

// 🚦 MUTEX / SEMÁFORO para controlar el refresco
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const token = localStorage.getItem('token');
    const isApiRequest = req.url.startsWith(environment.apiUrl);

    // 1. Inyectar Token si existe
    let request = req;
    if (token && isApiRequest) {
        request = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            // 2. Manejo de Error 401
            if (error.status === 401 && isApiRequest) {

                // A. Si falla el Login o el propio Refresh -> No hay nada que hacer, lanzar error
                if (req.url.includes('/token/')) {
                    return throwError(() => error);
                }

                // B. Lógica de Refresh Token (Mutex)
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshTokenSubject.next(null); // Bloquear cola

                    return authService.refreshToken().pipe(
                        switchMap((newToken: any) => {
                            isRefreshing = false;
                            refreshTokenSubject.next(newToken.access); // Desbloquear cola

                            // Reintentar la petición original con el nuevo token
                            return next(request.clone({
                                setHeaders: { Authorization: `Bearer ${newToken.access}` }
                            }));
                        }),
                        catchError((refreshErr) => {
                            isRefreshing = false;
                            // Si falla el refresh, logout forzado
                            authService.logout();
                            return throwError(() => refreshErr);
                        })
                    );
                } else {
                    // C. Si ya se está refrescando, encolar esta petición
                    return refreshTokenSubject.pipe(
                        filter(token => token !== null), // Esperar a que haya token
                        take(1), // Tomar solo 1 valor y completarse
                        switchMap(token => {
                            return next(request.clone({
                                setHeaders: { Authorization: `Bearer ${token}` }
                            }));
                        })
                    );
                }
            }

            return throwError(() => error);
        })
    );
};
