FROM node:20-alpine AS builder
WORKDIR /app

# Add npmrc for platform-specific issues


# First install dependencies - remove the --no-optional flag
COPY .npmrc package.json package-lock.json ./
RUN npm install --only=production


# Install build dependencies separately
RUN npm install esbuild @esbuild/linux-x64

# Copy source code and environment files
COPY . .

# Set build-time environment variables (these will be baked into the build)
ARG VITE_BACKEND_API
ARG VITE_ASSETS_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_REDIRECT_URI

ENV VITE_BACKEND_API=$VITE_BACKEND_API
ENV VITE_ASSETS_URL=$VITE_ASSETS_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI

# Set environment variables for build
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Expose port
EXPOSE 4173

# Start preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]