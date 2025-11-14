import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Servicios y Modelos ---
import { SocioService } from '@core/services/socio.service';
import { Socio } from '@core/models/socio.interface';

// --- Imports de PrimeNG ---
// (Los añadimos ahora para que estén listos para el HTML)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

@Component({
	selector: 'amc-socios',
	standalone: true,
	imports: [
		CommonModule,
		// --- Módulos de PrimeNG ---
		TableModule,
		ButtonModule,
		InputTextModule,
		TooltipModule,
		TagModule,
	],
	templateUrl: './socios.component.html',
	styleUrls: ['./socios.component.css'],
})
export class SociosComponent implements OnInit {
	// --- Inyección de Servicios ---
	private socioService = inject(SocioService);

	// --- Estado del Componente ---
	public socios: Socio[] = []; // Array para guardar los datos
	public isLoading = true; // Para el spinner de la tabla

	constructor() {}

	/**
	 * ngOnInit: Se ejecuta al cargar el componente.
	 * Aquí llamamos al servicio para obtener los datos.
	 */
	ngOnInit(): void {
		this.loadSocios();
	}

	/**
	 * Llama al servicio para cargar los socios
	 */
	loadSocios(): void {
		this.isLoading = true; // Activa el spinner

		this.socioService.getSocios().subscribe({
			next: (data) => {
				// Éxito: Guarda los datos y apaga el spinner
				this.socios = data;
				this.isLoading = false;
				console.log('Socios cargados:', this.socios);
			},
			error: (err) => {
				// Error: Apaga el spinner y muestra un error
				console.error('Error al cargar socios:', err);
				this.isLoading = false;
				// (Aquí podrías usar tu 'ErrorService' si algo falla)
				// this.errorService.showError('No se pudieron cargar los socios.');
			},
		});
	}

	// --- Futuros Métodos ---
	// (Aquí irán las funciones para los botones)

	crearSocio(): void {
		console.log('Abriendo modal para crear socio...');
		// (Lógica futura para abrir un <p-dialog>)
	}

	editarSocio(socio: Socio): void {
		console.log('Editando socio:', socio.id);
	}

	eliminarSocio(socio: Socio): void {
		console.log('Eliminando socio:', socio.id);
	}
}
