import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout.component'),
    children: [
      {
        path: 'login',
        title: 'Inicio de sesión',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Registro de usuario',
        loadComponent: () =>
          import('./pages/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'forgot-password',
        title: 'Recuperar contraseña',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'verify-code',
        title: 'Verificar Código',
        loadComponent: () =>
          import('./pages/verify-code/verify-code.component').then(
            (m) => m.VerifyCodeComponent,
          ),
      },
      {
        path: 'reset-password',
        title: 'Cambiar contraseña',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
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
