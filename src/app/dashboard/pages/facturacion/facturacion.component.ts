import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importar DatePipe
import { HttpClientModule } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

// Modelos y Servicios
import { LecturaPendiente, GenerarFacturaDTO } from '../../../core/interfaces/factura.interface';
import { FacturaService } from '../../../core/services/facturacion.service.js';
import { ErrorService } from '../../../auth/core/services/error.service';

// Componentes PrimeNG v20
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
	selector: 'amc-facturacion',
	standalone: true,
	imports: [
		CommonModule,
		HttpClientModule,
		// PrimeNG Módulos
		TableModule,
		ButtonModule,
		ToastModule,
		ConfirmDialogModule,
		IconFieldModule,
		InputIconModule,
		InputTextModule,
	],
	providers: [MessageService, ConfirmationService, DatePipe], // Añadir DatePipe
	templateUrl: './facturacion.component.html',
})
export class FacturacionComponent implements OnInit {
	// Inyección de dependencias
	private facturaService = inject(FacturaService);
	private errorService = inject(ErrorService);
	private confirmationService = inject(ConfirmationService);
	private datePipe = inject(DatePipe); // Para formatear la fecha

	// Estado del componente
	lecturasPendientes: LecturaPendiente[] = [];
	isLoading = true;
	isGenerating = false; // Estado para el botón "Generar"

	constructor() {}

	ngOnInit(): void {
		this.loadLecturasPendientes();
	}

	/**
	 * Carga la lista de lecturas simuladas
	 */
	loadLecturasPendientes(): void {
		this.isLoading = true;
		this.facturaService
			.getLecturasPendientes()
			.pipe(
				tap((data) => {
					this.lecturasPendientes = data;
					this.isLoading = false;
				}),
				catchError((err) => {
					this.isLoading = false;
					this.errorService.showError('Error al cargar lecturas simuladas: ' + err.message);
					return of([]);
				}),
			)
			.subscribe();
	}

	/**
	 * Se llama al hacer clic en "Generar Factura"
	 */
	onGenerarFactura(lectura: LecturaPendiente): void {
		this.confirmationService.confirm({
			message: `¿Desea generar la factura para el medidor <strong>${lectura.medidor.codigo}</strong> (Socio: ${lectura.socio.nombres})?`,
			header: 'Confirmar Generación',
			icon: 'pi pi-file-export',
			acceptLabel: 'Sí, generar',
			rejectLabel: 'Cancelar',
			accept: () => {
				this.generarFactura(lectura);
			},
		});
	}

	/**
	 * Llama a la API REAL para crear la factura
	 */
	private generarFactura(lectura: LecturaPendiente): void {
		this.isGenerating = true;

		// Formateamos la fecha de hoy a YYYY-MM-DD
		const hoy = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;

		const dto: GenerarFacturaDTO = {
			lectura_id: lectura.id,
			fecha_emision: hoy,
			// (La fecha de vencimiento se calcula en el backend)
		};

		this.facturaService
			.generarFactura(dto)
			.pipe(
				tap((response) => {
					this.isGenerating = false;
					this.errorService.showSuccess(`¡Factura #${response.id} generada por $${response.total}!`);

					// Quitamos la lectura de la lista de pendientes (simulación)
					this.lecturasPendientes = this.lecturasPendientes.filter((l) => l.id !== lectura.id);
				}),
				catchError((err) => {
					this.isGenerating = false;
					this.errorService.showError(err.message);
					return of(null);
				}),
			)
			.subscribe();
	}
}
