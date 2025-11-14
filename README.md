Aplicación Web para la Gestión de Cobros "El Arbolito" (Tesis)

Este proyecto fue generado utilizando Angular CLI v20.0.1.
La aplicación corresponde al frontend del sistema de gestión de cobros desarrollado como parte de la tesis "Desarrollo de una aplicación web para la gestión de cobros utilizando herramientas de inteligencia artificial generativa".

🚀 Requisitos Previos

Asegúrate de tener instalados:

Node.js 18+

Angular CLI 20+

Git

🧩 Instalación del Proyecto

1. Clonar el repositorio (solo la primera vez)
   git clone https://github.com/Edison25G/sigaf-frontend.git
   cd sigaf-frontend

2. Instalar dependencias (solo la primera vez)
   npm install

3. Moverse a la rama develop (IMPORTANTE)

Todos los desarrolladores deben trabajar SIEMPRE desde la rama develop.

git checkout develop

🪄 Scripts principales
▶️ Iniciar servidor de desarrollo
ng serve

Luego abre en el navegador:

http://localhost:4200/

🏗️ Construir la aplicación
ng build

Los archivos generados estarán en la carpeta dist/.

🛠️ Generar componentes, servicios, módulos, etc.
ng generate component nombre-componente

Ver más opciones:

ng generate --help

🌲 Flujo de trabajo con Git (Recomendado)
🔹 1. Actualizar rama develop
git checkout develop
git pull

🔹 2. Crear una rama para tu tarea
git checkout -b feature/nombre-de-la-tarea

🔹 3. Subir los cambios
git add .
git commit -m "Descripción clara del cambio"
git push --set-upstream origin feature/nombre-de-la-tarea

🔹 4. Crear un Pull Request → hacia develop

Nunca subas cambios directamente a main.

🧪 Pruebas
Unit Tests
ng test

End-to-End (E2E)
ng e2e

📁 Estructura Recomendada del Proyecto
src/
└── app/
├── core/ # Servicios, interceptores, guardias
├── shared/ # Componentes reutilizables
├── auth/ # Login / Registro
└── features/ # Módulos funcionales del sistema

🧑‍🤝‍🧑 Colaboración

La rama main se usa SOLO para versiones estables.

La rama develop es la base de trabajo del equipo.

Cada colaborador debe crear ramas nuevas para sus tareas.

📚 Recursos Útiles

Documentación Angular CLI:
https://angular.dev/tools/cli

Documentación PrimeNG:
https://primeng.org/
