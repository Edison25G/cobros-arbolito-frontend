import { Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { Role } from '@core/models/role.enum';

export default [
	{
		path: '',
		// Carga el Layout principal (el sidebar)
		loadComponent: () => import('./layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
		// ¡Protegemos TODO el dashboard! Solo usuarios logueados pueden entrar.
		canActivate: [RoleGuard],
		children: [
			// --- Ruta Común (Todos los roles logueados) ---
			{
				path: 'home',
				loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
			},

			// --- Rutas de Socio ---
			{
				path: 'pagos',
				loadComponent: () => import('./pages/pagos/pagos.component').then((m) => m.PagosComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Socio] },
			},
			{
				path: 'medidor',
				loadComponent: () => import('./pages/medidor/medidor.component').then((m) => m.MedidorComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Socio] },
			},

			// --- Rutas de Secretario (Algunas compartidas con Admin) ---
			{
				path: 'socios',
				loadComponent: () => import('./pages/socios/socios.component').then((m) => m.SociosComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Admin, Role.Secretario] },
			},
			{
				path: 'lecturas',
				loadComponent: () => import('./pages/lecturas/lecturas.component').then((m) => m.LecturasComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Secretario] },
			},
			{
				path: 'facturacion',
				loadComponent: () => import('./pages/facturacion/facturacion.component').then((m) => m.FacturacionComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Admin, Role.Secretario] },
			},
			{
				path: 'pagos-registro',
				loadComponent: () =>
					import('./pages/pagos-registro/pagos-registro.component').then((m) => m.PagosRegistroComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Secretario] },
			},

			// --- Rutas de Admin ---
			{
				path: 'usuarios',
				loadComponent: () => import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Admin] },
			},
			{
				path: 'medidores',
				loadComponent: () => import('./pages/medidores/medidores.component').then((m) => m.MedidoresComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Admin] },
			},
			{
				path: 'reportes',
				loadComponent: () => import('./pages/reportes/reportes.component').then((m) => m.ReportesComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Admin] },
			},
			{
				path: 'configuracion',
				loadComponent: () =>
					import('./pages/configuracion/configuracion.component').then((m) => m.ConfiguracionComponent),
				canActivate: [RoleGuard],
				data: { roles: [Role.Admin] },
			},

			// --- Redirección por defecto ---
			{
				path: '',
				redirectTo: 'home',
				pathMatch: 'full',
			},
		],
	},
] as Routes;
