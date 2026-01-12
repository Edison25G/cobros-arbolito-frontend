import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FacturacionService } from '../../../core/services/facturacion.service';
import { ComprobanteSRI } from '../../../core/interfaces/factura.interface';

@Component({
	selector: 'app-sri-gestion',
	standalone: true,
	imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, TooltipModule],
	providers: [MessageService],
	templateUrl: './sri-gestion.component.html',
})
export class SriGestionComponent implements OnInit {
	private facturaService = inject(FacturacionService);
	private messageService = inject(MessageService);

	comprobantes: ComprobanteSRI[] = [];
	loading = false;
	procesandoId: number | null = null; // Para poner loading solo al botón que se clickea

	ngOnInit() {
		this.cargarPendientes();
	}

	cargarPendientes() {
		this.loading = true;
		this.facturaService.getComprobantesPendientesSRI().subscribe({
			next: (data) => {
				this.comprobantes = data;
				this.loading = false;
			},
			error: () => (this.loading = false),
		});
	}

	procesarSRI(factura: ComprobanteSRI) {
		this.procesandoId = factura.id;

		this.facturaService.enviarFacturaSRI(factura.id).subscribe({
			next: (resp) => {
				if (resp.exito) {
					this.messageService.add({
						severity: 'success',
						summary: 'Autorizado',
						detail: 'Factura enviada al SRI correctamente.',
					});
					// Opción A: Quitar de la lista
					this.comprobantes = this.comprobantes.filter((c) => c.id !== factura.id);
				} else {
					this.messageService.add({ severity: 'warn', summary: 'Rechazada', detail: resp.mensaje });
					this.cargarPendientes(); // Recargar para ver el error actualizado
				}
				this.procesandoId = null;
			},
			error: (err) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
				this.procesandoId = null;
			},
		});
	}

	getSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
		switch (estado) {
			case 'AUTORIZADO':
				return 'success';
			case 'NO_ENVIADO':
				return 'secondary';
			case 'DEVUELTA':
				return 'warn';
			case 'RECHAZADA':
				return 'danger';
			default:
				return 'info';
		}
	}
}
