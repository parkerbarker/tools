#!/bin/bash
# Cloudflare Resources Setup Script
# Run this to create the D1 and KV resources needed for the demos.
# After running, copy the IDs into wrangler.toml

set -e

echo "=========================================="
echo "Cloudflare Resources Setup"
echo "=========================================="
echo ""
echo "Make sure you're logged in: npx wrangler login"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# D1 Database
echo -e "${YELLOW}Creating D1 Database...${NC}"
echo "Run: npx wrangler d1 create tools-demo-db"
echo ""
npx wrangler d1 create tools-demo-db || echo -e "${RED}Database may already exist${NC}"
echo ""
echo -e "${GREEN}Copy the database_id to wrangler.toml${NC}"
echo ""

# KV Namespace (Wrangler v4 syntax: space instead of colon)
echo -e "${YELLOW}Creating KV Namespace...${NC}"
echo "Run: npx wrangler kv namespace create DEMO_KV"
echo ""
npx wrangler kv namespace create DEMO_KV || echo -e "${RED}Namespace may already exist${NC}"
echo ""
echo -e "${GREEN}Copy the id to wrangler.toml${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy the IDs from above into wrangler.toml"
echo "2. Run 'pnpm dev' to test locally"
echo "3. Run 'pnpm deploy' to deploy to production"
echo ""
echo "Note: Workers AI doesn't require setup - just the binding in wrangler.toml"
