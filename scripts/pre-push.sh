# Add it to vim .git/hooks/pre-push

#!/bin/sh
# Deploy to Cloudflare Pages before pushing

echo "🚀 Deploying to Cloudflare Pages..."
pnpm deploy

if [ $? -ne 0 ]; then
  echo "❌ Deployment failed. Push aborted."
  exit 1
fi

echo "✅ Deployment successful. Continuing with push..."