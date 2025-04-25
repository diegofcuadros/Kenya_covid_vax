// visualizations.js
// Modern interactive charts for explorer.html using Plotly.js

document.addEventListener('DOMContentLoaded', function() {
    // Cluster data extracted from study summary
    const clusters = [
      {name: "Rural Remote",   cluster: 5, di: 20, vaccination: 7.84,   pop: 100, color: "#a6cee3"},
      {name: "Rural Trans",    cluster: 2, di: 22, vaccination: 6.56,   pop: 120, color: "#b2df8a"},
      {name: "Rural Dev",      cluster: 1, di: 30, vaccination: 15,     pop: 140, color: "#fb9a99"},
      {name: "Semi-Urban",     cluster: 4, di: 35, vaccination: 20,     pop: 110, color: "#fdbf6f"},
      {name: "Peri-Urban",     cluster: 3, di: 40, vaccination: 25,     pop: 130, color: "#cab2d6"},
      {name: "Urban High-Dev", cluster: 6, di: 60, vaccination: 40,     pop: 160, color: "#1f78b4"},
      {name: "Urban Mixed",    cluster: 0, di: 55, vaccination: 35,     pop: 150, color: "#33a02c"}
    ];

    // Data for bar chart
    const barData = {
      clusters: ["Rural Remote", "Rural Trans", "Rural Dev", "Semi-Urban", "Peri-Urban", "Urban High-Dev", "Urban Mixed"],
      bankAccess:   [10, 12, 22, 35, 40, 65, 60],   // %
      immunization: [60, 62, 68, 70, 72, 75, 73],   // %
      livingCond:   [15, 18, 28, 40, 45, 70, 65]    // score
    };

    // SCATTER PLOT: DI vs Vaccination Rate
    if(document.getElementById('scatter-plot')) {
      // Main cluster points
      const traceClusters = {
        x: clusters.map(c => c.di),
        y: clusters.map(c => c.vaccination),
        text: clusters.map(c => `${c.name}<br>Vaccination: ${c.vaccination}%<br>DI: ${c.di}`),
        mode: 'markers+text',
        type: 'scatter',
        name: 'Clusters',
        marker: {
          size: clusters.map(c => 18 + c.pop/12),
          color: clusters.map(c => c.color),
          line: { width: 2, color: '#fff' },
          opacity: 0.9
        },
        textposition: 'top center',
        hoverinfo: 'text'
      };
      // Regression line (approximate)
      const regX = clusters.map(c => c.di);
      const regY = clusters.map(c => c.di * 0.62 - 5); // Linear fit from your summary
      const traceLine = {
        x: regX,
        y: regY,
        mode: 'lines',
        name: 'Trend',
        line: { color: '#2166ac', dash: 'dash', width: 2 },
        hoverinfo: 'skip',
        showlegend: false
      };
      Plotly.newPlot('scatter-plot', [traceClusters, traceLine], {
        title: 'Development Index vs. COVID-19 Vaccination Rate',
        xaxis: { title: 'Development Index Score', range: [15, 65] },
        yaxis: { title: 'Vaccination Rate (%)', range: [0, 45] },
        font: { family: 'Inter, sans-serif', size: 14 },
        showlegend: false,
        plot_bgcolor: '#f7f7f7',
        paper_bgcolor: '#fff',
        margin: { t: 60, l: 60, r: 30, b: 60 },
        hoverlabel: { bgcolor: '#fff', bordercolor: '#2166ac', font: { color: '#2166ac' } }
      });
    }

    // BAR CHART: Key Development Components by Cluster
    if(document.getElementById('bar-chart')) {
      const traceBank = {
        x: barData.clusters,
        y: barData.bankAccess,
        name: 'Bank Account Access',
        type: 'bar',
        marker: { color: '#4393c3' },
        hovertemplate: '%{x}<br>Bank Access: %{y}%<extra></extra>'
      };
      const traceImmun = {
        x: barData.clusters,
        y: barData.immunization,
        name: 'Immunization Coverage',
        type: 'bar',
        marker: { color: '#b2182b' },
        hovertemplate: '%{x}<br>Immunization: %{y}%<extra></extra>'
      };
      const traceLiving = {
        x: barData.clusters,
        y: barData.livingCond,
        name: 'Living Conditions',
        type: 'bar',
        marker: { color: '#2166ac' },
        hovertemplate: '%{x}<br>Living Cond.: %{y}<extra></extra>'
      };
      Plotly.newPlot('bar-chart', [traceBank, traceImmun, traceLiving], {
        barmode: 'group',
        title: 'Key Development Components by Cluster',
        xaxis: { title: 'Cluster', tickangle: -25 },
        yaxis: { title: 'Score / Percentage' },
        font: { family: 'Inter, sans-serif', size: 14 },
        plot_bgcolor: '#f7f7f7',
        paper_bgcolor: '#fff',
        margin: { t: 60, l: 60, r: 30, b: 80 },
        legend: { orientation: 'h', y: -0.25 },
        hoverlabel: { bgcolor: '#fff', bordercolor: '#2166ac', font: { color: '#2166ac' } }
      });
    }
});
