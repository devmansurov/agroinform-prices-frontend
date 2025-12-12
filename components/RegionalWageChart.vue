<template>
  <div class="regional-wage-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

export default {
  name: 'RegionalWageChart',

  props: {
    regionalData: {
      type: Array,
      required: true,
      default: () => []
    },
    locale: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      chartInstance: null
    };
  },

  watch: {
    regionalData: {
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
    initChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Filter out markets with no data (food_basket_cost = 0)
      const validData = this.regionalData.filter(d => d.food_basket_cost > 0);

      // Identify problematic markets (basket > wage OR basket > 75% of wage)
      const problematicIndices = validData.map((d, index) => {
        const basketCost = d.food_basket_cost;
        const wage = d.unskilled_labour_wage;

        if (wage === null || wage === undefined || wage === 0) return false;

        // Highlight if basket exceeds wage OR is more than 75% of wage
        if (basketCost > wage || basketCost > (wage * 0.75)) {
          return index;
        }
        return false;
      }).filter(idx => idx !== false);

      // Calculate min and max for better visualization
      const allValues = [
        ...validData.map(d => d.food_basket_cost),
        ...validData.map(d => d.skilled_labour_wage),
        ...validData.map(d => d.unskilled_labour_wage)
      ].filter(v => v !== null && v !== undefined && v > 0);

      const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
      const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
      const range = maxValue - minValue;
      const suggestedMin = Math.max(0, minValue - (range * 0.1));
      const suggestedMax = maxValue + (range * 0.1);

      // Detect if in print mode
      const isPrintMode = window.matchMedia && window.matchMedia('print').matches;
      const fontSize = isPrintMode ? 9 : 12;
      const titleFontSize = isPrintMode ? 10 : 14;

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: validData.map(d => d.market_name),
          datasets: [
            {
              label: this.$t('food_basket_cost'),
              data: validData.map(d => d.food_basket_cost),
              borderColor: '#4285F4',
              backgroundColor: 'rgba(66, 133, 244, 0.3)',
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: validData.map((_, i) => problematicIndices.includes(i) ? '#F44336' : '#4285F4'),
              pointBorderColor: validData.map((_, i) => problematicIndices.includes(i) ? '#FFFFFF' : '#4285F4'),
              pointBorderWidth: validData.map((_, i) => problematicIndices.includes(i) ? 3 : 1),
              pointStyle: validData.map((_, i) => problematicIndices.includes(i) ? 'rectRot' : 'circle'),
              tension: 0.4,
              fill: true,
              datalabels: {
                display: true,
                align: 'top',
                anchor: 'end',
                offset: 4,
                formatter: (value) => {
                  if (value === null || value === undefined) return '';
                  return Math.round(value).toLocaleString('en-US');
                },
                font: (context) => ({
                  size: problematicIndices.includes(context.dataIndex) ? 11 : 10,
                  weight: 'bold'
                }),
                color: (context) => problematicIndices.includes(context.dataIndex) ? '#FFFFFF' : '#4285F4',
                backgroundColor: (context) => problematicIndices.includes(context.dataIndex) ? '#4285F4' : 'transparent',
                borderRadius: 4,
                padding: (context) => problematicIndices.includes(context.dataIndex) ? 4 : 0
              }
            },
            {
              label: this.$t('casual_labour_wage'),
              data: validData.map(d => d.unskilled_labour_wage),
              borderColor: '#EA4335',
              backgroundColor: 'rgba(234, 67, 53, 0.3)',
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: validData.map((_, i) => problematicIndices.includes(i) ? '#F44336' : '#EA4335'),
              pointBorderColor: validData.map((_, i) => problematicIndices.includes(i) ? '#FFFFFF' : '#EA4335'),
              pointBorderWidth: validData.map((_, i) => problematicIndices.includes(i) ? 3 : 1),
              pointStyle: validData.map((_, i) => problematicIndices.includes(i) ? 'rectRot' : 'circle'),
              tension: 0.4,
              fill: true,
              datalabels: {
                display: true,
                align: 'top',
                anchor: 'end',
                offset: 4,
                formatter: (value) => {
                  if (value === null || value === undefined) return '';
                  return Math.round(value).toLocaleString('en-US');
                },
                font: (context) => ({
                  size: problematicIndices.includes(context.dataIndex) ? 11 : 10,
                  weight: 'bold'
                }),
                color: (context) => problematicIndices.includes(context.dataIndex) ? '#FFFFFF' : '#EA4335',
                backgroundColor: (context) => problematicIndices.includes(context.dataIndex) ? '#EA4335' : 'transparent',
                borderRadius: 4,
                padding: (context) => problematicIndices.includes(context.dataIndex) ? 4 : 0
              }
            },
            {
              label: this.$t('skilled_labour_wage'),
              data: validData.map(d => d.skilled_labour_wage),
              borderColor: '#00B050',
              backgroundColor: 'rgba(0, 176, 80, 0.3)',
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              tension: 0.4,
              fill: true,
              datalabels: {
                display: true,
                align: 'top',
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
                color: '#00B050'
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
              top: 10
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
                    label += Math.round(context.parsed.y).toLocaleString('en-US') + ' ' + this.$t('tjs');
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
                text: this.$t('markets'),
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
                display: false
              }
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
                text: this.$t('tjs'),
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
            }
          }
        }
      });
    },

    updateChart() {
      if (!this.chartInstance) return;

      // Filter out markets with no data
      const validData = this.regionalData.filter(d => d.food_basket_cost > 0);

      // Recalculate problematic markets
      const problematicIndices = validData.map((d, index) => {
        const basketCost = d.food_basket_cost;
        const wage = d.unskilled_labour_wage;

        if (wage === null || wage === undefined || wage === 0) return false;

        if (basketCost > wage || basketCost > (wage * 0.75)) {
          return index;
        }
        return false;
      }).filter(idx => idx !== false);

      // Update data and labels
      this.chartInstance.data.labels = validData.map(d => d.market_name);
      this.chartInstance.data.datasets[0].data = validData.map(d => d.food_basket_cost);
      this.chartInstance.data.datasets[1].data = validData.map(d => d.unskilled_labour_wage);
      this.chartInstance.data.datasets[2].data = validData.map(d => d.skilled_labour_wage);

      // Update point styles for food basket cost (dataset 0)
      this.chartInstance.data.datasets[0].pointBackgroundColor = validData.map((_, i) => problematicIndices.includes(i) ? '#F44336' : '#4285F4');
      this.chartInstance.data.datasets[0].pointBorderColor = validData.map((_, i) => problematicIndices.includes(i) ? '#FFFFFF' : '#4285F4');
      this.chartInstance.data.datasets[0].pointBorderWidth = validData.map((_, i) => problematicIndices.includes(i) ? 3 : 1);
      this.chartInstance.data.datasets[0].pointStyle = validData.map((_, i) => problematicIndices.includes(i) ? 'rectRot' : 'circle');

      // Update point styles for casual labour wage (dataset 1)
      this.chartInstance.data.datasets[1].pointBackgroundColor = validData.map((_, i) => problematicIndices.includes(i) ? '#F44336' : '#EA4335');
      this.chartInstance.data.datasets[1].pointBorderColor = validData.map((_, i) => problematicIndices.includes(i) ? '#FFFFFF' : '#EA4335');
      this.chartInstance.data.datasets[1].pointBorderWidth = validData.map((_, i) => problematicIndices.includes(i) ? 3 : 1);
      this.chartInstance.data.datasets[1].pointStyle = validData.map((_, i) => problematicIndices.includes(i) ? 'rectRot' : 'circle');

      this.chartInstance.update();
    }
  }
};
</script>

<style scoped>
.regional-wage-chart-container {
  position: relative;
  width: 100%;
  height: 300px;
}

@media (min-width: 576px) and (max-width: 767px) {
  .regional-wage-chart-container {
    height: 240px;
  }
}

@media print {
  .regional-wage-chart-container {
    height: 162pt !important;
    max-height: 162pt !important;
    width: 100% !important;
    max-width: 100% !important;
    page-break-inside: avoid;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .regional-wage-chart-container canvas {
    max-width: 100% !important;
    max-height: 162pt !important;
    height: 162pt !important;
    width: 100% !important;
  }
}
</style>
