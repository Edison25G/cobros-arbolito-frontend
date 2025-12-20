import { Component, OnInit, inject } from '@angular/core';
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
import { ImageModule } from 'primeng/image'; // Para ver la foto del comprobante

// Servicio
import { CajaService } from '../../../core/services/caja.service';
import { ComprobanteService } from '../../../core/services/comprobante.service';

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
export class CajaComponent implements OnInit {
	// Inyecciones
	private cajaService = inject(CajaService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private comprobanteService = inject(ComprobanteService);
	// Variables Ventanilla
	terminoBusqueda = '';
	buscando = false;
	socioEncontrado: any = null;
	deudas: any[] = [];
	totalAPagar = 0;
	procesandoPago = false;

	// Variables Transferencias
	transferencias: any[] = [];
	cargandoTransferencias = false;

	ngOnInit() {
		this.cargarTransferencias();
	}

	// --- PESTAÑA 1: COBRO EN VENTANILLA ---

	buscarSocio() {
		if (!this.terminoBusqueda.trim()) return;

		this.buscando = true;
		this.socioEncontrado = null;
		this.deudas = [];

		this.cajaService.buscarSocioConDeudas(this.terminoBusqueda).subscribe({
			next: (data) => {
				this.socioEncontrado = data.socio;
				this.deudas = data.deudas;
				this.calcularTotal();
				this.buscando = false;
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'No encontrado',
					detail: 'No existe socio con esa cédula o nombre.',
				});
				this.buscando = false;
			},
		});
	}

	calcularTotal() {
		// Suma solo las deudas que tienen el checkbox marcado (seleccionado = true)
		this.totalAPagar = this.deudas.filter((d) => d.seleccionado).reduce((acc, d) => acc + d.monto, 0);
	}

	confirmarCobro() {
		const itemsSeleccionados = this.deudas.filter((d) => d.seleccionado);

		if (itemsSeleccionados.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Nada seleccionado',
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

	ejecutarPago(items: any[]) {
		this.procesandoPago = true;
		const ids = items.map((i) => i.id);

		// Guardamos referencia al socio y total ANTES de limpiar las variables
		const socioActual = { ...this.socioEncontrado };
		const totalCobrado = this.totalAPagar;
		const itemsCobrados = [...items];

		this.cajaService.procesarPago(ids, 'EFECTIVO').subscribe((resp: any) => {
			this.messageService.add({ severity: 'success', summary: 'Pago Exitoso', detail: 'Generando recibo...' });

			// ✅ GENERAMOS EL PDF AQUÍ
			// Usamos el ticket que devuelve el backend (o generamos uno temporal)
			const nroTicket = resp.ticket || 'TKT-' + Math.floor(Math.random() * 10000);

			this.comprobanteService.generarRecibo(socioActual, itemsCobrados, totalCobrado, nroTicket);

			// Limpiamos pantalla
			this.procesandoPago = false;
			this.socioEncontrado = null;
			this.terminoBusqueda = '';
			this.deudas = [];
			this.totalAPagar = 0;
		});
	}

	// --- PESTAÑA 2: TRANSFERENCIAS ---

	cargarTransferencias() {
		this.cargandoTransferencias = true;
		this.cajaService.getTransferenciasPendientes().subscribe((data) => {
			this.transferencias = data;
			this.cargandoTransferencias = false;
		});
	}

	aprobarTransferencia(transf: any) {
		this.confirmationService.confirm({
			message: `¿El dinero llegó al banco? Se aprobará el pago de ${transf.socio}.`,
			header: 'Validar Transferencia',
			accept: () => {
				// Aquí llamarías al servicio para aprobar
				this.transferencias = this.transferencias.filter((t) => t.id !== transf.id);
				this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'El pago ha sido validado.' });
			},
		});
	}
}
