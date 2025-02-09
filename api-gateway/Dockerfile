FROM node:16
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the api-gateway files
COPY . .

# Expose port
EXPOSE 8000

# Start command
CMD ["node", "app.js"]