import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

// Servicios y Modelos
import { SocioService } from '../../../../core/services/socio.service';
import { Socio } from '../../../../core/models/socio.interface';

@Component({
	selector: 'app-detalle-socio',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		TagModule,
		TableModule,
		AvatarModule,
		TabsModule,
		ToastModule,
		DividerModule,
		SkeletonModule,
	],
	providers: [MessageService],
	templateUrl: './detalle-socio.component.html',
})
export class DetalleSocioComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private socioService = inject(SocioService);
	private messageService = inject(MessageService);

	socioId!: number;
	socio: Socio | null = null;
	isLoading = true;

	// MOCK: Datos simulados de pagos (Simulando respuesta del backend)
	historialPagos = [
		{ id: 1, mes: 'Noviembre 2025', monto: 3.5, estado: 'PAGADO', fecha_pago: '2025-11-05' },
		{ id: 2, mes: 'Diciembre 2025', monto: 5.0, estado: 'PENDIENTE', fecha_pago: null },
		{ id: 3, mes: 'Multa Minga Dic', monto: 10.0, estado: 'PENDIENTE', fecha_pago: null },
	];

	// MOCK: Datos simulados de medidores
	misMedidores = [
		{ codigo: 'MED-004', ubicacion: 'Casa Principal', tipo: 'Físico', estado: 'Activo' },
		{ codigo: 'MED-102', ubicacion: 'Terreno Baldío', tipo: 'Tarifa Fija', estado: 'Inactivo' },
	];

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const id = params.get('id');
			if (id) {
				this.socioId = +id;
				this.cargarSocio();
			} else {
				this.volver();
			}
		});
	}

	cargarSocio(): void {
		this.isLoading = true;
		// Llamamos al servicio para obtener el socio real por ID
		this.socioService
			.getSocioById(this.socioId)
			.pipe(
				tap((data) => {
					this.socio = data;
					this.isLoading = false;
				}),
				catchError((err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: `No se pudo cargar: ${err.message}`,
					});
					this.isLoading = false;
					// Volver atrás si falla
					setTimeout(() => this.volver(), 2000);
					return of(null);
				}),
			)
			.subscribe();
	}

	volver(): void {
		this.router.navigate(['/dashboard/socios']);
	}
}
