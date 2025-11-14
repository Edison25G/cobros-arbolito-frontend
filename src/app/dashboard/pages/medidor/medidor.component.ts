import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Servicios y Modelos ---
import { MedidorService } from '@core/services/medidor.service';
import { LecturaService, HistorialLectura } from '@core/services/lectura.service';
import { Medidor } from '@core/models/medidor.interface';
import { ErrorService } from '../../../auth/core/services/error.service';

// --- Imports de PrimeNG ---
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton'; // Para la carga

@Component({
	selector: 'amc-medidor', // Vista del Socio
	standalone: true,
	imports: [
		CommonModule,
		// --- Módulos de PrimeNG ---
		CardModule,
		TableModule,
		TagModule,
		SkeletonModule,
	],
	templateUrl: './medidor.component.html',
	styleUrls: ['./medidor.component.css'],
})
export class MedidorComponent implements OnInit {
	// --- Inyección de Servicios ---
	private medidorService = inject(MedidorService);
	private lecturaService = inject(LecturaService);
	private errorService = inject(ErrorService);

	// --- Estado del Componente ---
	public medidor: Medidor | undefined; // Información de la tarjeta
	public historial: HistorialLectura[] = []; // Datos de la tabla

	public isLoadingMedidor = true; // Skeleton para la tarjeta
	public isLoadingHistorial = true; // Spinner para la tabla

	constructor() {}

	/**
	 * ngOnInit: Se ejecuta al cargar el componente.
	 * Llamamos a los dos servicios.
	 */
	ngOnInit(): void {
		this.loadDatosMedidor();
		this.loadHistorialLecturas();
	}

	/**
	 * Carga la información de la tarjeta del medidor
	 */
	loadDatosMedidor(): void {
		this.isLoadingMedidor = true;
		this.medidorService.getMedidorDelSocioLogueado().subscribe({
			next: (data) => {
				this.medidor = data;
				this.isLoadingMedidor = false;
			},
			error: (err) => {
				console.error('Error al cargar datos del medidor:', err);
				this.isLoadingMedidor = false;
				this.errorService.showError('No se pudo cargar la información de tu medidor.');
			},
		});
	}

	/**
	 * Carga la tabla del historial de lecturas
	 */
	loadHistorialLecturas(): void {
		this.isLoadingHistorial = true;
		this.lecturaService.getHistorialLecturasSocioLogueado().subscribe({
			next: (data) => {
				this.historial = data;
				this.isLoadingHistorial = false;
			},
			error: (err) => {
				console.error('Error al cargar historial de lecturas:', err);
				this.isLoadingHistorial = false;
				this.errorService.showError('No se pudo cargar tu historial de lecturas.');
			},
		});
	}
}
