#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Set CI to false
export CI=false

# Use npx to run react-scripts build
npx react-scripts build
