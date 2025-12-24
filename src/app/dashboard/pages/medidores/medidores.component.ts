import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Ya no ReactiveFormsModule
import { catchError, of, tap } from 'rxjs';

// Modelos y Servicios
import { Medidor } from '../../../core/models/medidor.interface';
import { MedidorService } from '../../../core/services/medidor.service';

// Componentes PrimeNG
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
	selector: 'amc-medidores',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TableModule,
		ButtonModule,
		InputTextModule,
		TagModule,
		TooltipModule,
		IconFieldModule,
		InputIconModule,
		ToastModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './medidores.component.html',
})
export class MedidoresComponent implements OnInit {
	// Inyecciones
	private medidorService = inject(MedidorService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	// Estado
	medidores: Medidor[] = [];
	isLoading = true;

	ngOnInit(): void {
		this.loadMedidores();
	}

	loadMedidores(): void {
		this.isLoading = true;
		this.medidorService
			.getMedidores()
			.pipe(
				tap((data) => {
					this.medidores = data;
					this.isLoading = false;
				}),
				catchError(() => {
					this.isLoading = false;
					this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el inventario.' });
					return of([]);
				}),
			)
			.subscribe();
	}

	// --- ACCIONES DE GESTIÓN (SOLO CAMBIAR ESTADO O BORRAR) ---

	// Ejemplo: Función para marcar como dañado (sin modal complejo)
	cambiarEstado(medidor: Medidor): void {
		this.confirmationService.confirm({
			message: `¿Cambiar estado del medidor ${medidor.codigo}?`,
			header: 'Gestión de Inventario',
			icon: 'pi pi-cog',
			acceptLabel: 'Marcar Dañado',
			rejectLabel: 'Marcar Activo',
			acceptButtonStyleClass: 'p-button-danger',
			rejectButtonStyleClass: 'p-button-success',
			accept: () => this.actualizarEstado(medidor.id!, 'DANADO'),
			reject: () => this.actualizarEstado(medidor.id!, 'ACTIVO'),
		});
	}

	actualizarEstado(id: number, nuevoEstado: string) {
		this.medidorService.updateMedidor(id, { estado: nuevoEstado }).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Actualizado',
					detail: `Estado cambiado a ${nuevoEstado}`,
				});
				this.loadMedidores();
			},
			error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar.' }),
		});
	}

	deleteMedidor(id: number): void {
		this.confirmationService.confirm({
			message: '¿Eliminar este medidor del inventario? Cuidado: Esto dejará al terreno sin servicio.',
			header: 'Confirmar Eliminación',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, eliminar',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.medidorService.deleteMedidor(id).subscribe({
					next: () => {
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medidor eliminado.' });
						this.loadMedidores();
					},
					error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message }),
				});
			},
		});
	}

	// Helpers
	filterGlobal(event: Event, dt: Table) {
		dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
	}
}
