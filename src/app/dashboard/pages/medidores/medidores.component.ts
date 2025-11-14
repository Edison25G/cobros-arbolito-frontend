import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Servicios y Modelos ---
import { MedidorService } from '@core/services/medidor.service';
import { Medidor, EstadoMedidor } from '@core/models/medidor.interface';
import { ErrorService } from '../../../auth/core/services/error.service';

// --- PrimeNG ---
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

// ✔ Tipo permitido por PrimeNG 20
type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null;

@Component({
	selector: 'amc-medidores',
	standalone: true,
	imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TooltipModule, TagModule],
	templateUrl: './medidores.component.html',
	styleUrls: ['./medidores.component.css'],
})
export class MedidoresComponent implements OnInit {
	// --- Inject Services ---
	private medidorService = inject(MedidorService);
	private errorService = inject(ErrorService);

	public medidores: Medidor[] = [];
	public isLoading = true;

	// Exponemos el Enum al HTML
	public EstadoMedidor = EstadoMedidor;

	constructor() {}

	ngOnInit(): void {
		this.loadMedidores();
	}

	loadMedidores(): void {
		this.isLoading = true;

		this.medidorService.getMedidores().subscribe({
			next: (data) => {
				this.medidores = data;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
				this.errorService.showError('No se pudieron cargar los medidores.');
			},
		});
	}

	// ✔ Método correcto para PrimeNG 20 (NO EXISTE TagSeverity)
	getSeverity(estado: EstadoMedidor): Severity {
		switch (estado) {
			case EstadoMedidor.Asignado:
				return 'success';
			case EstadoMedidor.EnBodega:
				return 'info';
			case EstadoMedidor.Mantenimiento:
				return 'warn';
			default:
				return 'secondary';
		}
	}

	// --- Métodos futuros ---
	crearMedidor(): void {
		console.log('Abriendo modal para crear medidor...');
	}

	editarMedidor(medidor: Medidor): void {
		console.log('Editando medidor:', medidor.id);
	}

	asignarSocio(medidor: Medidor): void {
		console.log('Asignando socio al medidor:', medidor.id);
	}
}
