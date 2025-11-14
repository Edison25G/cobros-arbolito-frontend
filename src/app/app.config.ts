// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

// 1. CORRECCIÓN: Importar desde '@primeuix/themes'
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { DialogService } from 'primeng/dynamicdialog';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes, withHashLocation()),
		provideAnimationsAsync(),
		provideHttpClient(withInterceptorsFromDi()),
		providePrimeNG({
			theme: {
				// 2. CORRECCIÓN: Esto ahora funcionará
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
