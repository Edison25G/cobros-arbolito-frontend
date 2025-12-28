import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // <-- Importar DatePipe
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// --- Servicios y Modelos ---
import { PagoService } from '../../../core/services/pago.service';
import { ErrorService } from '../../../auth/core/services/error.service';
import { FacturaSocio, EstadoFactura } from '../../../core/interfaces/pago.interfaces';

// --- PrimeNG v20 (Módulos) ---
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
	selector: 'amc-pagos',
	standalone: true,
	imports: [
		CommonModule,
		DatePipe, // <-- Añadido para formatear fechas en el HTML
		// Módulos de PrimeNG
		TableModule,
		TagModule,
		ButtonModule,
		TooltipModule,
		DialogModule,
		FileUploadModule,
		ToastModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService], // Proveedores necesarios
	templateUrl: './pagos.component.html',
	styleUrls: ['./pagos.component.css'],
})
export class PagosComponent implements OnInit {
	// --- Inyección de Dependencias ---
	private pagoService = inject(PagoService);
	private errorService = inject(ErrorService);
	private messageService = inject(MessageService);

	// --- Estado del Componente ---
	public misFacturas: FacturaSocio[] = [];
	public isLoading = true;
	public EstadoFactura = EstadoFactura; // Para usar el Enum en el HTML

	// --- Estado del Modal ---
	public showUploadModal = false;
	public isUploading = false;
	public facturaSeleccionada: FacturaSocio | null = null;
	public showDetailModal = false;
	constructor() {}

	ngOnInit(): void {
		this.loadMisFacturas();
	}

	/**
	 * Carga las facturas del socio desde el servicio (simulado)
	 */
	loadMisFacturas(): void {
		this.isLoading = true;
		this.pagoService.getFacturasDelSocioLogueado().subscribe({
			next: (data) => {
				this.misFacturas = data;
				this.isLoading = false;
			},
			error: (err) => {
				this.isLoading = false;
				this.errorService.showError(err.message || 'No se pudieron cargar tus facturas.');
			},
		});
	}

	/**
	 * Devuelve el color (severidad) para el <p-tag> basado en el estado
	 */
	getSeverity(estado: EstadoFactura): 'success' | 'info' | 'warn' | 'danger' {
		switch (estado) {
			case EstadoFactura.Pagada:
				return 'success';
			case EstadoFactura.EnVerificacion:
				return 'info';
			case EstadoFactura.Pendiente:
				return 'warn';
			case EstadoFactura.Anulada:
				return 'danger';
			default:
				return 'warn';
		}
	}

	// --- Lógica del Modal de Carga de Archivos ---

	/**
	 * Abre el modal para subir un comprobante
	 */
	openUploadModal(factura: FacturaSocio): void {
		this.facturaSeleccionada = factura;
		this.showUploadModal = true;
	}

	/**
	 * Cierra el modal
	 */
	closeUploadModal(): void {
		this.showUploadModal = false;
		this.isUploading = false;
		this.facturaSeleccionada = null;
	}

	/**
	 * Se dispara cuando el <p-fileUpload> selecciona un archivo.
	 * Llama al servicio (simulado) para "subir" el archivo.
	 */
	onUpload(event: { files: File[] }): void {
		if (!this.facturaSeleccionada || !event.files || event.files.length === 0) {
			return;
		}

		const archivo = event.files[0];
		this.isUploading = true;

		this.pagoService
			.subirComprobante(this.facturaSeleccionada.id, archivo)
			.pipe(
				tap((response) => {
					this.isUploading = false;
					if (response.success) {
						// Muestra notificación de éxito
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.message });
						// Recarga la tabla para mostrar el nuevo estado ("En Verificación")
						this.loadMisFacturas();
						this.closeUploadModal();
					} else {
						this.errorService.showError(response.message);
					}
				}),
				catchError((err) => {
					this.isUploading = false;
					this.errorService.showError(err.message);
					return of(null);
				}),
			)
			.subscribe();
	}

	/**
	 * Placeholder para la acción de ver una factura ya pagada
	 */
	verFactura(facturaId: number): void {
		console.log('Mostrando detalle de factura:', facturaId);
		this.errorService.showSuccess('Simulando vista de factura PDF...');
	}

	verDetalleFactura(factura: FacturaSocio) {
		this.facturaSeleccionada = factura;
		this.showDetailModal = true;
	}
	imprimirTicket() {
		// Cerramos el modal momentáneamente o imprimimos directamente
		window.print();

		// NOTA: Para imprimir SOLO el ticket y no toda la página,
		// lo ideal es usar CSS con @media print.
		// Por ahora, window.print() imprimirá la pantalla, lo cual sirve para empezar.
	}
}
