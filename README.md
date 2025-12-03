
# Frontend (Next.js)

## 🖥️ Descripción

Este proyecto corresponde al **frontend** de la aplicación **Ecometrix**, desarrollado con **Next.js y TypeScript**.
El objetivo es mantener una **estructura modular y escalable**, siguiendo principios de **Clean Architecture** y buenas prácticas de desarrollo.

---

## 📂 Estructura recomendada de carpetas

```plaintext
src/
├─ app/                          # Rutas principales (App Router de Next.js)
│  ├─ layout.tsx                 # Layout raíz (theme, providers globales)
│  ├─ page.tsx                   # Redirección inicial (ej. /login)
│  ├─ login/
│  │   ├─ page.tsx               # Página de login
│  │   ├─ layout.tsx             # Layout público (sin sidebar)
│  ├─ dashboard/
│  │   ├─ layout.tsx             # Layout privado con Sidebar, Navbar, etc.
│  │   ├─ page.tsx               # Dashboard principal
│  │   ├─ clientes/
│  │   │   ├─ page.tsx           # Vista de clientes
│  │   │   ├─ nuevo/
│  │   │   │   └─ page.tsx       # Registrar cliente
│  │   ├─ proyectos/
│  │   │   └─ page.tsx           # Vista de proyectos / viviendas
│  │   ├─ simulaciones/
│  │   │   ├─ page.tsx           # Lista / módulo principal de simulaciones
│  │   │   └─ nueva/
│  │   │       └─ page.tsx       # Simulación de crédito (pantalla principal)
│  │   ├─ bancos/
│  │   │   └─ page.tsx           # Selección / gestión de entidades bancarias
│  │   └─ reportes/
│  │       └─ page.tsx           # Vista de reportes y estadísticas
│  ├─ not-found.tsx              # Página 404 personalizada
│  └─ error.tsx                  # Manejo global de errores

├─ core/                         # Núcleo de la aplicación (config, auth, hooks globales)
│  ├─ config/
│  │   ├─ env.ts                 # Configuración de variables y entorno
│  │   ├─ constants.ts           # Constantes globales (nombres, roles, etc.)
│  ├─ providers/
│  │   ├─ AuthProvider.tsx       # Contexto de autenticación
│  │   ├─ ThemeProvider.tsx      # Contexto de tema Tailwind (light/dark)
│  │   └─ index.tsx              # Combina todos los providers
│  ├─ hooks/
│  │   ├─ useAuth.ts             # Hook global de autenticación
│  │   ├─ useTheme.ts            # Hook global de tema
│  │   └─ useModal.ts            # Hook global para modales
│  ├─ store/
│  │   ├─ uiStore.ts             # Zustand store global (UI state)
│  │   └─ sessionStore.ts        # Zustand store de sesión
│  └─ utils/
│      ├─ format.ts              # Formateadores (números, dinero, etc.)
│      └─ validators.ts          # Validaciones genéricas

├─ modules/                      # Módulos funcionales (DDD-style)
│  ├─ clientes/
│  │   ├─ components/            # Componentes específicos del módulo cliente
│  │   │   ├─ ClienteForm.tsx
│  │   │   ├─ ClienteCard.tsx
│  │   │   └─ ClienteList.tsx
│  │   ├─ services/
│  │   │   ├─ cliente.api.ts     # Comunicación API
│  │   │   └─ cliente.mapper.ts  # Mapear datos del backend
│  │   ├─ hooks/
│  │   │   └─ useClientes.ts
│  │   └─ types/
│  │       └─ cliente.types.ts
│
│  ├─ simulaciones/
│  │   ├─ components/
│  │   │   ├─ SimuladorForm.tsx
│  │   │   ├─ CronogramaTable.tsx
│  │   │   └─ ResultadoResumen.tsx
│  │   ├─ services/
│  │   │   ├─ simulacion.api.ts
│  │   │   └─ calculos.ts        # Funciones de cálculo financiero
│  │   ├─ hooks/
│  │   │   └─ useSimulacion.ts
│  │   └─ types/
│  │       └─ simulacion.types.ts
│
│  ├─ bancos/
│  │   ├─ components/
│  │   │   ├─ BancoCard.tsx
│  │   │   └─ BancoList.tsx
│  │   ├─ services/
│  │   │   ├─ banco.api.ts
│  │   │   └─ banco.utils.ts
│  │   └─ types/
│  │       └─ banco.types.ts
│
│  ├─ proyectos/
│  │   ├─ components/
│  │   │   ├─ ProyectoCard.tsx
│  │   │   └─ ProyectoList.tsx
│  │   ├─ services/
│  │   │   ├─ proyecto.api.ts
│  │   │   └─ proyecto.mapper.ts
│  │   └─ types/
│  │       └─ proyecto.types.ts
│
│  └─ reportes/
│      ├─ components/
│      │   ├─ ReporteResumen.tsx
│      │   └─ GraficoTIRVAN.tsx
│      ├─ services/
│      │   └─ reporte.api.ts
│      └─ types/
│          └─ reporte.types.ts

├─ components/                   # Componentes globales compartidos
│  ├─ ui/                        # Basados en shadcn/ui o tailwind
│  │   ├─ Button.tsx
│  │   ├─ Input.tsx
│  │   ├─ Select.tsx
│  │   ├─ Modal.tsx
│  │   └─ Card.tsx
│  ├─ layout/
│  │   ├─ Navbar.tsx
│  │   ├─ Sidebar.tsx
│  │   ├─ Footer.tsx
│  │   └─ DashboardShell.tsx
│  └─ feedback/
│      ├─ Alert.tsx
│      └─ Toast.tsx

├─ services/                     # Servicios transversales (API, auth, http)
│  ├─ api/
│  │   ├─ httpClient.ts          # Axios configurado o fetch wrapper
│  │   └─ interceptors.ts        # Manejo de errores, auth tokens, etc.
│  ├─ auth/
│  │   ├─ auth.api.ts
│  │   └─ auth.utils.ts
│  └─ storage/
│      ├─ localStorage.ts
│      └─ sessionStorage.ts

├─ styles/
│  ├─ globals.css                # Tailwind base y estilos globales
│  └─ theme.css                  # Colores, variables, dark mode, etc.

├─ lib/                          # Librerías auxiliares (recharts, date-fns, etc.)
│  ├─ charts.ts
│  ├─ date.ts
│  └─ export.ts                  # Exportar PDF / Excel helpers

├─ types/
│  ├─ global.d.ts                # Tipos globales TS
│  └─ api.d.ts                   # Tipos comunes de respuestas del backend

└─ utils/                        # Utilidades globales sin dependencia de dominio
   ├─ math.ts
   ├─ formatters.ts
   └─ validators.ts
```

💡 **Tip:** Cada feature debe ser autocontenida: componentes, hooks y servicios asociados. Esto facilita escalabilidad y mantenimiento.

---

## ⚙️ Convenciones de desarrollo

1. Usar **TypeScript** para tipado estricto.
2. Mantener **archivos y carpetas pequeños y modulares**.
3. Formatear código automáticamente con **Prettier**.
4. Evitar lógica compleja en `/pages`; moverla a `features` o `hooks`.
5. Servicios de comunicación con API en `/services`, usando variables de entorno (`NEXT_PUBLIC_API_URL`).
6. Preferir **functional components** y **React hooks**.
7. Estilos: CSS Modules o TailwindCSS según convención del proyecto.

---

## 🛠️ Tareas de VSCode

* **📦 Enter DockerShell**
  Abre una terminal dentro del contenedor del frontend (`web_ecometrix`) para ejecutar comandos directamente en el entorno del contenedor.

* **🚀 Start Frontend (npm run dev)**
  Inicia el servidor de desarrollo de Next.js dentro del contenedor, levantando la aplicación para pruebas y desarrollo.

* **▶️ Start Frontend Container**
  Levanta el contenedor del servicio `frontend` si no está iniciado, ejecutándolo en segundo plano.

* **⏸️ Stop Frontend Container**
  Detiene el contenedor del frontend sin eliminarlo, permitiendo reanudarlo rápidamente después.

* **🔄 Restart Frontend**
  Reinicia el contenedor del frontend, útil cuando hay cambios en la configuración o actualizaciones del contenedor.

* **🔨 Rebuild Containers**
  Reconstruye todos los contenedores del proyecto y los levanta en segundo plano, útil tras cambios en Dockerfile o dependencias.

* **🧹 Clean Docker Containers**
  Limpia contenedores, imágenes huérfanas y redes no usadas, manteniendo el entorno limpio y liberando espacio.

* **⬇️ Install Dependencies**
  Instala las dependencias definidas en `package.json` dentro del contenedor del frontend, asegurando que el proyecto funcione correctamente.


## 🧩 Extensiones recomendadas para VSCode

```json
{
  "recommendations": [
    "ms-azuretools.vscode-docker",
    "esbenp.prettier-vscode",
    "johnpapa.vscode-peacock",
    "christian-kohler.path-intellisense"
  ]
}

```

## 🚀 Flujo de desarrollo

1. Inicia la base de datos y backend antes de levantar el frontend si es necesario.
2. Usa `npm run dev` dentro del contenedor para levantar el frontend.
3. Gracias a **bind mounts**, cualquier cambio en tu máquina se refleja automáticamente en el contenedor.
4. Mantén cada feature aislada dentro de `/features` para un desarrollo limpio y escalable.
