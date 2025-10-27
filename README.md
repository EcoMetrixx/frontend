
# Frontend (Next.js)

## 🖥️ Descripción

Este proyecto corresponde al **frontend** de la aplicación **Ecometrix**, desarrollado con **Next.js y TypeScript**.
El objetivo es mantener una **estructura modular y escalable**, siguiendo principios de **Clean Architecture** y buenas prácticas de desarrollo.

---

## 📂 Estructura recomendada de carpetas

```plaintext
/frontend
│
├─ /components     # Componentes reutilizables de UI
├─ /features       # Funcionalidades o módulos de la aplicación
│   ├─ /[feature]  # Cada feature contiene sus componentes, hooks y servicios
├─ /pages          # Páginas de Next.js
├─ /public         # Archivos estáticos (imágenes, fuentes)
├─ /styles         # Archivos de estilos globales o utilitarios
├─ /hooks          # Custom hooks globales
├─ /services       # Comunicación con APIs (fetch/axios)
├─ /context        # Contextos de React
└─ /utils          # Funciones utilitarias
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
