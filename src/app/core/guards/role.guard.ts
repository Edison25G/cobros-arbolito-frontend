import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { RolUsuario } from '@core/models/role.enum';

// Función helper para normalizar el rol del backend al enum
function normalizeRole(roleString: string | null): RolUsuario | null {
	if (!roleString) return null;
	const role = roleString.toUpperCase();
	if (role === 'ADMINISTRADOR' || role === 'ADMIN') return RolUsuario.ADMIN;
	if (role === 'TESORERO') return RolUsuario.TESORERO;
	if (role === 'OPERADOR') return RolUsuario.OPERADOR;
	if (role === 'SOCIO') return RolUsuario.SOCIO;
	return null;
}

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	// 1. ¿Está el usuario logueado?
	if (!authService.isAuthenticated()) {
		router.navigate(['/auth/login']);
		return false;
	}

	// 2. ¿Qué roles requiere esta ruta?
	const requiredRoles = route.data['roles'] as RolUsuario[];

	// 3. Si la ruta no requiere roles, déjalo pasar
	if (!requiredRoles || requiredRoles.length === 0) {
		return true;
	}

	// 4. Normalizar el rol del usuario
	const userRoleString = authService.getRole();
	const userRole = normalizeRole(userRoleString);

	if (userRole && requiredRoles.includes(userRole)) {
		return true;
	}

	// No tiene el rol. Redirigir.
	router.navigate(['/dashboard/home']);
	return false;
};
