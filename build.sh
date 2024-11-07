#!/bin/bash

# Exit on error
set -e

# Echo commands before executing
set -x

# Debug: Print current directory
pwd
ls -la

# Navigate to project root and install server dependencies
cd /opt/render/project/src
echo "Installing server dependencies..."
rm -rf node_modules package-lock.json
npm install --production

# Debug: Verify express installation
ls -la node_modules/express

# Install client dependencies and build
echo "Installing client dependencies and building..."
cd client
rm -rf node_modules package-lock.json
npm install --production
npm run build
cd ..

# Debug: Final directory structure
echo "Final directory structure:"
ls -la
ls -la node_modules

echo "Build completed successfully!"
