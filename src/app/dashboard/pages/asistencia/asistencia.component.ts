import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { MingasService } from '../../../core/services/mingas.service';
// ✅ CORRECCIÓN 1: Importamos la interfaz ItemAsistencia
import { Minga, ItemAsistencia } from '../../../core/interfaces/minga.interface';

@Component({
	selector: 'app-asistencia',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TableModule,
		ButtonModule,
		InputTextModule,
		ToastModule,
		TagModule,
		IconFieldModule,
		InputIconModule,
	],
	providers: [MessageService],
	templateUrl: './asistencia.component.html',
	styles: [
		`
			.btn-state {
				transition: all 0.2s;
			}
			.btn-state:hover {
				transform: scale(1.05);
			}
		`,
	],
})
export class AsistenciaComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private mingasService = inject(MingasService);
	private messageService = inject(MessageService);

	mingaId!: number;
	minga: Minga | undefined;

	// ✅ CORRECCIÓN 2: Tipado estricto en lugar de 'any[]'
	asistenciaList: ItemAsistencia[] = [];

	loading = true;

	// Opciones visuales para los botones
	estados = [
		{ value: 'Presente', icon: 'pi pi-check', class: 'bg-green-100 text-green-700 border-green-500', label: 'Asiste' },
		{ value: 'Falta', icon: 'pi pi-times', class: 'bg-red-100 text-red-700 border-red-500', label: 'Falta' },
		{
			value: 'Exonerado',
			icon: 'pi pi-shield',
			class: 'bg-yellow-100 text-yellow-700 border-yellow-500',
			label: 'Exonerado',
		},
	];

	ngOnInit() {
		this.route.paramMap.subscribe((params) => {
			const id = params.get('id');
			if (id) {
				this.mingaId = +id;
				this.cargarDatos();
			}
		});
	}

	cargarDatos() {
		this.loading = true;
		// 1. Cargar Info Minga
		this.mingasService.getById(this.mingaId).subscribe((m) => (this.minga = m));

		// 2. Cargar Lista Socios
		this.mingasService.getAsistencia(this.mingaId).subscribe((data) => {
			this.asistenciaList = data;
			this.loading = false;
		});
	}

	// ✅ CORRECCIÓN 3: Tipado estricto para evitar errores de escritura
	marcarTodos(estado: 'Presente' | 'Falta' | 'Exonerado') {
		this.asistenciaList.forEach((s) => (s.estado = estado));
		this.messageService.add({ severity: 'info', summary: 'Actualizado', detail: `Todos marcados como ${estado}` });
	}

	guardar() {
		this.loading = true;
		this.mingasService.saveAsistencia(this.mingaId, this.asistenciaList).subscribe(() => {
			this.messageService.add({
				severity: 'success',
				summary: 'Éxito',
				detail: 'Asistencia guardada y multas generadas.',
			});
			setTimeout(() => {
				this.router.navigate(['/dashboard/mingas']);
			}, 1500);
		});
	}

	cancelar() {
		this.router.navigate(['/dashboard/mingas']);
	}
}
