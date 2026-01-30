#!/bin/bash
# Cloudflare Resources Setup Script
# Run this to create the D1, KV, and R2 resources needed for the demos.
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
NC='\033[0m' # No Color

# D1 Database
echo -e "${YELLOW}Creating D1 Database...${NC}"
echo "Run: npx wrangler d1 create tools-demo-db"
echo ""
npx wrangler d1 create tools-demo-db || echo "Database may already exist"
echo ""
echo -e "${GREEN}Copy the database_id to wrangler.toml${NC}"
echo ""

# KV Namespace
echo -e "${YELLOW}Creating KV Namespace...${NC}"
echo "Run: npx wrangler kv:namespace create DEMO_KV"
echo ""
npx wrangler kv:namespace create DEMO_KV || echo "Namespace may already exist"
echo ""
echo -e "${GREEN}Copy the id to wrangler.toml as 'id'${NC}"
echo ""

# KV Preview Namespace (for local dev)
echo -e "${YELLOW}Creating KV Preview Namespace...${NC}"
echo "Run: npx wrangler kv:namespace create DEMO_KV --preview"
echo ""
npx wrangler kv:namespace create DEMO_KV --preview || echo "Preview namespace may already exist"
echo ""
echo -e "${GREEN}Copy the id to wrangler.toml as 'preview_id'${NC}"
echo ""

# R2 Bucket
echo -e "${YELLOW}Creating R2 Bucket...${NC}"
echo "Run: npx wrangler r2 bucket create tools-demo-bucket"
echo ""
npx wrangler r2 bucket create tools-demo-bucket || echo "Bucket may already exist"
echo ""
echo -e "${GREEN}R2 bucket created (no ID needed in config)${NC}"
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
