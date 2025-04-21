# Kenya COVID-19 Vaccination Coverage Dashboard

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)

An interactive web platform visualizing spatial inequities in COVID-19 vaccination coverage across Kenya counties, analyzing structural determinants, and providing policy recommendations.

## 📋 Project Overview

This project provides a comprehensive geospatial analysis of COVID-19 vaccination coverage across Kenya, highlighting inequities between regions and identifying key structural determinants that influence vaccination rates. The platform includes interactive maps, data visualizations, and evidence-based policy recommendations.

### Key Features

- **Interactive Maps**: Explore county-level vaccination rates with dynamic filtering
- **Story Map**: Guided narrative explaining vaccination coverage patterns
- **Data Explorer**: Interactive tools to examine correlations between vaccination and socioeconomic factors
- **Policy Recommendations**: Evidence-based strategies to address vaccination gaps
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Mode**: Toggle between display modes for comfortable viewing

## 🚀 Live Demo

Visit the live dashboard: [Kenya COVID-19 Vaccination Coverage](https://your-site-name.netlify.app)

## 🛠️ Technologies Used

- **Mapbox GL JS**: Interactive mapping
- **JavaScript (ES6+)**: Core functionality
- **CSS3**: Styling with flexbox/grid
- **HTML5**: Semantic markup
- **Netlify**: Hosting and deployment

## 🔧 Local Development Setup

### Prerequisites

- Git
- A code editor (VS Code recommended)
- A local development server

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/kenya-covid-vax.git
   cd kenya-covid-vax
   ```

2. Set up your Mapbox access token:
   - Create a `.env` file in the root directory
   - Add your Mapbox token: `MAPBOX_TOKEN=your_token_here`

3. Start a local development server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

4. Open your browser and navigate to `http://localhost:8000`

## 📊 Data Sources

- **Vaccination Data**: Kenya Ministry of Health, 2022
- **County Boundaries**: Kenya National Bureau of Statistics
- **Demographic Data**: Kenya Demographic and Health Survey, 2022
- **Socioeconomic Indicators**: World Bank Development Indicators

## 📱 Responsive Design

The dashboard is optimized for various screen sizes:

- **Desktop**: Full-featured experience with all visualizations
- **Tablet**: Adapted layout with preserved core functionality
- **Mobile**: Streamlined interface focusing on essential features

## 🔄 Dark/Light Mode

Toggle between dark and light modes using the sun/moon icon in the navigation bar. The site respects user system preferences by default.

## 🌐 Netlify Deployment

### Deployment Steps

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: (none required)
   - Publish directory: `./`
3. Add environment variables:
   - `MAPBOX_TOKEN`: Your Mapbox access token
4. Deploy the site

### Performance Optimizations

- **Caching Strategy**: Optimized cache headers for different asset types
- **Image Compression**: Automatic image optimization via Netlify
- **CSS/JS Minification**: Enabled asset optimization in `netlify.toml`
- **Security Headers**: Comprehensive security policies applied

## 📈 Analytics

The site can be configured to use Netlify Analytics or Google Analytics to track user interactions and page views.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- [Your Name](https://github.com/yourusername) - Project Lead
- [Team Member 1](https://github.com/teammember1) - Data Scientist
- [Team Member 2](https://github.com/teammember2) - GIS Specialist
- [Team Member 3](https://github.com/teammember3) - Web Developer

## 📬 Contact

For questions or feedback, please [open an issue](https://github.com/yourusername/kenya-covid-vax/issues) or contact [your-email@example.com]
