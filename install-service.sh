#!/bin/bash

# FG Quiz Game - SystemD Service Installation Script
# This script installs and configures the FG Quiz Game as a systemd service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="fg-quiz"
SERVICE_USER="www-data"
APP_DIR="/var/www/fg-quiz"
REPO_URL="https://github.com/beeava/fg-project-2025-quiz.git"

echo -e "${GREEN}🚀 FG Quiz Game - SystemD Service Installation${NC}"
echo "=================================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Git...${NC}"
    apt-get update
    apt-get install -y git
fi

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
mkdir -p $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo -e "${YELLOW}🔄 Updating existing repository...${NC}"
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
npm install --production

# Create www-data user if it doesn't exist
if ! id "$SERVICE_USER" &>/dev/null; then
    echo -e "${YELLOW}👤 Creating $SERVICE_USER user...${NC}"
    useradd --system --home-dir $APP_DIR --shell /bin/false $SERVICE_USER
fi

# Set correct permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR
chmod -R 755 $APP_DIR

# Copy and install systemd service
echo -e "${YELLOW}⚙️  Installing systemd service...${NC}"
cp $APP_DIR/fg-quiz.service /etc/systemd/system/
systemctl daemon-reload

# Enable and start service
echo -e "${YELLOW}🔄 Enabling and starting service...${NC}"
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Check service status
sleep 2
if systemctl is-active --quiet $SERVICE_NAME; then
    echo -e "${GREEN}✅ Service installed and started successfully!${NC}"
    echo ""
    echo "📋 Service Information:"
    echo "   Name: $SERVICE_NAME"
    echo "   Status: $(systemctl is-active $SERVICE_NAME)"
    echo "   Directory: $APP_DIR"
    echo "   User: $SERVICE_USER"
    echo "   Port: 3000"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   Check status: sudo systemctl status $SERVICE_NAME"
    echo "   View logs: sudo journalctl -u $SERVICE_NAME -f"
    echo "   Restart: sudo systemctl restart $SERVICE_NAME"
    echo "   Stop: sudo systemctl stop $SERVICE_NAME"
    echo ""
    echo "🌐 Access your application at: http://your-server-ip:3000"
else
    echo -e "${RED}❌ Service failed to start${NC}"
    echo "Check logs with: sudo journalctl -u $SERVICE_NAME"
    exit 1
fi
