import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Para el botón de navegar a "Nuevo"

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// Servicio
import { LecturaService } from '../../../core/services/lectura.service';
import { LecturaView } from '../../../core/models/lectura.interface';
@Component({
	selector: 'app-historial-lecturas',
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		TableModule,
		ButtonModule,
		InputTextModule,
		IconFieldModule,
		InputIconModule,
		TagModule,
		TooltipModule,
	],
	templateUrl: './historial-lecturas.component.html',
})
export class HistorialLecturasComponent implements OnInit {
	private lecturaService = inject(LecturaService);

	lecturas: LecturaView[] = [];
	loading = true;
	errorCarga = false;

	ngOnInit(): void {
		this.cargarDatos();
	}

	cargarDatos() {
		this.loading = true;
		this.lecturaService.getAll().subscribe({
			next: (data) => {
				this.lecturas = data;
				this.loading = false;
			},
			error: (err) => {
				this.loading = false;

				// Manejo específico del 404
				if (err.status === 404) {
					this.lecturas = []; // Asumimos lista vacía
				} else {
					this.errorCarga = true; // Mostramos error genérico en el HTML
				}
			},
		});
	}
}
