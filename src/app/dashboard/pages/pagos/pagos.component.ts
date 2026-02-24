import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE para ngModel
import { InputTextModule } from 'primeng/inputtext'; // 👈 IMPORTANTE para inputs

// --- Servicios y Modelos ---
import { PagoService } from '../../../core/services/pago.service';
import { ErrorService } from '../../../auth/core/services/error.service';
import { ComprobanteService } from '../../../core/services/comprobante.service';
import { FacturaSocio, EstadoFactura } from '../../../core/models/pago.interface';

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
		DatePipe,
		FormsModule, // ✅ Necesario
		InputTextModule, // ✅ Necesario
		TableModule,
		TagModule,
		ButtonModule,
		TooltipModule,
		DialogModule,
		FileUploadModule,
		ToastModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './pagos.component.html',
	styleUrls: ['./pagos.component.css'],
})
export class PagosComponent implements OnInit {
	// --- Inyección de Dependencias ---
	private pagoService = inject(PagoService);
	private errorService = inject(ErrorService);
	private messageService = inject(MessageService);
	private comprobanteService = inject(ComprobanteService);

	// --- Estado del Componente ---
	public misFacturas: FacturaSocio[] = [];
	public isLoading = true;
	public EstadoFactura = EstadoFactura;

	// Variables para captura de datos
	public referenciaInput = '';
	public archivoSeleccionado: File | null = null;

	// --- Estado del Modal ---
	public showUploadModal = false;
	public isUploading = false;
	public facturaSeleccionada: FacturaSocio | null = null;
	public showDetailModal = false;

	public comprobanteActual: any = null;

	constructor() {}

	ngOnInit(): void {
		this.loadMisFacturas();
	}

	/**
	 * Carga las facturas del socio desde el servicio
	 */
	loadMisFacturas(): void {
		this.isLoading = true;
		this.pagoService.getFacturasDelSocioLogueado().subscribe({
			next: (data) => {
				this.misFacturas = data;
				this.isLoading = false;

				// ✅ VALIDACIÓN PARA EL TOAST
				if (this.misFacturas.length === 0) {
					this.messageService.add({
						severity: 'info',
						summary: 'Sin pendientes',
						detail: 'No tienes facturas o pagos registrados por el momento.',
						life: 5000, // Duración de 5 segundos
					});
				}
			},
			error: (err) => {
				this.isLoading = false;
				// Solo errores reales de conexión/servidor
				this.errorService.showError(err.message || 'Error al cargar facturas.');
			},
		});
	}

	getSeverity(estado: EstadoFactura): 'success' | 'info' | 'warn' | 'danger' {
		switch (estado) {
			case EstadoFactura.Pagada:
				return 'success';
			case EstadoFactura.EnVerificacion: // Antes POR_VALIDAR
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

	openUploadModal(factura: FacturaSocio): void {
		this.facturaSeleccionada = factura;
		this.referenciaInput = ''; // Limpiamos el campo
		this.archivoSeleccionado = null; // Limpiamos archivo previo
		this.showUploadModal = true;
	}

	closeUploadModal(): void {
		this.showUploadModal = false;
		this.isUploading = false;
		this.facturaSeleccionada = null;
	}

	// ✅ 1. CAPTURAR ARCHIVO: Se dispara cuando el usuario selecciona la imagen
	onFileSelect(event: { files: File[] }): void {
		if (event.files && event.files.length > 0) {
			this.archivoSeleccionado = event.files[0];
		}
	}

	// ✅ 2. ENVIAR AL BACKEND: Botón manual
	enviarComprobante(): void {
		// Validaciones básicas
		if (!this.facturaSeleccionada) return;

		if (!this.archivoSeleccionado) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Falta archivo',
				detail: 'Seleccione una imagen del recibo.',
			});
			return;
		}

		if (!this.referenciaInput || this.referenciaInput.trim().length < 3) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Falta referencia',
				detail: 'Escriba el número de comprobante.',
			});
			return;
		}

		this.isUploading = true;

		// Llamada al Servicio con los 4 Argumentos requeridos
		this.pagoService
			.subirComprobante(
				this.facturaSeleccionada.id, // 1. ID Factura
				this.facturaSeleccionada.total, // 2. Monto (Para validación)
				this.archivoSeleccionado, // 3. Archivo (Imagen)
				this.referenciaInput, // 4. Referencia (Texto)
			)
			.subscribe({
				next: (_res) => {
					this.isUploading = false;
					this.messageService.add({
						severity: 'success',
						summary: 'Enviado',
						detail: 'Comprobante subido correctamente para validación.',
					});
					this.loadMisFacturas(); // Recargar tabla para ver el cambio de estado
					this.closeUploadModal();
				},
				error: (err) => {
					this.isUploading = false;
					this.errorService.showError(err.message || 'Error al subir comprobante');
				},
			});
	}

	// --- Otros Métodos (Impresión, Detalles) ---

	verFactura(facturaId: number): void {
		this.errorService.showSuccess(`Ver factura #${facturaId}`);
	}

	verDetalleFactura(factura: FacturaSocio) {
		this.facturaSeleccionada = factura;
		this.showDetailModal = true;
	}

	imprimirTicket() {
		if (this.facturaSeleccionada && this.facturaSeleccionada.socio) {
			this.comprobanteService.generarTicketProfesional(this.facturaSeleccionada.socio, this.facturaSeleccionada, []);
		}
	}

	imprimirComprobanteProfesional() {
		if (this.comprobanteActual) {
			this.comprobanteService.generarTicketProfesional(
				this.comprobanteActual.socio,
				this.comprobanteActual.factura,
				this.comprobanteActual.pagos,
			);
		}
	}
}
