# Aplicación Web para la Gestión de Cobros "El Arbolito" (Frontend)

Este repositorio contiene el código fuente del **Frontend** para el sistema de gestión de cobros de la **Junta de Riego y/o Drenaje "El Arbolito"**.

El proyecto ha sido desarrollado utilizando **Angular v20+** como parte de la tesis:

> _"Desarrollo de una aplicación web para la gestión de cobros utilizando herramientas de inteligencia artificial generativa"._

---

## 🛠️ Tecnologías Utilizadas

Este proyecto integra las siguientes tecnologías. No es necesario instalarlas manualmente una por una; el gestor de paquetes se encargará de ello.

- **Framework:** Angular 20+
- **Lenguaje:** TypeScript
- **Estilos y Diseño:** Tailwind CSS
- **Componentes UI:** PrimeNG
- **Gestión de Paquetes:** NPM (Node Package Manager)

---

## 🚀 Requisitos Previos

Para ejecutar este proyecto, el cliente o evaluador solo necesita tener instalado:

1.  **Node.js** (Versión 18 LTS o superior) - [Descargar Node.js](https://nodejs.org/)
2.  **Git** - [Descargar Git](https://git-scm.com/)

---

## 🧩 Instalación y Ejecución

Sigue estos pasos para levantar el proyecto en tu máquina local:

### 1. Clonar el repositorio

Abre tu terminal y ejecuta:

```bash
git clone [https://github.com/Edison25G/cobros-arbolito-frontend.git](https://github.com/Edison25G/cobros-arbolito-frontend.git)
cd cobros-arbolito-frontend

```

### 2. Instalar dependencias

Este comando leerá el archivo `package.json` e instalará automáticamente Angular, PrimeNG, Tailwind CSS y todas las librerías necesarias.

```bash
npm install

```

### 3. Iniciar el servidor de desarrollo

Una vez instaladas las dependencias, inicia la aplicación:

```bash
ng serve

```

Luego, abre tu navegador web e ingresa a:

👉 **http://localhost:4200/**

> **Nota:** Asegúrate de que el Backend (API en Django) esté en ejecución para que la aplicación pueda iniciar sesión y cargar datos correctamente.

---

## 🌲 Flujo de Trabajo con Git (Para el Equipo de Desarrollo)

Para mantener la integridad del código durante el desarrollo de la tesis, seguimos estrictamente este flujo:

- **`main`**: Rama de producción (Solo versiones estables y finales).
- **`develop`**: Rama principal de desarrollo (Aquí se integran los cambios).

**Pasos para contribuir:**

1. **Actualizar la rama develop:**

```bash
git checkout develop
git pull origin develop

```

2. **Crear una rama para tu tarea (Feature):**

```bash
git checkout -b feature/nombre-de-la-tarea

```

3. **Subir los cambios:**

```bash
git add .
git commit -m "feat: descripción clara del cambio realizado"
git push --set-upstream origin feature/nombre-de-la-tarea

```

4. **Integrar:**
   Crear un **Pull Request** en GitHub desde tu rama `feature` hacia `develop`.

---

## 🏗️ Comandos Útiles

| Comando    | Descripción                                                  |
| ---------- | ------------------------------------------------------------ |
| `ng serve` | Inicia el servidor de desarrollo.                            |
| `ng build` | Compila la aplicación en la carpeta `dist/` para producción. |
| `ng test`  | Ejecuta pruebas unitarias.                                   |
| `ng lint`  | Analiza el código en busca de errores de estilo.             |

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── auth/        # Módulo de Autenticación (Login)
│   ├── core/        # Servicios globales, interceptores y guards
│   ├── features/    # Módulos funcionales (Gestión de cobros, usuarios, etc.)
│   ├── shared/      # Componentes reutilizables (Botones, tablas, inputs)
│   └── layout/      # Estructura base (Sidebar, Header, Footer)
├── assets/          # Imágenes y recursos estáticos
└── environments/    # Configuración de variables de entorno (API URL)

```

---

## ✒️ Autores

- **Edison Unaucho y Alexis Vega** - _Desarrollo Frontend e Integración_

---

## 📚 Documentación y Recursos

- [Angular Documentation](https://angular.dev/)
- [PrimeNG Components](https://primeng.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
