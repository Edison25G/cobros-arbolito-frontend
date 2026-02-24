import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; // 👈 Esto es clave para traer a los socios

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
import { SocioService } from '../../../core/services/socio.service'; // 👈 Servicio para traer a las personas
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
	private socioService = inject(SocioService); // 👈 Inyectamos a los socios
	private messageService = inject(MessageService);

	mingaId!: number;
	minga: Minga | undefined;
	asistenciaList: ItemAsistencia[] = [];
	loading = true;

	estados = [
		{ value: 'PRESENTE', icon: 'pi pi-check', class: 'bg-green-100 text-green-700 border-green-500', label: 'Asiste' },
		{ value: 'FALTA', icon: 'pi pi-times', class: 'bg-red-100 text-red-700 border-red-500', label: 'Falta' },
		{
			value: 'JUSTIFICADO',
			icon: 'pi pi-shield',
			class: 'bg-yellow-100 text-yellow-700 border-yellow-500',
			label: 'Justificado',
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

	// 🚀 AQUÍ ESTÁ LA MAGIA CORREGIDA Y LIBRE DE ERRORES TS
	cargarDatos() {
		this.loading = true;

		forkJoin({
			minga: this.mingasService.getById(this.mingaId),
			socios: this.socioService.getSocios(),
			asistenciasPrevias: this.mingasService.getAsistencia(this.mingaId),
		}).subscribe({
			next: (res) => {
				// 👇 AÑADE ESTO PARA REVISAR EN LA CONSOLA DEL NAVEGADOR (F12)
				console.log('DATOS DEL EVENTO:', res.minga);

				this.minga = res.minga;
				const mingaData: any = res.minga;

				let sociosFiltrados = res.socios.filter((s: any) => s.esta_activo);

				// Forzamos que los nombres de las propiedades coincidan con lo que suele enviar Django
				// A veces Django usa 'lista_socios_ids' y otras 'socios_seleccionados'
				const seleccion = mingaData?.seleccion_socios || 'TODOS';
				const idsPermitidos = mingaData?.lista_socios_ids || mingaData?.socios_ids || [];

				console.log('TIPO SELECCION:', seleccion);
				console.log('IDS PERMITIDOS:', idsPermitidos);

				if (seleccion === 'BARRIO') {
					sociosFiltrados = sociosFiltrados.filter((s: any) => s.barrio_id === mingaData?.barrio_id);
				} else if (seleccion === 'MANUAL') {
					// Si idsPermitidos está vacío, aquí es donde falla
					if (idsPermitidos.length > 0) {
						sociosFiltrados = sociosFiltrados.filter((s: any) =>
							idsPermitidos.some((id: any) => String(id) === String(s.id)),
						);
					}
				}

				this.asistenciaList = sociosFiltrados.map((socio: any) => {
					const asisPrevia = res.asistenciasPrevias.find((a: any) => a.socio_id === socio.id);
					const estadoAnterior = asisPrevia ? (asisPrevia.estado as string) : null;
					let estadoFinal: 'PENDIENTE' | 'PRESENTE' | 'FALTA' | 'JUSTIFICADO' = 'FALTA';

					if (estadoAnterior === 'ASISTIO' || estadoAnterior === 'PRESENTE') {
						estadoFinal = 'PRESENTE';
					} else if (estadoAnterior === 'JUSTIFICADO') {
						estadoFinal = 'JUSTIFICADO';
					}

					return {
						id: asisPrevia?.id || 0,
						socio_id: socio.id,
						nombres: `${socio.nombres} ${socio.apellidos}`,
						identificacion: socio.identificacion,
						estado: estadoFinal,
						estado_justificacion: asisPrevia?.estado_justificacion || 'SIN_SOLICITUD',
						observacion: asisPrevia?.observacion || '',
						multa_factura: asisPrevia?.multa_factura ?? null,
					};
				});

				this.loading = false;
			},
			error: (err) => {
				console.error('Error cargando datos:', err);
				this.loading = false;
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información' });
			},
		});
	}

	marcarTodos(estado: 'PRESENTE' | 'FALTA' | 'JUSTIFICADO') {
		this.asistenciaList.forEach((s) => {
			s.estado = estado;
		});
		this.messageService.add({ severity: 'info', summary: 'Actualizado', detail: `Todos marcados como ${estado}` });
	}

	guardar() {
		this.loading = true;
		this.mingasService.saveAsistencia(this.mingaId, this.asistenciaList).subscribe({
			next: () => {
				this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Asistencia guardada.' });
				setTimeout(() => {
					this.router.navigate(['/dashboard/mingas']);
				}, 1500);
			},
			error: (err) => {
				this.loading = false;
				console.error('Error guardando:', err);
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la asistencia.' });
			},
		});
	}

	cancelar() {
		this.router.navigate(['/dashboard/mingas']);
	}
}
