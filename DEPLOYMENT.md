# NAMS API Deployment Guide

This document outlines the deployment process for the NAMS API application using Docker and Jenkins on a VPS server.

## Prerequisites

- VPS server with Docker installed
- Jenkins running inside a Docker container
- PostgreSQL database installed on the server (not in Docker container)
- Git access to the repository
- Basic knowledge of Docker and Jenkins

## Environment Setup

### 1. Server Requirements

Ensure your VPS server meets these requirements:
- Minimum 2GB RAM
- 2+ CPU cores
- 10GB+ disk space
- Ubuntu 20.04/22.04 or equivalent Linux distribution

### 2. Database Setup

The application requires a PostgreSQL database. Since the database is installed directly on the server (not in Docker):

1. Connect to your PostgreSQL server
2. Create databases for staging and production:
```sql
CREATE DATABASE pms_staging;
CREATE DATABASE pms_prod;
```
3. Create a database user:
```sql
CREATE USER admin WITH PASSWORD 'admin3128';
GRANT ALL PRIVILEGES ON DATABASE pms_staging TO admin;
GRANT ALL PRIVILEGES ON DATABASE pms_prod TO admin;
```

## Deployment Configuration

### 1. Environment Files

Two environment files are used for different environments:

#### `.env.staging`
```
# Staging Environment Configuration
NODE_ENV=staging
PORT=3334

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=pms_staging
DB_USER=admin
DB_PASSWORD=admin3128

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random

# Application URL
APP_URL=http://localhost:3334
```

#### `.env.prod`
```
# Production Environment Configuration
NODE_ENV=production
PORT=3333

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pms_prod
DB_USER=admin
DB_PASSWORD=admin3128

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random

# Application URL
APP_URL=http://localhost:3333
```

**Important**: Replace the `JWT_SECRET` with a strong, randomly generated secret in production.

## Docker Configuration

### 1. Dockerfile

The application uses a multi-stage Docker build process defined in the `Dockerfile`:

```dockerfile
# Use Node.js 22 LTS as base image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
FROM base AS builder
RUN npm ci
RUN npm run db:generate
RUN npm run build
RUN npm run db:migrate

# Production stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for Prisma generation)
RUN npm ci

# Copy built application and Prisma client from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose port
EXPOSE 3333

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/healthz', (r) => { if (r.statusCode !== 200) throw new Error('Health check failed') }).on('error', (e) => { console.error(e.message); process.exit(1); })"

# Start the application
CMD ["node", "dist/main.js"]
```

### 2. Docker Compose Files

Two separate docker-compose files are used for staging and production environments. Since the database is installed on the server (not in Docker), the database services have been removed from these files.

#### `docker-compose.staging.yml`
```yaml
version: '3.8'

services:
  app-staging:
    build:
      context: .
      target: production
    ports:
      - "3334:3333"
    environment:
      - NODE_ENV=staging
      - PORT=3333
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    env_file:
      - .env.staging
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3333/healthz', (r) => { if (r.statusCode !== 200) throw new Error('Health check failed') }).on('error', (e) => { console.error(e.message); process.exit(1); })"]
      interval: 30s
      timeout: 30s
      retries: 3
      start_period: 5s

volumes:
  postgres_data_staging:
```

#### `docker-compose.prod.yml`
```yaml
version: '3.8'

services:
  app-prod:
    build:
      context: .
      target: production
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - PORT=3333
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    env_file:
      - .env.prod
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3333/healthz', (r) => { if (r.statusCode !== 200) throw new Error('Health check failed') }).on('error', (e) => { console.error(e.message); process.exit(1); })"]
      interval: 30s
      timeout: 30s
      retries: 3
      start_period: 5s

volumes:
  postgres_data_prod:
```

## Jenkins Pipeline Configuration

Two separate Jenkins pipelines are configured for staging and production deployments.

### 1. Staging Pipeline (`jenkins/staging-pipeline.groovy`)

Triggers on commits to the `staging` branch.

#### Pipeline Stages:
1. **Checkout**: Pulls the latest code from the staging branch
2. **Build Docker Image**: Builds the Docker image using the Dockerfile
3. **Stop and Remove Existing Container**: Stops and removes any existing staging container
4. **Start Application**: Runs the new container with staging configuration
5. **Health Check**: Verifies the application is running and healthy

#### Pipeline Code:
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'nams-api-staging'
        CONTAINER_NAME = 'nams-api-staging'
        PORT = '3334'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image for staging...'
                    sh 'docker build -t ${DOCKER_IMAGE}:latest .'
                }
            }
        }
        
        stage('Stop and Remove Existing Container') {
            steps {
                script {
                    sh '''
                        if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
                            echo "Stopping existing container..."
                            docker stop ${CONTAINER_NAME}
                        fi
                        if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
                            echo "Removing existing container..."
                            docker rm ${CONTAINER_NAME}
                        fi
                    '''
                }
            }
        }
        
        stage('Start Application') {
            steps {
                script {
                    echo 'Starting application container...'
                    sh '''
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            --env-file .env.staging \
                            -p ${PORT}:3333 \
                            -e DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME} \
                            --restart unless-stopped \
                            ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo 'Checking application health...'
                    sh '''
                        # Wait for container to start
                        sleep 10
                        
                        # Check if container is running
                        if ! docker ps | grep -q ${CONTAINER_NAME}; then
                            echo "Container ${CONTAINER_NAME} is not running"
                            exit 1
                        fi
                        
                        # Check application health endpoint
                        ATTEMPTS=0
                        MAX_ATTEMPTS=10
                        HEALTHY=false
                        
                        while [ $ATTEMPTS -lt $MAX_ATTEMPTS ] && [ "$HEALTHY" = false ]; do
                            if curl -f http://localhost:${PORT}/healthz; then
                                HEALTHY=true
                                echo "Application is healthy"
                            else
                                echo "Health check failed, retrying in 10 seconds..."
                                sleep 10
                                ATTEMPTS=$((ATTEMPTS+1))
                            fi
                        done

                        if [ "$HEALTHY" = false ]; then
                            echo "Application failed to become healthy after $MAX_ATTEMPTS attempts"
                            exit 1
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Staging deployment completed successfully!'
        }
        failure {
            echo 'Staging deployment failed!'
        }
    }
}
```

### 2. Production Pipeline (`jenkins/prod-pipeline.groovy`)

Triggers on commits to the `main` branch.

#### Pipeline Stages:
1. **Checkout**: Pulls the latest code from the main branch
2. **Build Docker Image**: Builds the Docker image using the Dockerfile
3. **Stop and Remove Existing Container**: Stops and removes any existing production container
4. **Start Application**: Runs the new container with production configuration
5. **Health Check**: Verifies the application is running and healthy

#### Pipeline Code:
```groovy
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'nams-api-prod'
        CONTAINER_NAME = 'nams-api-prod'
        PORT = '3333'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image for production...'
                    sh 'docker build -t ${DOCKER_IMAGE}:latest .'
                }
            }
        }

        stage('Stop and Remove Existing Container') {
            steps {
                script {
                    sh '''
                        if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
                            echo "Stopping existing container..."
                            docker stop ${CONTAINER_NAME}
                        fi
                        if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
                            echo "Removing existing container..."
                            docker rm ${CONTAINER_NAME}
                        fi
                    '''
                }
            }
        }

        stage('Start Application') {
            steps {
                script {
                    echo 'Starting application container...'
                    sh '''
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            --env-file .env.prod \
                            -p ${PORT}:3333 \
                            -e DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME} \
                            --restart unless-stopped \
                            ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo 'Checking application health...'
                    sh '''
                        # Wait for container to start
                        sleep 10

                        # Check if container is running
                        if ! docker ps | grep -q ${CONTAINER_NAME}; then
                            echo "Container ${CONTAINER_NAME} is not running"
                            exit 1
                        fi

                        # Check application health endpoint
                        ATTEMPTS=0
                        MAX_ATTEMPTS=10
                        HEALTHY=false

                        while [ $ATTEMPTS -lt $MAX_ATTEMPTS ] && [ "$HEALTHY" = false ]; do
                            if curl -f http://localhost:${PORT}/healthz; then
                                HEALTHY=true
                                echo "Application is healthy"
                            else
                                echo "Health check failed, retrying in 10 seconds..."
                                sleep 10
                                ATTEMPTS=$((ATTEMPTS+1))
                            fi
                        done

                        if [ "$HEALTHY" = false ]; then
                            echo "Application failed to become healthy after $MAX_ATTEMPTS attempts"
                            exit 1
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Production deployment completed successfully!'
        }
        failure {
            echo 'Production deployment failed!'
        }
    }
}
```

## Jenkins Setup

### 1. Install Required Plugins

In Jenkins, install these plugins:
- Pipeline
- Git
- Docker Pipeline
- Environment Injector (Note: This plugin is up for adoption and may not be actively maintained. Consider using Jenkins built-in environment variable management instead.)

### 2. Create Jenkins Pipelines

#### Staging Pipeline
1. Go to Jenkins dashboard
2. Click "New Item"
3. Enter name: "nams-api-staging"
4. Select "Pipeline"
5. Click "OK"
6. In the pipeline configuration:
   - Under "Build Triggers", check "GitHub hook trigger for GITscm polling"
   - Under "Pipeline", select "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: [your repository URL]
   - Branches to build: `*/staging`
   - Script Path: `jenkins/staging-pipeline.groovy`
7. Click "Save"

#### Production Pipeline
1. Go to Jenkins dashboard
2. Click "New Item"
3. Enter name: "nams-api-prod"
4. Select "Pipeline"
5. Click "OK"
6. In the pipeline configuration:
   - Under "Build Triggers", check "GitHub hook trigger for GITscm polling"
   - Under "Pipeline", select "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: [your repository URL]
   - Branches to build: `*/main`
   - Script Path: `jenkins/prod-pipeline.groovy`
7. Click "Save"

## Deployment Process

### 1. Staging Deployment

1. Push changes to the `staging` branch:
```bash
git checkout staging
git merge feature/your-feature
git push origin staging
```

2. The Jenkins pipeline will automatically:
   - Pull the latest code
   - Build the Docker image
   - Deploy to the staging environment
   - Run health checks

3. Access the staging application at: `http://your-server-ip:3334`

### 2. Production Deployment

1. Merge changes from `staging` to `main`:
```bash
git checkout main
git merge staging
git push origin main
```

2. The Jenkins pipeline will automatically:
   - Pull the latest code
   - Build the Docker image
   - Deploy to the production environment
   - Run health checks

3. Access the production application at: `http://your-server-ip:3333`

## Health Check Endpoint

The application provides a health check endpoint:
- URL: `/healthz`
- Returns: HTTP 200 if application is healthy
- Used by Docker health checks and Jenkins pipelines

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secret**: Use a strong, randomly generated secret for production
3. **Database Credentials**: Store database credentials securely
4. **Firewall**: Configure firewall rules to restrict access to database ports
5. **HTTPS**: Use HTTPS in production (consider using Nginx as a reverse proxy)

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
- Verify database is running
- Check database credentials in environment files
- Ensure database port is accessible
- Verify database user has proper permissions

#### 2. Docker Build Failures
- Check Docker daemon is running
- Verify sufficient disk space
- Check for syntax errors in Dockerfile
- Ensure npm packages can be installed

#### 3. Jenkins Pipeline Failures
- Verify Jenkins has access to the repository
- Check Jenkins logs for detailed error messages
- Ensure Docker commands can be executed by Jenkins user
- Verify environment variables are properly configured

## Maintenance

### 1. Monitoring
- Set up monitoring for CPU, memory, and disk usage
- Monitor application logs
- Set up alerts for health check failures

### 2. Backups
- Regularly backup the PostgreSQL databases
- Store backups in a secure, off-site location
- Test backup restoration process periodically

### 3. Updates
- Regularly update Docker, Jenkins, and PostgreSQL
- Keep application dependencies up to date
- Test updates in staging before applying to production