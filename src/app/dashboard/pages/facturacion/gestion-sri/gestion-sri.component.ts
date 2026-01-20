import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FacturacionService } from '../../../../core/services/facturacion.service';

@Component({
	selector: 'app-gestion-sri',
	standalone: true,
	imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule],
	providers: [MessageService],
	templateUrl: './gestion-sri.component.html',
})
export class GestionSriComponent implements OnInit {
	private facturacionService = inject(FacturacionService);
	private messageService = inject(MessageService);

	facturasPendientes: any[] = [];
	loading = false;

	ngOnInit() {
		this.cargarFacturasConProblemas();
	}

	cargarFacturasConProblemas() {
		this.loading = true;
		// Usamos el mismo método de buscar facturas pero podrías filtrar en el backend
		// solo las que NO están autorizadas.
		this.facturacionService.getFacturasPorSocio('', true).subscribe({
			next: (data) => {
				// Filtramos para mostrar solo lo que necesita atención
				this.facturasPendientes = data.filter((f) => f.estado_sri !== 'AUTORIZADO');
				this.loading = false;
			},
			error: () => (this.loading = false),
		});
	}

	sincronizar(claveAcceso: string) {
		if (!claveAcceso) return;

		this.messageService.add({ severity: 'info', summary: 'Procesando', detail: 'Consultando al SRI...' });

		this.facturacionService.consultarSRI(claveAcceso).subscribe({
			next: (res) => {
				this.messageService.add({
					severity: res.estado === 'AUTORIZADO' ? 'success' : 'warn',
					summary: 'Resultado SRI',
					detail: res.mensaje,
				});
				this.cargarFacturasConProblemas(); // Recargar tabla
			},
			error: (_err) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con el servidor' });
			},
		});
	}
}
