import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast'; // ✅ Importado

// Servicios
import { SocioService } from '../../../core/services/socio.service';
import { ErrorService } from '../../../auth/core/services/error.service'; // ✅ Importado
import { Socio } from '../../../core/models/socio.interface';

@Component({
	selector: 'app-detalle-barrio',
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		TableModule,
		ButtonModule,
		TagModule,
		InputTextModule,
		IconFieldModule,
		InputIconModule,
		ToastModule, // ✅ Añadido a imports
	],
	templateUrl: './detalle-barrio.component.html', // ✅ Usamos archivo externo
})
export class DetalleBarrioComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private socioService = inject(SocioService);
	private errorService = inject(ErrorService); // ✅ Inyectado

	nombreBarrio = '';
	sociosDelBarrio: Socio[] = [];
	loading = true;

	ngOnInit() {
		// Capturamos el nombre del barrio de la URL (ej: /detalle/Centro)
		this.nombreBarrio = this.route.snapshot.paramMap.get('nombre') || '';
		this.cargarSocios();
	}

	cargarSocios() {
		this.loading = true;
		this.socioService.getSocios().subscribe({
			next: (socios) => {
				// Filtramos localmente solo los que pertenecen a este barrio
				this.sociosDelBarrio = socios.filter((s) => s.barrio === this.nombreBarrio);
				this.loading = false;
			},
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.errorService.showError('No se pudo cargar la lista de socios.'); // ✅ Uso del servicio
			},
		});
	}
}
