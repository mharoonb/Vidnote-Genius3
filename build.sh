#!/bin/bash

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies and build
echo "Installing client dependencies and building..."
cd client && npm install && npm run build && cd ..

echo "Build completed successfully!"
