import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

// 1. Comentamos estas importaciones (aún no existen)
// import { SessionService } from '@dashboard/core/services/sessions.service';
// import { AuthService } from '@auth/core/services/auth.service';

@Component({
  selector: 'amc-root', // (Recuerda que cambiaste esto en index.html)
  standalone: true,
  imports: [RouterOutlet, ButtonModule, ToastModule],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'sigaf-frontend'; // <-- Te sugiero cambiar esto

  constructor() // 2. Comentamos las inyecciones
  // private sessionService: SessionService,
  // private authService: AuthService,
  {}

  ngOnInit(): void {
    // 3. Comentamos la lógica que depende de los servicios
    //  if (this.authService.isAuthenticated()) {
    //  this.sessionService.startWatcher();
    // }
  }
}
