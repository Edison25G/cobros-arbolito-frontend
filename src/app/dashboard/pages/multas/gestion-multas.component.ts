import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios e Interfaces
import { MultaService } from '../../../core/services/multa.service';
import { Multa, ImpugnarMultaDTO } from '../../../core/interfaces/multa.interface';

@Component({
	selector: 'app-gestion-multas',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		TableModule,
		ButtonModule,
		DialogModule,
		InputTextModule,
		TextareaModule,
		InputNumberModule,
		TagModule,
		ToastModule,
		ConfirmDialogModule,
		SelectModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './gestion-multas.component.html',
})
export class GestionMultasComponent implements OnInit {
	private multaService = inject(MultaService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private fb = inject(FormBuilder);

	multas: Multa[] = [];
	loading = true;

	// Dialog de Impugnación
	dialogVisible = false;
	multaSeleccionada: Multa | null = null;
	impugnarForm!: FormGroup;
	procesando = false;

	// Opciones para el select
	accionesOptions = [
		{ label: 'Anular Multa', value: 'ANULAR' },
		{ label: 'Rectificar Monto', value: 'RECTIFICAR' },
	];

	ngOnInit() {
		this.cargarMultas();
		this.initForm();
	}

	initForm() {
		this.impugnarForm = this.fb.group({
			accion: ['ANULAR', Validators.required],
			motivo: ['', Validators.required],
			nuevo_monto: [null],
		});

		// Escuchar cambios en 'accion' para validar nuevo_monto
		this.impugnarForm.get('accion')?.valueChanges.subscribe((val) => {
			const nuevoMontoCtrl = this.impugnarForm.get('nuevo_monto');
			if (val === 'RECTIFICAR') {
				nuevoMontoCtrl?.setValidators([Validators.required, Validators.min(0.01)]);
			} else {
				nuevoMontoCtrl?.clearValidators();
				nuevoMontoCtrl?.setValue(null);
			}
			nuevoMontoCtrl?.updateValueAndValidity();
		});
	}

	cargarMultas() {
		this.loading = true;
		this.multaService.getAll().subscribe({
			next: (data) => {
				this.multas = data;
				this.loading = false;
			},
			error: (err) => {
				console.error(err);
				this.loading = false;
				// Mostrar datos mock si el backend aún no está listo
				this.multas = this.getMultasMock();
			},
		});
	}

	// Datos de ejemplo mientras el backend no esté listo
	private getMultasMock(): Multa[] {
		return [
			{
				id: 1,
				socio_id: 10,
				socio_nombre: 'Juan Pérez',
				minga_id: 1,
				minga_titulo: 'Limpieza de Canales',
				monto: 10.0,
				fecha: '2025-12-15',
				estado: 'PENDIENTE',
			},
			{
				id: 2,
				socio_id: 15,
				socio_nombre: 'María García',
				minga_id: 1,
				minga_titulo: 'Limpieza de Canales',
				monto: 10.0,
				fecha: '2025-12-15',
				estado: 'PENDIENTE',
			},
			{
				id: 3,
				socio_id: 8,
				socio_nombre: 'Carlos López',
				minga_id: 2,
				minga_titulo: 'Reforestación',
				monto: 5.0,
				fecha: '2025-11-20',
				estado: 'PAGADA',
			},
		];
	}

	abrirDialogImpugnar(multa: Multa) {
		this.multaSeleccionada = multa;
		this.impugnarForm.reset({
			accion: 'ANULAR',
			motivo: '',
			nuevo_monto: null,
		});
		this.dialogVisible = true;
	}

	confirmarImpugnacion() {
		if (this.impugnarForm.invalid || !this.multaSeleccionada) return;

		const formValue = this.impugnarForm.value;
		const datos: ImpugnarMultaDTO = {
			accion: formValue.accion,
			motivo: formValue.motivo,
		};

		if (formValue.accion === 'RECTIFICAR') {
			datos.nuevo_monto = formValue.nuevo_monto;
		}

		const accionTexto = formValue.accion === 'ANULAR' ? 'anular' : 'rectificar';

		this.confirmationService.confirm({
			message: `¿Está seguro de ${accionTexto} la multa de ${this.multaSeleccionada.socio_nombre}?`,
			header: 'Confirmar Impugnación',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, Confirmar',
			rejectLabel: 'Cancelar',
			acceptButtonStyleClass: 'p-button-warning',
			accept: () => {
				this.ejecutarImpugnacion(datos);
			},
		});
	}

	ejecutarImpugnacion(datos: ImpugnarMultaDTO) {
		if (!this.multaSeleccionada) return;

		this.procesando = true;
		this.multaService.impugnar(this.multaSeleccionada.id, datos).subscribe({
			next: (resp) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: resp.mensaje || 'Multa procesada correctamente',
				});
				this.dialogVisible = false;
				this.procesando = false;
				this.cargarMultas();
			},
			error: (err) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: err.message,
				});
				this.procesando = false;
			},
		});
	}

	getSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
		switch (estado) {
			case 'PENDIENTE':
				return 'warn';
			case 'PAGADA':
				return 'success';
			case 'ANULADA':
				return 'secondary';
			case 'RECTIFICADA':
				return 'info';
			default:
				return 'info';
		}
	}

	// Solo admins pueden impugnar
	puedeImpugnar(multa: Multa): boolean {
		// TODO: Verificar rol del usuario actual
		// Por ahora retornamos true si la multa está pendiente
		return multa.estado === 'PENDIENTE';
	}
}
