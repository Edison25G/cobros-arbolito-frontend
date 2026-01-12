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
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios
import { MingasService } from '../../../core/services/mingas.service';
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
		ToastModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService, DatePipe],
	templateUrl: './gestion-mingas.component.html',
})
export class GestionMingasComponent implements OnInit {
	private mingasService = inject(MingasService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private fb = inject(FormBuilder);
	private datePipe = inject(DatePipe);
	private router = inject(Router);

	mingas: Minga[] = [];
	loading = true;
	dialogVisible = false;
	mingaForm!: FormGroup;

	ngOnInit() {
		this.cargarMingas();
		this.initForm();
	}

	initForm() {
		this.mingaForm = this.fb.group({
			titulo: ['', Validators.required],
			lugar: ['', Validators.required],
			fecha: [new Date(), Validators.required],
			multa: [5.0, [Validators.required, Validators.min(0)]],
			descripcion: [''],
		});
	}

	cargarMingas() {
		this.loading = true;
		this.mingasService.getAll().subscribe({
			next: (data) => {
				this.mingas = data;
				this.loading = false;
			},
			error: () => (this.loading = false),
		});
	}

	openNew() {
		this.mingaForm.reset({
			fecha: new Date(),
			multa: 5.0,
		});
		this.dialogVisible = true;
	}

	guardarMinga() {
		if (this.mingaForm.invalid) return;

		const formValue = this.mingaForm.value;

		// Preparar objeto
		const nuevaMinga: any = {
			...formValue,
			// Formatear fecha para guardar (simulado)
			fecha: this.datePipe.transform(formValue.fecha, 'yyyy-MM-dd'),
		};

		this.mingasService.create(nuevaMinga).subscribe(() => {
			this.messageService.add({ severity: 'success', summary: 'Creada', detail: 'Minga programada correctamente' });
			this.dialogVisible = false;
			this.cargarMingas();
		});
	}
	irAAsistencia(id: number) {
		this.router.navigate(['/dashboard/mingas/asistencia', id]);
	}
	eliminarMinga(minga: Minga) {
		this.confirmationService.confirm({
			message: `¿Eliminar la minga "${minga.titulo}"?`,
			header: 'Confirmar',
			icon: 'pi pi-exclamation-triangle',
			accept: () => {
				this.mingasService.delete(minga.id).subscribe(() => {
					this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'Registro eliminado' });
					this.cargarMingas();
				});
			},
		});
	}
}
