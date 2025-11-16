import { Routes } from '@angular/router';
// Asegúrate de que la ruta de importación sea correcta según donde creaste el componente
import { LandingPageComponent } from './features/public/landing-page/landing-page.component';

export const routes: Routes = [
	// 1. La ruta "raíz" (vacía) ahora carga tu Landing Page
	{
		path: '',
		component: LandingPageComponent,
	},

	// 2. Tus rutas de autenticación (Login, Registro, etc.) se mantienen igual
	// Esto significa que para entrar al login, la URL será: localhost:4200/auth/login
	{
		path: 'auth',
		loadChildren: () => import('./auth/auth.routes'),
	},

	// 3. El Dashboard (protegido) se mantiene igual
	{
		path: 'dashboard',
		loadChildren: () => import('./dashboard/dashboard.routes'),
	},

	// 4. Manejo de rutas desconocidas (Wildcard)
	// Si alguien escribe una ruta que no existe, lo mandamos a la Landing Page
	{
		path: '**',
		redirectTo: '',
		pathMatch: 'full',
	},
];
