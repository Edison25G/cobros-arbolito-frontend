import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast'; // ✅ Importado

// Servicios
import { SocioService } from '../../../core/services/socio.service';
import { ErrorService } from '../../../auth/core/services/error.service'; // ✅ Importado
import { Socio } from '../../../core/models/socio.interface';

interface BarrioResumen {
	nombre: string;
	cantidadSocios: number;
	activos: number;
	inactivos: number;
}

@Component({
	selector: 'app-barrios',
	standalone: true,
	imports: [
		CommonModule,
		CardModule,
		ButtonModule,
		SkeletonModule,
		ToastModule, // ✅ Añadido a imports
	],
	templateUrl: './barrios.component.html',
})
export class BarriosComponent implements OnInit {
	private socioService = inject(SocioService);
	private errorService = inject(ErrorService); // ✅ Inyectado
	private router = inject(Router);

	barrios: BarrioResumen[] = [];
	loading = true;

	ngOnInit() {
		this.cargarDatos();
	}

	cargarDatos() {
		this.loading = true;
		this.socioService.getSocios().subscribe({
			next: (socios) => {
				this.procesarBarrios(socios);
				this.loading = false;
			},
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.errorService.showError('No se pudieron cargar los barrios.'); // ✅ Uso del ErrorService
			},
		});
	}

	// Agrupa los socios por el campo "barrio"
	procesarBarrios(socios: Socio[]) {
		const mapa = new Map<string, BarrioResumen>();

		socios.forEach((socio) => {
			const nombreBarrio = socio.barrio || 'Sin Barrio';

			if (!mapa.has(nombreBarrio)) {
				mapa.set(nombreBarrio, { nombre: nombreBarrio, cantidadSocios: 0, activos: 0, inactivos: 0 });
			}

			const info = mapa.get(nombreBarrio)!;
			info.cantidadSocios++;
			if (socio.esta_activo) info.activos++;
			else info.inactivos++;
		});

		// Ordenar alfabéticamente
		this.barrios = Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
	}

	verDetalle(barrio: string) {
		this.router.navigate(['/dashboard/barrios/detalle', barrio]);
	}
}
