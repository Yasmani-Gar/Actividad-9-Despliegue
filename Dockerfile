# Usar imagen oficial de Node.js
FROM node:18

# Instalar SQLite
RUN apt-get update && apt-get install -y sqlite3

# Establecer directorio de trabajo en backend
WORKDIR /app/backend

# Copiar archivos de package desde la carpeta backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install

# Instalar sqlite3 como dependencia global
RUN npm install -g sqlite3

# Copiar el resto de los archivos, incluyendo database.db
COPY backend/ .

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]