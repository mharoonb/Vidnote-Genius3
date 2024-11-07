#!/bin/bash

# Exit on error
set -e

# Echo commands before executing
set -x

# Clean install of dependencies
echo "Installing server dependencies..."
npm ci || npm install

# Install client dependencies and build
echo "Installing client dependencies and building..."
cd client
npm ci || npm install
npm run build
cd ..

echo "Build completed successfully!"
