import { Routes } from '@angular/router';

export default [
	{
		path: '',
		loadComponent: () => import('./layout/auth-layout.component'),
		children: [
			{
				path: 'login',
				title: 'Inicio de sesión',
				loadComponent: () => import('./pages/login/login.component'),
			},
			{
				path: 'forgot-password',
				title: 'Recuperar contraseña',
				loadComponent: () => import('./pages/forgot-password/forgot-password.component'),
			},
			{
				path: 'verify-code',
				title: 'Verificar Código',
				loadComponent: () => import('./pages/verify-code/verify-code.component'),
			},
			{
				path: 'reset-password',
				title: 'Cambiar contraseña',
				loadComponent: () => import('./pages/reset-password/reset-password.component'),
			},

			{
				path: '',
				redirectTo: 'login',
				pathMatch: 'full',
			},
			{
				path: '**',
				loadComponent: () =>
					import('../common/pages/not-found/not-found.component').then(
						(m) => (m as any).NotFoundComponent || (m as any).default,
					),
			},
		],
	},
] as Routes;
