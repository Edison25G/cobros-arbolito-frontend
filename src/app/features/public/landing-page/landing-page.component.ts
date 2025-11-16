import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

// 1. IMPORTAR TU FOOTER GLOBAL
// (Asegúrate de que la ruta sea correcta según donde está tu carpeta 'common')
import { FooterComponent } from '../../../common/components/footer/footer.component';

@Component({
	selector: 'app-landing-page',
	standalone: true,
	// 2. AGREGARLO A LOS IMPORTS
	imports: [CommonModule, RouterModule, ButtonModule, FooterComponent],
	templateUrl: './landing-page.component.html',
	styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
	// ... (El resto del código se queda igual)
	openMap() {
		window.open('https://www.google.com/maps/search/?api=1&query=Comuna+Alpamalag+de+Acurios+Pujili', '_blank');
	}

	scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}
}
