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

		// ✅ CAMBIO: Usamos el nuevo endpoint específico
		this.medidorService.getPlanillaLecturas(this.barrioSeleccionado).subscribe({
			next: (datosMixtos) => {
				// Ya no necesitamos filtrar manualmente, el backend ya filtró por barrio

				this.filas = datosMixtos.map((item: any) => ({
					// Reconstruimos el objeto 'medidor' para que coincida con la interfaz FilaLectura
					medidor: {
						id: item.id, // Será null si es acometida
						codigo: item.codigo,
						marca: item.marca,
						nombre_socio: item.nombre_socio,
						nombre_barrio: item.nombre_barrio,
						// ... otros campos opcionales
					} as any, // 'as any' para flexibilidad temporal

					tiene_medidor: item.tiene_medidor, // ✅ Usamos el flag del backend

					lecturaAnterior: item.lectura_anterior,
					lecturaActual: null,
					consumo: 0,
				}));

				this.isLoading = false;
			},
			error: (_err) => {
				this.errorService.showError('No se pudieron cargar los datos del barrio.');
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
		// 1. Filtrar:
		// - Que tenga lectura escrita (lecturaActual !== null)
		// - Que NO tenga errores (!f.error)
		// - Que NO esté ya guardado (!f.procesado)
		// - Y LO MÁS IMPORTANTE: Que tenga ID de medidor (f.medidor.id)
		const lecturasParaGuardar = this.filas.filter(
			(f) =>
				f.medidor.id != null && // <--- ESTO EVITA EL ERROR DE LAS ACOMETIDAS
				f.lecturaActual !== null &&
				!f.error &&
				!f.procesado,
		);

		if (lecturasParaGuardar.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Atención',
				detail: 'No hay lecturas de medidores válidas para guardar.',
			});
			return;
		}

		this.guardando = true;
		const fechaISO = this.fechaLectura.toISOString().split('T')[0];

		// 2. Creamos un array de peticiones
		const peticiones = lecturasParaGuardar.map((fila) => {
			const dto: RegistrarLecturaDTO = {
				medidor_id: fila.medidor.id!, // El ! es seguro aquí porque ya filtramos los null arriba
				lectura_actual: fila.lecturaActual!,
				fecha_lectura: fechaISO,
				// operador_id: 1, // Puedes descomentar si lo manejas
			};

			return this.lecturaService.registrarLectura(dto).pipe(
				catchError((errorBackend) => {
					// 👇 AUMENTA ESTO: Para ver el error en la consola negra (F12)
					console.error('❌ ERROR AL GUARDAR MEDIDOR:', fila.medidor.codigo);
					console.error('DETALLE:', errorBackend.error); // Aquí te dirá qué campo falla

					// Esto sigue igual para que el proceso continúe
					return of({ error: true, medidor: fila.medidor.codigo });
				}),
			);
		});

		// 3. Ejecutamos batch
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
						lecturasParaGuardar[index].procesado = true;
					}
				});

				if (exitos > 0) {
					this.messageService.add({
						severity: 'success',
						summary: 'Guardado',
						detail: `Se registraron ${exitos} lecturas correctamente.`,
					});
				}
				if (fallos > 0) {
					this.messageService.add({
						severity: 'error',
						summary: 'Errores',
						detail: `Hubo ${fallos} problemas al guardar.`,
					});
				}

				// Limpiar filas si todo salió perfecto (Opcional)
				if (fallos === 0) {
					// this.cargarPlanilla(); // Descomentar si quieres recargar la tabla
				}
			});
	}
}
