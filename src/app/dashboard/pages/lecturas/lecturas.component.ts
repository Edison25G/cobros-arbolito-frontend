import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Importante para los inputs de la tabla
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

// Modelos y Servicios
import { Medidor } from '../../../core/models/medidor.interface';
import { RegistrarLecturaDTO } from '../../../core/models/lectura.interface';
import { MedidorService } from '../../../core/services/medidor.service';
import { LecturaService } from '../../../core/services/lectura.service';
import { BarriosService } from '../../../core/services/barrios.service'; // ✅ Nuevo servicio
import { ErrorService } from '../../../auth/core/services/error.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select'; // O DropdownModule según tu versión
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table'; // ✅ Para la tabla masiva
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

// Interfaz local para manejar la fila de la tabla
interface FilaLectura {
	medidor: Medidor;
	lecturaAnterior: number;
	lecturaActual: number | null;
	consumo: number;
	error?: string; // Para validar si lecturaActual < lecturaAnterior
	procesado?: boolean; // Para marcar si ya se guardó
}

@Component({
	selector: 'amc-lecturas',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule, // ✅ Necesario para [(ngModel)] en la tabla
		RouterModule,
		ButtonModule,
		InputNumberModule,
		SelectModule,
		DatePickerModule,
		TableModule, // ✅
		ToastModule,
		TooltipModule,
		TagModule,
	],
	providers: [MessageService, DatePipe],
	templateUrl: './lecturas.component.html',
})
export class LecturasComponent implements OnInit {
	private medidorService = inject(MedidorService);
	private lecturaService = inject(LecturaService);
	private barriosService = inject(BarriosService); // ✅ Inyección
	private errorService = inject(ErrorService);
	private router = inject(Router);
	private messageService = inject(MessageService);

	isLoading = false;
	guardando = false;

	// Filtros Globales
	fechaLectura: Date = new Date();
	barrioSeleccionado: string | null = null;

	// Datos
	barrios: any[] = [];
	filas: FilaLectura[] = []; // Los datos de la tabla

	ngOnInit(): void {
		this.cargarBarrios();
	}

	cargarBarrios() {
		// ✅ Usamos el servicio de barrios para asegurar que salgan los 3 (Latacunga, Alpamalag, etc.)
		this.barriosService.getBarrios().subscribe({
			next: (data) => {
				// Mapeamos para el dropdown de PrimeNG (label/value) y solo activos
				this.barrios = data.filter((b) => b.activo).map((b) => ({ label: b.nombre, value: b.nombre }));
			},
			error: (err) => console.error('Error cargando barrios', err),
		});
	}

	cargarPlanilla() {
		if (!this.barrioSeleccionado) {
			this.filas = [];
			return;
		}

		this.isLoading = true;
		this.medidorService.getMedidores().subscribe({
			next: (medidores) => {
				// --- CORRECCIÓN DEL FILTRO ---
				// 1. Usamos 'any' porque la interfaz Medidor a veces no tiene las propiedades extra del backend
				const filtrados = medidores.filter((m: any) => {
					// Verificamos que tenga terreno (esté instalado) y coincida el nombre del barrio
					return m.terreno_id && m.nombre_barrio === this.barrioSeleccionado;
				});

				// 2. Mapeamos a filas
				this.filas = filtrados.map((m: any) => ({
					medidor: m,
					// ✅ PRIORIDAD: Usamos 'lectura_anterior' (calculada por backend).
					// Si no viene, usamos 'lectura_inicial' (0).
					lecturaAnterior:
						m.lectura_anterior !== undefined && m.lectura_anterior !== null
							? Number(m.lectura_anterior)
							: m.lectura_inicial || 0,
					lecturaActual: null,
					consumo: 0,
				}));

				this.isLoading = false;
			},
			error: (_err) => {
				this.errorService.showError('No se pudieron cargar los medidores.');
				this.isLoading = false;
			},
		});
	}

	// ✅ Cálculos en tiempo real
	calcularConsumo(fila: FilaLectura) {
		if (fila.lecturaActual === null) {
			fila.consumo = 0;
			fila.error = undefined;
			return;
		}

		if (fila.lecturaActual < fila.lecturaAnterior) {
			fila.error = 'La lectura no puede ser menor a la anterior';
			fila.consumo = 0;
		} else {
			fila.error = undefined;
			fila.consumo = fila.lecturaActual - fila.lecturaAnterior;
		}
	}

	// ✅ Guardado Masivo
	guardarPlanilla() {
		// 1. Filtrar solo los que tienen datos válidos
		const lecturasParaGuardar = this.filas.filter((f) => f.lecturaActual !== null && !f.error && !f.procesado);

		if (lecturasParaGuardar.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Atención',
				detail: 'No hay lecturas nuevas válidas para guardar.',
			});
			return;
		}

		this.guardando = true;
		// const user = JSON.parse(localStorage.getItem('user') || '{}');
		// const operadorId = user.id && user.id > 0 ? user.id : 1;

		// Convertir fecha a string ISO (YYYY-MM-DD)
		const fechaISO = this.fechaLectura.toISOString().split('T')[0];

		// 2. Creamos un array de peticiones (Observables)
		const peticiones = lecturasParaGuardar.map((fila) => {
			const dto: RegistrarLecturaDTO = {
				medidor_id: fila.medidor.id!,
				lectura_actual: fila.lecturaActual!,
				fecha_lectura: fechaISO,
				// operador_id: operadorId,
			};

			// Retornamos la petición atrapando errores individuales para que no se caiga todo el proceso
			return this.lecturaService
				.registrarLectura(dto)
				.pipe(catchError((_error) => of({ error: true, medidor: fila.medidor.codigo })));
		});

		// 3. Ejecutamos todas las peticiones en paralelo (Batch Frontend)
		forkJoin(peticiones)
			.pipe(finalize(() => (this.guardando = false)))
			.subscribe((resultados) => {
				let exitos = 0;
				let fallos = 0;

				resultados.forEach((res, index) => {
					if ((res as any).error) {
						fallos++;
					} else {
						exitos++;
						// Marcamos la fila como procesada visualmente (verde)
						lecturasParaGuardar[index].procesado = true;
					}
				});

				if (exitos > 0) {
					this.messageService.add({
						severity: 'success',
						summary: 'Proceso Finalizado',
						detail: `Se registraron ${exitos} lecturas correctamente.`,
					});
				}
				if (fallos > 0) {
					this.messageService.add({
						severity: 'error',
						summary: 'Errores',
						detail: `Hubo ${fallos} lecturas que no se pudieron guardar.`,
					});
				}

				// Opcional: Recargar la tabla automáticamente si todo salió bien
				if (fallos === 0) {
					setTimeout(() => {
						// Limpiamos o recargamos según prefieras
						// this.filas = [];
						// this.barrioSeleccionado = null;
					}, 1500);
				}
			});
	}
}
