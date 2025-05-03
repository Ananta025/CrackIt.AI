# Use a Debian-based Node image for better native module support
FROM node:18-bullseye

# Create app directory
WORKDIR /app

# Only copy package files first to install deps
COPY package*.json ./

# Install dependencies
RUN npm install

# Then copy the rest of the application
COPY . .

# Expose the server port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]

