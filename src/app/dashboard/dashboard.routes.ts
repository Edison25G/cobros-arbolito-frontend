import { Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { RolUsuario } from '@core/models/role.enum';

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
				// ✅ Agregamos TODOS los roles explícitamente para que el Operador pueda entrar
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR, RolUsuario.SOCIO] },
			},

			// --- Rutas de Socio ---
			{
				path: 'pagos',
				loadComponent: () => import('./pages/pagos/pagos.component').then((m) => m.PagosComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.SOCIO] },
			},
			// {
			// 	path: 'medidor',
			// 	loadComponent: () => import('./pages/medidor/medidor.component').then((m) => m.MedidorComponent),
			// 	canActivate: [RoleGuard],
			// 	data: { roles: [RolUsuario.SOCIO] },
			// },

			// --- Rutas de Secretario (Algunas compartidas con Admin) ---
			{
				path: 'socios',
				loadComponent: () => import('./pages/socios/socios.component').then((m) => m.SociosComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN] },
			},

			{
				path: 'socios/detalle/:id',
				loadComponent: () =>
					import('./pages/socios/detalle-socio/detalle-socio.component').then((m) => m.DetalleSocioComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO] },
			},
			{
				path: 'lecturas',
				// El Guard protege toda la sección
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR] },
				children: [
					// 1. Ruta base (/dashboard/lecturas): Muestra el HISTORIAL (Tabla)
					{
						path: '',
						loadComponent: () =>
							import('./pages/lecturas/historial-lecturas.component').then((m) => m.HistorialLecturasComponent),
					},
					// 2. Ruta hija (/dashboard/lecturas/registro): Muestra el FORMULARIO
					{
						path: 'registro',
						loadComponent: () => import('./pages/lecturas/lecturas.component').then((m) => m.LecturasComponent),
					},
				],
			},
			{
				path: 'facturacion',
				loadComponent: () => import('./pages/facturacion/facturacion.component').then((m) => m.FacturacionComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO] },
			},

			{
				path: 'caja',
				loadComponent: () => import('./pages/caja/caja.component').then((m) => m.CajaComponent),
				canActivate: [RoleGuard],
				// Acceso para Tesorero (obvio) y Admin (por si acaso)
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO] },
			},
			// Busca esta sección en tu archivo de rutas y cámbiala:
			{
				path: 'barrios',
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR] },
				children: [
					{
						path: '',
						loadComponent: () => import('./pages/barrios/barrios.component').then((m) => m.BarriosComponent),
					},
					{
						// ✅ CAMBIO: de 'detalle/:nombre' a 'detalle/:id'
						path: 'detalle/:id',
						loadComponent: () =>
							import('./pages/barrios/detalle-barrio.component').then((m) => m.DetalleBarrioComponent),
					},
				],
			},
			{
				path: 'mingas',
				loadComponent: () => import('./pages/mingas/gestion-mingas.component').then((m) => m.GestionMingasComponent),
				canActivate: [RoleGuard],
				// Visible para Admin, Tesorero (que cobra) y quizá Operador
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO] },
			},
			{
				path: 'mingas/asistencia/:id',
				// Según tu imagen 1, la carpeta 'asistencia' está directo en 'pages', así que esto está bien:
				loadComponent: () => import('./pages/asistencia/asistencia.component').then((m) => m.AsistenciaComponent),
				canActivate: [RoleGuard],
				// ¡IMPORTANTE! Agregamos RolUsuario.TESORERO para que no lo bloquee si entra con ese rol
				data: { roles: [RolUsuario.ADMIN, RolUsuario.OPERADOR, RolUsuario.TESORERO] },
			},
			// --- Rutas de Admin ---
			{
				path: 'usuarios',
				loadComponent: () => import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN] },
			},
			{
				path: 'medidores',
				loadComponent: () => import('./pages/medidores/medidores.component').then((m) => m.MedidoresComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN, RolUsuario.OPERADOR] },
			},
			{
				path: 'reportes',
				loadComponent: () => import('./pages/reportes/reportes.component').then((m) => m.ReportesComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN, RolUsuario.TESORERO] },
			},
			{
				path: 'configuracion',
				loadComponent: () =>
					import('./pages/configuracion/configuracion.component').then((m) => m.ConfiguracionComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN] },
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
