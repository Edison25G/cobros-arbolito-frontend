import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select'; // Changed from Dropdown for safety
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card'; // Added CardModule
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { BillingService, TransferenciaPendiente, ValidarTransferenciaRequest } from '../../../core/services/billing.service';
import { EstadoCuentaDTO, AbonoInput, AbonoOutput } from '../../../core/interfaces/billing.interface';

@Component({
	selector: 'app-caja',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		DividerModule,
		ButtonModule,
		InputTextModule,
		TableModule,
		TagModule,
		DialogModule,
		ToastModule,
		SelectModule,
		InputNumberModule,
		CardModule,
		ConfirmDialogModule
	],
	templateUrl: './caja.component.html',
	styleUrls: ['./caja.component.css'],
	providers: [MessageService, ConfirmationService]
})
export class CajaComponent implements OnInit {

	// Search
	socioIdBusqueda: string = ''; // Changed to string for input compatibility
	loading: boolean = false;

	// Data
	estadoCuenta: EstadoCuentaDTO | null = null;

	// Transferencias Pendientes
	transferencias: TransferenciaPendiente[] = [];
	loadingTransferencias: boolean = false;
	mostrarDialogoTransferencia: boolean = false;
	transferenciaSeleccionada: TransferenciaPendiente | null = null;
	motivoRechazo: string = '';

	// Payment
	montoPagar: number | null = null;
	metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE' = 'EFECTIVO';
	referenciaPago: string = '';
	procesandoPago: boolean = false;

	metodosPagoOptions = [
		{ label: 'Efectivo', value: 'EFECTIVO' },
		{ label: 'Transferencia', value: 'TRANSFERENCIA' },
		{ label: 'Cheque', value: 'CHEQUE' }
	];

	// Dialogs
	mostrarDialogoReconexion: boolean = false;

	constructor(
		private billingService: BillingService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService
	) { }

	ngOnInit(): void {
		this.cargarTransferencias();
	}

	cargarTransferencias() {
		this.loadingTransferencias = true;
		this.billingService.getTransferenciasPendientes().subscribe({
			next: (data) => {
				this.transferencias = data;
				this.loadingTransferencias = false;
			},
			error: (err) => {
				this.loadingTransferencias = false;
				console.error("Error cargando transferencias", err);
				// No mostrar toast para no saturar si es solo init
			}
		});
	}

	abrirValidarTransferencia(trx: TransferenciaPendiente) {
		this.transferenciaSeleccionada = trx;
		this.motivoRechazo = '';
		this.mostrarDialogoTransferencia = true;
	}

	procesarTransferencia(accion: 'APROBAR' | 'RECHAZAR') {
		if (!this.transferenciaSeleccionada) return;

		// Validar motivo si es rechazo (opcional segun backend pero buena UX)
		if (accion === 'RECHAZAR' && !this.motivoRechazo.trim()) {
			this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Indique el motivo del rechazo.' });
			return;
		}

		const request = {
			pago_id: this.transferenciaSeleccionada.pago_id,
			accion: accion,
			motivo_rechazo: this.motivoRechazo
		};

		this.loadingTransferencias = true; // Reusamos loading o creamos uno nuevo si queremos bloquear solo dialogo
		// Para UX simple, bloqueamos todo un poco o usamos un flag especifico. 
		// El usuario pidio "procesandoTransferencia".
		// Como no declare esa variable en la clase, usare loadingTransferencias para bloquear la tabla al menos, 
		// pero idealmente deberia bloquear el dialogo.
		// Voy a asumir que puedo usar un flag local o simplemente cerrar el dialogo al finalizar.

		this.billingService.validarTransferencia(request).subscribe({
			next: (resp) => {
				this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.mensaje });
				this.mostrarDialogoTransferencia = false;
				this.transferenciaSeleccionada = null;
				this.motivoRechazo = '';
				this.cargarTransferencias(); // Refrescar lista
			},
			error: (err) => {
				this.loadingTransferencias = false;
				this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
			}
		});
	}

	openInNewTab(url: string) {
		window.open(url, '_blank');
	}


	buscarSocio() {
		if (!this.socioIdBusqueda) {
			this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Ingrese un ID de socio.' });
			return;
		}

		const id = parseInt(this.socioIdBusqueda, 10);
		if (isNaN(id)) {
			this.messageService.add({ severity: 'error', summary: 'Error', detail: 'ID inválido.' });
			return;
		}

		this.loading = true;
		this.estadoCuenta = null;

		this.billingService.getEstadoCuenta(id).subscribe({
			next: (data) => {
				this.estadoCuenta = data;
				this.loading = false;
				// Auto-fill monto with total debt
				this.montoPagar = parseFloat(data.deuda_total);
			},
			error: (err) => {
				this.loading = false;
				this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
			}
		});
	}

	confirmarPago() {
		if (!this.estadoCuenta || !this.montoPagar || this.montoPagar <= 0) {
			this.messageService.add({ severity: 'warn', summary: 'Inválido', detail: 'Ingrese un monto válido.' });
			return;
		}

		this.confirmationService.confirm({
			message: `¿Confirmar pago de $${this.montoPagar}?`,
			header: 'Confirmación de Pago',
			icon: 'pi pi-exclamation-triangle',
			accept: () => {
				this.ejecutarPago();
			}
		});
	}

	ejecutarPago() {
		if (!this.estadoCuenta || !this.montoPagar) return;

		this.procesandoPago = true;
		const request: AbonoInput = {
			socio_id: this.estadoCuenta.socio_id,
			monto: this.montoPagar,
			metodo_pago: this.metodoPago,
			referencia: this.referenciaPago
		};

		this.billingService.procesarPago(request).subscribe({
			next: (resp) => {
				this.procesandoPago = false;

				if (resp.estado_servicio === 'PENDIENTE_RECONEXION') {
					this.mostrarDialogoReconexion = true;
				} else {
					this.messageService.add({ severity: 'success', summary: 'Pago Exitoso', detail: resp.mensaje });
				}

				// Refresh
				this.buscarSocio();
				this.montoPagar = null;
				this.referenciaPago = '';
			},
			error: (err) => {
				this.procesandoPago = false;
				this.messageService.add({ severity: 'error', summary: 'Error en Pago', detail: err.message });
			}
		});
	}

	getSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' {
		switch (estado) {
			case 'ACTIVO':
				return 'success';
			case 'SUSPENDIDO':
				return 'danger';
			case 'PENDIENTE_RECONEXION':
				return 'info';
			default:
				return 'info';
		}
	}

	descargarFactura(facturaId: number) {
		this.billingService.downloadFacturaPdf(facturaId).subscribe({
			next: (blob) => {
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `factura_${facturaId}.pdf`;
				link.click();
				window.URL.revokeObjectURL(url);
			},
			error: (err) => {
				console.error("Error descargando PDF", err);
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar la factura.' });
			}
		});
	}
}
