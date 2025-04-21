// Netlify Build Plugin to inject environment variables into static files
module.exports = {
  onPostBuild: async ({ utils }) => {
    console.log('Injecting environment variables into JavaScript files...');
    
    // Get the Mapbox token from environment variables
    const mapboxToken = process.env.MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      utils.build.failBuild('Required MAPBOX_TOKEN environment variable is missing');
      return;
    }
    
    // Replace the placeholder token in map-config.js
    try {
      const jsFiles = ['js/map-config.js'];
      
      for (const file of jsFiles) {
        await utils.run.command(`sed -i 's|pk\\.eyJ1IjoieW91ci1tYXBib3gtdXNlcm5hbWUiLCJhIjoieW91ci1tYXBib3gtdG9rZW4ifQ\\.your-mapbox-signature|${mapboxToken}|g' ${file}`);
        console.log(`Successfully injected MAPBOX_TOKEN into ${file}`);
      }
    } catch (error) {
      utils.build.failBuild(`Failed to inject environment variables: ${error.message}`);
    }
  }
}; 