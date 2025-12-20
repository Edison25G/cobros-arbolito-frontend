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

	// Datos
	nombreBarrio = '';
	sociosDelBarrio: Socio[] = [];
	loading = true;

	// Estadísticas (Lo que faltaba)
	stats = {
		total: 0,
		activos: 0,
		inactivos: 0,
	};

	ngOnInit() {
		// Capturamos el nombre de la URL (Ej: "Alpamalag")
		this.route.params.subscribe((params) => {
			// OJO: Asegúrate que en tu app.routes.ts pusiste 'detalle/:id' o 'detalle/:nombre'
			// Aquí leemos el parámetro. Si usaste :id, angular lo guarda en params['id'] aunque sea texto.
			this.nombreBarrio = params['id'] || params['nombre'];

			if (this.nombreBarrio) {
				this.cargarSocios(this.nombreBarrio);
			}
		});
	}

	cargarSocios(nombre: string) {
		this.loading = true;

		this.socioService.getSocios().subscribe({
			next: (todosLosSocios) => {
				// 1. FILTRAR: Comparamos el texto del barrio
				this.sociosDelBarrio = todosLosSocios.filter(
					(s) => s.barrio && s.barrio.trim().toLowerCase() === nombre.trim().toLowerCase(),
				);

				// 2. CALCULAR ESTADÍSTICAS (Nuevo)
				this.calcularEstadisticas();

				this.loading = false;
			},
			error: (err) => {
				console.error('Error cargando socios', err);
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
