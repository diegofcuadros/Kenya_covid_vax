#!/bin/bash
echo "Running build process to inject environment variables..."

# Replace the Mapbox token in map-config.js
if [ -n "$MAPBOX_TOKEN" ]; then
  echo "Injecting Mapbox token into js/map-config.js"
  sed -i.bak "s|pk\\.eyJ1IjoieW91ci1tYXBib3gtdXNlcm5hbWUiLCJhIjoieW91ci1tYXBib3gtdG9rZW4ifQ\\.your-mapbox-signature|$MAPBOX_TOKEN|g" js/map-config.js
  rm -f js/map-config.js.bak
else
  echo "Error: MAPBOX_TOKEN environment variable is not set"
  exit 1
fi

echo "Build process completed successfully" 