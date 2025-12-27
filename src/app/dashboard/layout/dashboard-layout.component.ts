import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG
import { PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';

// Componentes y Servicios
import { FooterComponent } from '../../common/components/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { RolUsuario } from '../../core/models/role.enum'; // ✅ USAMOS RolUsuario

interface SideNavItem {
	label: string;
	icon: string;
	link: string;
	roles: RolUsuario[];
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
	currentRole: RolUsuario | null = null; // ✅ TIPO CORRECTO

	public roleEnum = RolUsuario; // Para usar en el HTML

	// ✅ MENÚ CONFIGURADO CON RolUsuario
	menuItems: SideNavItem[] = [
		// --- TODOS ---
		{
			label: 'Resumen',
			icon: 'pi pi-home',
			link: '/dashboard/home',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR, RolUsuario.SOCIO],
		},
		// --- SOCIO ---
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
		{
			label: 'Gestión de Mingas',
			icon: 'pi pi-calendar',
			link: '/dashboard/mingas',
			roles: [RolUsuario.ADMIN, RolUsuario.OPERADOR, RolUsuario.TESORERO],
		},
		// --- TESORERO / ADMIN ---
		{
			label: 'Gestión de Socios',
			icon: 'pi pi-users',
			link: '/dashboard/socios',
			roles: [RolUsuario.ADMIN],
		},

		{
			label: 'Barrios / Zonas',
			icon: 'pi pi-map', // Icono de mapa
			link: '/dashboard/barrios',
			roles: [RolUsuario.ADMIN, RolUsuario.TESORERO, RolUsuario.OPERADOR],
		},

		{
			label: 'Generar Facturación',
			icon: 'pi pi-file-edit',
			link: '/dashboard/facturacion',
			roles: [RolUsuario.TESORERO, RolUsuario.ADMIN],
		},
		// --- TESORERO ---
		{
			label: 'Caja / Recaudación', // Nombre más profesional
			icon: 'pi pi-wallet', // Icono de billetera
			link: '/dashboard/caja', // Debe coincidir con el path del routes
			roles: [RolUsuario.TESORERO, RolUsuario.ADMIN],
		},
		// --- OPERADOR ---
		{
			label: 'Registro de Lecturas',
			icon: 'pi pi-camera',
			link: '/dashboard/lecturas',
			roles: [RolUsuario.OPERADOR, RolUsuario.ADMIN],
		},
		// --- ADMIN ---
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
			roles: [RolUsuario.ADMIN, RolUsuario.OPERADOR],
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
	];

	ngOnInit(): void {
		this.checkScreen();

		// ✅ OBTENCIÓN Y CASTING DEL ROL
		const roleString = this.authService.getRole();
		this.currentRole = roleString as RolUsuario | null;

		// Nombre para el Avatar
		// Si roleString es 'Administrador', eso mostramos. Si es null, mostramos 'Usuario'
		this.currentUser = roleString || 'Usuario';
	}

	onMenuClick(): void {
		if (this.isMobile) {
			this.menuOpen = false;
		}
	}

	logout(): void {
		this.authService.logout();
		this.router.navigate(['/auth/login']); // Asegúrate que la ruta sea correcta
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
