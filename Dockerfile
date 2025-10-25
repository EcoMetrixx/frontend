# Imagen base con Node 22 en versión ligera
FROM node:22-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Comando por defecto: abre una shell interactiva
CMD ["sh"]
