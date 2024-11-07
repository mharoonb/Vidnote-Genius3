#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install
npm install --only=dev

# Set environment to production
export NODE_ENV=production

# Build the React app with CI=false to prevent treating warnings as errors
CI=false npm run build

# Make sure the server can serve the static files
chmod -R 755 build/
