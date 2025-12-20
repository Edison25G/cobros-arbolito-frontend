// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// 1. ELIMINAMOS 'withHashLocation' de aquí
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { tokenInterceptor } from './interceptors/token-interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),

		// 2. CORRECCIÓN: Dejamos solo 'routes' (y opcionalmente withViewTransitions para suavidad)
		// ¡Adios al withHashLocation()!
		provideRouter(routes, withViewTransitions()),

		provideAnimationsAsync(),
		provideHttpClient(withInterceptors([tokenInterceptor])),

		providePrimeNG({
			theme: {
				preset: Aura,
				options: {
					darkModeSelector: '.my-app-dark',
				},
			},
		}),

		MessageService,
		DialogService,
	],
};
