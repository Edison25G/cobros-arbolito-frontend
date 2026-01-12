import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ImageModule } from 'primeng/image';

// Servicios e Interfaces
import { CajaService } from '../../../core/services/caja.service';
import { ComprobanteService } from '../../../core/services/comprobante.service';
import { DeudaItem, TransferenciaPendiente } from '../../../core/interfaces/caja.interface';

@Component({
	selector: 'app-caja',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		InputTextModule,
		ButtonModule,
		TableModule,
		CardModule,
		TabsModule,
		TagModule,
		ToastModule,
		CheckboxModule,
		ConfirmDialogModule,
		ImageModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './caja.component.html',
})
export class CajaComponent {
	// Inyecciones
	private cajaService = inject(CajaService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private comprobanteService = inject(ComprobanteService);

	// Variables Ventanilla
	terminoBusqueda = '';
	buscando = false;

	// Usamos 'any' para el socio si no tienes una interfaz estricta de Socio aún
	socioEncontrado: any = null;
	deudas: DeudaItem[] = [];

	totalAPagar = 0;
	procesandoPago = false;

	// Variables Transferencias
	transferencias: TransferenciaPendiente[] = [];
	cargandoTransferencias = false;

	// TODO: Descomentar cuando el backend tenga listo el endpoint
	// ngOnInit(): void {
	//   this.cargarTransferencias();
	// }

	// --- PESTAÑA 1: COBRO EN VENTANILLA ---

	buscarSocio() {
		if (!this.terminoBusqueda.trim()) return;

		this.buscando = true;
		this.socioEncontrado = null;
		this.deudas = [];
		this.totalAPagar = 0;

		this.cajaService.buscarSocioConDeudas(this.terminoBusqueda).subscribe({
			next: (data) => {
				if (data.encontrado) {
					this.socioEncontrado = data.socio;
					// Mapeamos las deudas del backend y les agregamos 'seleccionado' para los checkboxes
					this.deudas = data.deudas.map((d) => ({ ...d, seleccionado: true }));
					this.calcularTotal();
				} else {
					this.mostrarError('No encontrado', 'No se encontraron resultados con ese criterio.');
				}
				this.buscando = false;
			},
			error: (err) => {
				// Si es un 404 manejado por el servicio, llega como error aquí también
				this.mostrarError('Aviso', err.message);
				this.buscando = false;
			},
		});
	}

	calcularTotal() {
		// Suma solo los ítems seleccionados
		this.totalAPagar = this.deudas.filter((d) => d.seleccionado).reduce((acc, d) => acc + Number(d.monto), 0);
	}

	confirmarCobro() {
		const itemsSeleccionados = this.deudas.filter((d) => d.seleccionado);

		if (itemsSeleccionados.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Atención',
				detail: 'Seleccione al menos una deuda para cobrar.',
			});
			return;
		}

		this.confirmationService.confirm({
			message: `¿Confirmar cobro de $${this.totalAPagar.toFixed(2)} a ${this.socioEncontrado.nombres}?`,
			header: 'Confirmación de Caja',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, Cobrar',
			rejectLabel: 'Cancelar',
			acceptButtonStyleClass: 'p-button-success',
			accept: () => {
				this.ejecutarPago(itemsSeleccionados);
			},
		});
	}

	ejecutarPago(items: DeudaItem[]) {
		this.procesandoPago = true;
		const ids = items.map((i) => i.id);

		// Guardamos una copia de los datos para el recibo ANTES de limpiar las variables
		const datosRecibo = {
			socio: { ...this.socioEncontrado },
			items: [...items],
			total: this.totalAPagar,
		};

		this.cajaService.procesarPago(ids, 'EFECTIVO').subscribe({
			next: (resp) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Pago Exitoso',
					detail: `Ticket Generado: ${resp.ticket_numero}`,
				});

				// Generar Recibo PDF usando tu ComprobanteService
				this.comprobanteService.generarRecibo(
					datosRecibo.socio,
					datosRecibo.items,
					datosRecibo.total,
					resp.ticket_numero,
				);

				// Limpiar pantalla / Reiniciar estado
				this.procesandoPago = false;
				this.socioEncontrado = null;
				this.terminoBusqueda = '';
				this.deudas = [];
				this.totalAPagar = 0;
			},
			error: (err) => {
				this.procesandoPago = false;
				this.mostrarError('Error al procesar pago', err.message);
			},
		});
	}

	// --- PESTAÑA 2: TRANSFERENCIAS (Opcional por ahora) ---

	cargarTransferencias() {
		this.cargandoTransferencias = true;
		this.cajaService.getTransferenciasPendientes().subscribe({
			next: (data) => {
				this.transferencias = data;
				this.cargandoTransferencias = false;
			},
			error: (err) => {
				console.error(err);
				this.cargandoTransferencias = false;
			},
		});
	}

	aprobarTransferencia(transf: TransferenciaPendiente) {
		this.confirmationService.confirm({
			message: `¿Confirmar aprobación del pago de ${transf.socio_nombre}?`,
			accept: () => {
				// Aquí llamarías al servicio para aprobar
				this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'Transferencia validada.' });
				// Eliminar de la lista localmente
				this.transferencias = this.transferencias.filter((t) => t.id !== transf.id);
			},
		});
	}

	mostrarError(titulo: string, msg: string) {
		this.messageService.add({ severity: 'error', summary: titulo, detail: msg });
	}
}
