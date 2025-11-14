import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Servicios y Modelos ---
import { FacturacionService } from '@core/services/facturacion.service';
import { Factura, EstadoFactura } from '@core/models/factura.interface';
import { ErrorService } from '../../../auth/core/services/error.service';

// --- PrimeNG ---
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'amc-pagos',
	standalone: true,
	imports: [CommonModule, TableModule, TagModule, ButtonModule, TooltipModule],
	templateUrl: './pagos.component.html',
	styleUrls: ['./pagos.component.css'],
})
export class PagosComponent implements OnInit {
	private facturacionService = inject(FacturacionService);
	private errorService = inject(ErrorService);

	public misFacturas: Factura[] = [];
	public isLoading = true;
	public EstadoFactura = EstadoFactura;

	constructor() {}

	ngOnInit(): void {
		this.loadMisFacturas();
	}

	loadMisFacturas(): void {
		this.isLoading = true;

		this.facturacionService.getFacturasDelSocioLogueado().subscribe({
			next: (data) => {
				this.misFacturas = data;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
				this.errorService.showError('No se pudieron cargar tus facturas.');
			},
		});
	}

	getSeverity(estado: EstadoFactura): 'success' | 'info' | 'warn' | 'danger' {
		switch (estado) {
			case EstadoFactura.Pagada:
				return 'success';
			case EstadoFactura.Vencida:
				return 'danger';
			case EstadoFactura.Pendiente:
			default:
				return 'warn';
		}
	}

	getLabel(estado: EstadoFactura): string {
		return estado;
	}

	pagarFactura(factura: Factura): void {
		console.log('Redirigiendo a pago:', factura.id);
		this.errorService.showSuccess('Simulando redirección a pago…');
	}
}
