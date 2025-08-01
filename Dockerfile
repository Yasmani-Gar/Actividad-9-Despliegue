# Usar imagen oficial de Node.js
FROM node:18

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto
EXPOSE 3000

# Copiar script de inicialización
COPY init-db.sql /app/backend/init-db.sql
RUN sqlite3 database.db < /app/backend/init-db.sql

# Comando para iniciar la aplicación
CMD ["node", "server.js"]