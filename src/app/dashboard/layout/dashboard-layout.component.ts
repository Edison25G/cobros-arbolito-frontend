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
import { Role } from '../../core/models/role.enum';

// --- Interfaz actualizada con Roles ---
interface SideNavItem {
	label: string;
	icon: string;
	link: string;
	roles: Role[]; // Qué roles pueden ver este enlace
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
	currentRole: Role | null = null;

	// Hacemos el Enum 'Role' público para poder usarlo en el *ngIf del HTML
	public roleEnum = Role;

	// --- Menú actualizado para "El Arbolito" ---
	menuItems: SideNavItem[] = [
		// --- Menú Común (Todos los roles) ---
		{
			label: 'Dashboard',
			icon: 'pi pi-home',
			link: '/dashboard/home',
			roles: [Role.Admin, Role.Secretario, Role.Socio],
		},
		// --- Menú de Socio ---
		{
			label: 'Mis Pagos',
			icon: 'pi pi-dollar',
			link: '/dashboard/pagos',
			roles: [Role.Socio],
		},
		{
			label: 'Mi Medidor',
			icon: 'pi pi-chart-line',
			link: '/dashboard/medidor',
			roles: [Role.Socio],
		},
		// --- Menú de Secretario ---
		{
			label: 'Gestión de Socios',
			icon: 'pi pi-users',
			link: '/dashboard/socios',
			roles: [Role.Secretario, Role.Admin],
		},
		{
			label: 'Registro de Lecturas',
			icon: 'pi pi-camera',
			link: '/dashboard/lecturas',
			roles: [Role.Secretario],
		},
		{
			label: 'Generar Facturación',
			icon: 'pi pi-file-edit',
			link: '/dashboard/facturacion',
			roles: [Role.Secretario, Role.Admin],
		},
		{
			label: 'Registro de Pagos',
			icon: 'pi pi-money-bill',
			link: '/dashboard/pagos-registro',
			roles: [Role.Secretario],
		},
		// --- Menú de Administrador ---
		{
			label: 'Gestión de Usuarios',
			icon: 'pi pi-shield',
			link: '/dashboard/usuarios',
			roles: [Role.Admin],
		},
		{
			label: 'Gestión de Medidores',
			icon: 'pi pi-gauge',
			link: '/dashboard/medidores',
			roles: [Role.Admin],
		},
		{
			label: 'Reportes',
			icon: 'pi pi-chart-bar',
			link: '/dashboard/reportes',
			roles: [Role.Admin],
		},
		{
			label: 'Configuración',
			icon: 'pi pi-cog',
			link: '/dashboard/configuracion',
			roles: [Role.Admin],
		},
	];

	constructor() {}

	// En src/app/dashboard/layout/dashboard-layout.component.ts

	ngOnInit(): void {
		this.checkScreen();

		// ⬅️ CORRECCIÓN DE TIPO: Forzamos el rol a que sea tipo Role o null
		this.currentRole = this.authService.getRole() as Role | null;

		// Asignamos un nombre para el avatar. Si currentRole es null, usa 'Usuario'.
		// Si currentRole tiene un valor (ej. 'Administrador'), úsalo.
		this.currentUser = this.currentRole || 'Usuario';
	}

	onMenuClick(): void {
		if (this.isMobile) {
			this.menuOpen = false;
		}
	}

	logout(): void {
		this.authService.logout(); // Llama al servicio real
	}

	/**
	 * Helper para verificar roles en el HTML
	 */
	hasAccess(itemRoles: Role[]): boolean {
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
