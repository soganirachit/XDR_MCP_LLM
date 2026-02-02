FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Expose port (configurable)
EXPOSE 3001

# Development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]
