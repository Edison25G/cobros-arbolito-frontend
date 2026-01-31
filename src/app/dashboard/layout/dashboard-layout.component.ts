import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG
import { PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';

// Componentes y Servicios
import { FooterComponent } from '../../common/components/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { RolUsuario } from '../../core/models/role.enum';

interface SideNavItem {
	label: string;
	icon: string;
	link: string;
	roles: RolUsuario[];
	header?: string; // ✅ NUEVO: Para poner títulos separadores visuales
}

@Component({
	selector: 'ca-dashboard-layout',
	standalone: true,
	imports: [RouterOutlet, CommonModule, RouterModule, PopoverModule, FooterComponent, AvatarModule],
	templateUrl: './dashboard-layout.component.html',
	styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent implements OnInit {
	private router = inject(Router);
	private authService = inject(AuthService);

	menuOpen = false;
	isMobile = false;

	currentUser!: string;
	currentRole: RolUsuario | null = null;

	public roleEnum = RolUsuario;

	// ✅ MENÚ HÍBRIDO CONFIGURADO
	menuItems: SideNavItem[] = [
		// 1. DASHBOARD GENERAL (Para todos)
		{
			label: 'Resumen',
			icon: 'pi pi-home',
			link: '/dashboard/home',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR, RolUsuario.SOCIO],
		},

		// 2. SECCIÓN DE TRABAJO (Solo Roles Administrativos)
		// -----------------------------------------------------
		// {
		// 	header: 'GESTIÓN ADMINISTRATIVA', // Título visual
		// 	label: 'Gestión de Usuarios',
		// 	icon: 'pi pi-shield',
		// 	link: '/dashboard/usuarios',
		// 	roles: [RolUsuario.ADMIN],
		// },
		{
			header: 'GESTIÓN ADMINISTRATIVA',
			label: 'Gestión de Socios',
			icon: 'pi pi-users',
			link: '/dashboard/socios',
			roles: [RolUsuario.ADMIN],
		},
		{
			label: 'Caja / Recaudación',
			icon: 'pi pi-wallet',
			link: '/dashboard/caja',
			roles: [RolUsuario.TESORERO, RolUsuario.ADMIN],
		},
		{
			label: 'Generar Planilla',
			icon: 'pi pi-file-edit',
			link: '/dashboard/facturacion',
			roles: [RolUsuario.TESORERO, RolUsuario.ADMIN],
		},

		{
			label: 'Gestión SRI',
			icon: 'pi pi-cloud-upload',
			link: '/dashboard/gestion-sri', // <--- Cambiado para que coincida con la ruta
			roles: [RolUsuario.TESORERO, RolUsuario.ADMIN],
		},

		{
			label: 'Registro de Lecturas',
			icon: 'pi pi-camera',
			link: '/dashboard/lecturas',
			roles: [RolUsuario.OPERADOR, RolUsuario.ADMIN],
		},
		{
			label: 'Gestión de Medidores',
			icon: 'pi pi-gauge',
			link: '/dashboard/medidores',
			roles: [RolUsuario.ADMIN, RolUsuario.OPERADOR],
		},
		{
			label: 'Barrios / Zonas',
			icon: 'pi pi-map',
			link: '/dashboard/barrios',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR],
		},
		{
			label: 'Gestión de Eventos',
			icon: 'pi pi-calendar',
			link: '/dashboard/mingas',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO],
		},
		{
			label: 'Gestión de Multas',
			icon: 'pi pi-exclamation-circle',
			link: '/dashboard/multas',
			roles: [RolUsuario.ADMIN], // Solo Admin puede impugnar
		},
		{
			label: 'Reportes',
			icon: 'pi pi-chart-bar',
			link: '/dashboard/reportes',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO],
		},
		{
			label: 'Configuración',
			icon: 'pi pi-cog',
			link: '/dashboard/configuracion',
			roles: [RolUsuario.ADMIN],
		},

		// 3. SECCIÓN PERSONAL (Para TODOS, incluido el Tesorero en su rol de vecino)
		// --------------------------------------------------------------------------
		{
			header: 'MI SERVICIO (PERSONAL)', // Título visual
			label: 'Mis Pagos',
			icon: 'pi pi-dollar',
			link: '/dashboard/pagos',
			// ✅ CLAVE: Agregamos ADMIN, TESORERO y OPERADOR aquí
			roles: [RolUsuario.SOCIO, RolUsuario.TESORERO, RolUsuario.OPERADOR],
		},
		{
			label: 'Mi Medidor',
			icon: 'pi pi-chart-line',
			link: '/dashboard/medidor',
			// ✅ CLAVE: Agregamos ADMIN, TESORERO y OPERADOR aquí
			roles: [RolUsuario.SOCIO, RolUsuario.TESORERO, RolUsuario.OPERADOR],
		},
	];

	ngOnInit(): void {
		this.checkScreen();
		const roleString = this.authService.getRole();

		// Normalizar el rol a mayúsculas para comparación consistente
		if (roleString) {
			const roleUpper = roleString.toUpperCase();
			// Mapear el rol del backend al enum
			if (roleUpper === 'ADMINISTRADOR' || roleUpper === 'ADMIN') {
				this.currentRole = RolUsuario.ADMIN;
			} else if (roleUpper === 'TESORERO') {
				this.currentRole = RolUsuario.TESORERO;
			} else if (roleUpper === 'OPERADOR') {
				this.currentRole = RolUsuario.OPERADOR;
			} else if (roleUpper === 'SOCIO') {
				this.currentRole = RolUsuario.SOCIO;
			} else {
				this.currentRole = null;
			}
		} else {
			this.currentRole = null;
		}

		const nombreReal = this.authService.getNombreCompleto();

		// Si nombreReal no está vacío (""), lo usamos. Si está vacío, usamos el Rol como respaldo.
		this.currentUser = nombreReal ? nombreReal : roleString || 'Usuario';
	}

	onMenuClick(): void {
		if (this.isMobile) {
			this.menuOpen = false;
		}
	}

	logout(): void {
		this.authService.logout();
		this.router.navigate(['/auth/login']);
	}

	hasAccess(itemRoles: RolUsuario[]): boolean {
		if (!this.currentRole) {
			return false;
		}
		return itemRoles.includes(this.currentRole);
	}

	@HostListener('window:resize', [])
	checkScreen(): void {
		this.isMobile = window.innerWidth < 1024;
		if (!this.isMobile) {
			this.menuOpen = false;
		}
	}
}
