import { Routes } from '@angular/router';
export default [
  {
    path: '',
    // Carga el Layout principal (el sidebar)
    loadComponent: () =>
      import('./layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    // canActivate: [], // <-- Aquí irá tu Guard de autenticación

    children: [
      // --- Rutas de SIGAF (basadas en tu propuesta) ---
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
        // canActivate: [],
      },
      {
        path: 'categorias', // HU-001
        loadComponent: () =>
          import('./pages/categorias/categorias.component').then(
            (m) => m.CategoriasComponent,
          ),
        // canActivate: [],
      },
      {
        path: 'inventario', // HU-002, 003
        loadComponent: () =>
          import('./pages/inventario/inventario.component').then(
            (m) => m.InventarioComponent,
          ),
        // canActivate: [],
      },
      {
        path: 'clientes', // HU-004
        loadComponent: () =>
          import('./pages/clientes/clientes.component').then(
            (m) => m.ClientesComponent,
          ),
        // canActivate: [],
      },
      {
        path: 'alquileres', // HU-005, 006
        loadComponent: () =>
          import('./pages/alquileres/alquileres.component').then(
            (m) => m.AlquileresComponent,
          ),
        // canActivate: [],
      },
      {
        path: 'facturacion', // HU-007, 008
        loadComponent: () =>
          import('./pages/facturacion/facturacion.component').then(
            (m) => m.FacturacionComponent,
          ),
        // canActivate: [],
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./pages/pagos/pagos.component').then((m) => m.PagosComponent),
        // canActivate: [],
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./pages/reportes/reportes.component').then(
            (m) => m.ReportesComponent,
          ),
        // canActivate: [],
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion.component').then(
            (m) => m.ConfiguracionComponent,
          ),
        // canActivate: [],
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
