#!/bin/bash
# EAS Build hook to force npm instead of Bun
set -e

# Remove any bun.lockb file if it exists
rm -f bun.lockb

# Ensure npm is used
npm install --legacy-peer-deps

