#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Install react-scripts globally
npm install -g react-scripts

# Set CI to false
export CI=false

# Build the React app
npm run build
