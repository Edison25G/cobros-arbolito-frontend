import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios
import { MingasService } from '../../../core/services/mingas.service';
import { BarriosService } from '../../../core/services/barrios.service';
import { Minga } from '../../../core/interfaces/minga.interface';

@Component({
	selector: 'app-gestion-mingas',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TableModule,
		ButtonModule,
		DialogModule,
		InputTextModule,
		TextareaModule,
		InputNumberModule,
		DatePickerModule,
		TagModule,
		SelectModule,
		ToastModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService, DatePipe],
	templateUrl: './gestion-mingas.component.html',
})
export class GestionMingasComponent implements OnInit {
	private mingasService = inject(MingasService);
	private barriosService = inject(BarriosService); // Inyección de Barrios
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private fb = inject(FormBuilder);
	private datePipe = inject(DatePipe);
	private router = inject(Router);

	mingas: Minga[] = [];
	barrios: any[] = []; // Lista de barrios para el dropdown
	loading = true;
	dialogVisible = false;
	mingaForm!: FormGroup;

	// Opciones para Dropdowns
	tiposEvento = [
		{ label: 'Minga', value: 'MINGA' },
		{ label: 'Sesión', value: 'SESION' },
		{ label: 'Aporte Económico', value: 'APORTE' },
	];

	opcionesSeleccion = [
		{ label: 'Todos los Socios', value: 'TODOS' },
		{ label: 'Por Barrio', value: 'BARRIO' },
	];

	ngOnInit() {
		this.cargarEventos();
		this.cargarBarrios();
		this.initForm();
	}

	initForm() {
		this.mingaForm = this.fb.group({
			titulo: ['', Validators.required],
			tipo: ['MINGA', Validators.required], // Nuevo campo
			seleccion_socios: ['TODOS', Validators.required], // Nuevo campo
			barrio_id: [null], // Opcional, validar dinámicamente
			lugar: ['', Validators.required],
			fecha: [new Date(), Validators.required],
			multa: [5.0, [Validators.required, Validators.min(0)]],
			descripcion: [''],
		});

		// Validación dinámica: Barrio requerido si seleccion_socios es BARRIO
		this.mingaForm.get('seleccion_socios')?.valueChanges.subscribe((val) => {
			const barrioControl = this.mingaForm.get('barrio_id');
			if (val === 'BARRIO') {
				barrioControl?.setValidators(Validators.required);
			} else {
				barrioControl?.clearValidators();
				barrioControl?.setValue(null);
			}
			barrioControl?.updateValueAndValidity();
		});
	}

	cargarEventos() {
		this.loading = true;
		this.mingasService.getAll().subscribe({
			next: (data) => {
				this.mingas = data;
				this.loading = false;
			},
			error: () => (this.loading = false),
		});
	}

	cargarBarrios() {
		this.barriosService.getBarrios().subscribe((data) => {
			this.barrios = data.filter((b) => b.activo);
		});
	}

	openNew() {
		this.mingaForm.reset({
			fecha: new Date(),
			multa: 5.0,
			tipo: 'MINGA',
			seleccion_socios: 'TODOS',
		});
		this.dialogVisible = true;
	}

	guardarEvento() {
		if (this.mingaForm.invalid) {
			this.mingaForm.markAllAsTouched();
			return;
		}

		const formValue = this.mingaForm.value;

		// Preparar objeto
		const nuevoEvento: any = {
			...formValue,
			fecha: this.datePipe.transform(formValue.fecha, 'yyyy-MM-dd'),
			// Asegurar barrio_id numérico si existe
			barrio_id: formValue.barrio_id ? Number(formValue.barrio_id) : null,
		};

		this.mingasService.create(nuevoEvento).subscribe({
			next: () => {
				this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Evento creado correctamente' });
				this.dialogVisible = false;
				this.cargarEventos();
			},
			error: (err) => {
				console.error(err);
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el evento.' });
			},
		});
	}

	cerrarEvento(evento: Minga) {
		this.confirmationService.confirm({
			message: '¿Está seguro de cerrar el evento? Se generarán multas automáticamente para los inasistentes.',
			header: 'Confirmar Cierre',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, cerrar',
			rejectLabel: 'Cancelar',
			accept: () => {
				this.mingasService.cerrarEvento(evento.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Evento Cerrado',
							detail: 'Multas generadas correctamente.',
						});
						this.cargarEventos();
					},
					error: (_err) => {
						this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar el evento.' });
					},
				});
			},
		});
	}

	irAAsistencia(id: number) {
		this.router.navigate(['/dashboard/mingas/asistencia', id]);
	}

	eliminarEvento(minga: Minga) {
		this.confirmationService.confirm({
			message: `¿Eliminar el evento "${minga.titulo}"?`,
			header: 'Confirmar Eliminación',
			icon: 'pi pi-trash',
			acceptLabel: 'Eliminar',
			acceptButtonStyleClass: 'p-button-danger',
			rejectLabel: 'Cancelar',
			accept: () => {
				this.mingasService.delete(minga.id).subscribe(() => {
					this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Registro eliminado' });
					this.cargarEventos();
				});
			},
		});
	}
}
