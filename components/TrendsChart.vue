<template>
  <div class="trends-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
Chart.register(
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default {
  name: 'TrendsChart',

  props: {
    trendsData: {
      type: Array,
      required: true,
      default: () => []
    },
    locale: {
      type: String,
      required: true
    },
    showAllLabels: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      chartInstance: null
    };
  },

  watch: {
    trendsData: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },

  mounted() {
    this.initChart();
  },

  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}.${year}`;
    },

    initChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Calculate min and max for better visualization
      const basketValues = this.trendsData.map(d => d.food_basket_cost).filter(v => v !== null && v !== undefined);
      const minValue = basketValues.length > 0 ? Math.min(...basketValues) : 0;
      const maxValue = basketValues.length > 0 ? Math.max(...basketValues) : 0;
      const range = maxValue - minValue;
      const suggestedMin = minValue - (range * 0.1);
      const suggestedMax = maxValue + (range * 0.1);

      // Find indices of min/max values for labeling
      const minIndex = this.trendsData.findIndex(d => d.food_basket_cost === minValue);
      const maxIndex = this.trendsData.findIndex(d => d.food_basket_cost === maxValue);

      // Detect if in print mode (approximation)
      const isPrintMode = window.matchMedia && window.matchMedia('print').matches;
      const fontSize = isPrintMode ? 9 : 12;
      const titleFontSize = isPrintMode ? 10 : 14;

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.trendsData.map(d => this.formatDate(d.date)),
          datasets: [
            {
              label: this.$t('food_basket_cost_monthly'),
              type: 'bar',
              data: this.trendsData.map(d => d.food_basket_cost ?? null),
              backgroundColor: this.trendsData.map((d, i) => {
                if (i === minIndex) return '#4CAF50'; // Green for min
                if (i === maxIndex) return '#F44336'; // Red for max
                return '#1976D2'; // Default blue
              }),
              borderColor: this.trendsData.map((d, i) => {
                if (i === minIndex) return '#2E7D32'; // Dark green border for min
                if (i === maxIndex) return '#C62828'; // Dark red border for max
                return '#1976D2'; // Default blue border
              }),
              borderWidth: this.trendsData.map((d, i) => {
                if (i === minIndex || i === maxIndex) return 2; // Thicker border for min/max
                return 1;
              }),
              barThickness: 6,
              categoryPercentage: 0.375,
              barPercentage: 1.0,
              yAxisID: 'y',
              order: 2,
              datalabels: {
                display: (context) => {
                  // Show all labels if showAllLabels is true
                  if (this.showAllLabels) return true;
                  // Otherwise, show only for min/max values
                  const index = context.dataIndex;
                  return index === minIndex || index === maxIndex;
                },
                align: 'end',
                anchor: 'end',
                offset: 4,
                formatter: (value) => {
                  if (value === null || value === undefined) return '';
                  return Math.round(value).toLocaleString('en-US');
                },
                font: {
                  size: 10,
                  weight: 'bold'
                },
                color: (context) => {
                  const index = context.dataIndex;
                  if (index === minIndex) return '#2E7D32'; // Dark green for min
                  if (index === maxIndex) return '#C62828'; // Dark red for max
                  return '#1976D2'; // Default blue
                }
              }
            },
            {
              label: this.$t('percentage_increase_vs_prev_period'),
              type: 'line',
              data: this.trendsData.map(d => d.percentage_change ?? null),
              borderColor: '#F57C00',
              backgroundColor: 'transparent',
              borderWidth: 3,
              pointRadius: 3,
              pointHoverRadius: 5,
              tension: 0.4,
              yAxisID: 'y1',
              order: 1,
              datalabels: {
                display: true,
                align: 'top',
                anchor: 'end',
                offset: 4,
                formatter: (value) => {
                  if (value === null || value === undefined) return '';
                  return value.toFixed(1) + '%';
                },
                font: {
                  size: 10,
                  weight: 'bold'
                },
                color: '#F57C00'
              }
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          layout: {
            padding: {
              top: 20
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'center',
              labels: {
                usePointStyle: false,
                boxWidth: 40,
                padding: 15,
                font: {
                  size: fontSize
                },
                generateLabels: (chart) => {
                  const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);

                  // Add custom legend items for min/max
                  const customItems = [
                    {
                      text: this.$t('min_cost_last_24_months'),
                      fillStyle: 'transparent',
                      strokeStyle: '#2E7D32',
                      lineWidth: 2,
                      hidden: false,
                      index: 100
                    },
                    {
                      text: this.$t('max_cost_last_24_months'),
                      fillStyle: 'transparent',
                      strokeStyle: '#C62828',
                      lineWidth: 2,
                      hidden: false,
                      index: 101
                    }
                  ];

                  return [...original, ...customItems];
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    if (context.datasetIndex === 0) {
                      label += Math.round(context.parsed.y).toLocaleString('en-US') + ' ' + this.$t('tjs');
                    } else {
                      label += context.parsed.y.toFixed(1) + '%';
                    }
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: this.$t('date'),
                font: {
                  size: titleFontSize
                }
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: fontSize
                }
              },
              grid: {
                display: false,
                offset: true
              },
              offset: true
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              beginAtZero: false,
              suggestedMin: suggestedMin,
              suggestedMax: suggestedMax,
              title: {
                display: true,
                text: this.$t('food_basket_cost_monthly'),
                font: {
                  size: titleFontSize
                }
              },
              ticks: {
                callback: (value) => Math.round(value).toLocaleString('en-US'),
                font: {
                  size: fontSize
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: this.$t('percentage_increase_vs_prev_period'),
                font: {
                  size: titleFontSize
                }
              },
              ticks: {
                callback: (value) => value.toFixed(1) + '%',
                font: {
                  size: fontSize
                }
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    },

    updateChart() {
      if (!this.chartInstance) return;

      this.chartInstance.data.labels = this.trendsData.map(d => this.formatDate(d.date));
      this.chartInstance.data.datasets[0].data = this.trendsData.map(d => d.food_basket_cost ?? null);
      this.chartInstance.data.datasets[1].data = this.trendsData.map(d => d.percentage_change ?? null);

      this.chartInstance.update();
    }
  }
};
</script>

<style scoped>
.trends-chart-container {
  position: relative;
  width: 100%;
  height: 300px;
}

@media (min-width: 576px) and (max-width: 767px) {
  .trends-chart-container {
    height: 240px;
  }
}

@media print {
  .trends-chart-container {
    height: 162pt !important;
    max-height: 162pt !important;
    width: 100% !important;
    max-width: 100% !important;
    page-break-inside: avoid;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .trends-chart-container canvas {
    max-width: 100% !important;
    max-height: 162pt !important;
    height: 162pt !important;
    width: 100% !important;
  }
}
</style>
