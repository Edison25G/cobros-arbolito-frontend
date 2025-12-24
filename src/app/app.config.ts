import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Servicios de PrimeNG
// AGREGADO: ConfirmationService (necesario para los popups de borrar)
import { MessageService, ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { tokenInterceptor } from './interceptors/token-interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),

		provideRouter(routes, withViewTransitions()),

		provideAnimationsAsync(),
		provideHttpClient(withInterceptors([tokenInterceptor])),

		// ✅ CONFIGURACIÓN CENTRAL DE PRIMENG (v20)
		providePrimeNG({
			theme: {
				preset: Aura,
				options: {
					darkModeSelector: '.my-app-dark',
				},
			},
			// Habilitar efecto de onda en botones
			ripple: true,

			// 👇 TRADUCCIÓN AL ESPAÑOL (Aquí se hace ahora)
			translation: {
				accept: 'Aceptar',
				reject: 'Cancelar',
				choose: 'Elegir',
				upload: 'Subir',
				cancel: 'Cancelar',
				dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
				dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
				dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
				monthNames: [
					'Enero',
					'Febrero',
					'Marzo',
					'Abril',
					'Mayo',
					'Junio',
					'Julio',
					'Agosto',
					'Septiembre',
					'Octubre',
					'Noviembre',
					'Diciembre',
				],
				monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
				today: 'Hoy',
				clear: 'Limpiar',
				weekHeader: 'Sem',
				firstDayOfWeek: 1,
				dateFormat: 'dd/mm/yy',

				// Contraseñas (p-password)
				weak: 'Débil',
				medium: 'Medio',
				strong: 'Fuerte',
				passwordPrompt: 'Ingrese una contraseña',

				// Tablas y Listas (p-table, p-select)
				emptyMessage: 'No se encontraron resultados',
				emptyFilterMessage: 'No se encontraron resultados',

				// Filtros de tabla
				startsWith: 'Comienza con',
				contains: 'Contiene',
				notContains: 'No contiene',
				endsWith: 'Termina con',
				equals: 'Igual a',
				notEquals: 'Diferente de',
				noFilter: 'Sin filtro',
				lt: 'Menor que',
				lte: 'Menor o igual a',
				gt: 'Mayor que',
				gte: 'Mayor o igual a',
				dateIs: 'Fecha es',
				dateIsNot: 'Fecha no es',
				dateBefore: 'Fecha antes de',
				dateAfter: 'Fecha después de',
				apply: 'Aplicar',
				matchAll: 'Coincidir todo',
				matchAny: 'Coincidir cualquiera',
				addRule: 'Agregar regla',
				removeRule: 'Eliminar regla',
			},
		}),

		// Servicios globales disponibles para inyectar
		MessageService,
		DialogService,
		ConfirmationService, // <-- Agregado para que funcionen los diálogos de confirmación
	],
};
