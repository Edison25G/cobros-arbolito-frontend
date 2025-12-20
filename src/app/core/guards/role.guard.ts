import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { RolUsuario } from '@core/models/role.enum';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	// 1. ¿Está el usuario logueado?
	if (!authService.isAuthenticated()) {
		console.error('RoleGuard: No autenticado. Redirigiendo a login.');
		router.navigate(['/auth/login']);
		return false;
	}

	// 2. ¿Qué roles requiere esta ruta? (Los definimos en 'data' en las rutas)
	const requiredRoles = route.data['roles'] as RolUsuario[];

	// 3. Si la ruta no requiere roles, déjalo pasar (ej. /home)
	if (!requiredRoles || requiredRoles.length === 0) {
		return true;
	}

	// 4. ¿Tiene el usuario el rol necesario?
	// ⬅️ SOLUCIÓN: Usamos 'as Role' para decirle a TypeScript que confíe en que userRole es un tipo Role válido.
	const userRole = authService.getRole() as RolUsuario;

	if (userRole && requiredRoles.includes(userRole)) {
		return true; // ¡Acceso concedido!
	}

	// 5. No tiene el rol. Redirigir.
	console.warn(`RoleGuard: Acceso denegado. Rol [${userRole}] no autorizado.`);
	router.navigate(['/dashboard/home']); // O a una página 'acceso-denegado'
	return false;
};
