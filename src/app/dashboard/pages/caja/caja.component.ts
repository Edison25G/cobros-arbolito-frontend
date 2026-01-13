import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
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
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';

// Servicios e Interfaces
import { CajaService } from '../../../core/services/caja.service';
import { TransferenciaPendiente, PagoItem, FacturaPendiente, Comprobante } from '../../../core/interfaces/caja.interface';

@Component({
	selector: 'app-caja',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		InputTextModule,
		InputNumberModule,
		ButtonModule,
		TableModule,
		CardModule,
		TabsModule,
		TagModule,
		ToastModule,
		CheckboxModule,
		ConfirmDialogModule,
		ImageModule,
		DialogModule,
		TooltipModule,
		DatePickerModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './caja.component.html',
})
export class CajaComponent implements OnInit {
	// Inyecciones
	private cajaService = inject(CajaService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	// --- Variables para tabla de facturas pendientes ---
	facturasPendientes: FacturaPendiente[] = [];
	facturasFiltradas: FacturaPendiente[] = [];
	cargando = false;
	filtroGlobal = '';

	// Filtro de fecha
	fechaSeleccionada: Date = new Date();

	// Factura seleccionada para cobrar
	facturaSeleccionada: FacturaPendiente | null = null;

	// KPIs
	totalFacturas = 0;
	totalPorCobrar = 0;

	// Variables de procesamiento
	procesandoPago = false;

	// Variables Transferencias
	transferencias: TransferenciaPendiente[] = [];
	cargandoTransferencias = false;

	// Variables Modal Pago Mixto
	modalPagoMixtoVisible = false;
	montoEfectivo = 0;
	montoTransferencia = 0;
	referenciaTransferencia = '';
	montoRestante = 0;

	// Variables Modal Comprobante
	modalComprobanteVisible = false;
	comprobanteActual: Comprobante | null = null;

	ngOnInit(): void {
		// No cargamos todo al inicio para optimizar si son muchos datos.
		// Solo si el usuario busca se llena la tabla.
		console.log('Módulo de Caja listo para cobrar.');
	}

	// --- BUSCAR FACTURAS ---
	buscarSocio() {
		this.cargando = true;

		// Obtenemos los filtros
		const q = this.filtroGlobal.trim() || undefined;
		const dia = this.fechaSeleccionada.getDate();
		const mes = this.fechaSeleccionada.getMonth() + 1;
		const anio = this.fechaSeleccionada.getFullYear();

		// Llamamos al servicio con los parámetros de búsqueda
		this.cajaService.getFacturasPendientes(q, dia, mes, anio).subscribe({
			next: (facturas) => {
				this.facturasPendientes = facturas || [];
				this.facturasFiltradas = [...this.facturasPendientes];
				this.calcularKPIs();
				this.cargando = false;

				if (this.facturasPendientes.length === 0) {
					this.messageService.add({
						severity: 'info',
						summary: 'Sin Facturas',
						detail: `No hay facturas pendientes para ${this.formatearFecha(this.fechaSeleccionada)}`,
					});
				}
			},
			error: (err) => {
				console.error('Error buscando facturas:', err);
				this.cargando = false;
				this.facturasPendientes = [];
				this.facturasFiltradas = [];
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: err.message || 'No se pudo buscar. Verifique la conexión.',
				});
			},
		});
	}

	formatearFecha(fecha: Date): string {
		return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });
	}

	calcularKPIs() {
		this.totalFacturas = this.facturasPendientes.length;
		this.totalPorCobrar = this.facturasPendientes.reduce((acc, f) => acc + Number(f.total), 0);
	}

	// --- FILTRO LOCAL (Opcional, si ya trajiste los datos del socio) ---
	filtrar() {
		const filtro = this.filtroGlobal.toLowerCase().trim();
		if (!filtro) {
			this.facturasFiltradas = [...this.facturasPendientes];
		} else {
			this.facturasFiltradas = this.facturasPendientes.filter(
				(f) =>
					f.socio_nombre.toLowerCase().includes(filtro) ||
					f.socio_cedula.includes(filtro) ||
					f.numero_factura.toLowerCase().includes(filtro) ||
					(f.medidor_codigo && f.medidor_codigo.toLowerCase().includes(filtro)),
			);
		}
	}

	limpiarFiltro() {
		this.filtroGlobal = '';
		this.facturasFiltradas = []; // Limpiamos tabla
		this.facturasPendientes = [];
		this.calcularKPIs();
	}

	// --- COBRAR FACTURA ---
	confirmarCobroEfectivo(factura: FacturaPendiente) {
		this.confirmationService.confirm({
			message: `¿Confirmar cobro de $${Number(factura.total).toFixed(2)} a ${factura.socio_nombre}?`,
			header: 'Confirmación de Cobro',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, Cobrar',
			rejectLabel: 'Cancelar',
			acceptButtonStyleClass: 'p-button-success',
			accept: () => {
				this.ejecutarCobroEfectivo(factura);
			},
		});
	}

	ejecutarCobroEfectivo(factura: FacturaPendiente) {
		this.procesandoPago = true;

		// Aseguramos que el monto sea un número con 2 decimales para evitar errores 400
		const montoExacto = Number(Number(factura.total).toFixed(2));

		const pagos: PagoItem[] = [{ metodo: 'EFECTIVO', monto: montoExacto }];

		this.cajaService.registrarCobro({ factura_id: factura.id, pagos }).subscribe({
			next: (resp) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Cobro Exitoso',
					detail: resp.mensaje,
				});

				// Mostrar comprobante del backend
				this.mostrarComprobante(resp.comprobante);

				// Remover de la lista visualmente
				this.facturasPendientes = this.facturasPendientes.filter((f) => f.id !== factura.id);
				this.facturasFiltradas = this.facturasFiltradas.filter((f) => f.id !== factura.id);
				this.calcularKPIs();
				this.procesandoPago = false;
			},
			error: (err) => {
				this.procesandoPago = false;
				// Mostramos el mensaje exacto que envía el backend
				const msg = err.error?.error || err.message || 'Error desconocido';
				this.messageService.add({ severity: 'error', summary: 'Error al Cobrar', detail: msg });
			},
		});
	}

	// --- MOSTRAR COMPROBANTE ---
	mostrarComprobante(comprobante: Comprobante) {
		this.comprobanteActual = comprobante;
		this.modalComprobanteVisible = true;
	}

	imprimirComprobante() {
		window.print();
	}

	// --- PAGO MIXTO ---
	abrirModalPagoMixto(factura: FacturaPendiente) {
		this.facturaSeleccionada = factura;
		this.montoEfectivo = 0;
		this.montoTransferencia = 0;
		this.referenciaTransferencia = '';
		this.montoRestante = Number(factura.total);
		this.modalPagoMixtoVisible = true;
	}

	calcularRestante() {
		if (!this.facturaSeleccionada) return;
		const total = Number(this.facturaSeleccionada.total);
		const sumaMontos = (this.montoEfectivo || 0) + (this.montoTransferencia || 0);
		this.montoRestante = Math.round((total - sumaMontos) * 100) / 100;
	}

	ejecutarPagoMixto() {
		if (!this.facturaSeleccionada) return;

		if (Math.abs(this.montoRestante) > 0.01) {
			// Tolerancia pequeña para decimales
			this.messageService.add({
				severity: 'warn',
				summary: 'Atención',
				detail: 'Los montos deben sumar exactamente el total a pagar.',
			});
			return;
		}

		const pagos: PagoItem[] = [];

		if (this.montoEfectivo > 0) {
			pagos.push({ metodo: 'EFECTIVO', monto: this.montoEfectivo });
		}

		if (this.montoTransferencia > 0) {
			pagos.push({
				metodo: 'TRANSFERENCIA',
				monto: this.montoTransferencia,
				referencia: this.referenciaTransferencia || undefined,
			});
		}

		this.procesandoPago = true;
		const factura = this.facturaSeleccionada;

		this.cajaService.registrarCobro({ factura_id: factura.id, pagos }).subscribe({
			next: (resp) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Pago Mixto Exitoso',
					detail: resp.mensaje,
				});

				// Cerrar modal de pago mixto y mostrar comprobante
				this.modalPagoMixtoVisible = false;
				this.mostrarComprobante(resp.comprobante);

				// Remover de la lista
				this.facturasPendientes = this.facturasPendientes.filter((f) => f.id !== factura.id);
				this.facturasFiltradas = this.facturasFiltradas.filter((f) => f.id !== factura.id);
				this.calcularKPIs();

				this.procesandoPago = false;
				this.facturaSeleccionada = null;
			},
			error: (err) => {
				this.procesandoPago = false;
				const msg = err.error?.error || err.message;
				this.messageService.add({ severity: 'error', summary: 'Error en Pago Mixto', detail: msg });
			},
		});
	}

	// --- PESTAÑA TRANSFERENCIAS ---
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
				this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'Transferencia validada.' });
				// Aquí deberías llamar al servicio real para aprobar en BD
				this.transferencias = this.transferencias.filter((t) => t.id !== transf.id);
			},
		});
	}

	// --- UTILIDADES ---
	getSeverityVencimiento(dias: number | undefined): 'success' | 'warn' | 'danger' | 'info' {
		if (!dias || dias <= 0) return 'success';
		if (dias <= 15) return 'warn';
		return 'danger';
	}
}
