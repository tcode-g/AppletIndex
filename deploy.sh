#!/bin/bash
# file: /var/applet-index/deploy.sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting backend deployment..."
cd /var/applet-index/backend
if [ -f ./actions/update_backend.sh ]; then
  bash ./actions/update_backend.sh
else
  echo "No backend update script found, skipping."
fi

echo "Starting frontend deployment..."
cd /var/applet-index/frontend
if [ -f ./actions/update_frontend.sh ]; then
  bash ./actions/update_frontend.sh
else
  echo "No frontend update script found, skipping."
fi

echo "Deployment complete."