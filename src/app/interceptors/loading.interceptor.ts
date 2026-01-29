import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../core/services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
	const loadingService = inject(LoadingService);

	// Mostramos el loading
	loadingService.show();

	return next(req).pipe(
		// Al finalizar (sea éxito o error), ocultamos el loading
		finalize(() => {
			loadingService.hide();
		}),
	);
};
