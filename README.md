# Calendar Frontend

Aplicacion web para gestionar eventos de calendario. Permite autenticacion de usuarios, creacion y edicion de eventos, eliminacion y vistas por dia, semana, mes y agenda.

Este frontend consume una API HTTP del proyecto backend y se ejecuta de forma independiente.

## Stack Tecnologico

- React 19 + Vite + TypeScript
- Redux Toolkit
- React Router
- Axios
- React Big Calendar
- Bootstrap

## Estructura Principal

- src/auth: flujo de autenticacion
- src/calendar: modulo de calendario (paginas, componentes y tipos)
- src/store: slices y configuracion global de Redux
- src/hooks: hooks personalizados para auth, calendario y UI
- src/helpers: utilidades de fecha, mensajes y transformaciones

## Requisitos

- Node.js 22 o superior recomendado
- Yarn 1.22.x

Si no tienes Yarn habilitado:

   corepack enable
   corepack prepare yarn@1.22.22 --activate

## Instalacion

1. Clonar el repositorio:

   git clone https://github.com/JhoannPV/calendar-frontend-patrones.git
   cd calendar-frontend-patrones

2. Configurar variables de entorno:

- Crear el archivo .env en la raiz del proyecto.
- Configurar la URL del backend (por ejemplo, VITE_API_URL).

3. Instalar dependencias:

   yarn install

## Ejecucion

- Desarrollo:

   yarn dev

- Build de produccion:

   yarn build

- Preview del build:

   yarn preview

Por defecto, Vite abre la app en http://localhost:5173.

## Funcionalidades

1. Crear evento con el boton +.
2. Editar evento con doble clic.
3. Eliminar evento seleccionado.
4. Cambiar entre vistas dia, semana, mes y agenda.
5. Mantener sesion con JWT.
6. Ver calendario compartido entre usuarios.
7. Restringir edicion y eliminacion a eventos del autor.