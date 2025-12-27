import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast'; // Opcional, por si quieres mensajes

// Servicios e Interfaces
import { SocioService } from '../../../core/services/socio.service'; // Ajusta la ruta
import { BarriosService } from '../../../core/services/barrios.service';
import { Socio } from '../../../core/models/socio.interface';

@Component({
	selector: 'app-detalle-barrio',
	standalone: true,
	imports: [
		CommonModule,
		TableModule,
		ButtonModule,
		InputTextModule,
		TagModule,
		IconFieldModule,
		InputIconModule,
		SkeletonModule,
		TooltipModule,
		ToastModule,
	],
	templateUrl: './detalle-barrio.component.html',
})
export class DetalleBarrioComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private socioService = inject(SocioService);
	private barriosService = inject(BarriosService);
	// Datos
	barrioId!: number;
	nombreBarrio = 'Cargando...';
	sociosDelBarrio: Socio[] = [];
	loading = true;

	// Estadísticas (Lo que faltaba)
	stats = {
		total: 0,
		activos: 0,
		inactivos: 0,
	};

	ngOnInit() {
		this.route.params.subscribe((params) => {
			// ✅ CORRECCIÓN: Leemos el ID y lo convertimos a número con 'Number()' o el '+'
			const idUrl = params['id'];

			if (idUrl) {
				this.barrioId = Number(idUrl); // Convertimos "1" -> 1
				this.cargarSocios(this.barrioId);
			}
		});
	}

	// ✅ CORRECCIÓN: Cambiamos el parámetro de (nombre: string) a (idBarrio: number)
	cargarSocios(idBarrio: number) {
		this.loading = true;

		this.socioService.getSocios().subscribe({
			next: (socios) => {
				// ✅ CAMBIO CLAVE: Usamos 's.barrio' porque así viene desde tu API
				this.sociosDelBarrio = socios.filter((s: any) => s.barrio == idBarrio);
				this.calcularEstadisticas();
				this.loading = false;
			},
			error: (err) => {
				console.error('Error al cargar socios', err);
				this.loading = false;
			},
		});
	}

	calcularEstadisticas() {
		this.stats.total = this.sociosDelBarrio.length;
		this.stats.activos = this.sociosDelBarrio.filter((s) => s.esta_activo).length;
		this.stats.inactivos = this.stats.total - this.stats.activos;
	}

	// --- ACCIONES ---

	// ✅ FUNCIONALIDAD NUEVA: Ver perfil del socio
	verPerfilSocio(id: number) {
		// Asumo que tienes una ruta para ver socios individuales, si no, puedes crearla luego
		this.router.navigate(['/dashboard/socios/detalle', id]);
	}

	goBack() {
		this.router.navigate(['/dashboard/barrios']);
	}
}
