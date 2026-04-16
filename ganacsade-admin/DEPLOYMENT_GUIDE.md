# 🚀 GANACSADE Admin Dashboard - Deployment Guide

Complete guide for deploying the GANACSADE admin dashboard to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Backend API running and accessible
- ✅ Environment variables configured
- ✅ Database populated with initial data
- ✅ Admin user accounts created
- ✅ SSL certificates for HTTPS (production)
- ✅ Domain name configured (optional)

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Vercel** is the easiest and fastest deployment option for Next.js applications.

#### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: GANACSADE Admin Dashboard"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/ganacsade-admin.git
git push -u origin main
```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

#### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_APP_NAME=GANACSADE Admin
```

#### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete. Your dashboard will be live at:
```
https://your-project.vercel.app
```

#### Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `admin.ganacsade.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate to be issued

---

### Option 2: Self-Hosted (VPS/Dedicated Server)

Deploy on your own server (Ubuntu/Debian example).

#### Prerequisites

- Ubuntu 20.04+ or Debian 11+
- Node.js 18+
- Nginx
- PM2 (process manager)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Clone and Build

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/ganacsade-admin.git
cd ganacsade-admin

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.ganacsade.com/api
NEXT_PUBLIC_APP_NAME=GANACSADE Admin
EOF

# Build for production
npm run build
```

#### Step 3: Start with PM2

```bash
# Start the application
pm2 start npm --name "ganacsade-admin" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 4: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/ganacsade-admin
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name admin.ganacsade.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ganacsade-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d admin.ganacsade.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

### Option 3: Docker Deployment

Deploy using Docker containers.

#### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  admin-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.ganacsade.com/api
      - NEXT_PUBLIC_APP_NAME=GANACSADE Admin
    restart: unless-stopped
```

#### Step 3: Build and Run

```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env.local` to version control
- ✅ Use different API URLs for dev/staging/production
- ✅ Rotate secrets regularly
- ✅ Use environment-specific configurations

### 2. API Security

- ✅ Enable CORS with specific origins
- ✅ Implement rate limiting on backend
- ✅ Use HTTPS only in production
- ✅ Validate all user inputs
- ✅ Implement JWT token expiration

### 3. Access Control

- ✅ Implement role-based access control (RBAC)
- ✅ Use strong password policies
- ✅ Enable 2FA for admin accounts
- ✅ Log all admin actions
- ✅ Regular security audits

### 4. Server Hardening

```bash
# Firewall configuration
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Fail2ban for SSH protection
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs ganacsade-admin

# Restart application
pm2 restart ganacsade-admin

# Check status
pm2 status
```

### Server Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/ganacsade-admin"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /path/to/ganacsade-admin

# Backup database (if local)
# pg_dump dbname > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Vercel)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Actions (Self-Hosted)

```yaml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/ganacsade-admin
            git pull origin main
            npm install
            npm run build
            pm2 restart ganacsade-admin
```

---

## 🐛 Troubleshooting

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### PM2 Not Starting

```bash
# Delete PM2 process
pm2 delete ganacsade-admin

# Start fresh
pm2 start npm --name "ganacsade-admin" -- start
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check logs
sudo tail -100 /var/log/nginx/error.log
```

---

## 📈 Performance Optimization

### 1. Enable Caching

In `next.config.ts`:

```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png)',
      locale: false,
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }
      ],
    },
  ],
}
```

### 2. Enable Compression

In Nginx:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 3. CDN Integration

For Vercel, CDN is automatic. For self-hosted:

- Use CloudFlare for CDN
- Enable asset optimization
- Configure edge caching rules

---

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs` or Vercel dashboard
- Review documentation in `README.md`
- Verify environment variables
- Check backend API connectivity

---

**Deployment Guide Last Updated: October 2025**
