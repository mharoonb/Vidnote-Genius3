#!/bin/bash

# Exit on error
set -e

# Echo commands before executing
set -x

# Navigate to project root (just in case)
cd /opt/render/project/src

# Clean install of dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies and build
echo "Installing client dependencies and building..."
cd client
npm install
npm run build
cd ..

echo "Build completed successfully!"
