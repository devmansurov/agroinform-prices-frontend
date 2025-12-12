<template>
  <div class="food-basket-breakdown-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default {
  name: 'FoodBasketBreakdownChart',

  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => ({
        chart_data: []
      })
    }
  },

  data() {
    return {
      chartInstance: null
    };
  },

  watch: {
    chartData: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },

  mounted() {
    this.initChart();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    getResponsiveFontSize() {
      const width = window.innerWidth;

      if (width >= 1920) return 14;
      if (width >= 1440) return 12;
      if (width >= 1280) return 11;
      if (width >= 1024) return 10;
      if (width >= 768) return 9;
      if (width >= 576) return 8;
      return 10;
    },

    handleResize() {
      if (this.chartInstance) {
        const fontSize = this.getResponsiveFontSize();
        this.chartInstance.options.plugins.legend.labels.font.size = fontSize;
        this.chartInstance.options.plugins.datalabels.font.size = fontSize;
        this.chartInstance.update();
      }
    },

    initChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Define colors for each product (matching Excel chart colors)
      const colors = [
        '#4472C4', // Rice - Blue
        '#ED7D31', // Potatoes - Orange
        '#A5A5A5', // Haricot bean - Gray
        '#FFC000', // Milk - Yellow
        '#5B9BD5', // Eggs - Light Blue
        '#70AD47', // Cabbage - Green
        '#264478', // Carrots - Dark Blue
        '#9E480E', // Onions - Brown
        '#636363', // Cauliflower - Dark Gray
        '#997300', // Salt - Dark Yellow
        '#255E91', // Sugar - Dark Blue 2
        '#43682B', // Tea green - Dark Green
        '#698ED0', // Apple - Light Blue 2
        '#F1975A', // Vegetable oil - Light Orange
        '#B4B4B4', // Chicken - Light Gray
        '#FFD966'  // Wheat flour - Light Yellow
      ];

      // Prepare data
      const labels = this.chartData.chart_data.map(item => this.$t(item.product_key));
      const data = this.chartData.chart_data.map(item => item.percentage * 100); // Convert to percentage
      const backgroundColors = colors.slice(0, this.chartData.chart_data.length);

      // Detect print mode or use responsive font size
      const isPrintMode = window.matchMedia && window.matchMedia('print').matches;
      const fontSize = isPrintMode ? 6 : this.getResponsiveFontSize();

      this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'right',
              align: 'center',
              labels: {
                boxWidth: 15,
                boxHeight: 15,
                padding: 8,
                font: {
                  size: fontSize
                },
                generateLabels: (chart) => {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const dataset = data.datasets[0];
                      const value = dataset.data[i];
                      return {
                        text: `${label} (${value.toFixed(1)}%)`,
                        fillStyle: dataset.backgroundColor[i],
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  return `${label}: ${value.toFixed(1)}%`;
                }
              }
            },
            datalabels: {
              color: '#ffffff',
              font: {
                size: fontSize,
                weight: 'bold'
              },
              formatter: (value) => {
                // Only show percentages > 3% to avoid clutter
                return value > 3 ? `${value.toFixed(1)}%` : '';
              }
            }
          }
        }
      });
    },

    updateChart() {
      if (!this.chartInstance) return;

      const labels = this.chartData.chart_data.map(item => this.$t(item.product_key));
      const data = this.chartData.chart_data.map(item => item.percentage * 100);

      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.update();
    }
  }
};
</script>

<style scoped>
.food-basket-breakdown-chart-container {
  position: relative;
  width: 100%;
  height: 350px;
  margin: 20px 0;
}

/* Responsive breakpoints */
@media (min-width: 576px) {
  .food-basket-breakdown-chart-container {
    height: 350px;
  }
}

@media (min-width: 768px) {
  .food-basket-breakdown-chart-container {
    height: 400px;
  }
}

@media (min-width: 1024px) {
  .food-basket-breakdown-chart-container {
    height: 450px;
  }
}

@media (min-width: 1280px) {
  .food-basket-breakdown-chart-container {
    height: 500px;
  }
}

@media (min-width: 1440px) {
  .food-basket-breakdown-chart-container {
    height: 550px;
  }
}

@media (min-width: 1920px) {
  .food-basket-breakdown-chart-container {
    height: 600px;
  }
}

/* Print styles */
@media print {
  .food-basket-breakdown-chart-container {
    height: 200pt !important;
    max-height: 200pt !important;
    width: 100% !important;
    max-width: 100% !important;
    page-break-inside: avoid;
    margin: 10pt 0 !important;
    padding: 0 !important;
  }

  .food-basket-breakdown-chart-container canvas {
    max-width: 100% !important;
    max-height: 200pt !important;
    height: 200pt !important;
    width: 100% !important;
  }
}
</style>
