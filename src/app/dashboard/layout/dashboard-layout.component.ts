import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- 1. IMPORTAR COMMON MODULE

// --- Imports de PrimeNG ---
import { PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';

// --- Imports Locales ---
// (Asegúrate que la ruta a FooterComponent sea correcta)
import { FooterComponent } from '../../common/components/footer/footer.component';

// --- Imports de la Tesis (Core) ---
import { AuthService } from '../../core/services/auth.service';
import { RolUsuario } from '../../core/models/role.enum';

// --- Interfaz actualizada con Roles ---
interface SideNavItem {
	label: string;
	icon: string;
	link: string;
	roles: RolUsuario[]; // Qué roles pueden ver este enlace
}

@Component({
	selector: 'ca-dashboard-layout', // (O 'amc-dashboard-layout' si usas ese)
	standalone: true,
	imports: [
		RouterOutlet,
		CommonModule, // <-- 2. AÑADIRLO A LOS IMPORTS
		RouterModule,
		PopoverModule,
		FooterComponent,
		AvatarModule,
	],
	templateUrl: './dashboard-layout.component.html',
	styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent implements OnInit {
	// --- Inyección de dependencias ---
	private router = inject(Router);
	private authService = inject(AuthService);

	// --- Estado del Layout ---
	menuOpen = false;
	isMobile = false;

	// --- Datos del Usuario (Cargados de AuthService) ---
	currentUser!: string;
	currentRole: RolUsuario | null = null;

	// Hacemos el Enum 'Role' público para poder usarlo en el *ngIf del HTML
	public roleEnum = RolUsuario;

	// --- Menú actualizado para "El Arbolito" ---
	menuItems: SideNavItem[] = [
		// --- Menú Común (Todos los roles) ---
		{
			label: 'Resumen',
			icon: 'pi pi-home',
			link: '/dashboard/home',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR, RolUsuario.SOCIO],
		},
		// --- Menú de Socio ---
		{
			label: 'Mis Pagos',
			icon: 'pi pi-dollar',
			link: '/dashboard/pagos',
			roles: [RolUsuario.SOCIO],
		},
		{
			label: 'Mi Medidor',
			icon: 'pi pi-chart-line',
			link: '/dashboard/medidor',
			roles: [RolUsuario.SOCIO],
		},
		// --- Menú de Secretario ---
		{
			label: 'Gestión de Socios',
			icon: 'pi pi-users',
			link: '/dashboard/socios',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO], // <-- El Socio NO debe ver esto
		},
		{
			label: 'Registro de Lecturas',
			icon: 'pi pi-camera',
			link: '/dashboard/lecturas',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR],
		},
		{
			label: 'Generar Facturación',
			icon: 'pi pi-file-edit',
			link: '/dashboard/facturacion',
			roles: [RolUsuario.TESORERO, RolUsuario.ADMIN],
		},
		{
			label: 'Registro de Pagos',
			icon: 'pi pi-money-bill',
			link: '/dashboard/pagos-registro',
			roles: [RolUsuario.TESORERO],
		},
		// --- Menú de Administrador ---
		{
			label: 'Gestión de Usuarios',
			icon: 'pi pi-shield',
			link: '/dashboard/usuarios',
			roles: [RolUsuario.ADMIN],
		},
		{
			label: 'Gestión de Medidores',
			icon: 'pi pi-gauge',
			link: '/dashboard/medidores',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO], // <-- El Socio NO debe ver esto
		},
		{
			label: 'Reportes', // <-- Este se queda
			icon: 'pi pi-chart-bar',
			link: '/dashboard/reportes',
			// Solo Admin y Tesorero ven reportes detallados
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO],
		},
		{
			label: 'Configuración',
			icon: 'pi pi-cog',
			link: '/dashboard/configuracion',
			roles: [RolUsuario.ADMIN],
		},
	];

	constructor() {}

	// En src/app/dashboard/layout/dashboard-layout.component.ts

	ngOnInit(): void {
		this.checkScreen();

		// ⬅️ CAMBIO AQUÍ: Añade 'as Role | null'
		// Esto fuerza al string "Administrador" a ser tratado como el tipo Role.Admin
		this.currentRole = this.authService.getRole() as RolUsuario | null;

		// Esto ahora funcionará
		this.currentUser = this.currentRole || 'Usuario';

		// Para depurar, puedes dejar esto:
		console.log('Rol cargado en el Layout:', this.currentRole);
	}

	onMenuClick(): void {
		if (this.isMobile) {
			this.menuOpen = false;
		}
	}

	logout(): void {
		this.authService.logout();
		this.router.navigate(['/login']);
	}

	/**
	 * Helper para verificar roles en el HTML
	 */
	hasAccess(itemRoles: RolUsuario[]): boolean {
		if (!this.currentRole) {
			return false; // Si no hay rol, no mostrar nada
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
