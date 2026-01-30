#!/bin/bash
# Cloudflare Resources Setup Script
# Creates D1 and KV resources for a project
#
# Usage:
#   ./scripts/setup.sh                    # Interactive mode - prompts for name
#   ./scripts/setup.sh myproject          # Creates myproject-db and MYPROJECT_KV
#   ./scripts/setup.sh myproject --kv-only    # Only create KV
#   ./scripts/setup.sh myproject --d1-only    # Only create D1

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
PROJECT_NAME=""
CREATE_D1=true
CREATE_KV=true

while [[ $# -gt 0 ]]; do
  case $1 in
    --kv-only)
      CREATE_D1=false
      shift
      ;;
    --d1-only)
      CREATE_KV=false
      shift
      ;;
    --help|-h)
      echo "Usage: ./scripts/setup.sh [project-name] [options]"
      echo ""
      echo "Options:"
      echo "  --d1-only    Only create D1 database"
      echo "  --kv-only    Only create KV namespace"
      echo "  --help       Show this help"
      echo ""
      echo "Examples:"
      echo "  ./scripts/setup.sh                  # Interactive mode"
      echo "  ./scripts/setup.sh myapp            # Creates myapp-db and MYAPP_KV"
      echo "  ./scripts/setup.sh users --d1-only  # Only creates users-db"
      exit 0
      ;;
    *)
      PROJECT_NAME="$1"
      shift
      ;;
  esac
done

echo ""
echo -e "${BLUE}=========================================="
echo "Cloudflare Resources Setup"
echo -e "==========================================${NC}"
echo ""

# Check if logged in
if ! npx wrangler whoami &> /dev/null; then
  echo -e "${RED}Not logged in to Cloudflare.${NC}"
  echo "Run: npx wrangler login"
  exit 1
fi

# Get project name if not provided
if [ -z "$PROJECT_NAME" ]; then
  echo -e "${YELLOW}Enter a project/resource name (lowercase, no spaces):${NC}"
  echo "Examples: tools-demo, users, cache, analytics"
  read -p "> " PROJECT_NAME
  
  if [ -z "$PROJECT_NAME" ]; then
    echo -e "${RED}Project name is required${NC}"
    exit 1
  fi
fi

# Sanitize project name (lowercase, replace spaces with dashes)
PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')

# Generate resource names
D1_NAME="${PROJECT_NAME}-db"
KV_NAME=$(echo "${PROJECT_NAME}_KV" | tr '[:lower:]-' '[:upper:]_')

echo ""
echo -e "Project name: ${GREEN}${PROJECT_NAME}${NC}"
if $CREATE_D1; then
  echo -e "D1 database:  ${GREEN}${D1_NAME}${NC}"
fi
if $CREATE_KV; then
  echo -e "KV namespace: ${GREEN}${KV_NAME}${NC}"
fi
echo ""

# Confirm
read -p "Create these resources? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""

# Track created resources for final summary
D1_ID=""
KV_ID=""

# Create D1 Database
if $CREATE_D1; then
  echo -e "${YELLOW}Creating D1 Database: ${D1_NAME}${NC}"
  
  D1_OUTPUT=$(npx wrangler d1 create "$D1_NAME" 2>&1) || {
    if echo "$D1_OUTPUT" | grep -q "already exists"; then
      echo -e "${YELLOW}Database already exists${NC}"
    else
      echo -e "${RED}Failed to create D1 database${NC}"
      echo "$D1_OUTPUT"
    fi
  }
  
  # Extract database_id from output
  D1_ID=$(echo "$D1_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
  
  if [ -n "$D1_ID" ]; then
    echo -e "${GREEN}Created! ID: ${D1_ID}${NC}"
  fi
  echo ""
fi

# Create KV Namespace
if $CREATE_KV; then
  echo -e "${YELLOW}Creating KV Namespace: ${KV_NAME}${NC}"
  
  KV_OUTPUT=$(npx wrangler kv namespace create "$KV_NAME" 2>&1) || {
    if echo "$KV_OUTPUT" | grep -q "already exists"; then
      echo -e "${YELLOW}Namespace already exists${NC}"
    else
      echo -e "${RED}Failed to create KV namespace${NC}"
      echo "$KV_OUTPUT"
    fi
  }
  
  # Extract id from output
  KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
  
  if [ -n "$KV_ID" ]; then
    echo -e "${GREEN}Created! ID: ${KV_ID}${NC}"
  fi
  echo ""
fi

# Print wrangler.toml snippet
echo -e "${BLUE}=========================================="
echo "Add to wrangler.toml:"
echo -e "==========================================${NC}"
echo ""

if $CREATE_D1 && [ -n "$D1_ID" ]; then
  echo "# D1 Database: ${D1_NAME}"
  echo "[[d1_databases]]"
  echo "binding = \"DB\"  # or use a custom binding name"
  echo "database_name = \"${D1_NAME}\""
  echo "database_id = \"${D1_ID}\""
  echo ""
fi

if $CREATE_KV && [ -n "$KV_ID" ]; then
  echo "# KV Namespace: ${KV_NAME}"
  echo "[[kv_namespaces]]"
  echo "binding = \"${KV_NAME}\""
  echo "id = \"${KV_ID}\""
  echo ""
fi

echo -e "${BLUE}=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the config above into wrangler.toml"
echo "2. Run 'pnpm dev' to test locally"
echo "3. Run 'pnpm deploy' to deploy"
echo ""
echo "Note: Workers AI doesn't require setup - just add to wrangler.toml:"
echo "[ai]"
echo "binding = \"AI\""
