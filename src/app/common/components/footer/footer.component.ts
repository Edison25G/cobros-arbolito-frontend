import { Component } from '@angular/core';

@Component({
  selector: 'amc-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrls: [],
})
export class FooterComponent {
  abrirWhatsApp(): void {
    const numero = '593985557248';
    const mensaje = encodeURIComponent('........');
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, '_blank');
  }
}
