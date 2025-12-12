<template>
  <div class="historical-trends-chart-container">
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
  Legend
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
  ChartDataLabels
);

export default {
  name: 'HistoricalTrendsChart',

  props: {
    historicalData: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      chartInstance: null
    };
  },

  watch: {
    historicalData: {
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
    /**
     * Localize month names from English to current locale
     * Converts "Jul 2022" to localized format like "Июль 2022"
     */
    localizeMonthLabel(englishLabel) {
      if (!englishLabel) return '';

      // Map English month abbreviations to translation keys
      const monthMap = {
        'Jan': 'Jan',
        'Feb': 'Feb',
        'Mar': 'March',
        'Apr': 'April',
        'May': 'May',
        'Jun': 'June',
        'Jul': 'July',
        'Aug': 'Aug',
        'Sep': 'Sep',
        'Oct': 'Oct',
        'Nov': 'Nov',
        'Dec': 'Dec'
      };

      // Parse the label (format: "Jul 2022")
      const parts = englishLabel.split(' ');
      if (parts.length !== 2) return englishLabel;

      const [monthAbbr, year] = parts;
      const translationKey = monthMap[monthAbbr];

      if (!translationKey) return englishLabel;

      // Return localized month + year
      return `${this.$t(translationKey)} ${year}`;
    },

    initChart() {
      if (!this.historicalData || !this.historicalData.series || !this.historicalData.dates) {
        return;
      }

      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Include all series (wheat flour, vegetable oil, sugar, exchange rate)
      const series = this.historicalData.series;

      // Define colors for each product
      const colors = [
        '#1976D2', // Blue for wheat flour
        '#F57C00', // Orange for vegetable oil
        '#388E3C', // Green for sugar
        '#D32F2F'  // Red for exchange rate
      ];

      // Detect if in print mode
      const isPrintMode = window.matchMedia && window.matchMedia('print').matches;
      const fontSize = isPrintMode ? 10 : 11;
      const titleFontSize = isPrintMode ? 11 : 13;
      const dataLabelFontSize = isPrintMode ? 8 : 10;
      const legendFontSize = isPrintMode ? 10 : 13;

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.historicalData.dates.map(d => this.localizeMonthLabel(d.label)),
          datasets: series.map((s, index) => ({
            label: this.$t(s.product_key),
            data: s.data,
            borderColor: colors[index % colors.length],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.3,
            datalabels: {
              display: true,
              align: 'top',
              anchor: 'end',
              offset: 4,
              formatter: (value) => {
                if (value === null || value === undefined) return '';
                return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              },
              font: {
                size: dataLabelFontSize,
                weight: 'bold'
              },
              color: colors[index % colors.length]
            }
          }))
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
                usePointStyle: true,
                pointStyle: 'line',
                padding: 15,
                font: {
                  size: legendFontSize
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
                    label += Number(context.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + this.$t('tjs');
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
                  size: isPrintMode ? 7 : 10
                },
                autoSkip: false,
                maxTicksLimit: 24
              },
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: this.$t('price') + ' (' + this.$t('tjs') + ')',
                font: {
                  size: titleFontSize
                }
              },
              ticks: {
                callback: (value) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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
      if (!this.chartInstance || !this.historicalData || !this.historicalData.series) {
        return;
      }

      // Include all series (wheat flour, vegetable oil, sugar, exchange rate)
      const series = this.historicalData.series;

      this.chartInstance.data.labels = this.historicalData.dates.map(d => this.localizeMonthLabel(d.label));
      this.chartInstance.data.datasets = series.map((s, index) => {
        const existingDataset = this.chartInstance.data.datasets[index];
        return {
          ...existingDataset,
          label: this.$t(s.product_key),
          data: s.data
        };
      });

      this.chartInstance.update();
    }
  }
};
</script>

<style scoped>
.historical-trends-chart-container {
  position: relative;
  width: 100%;
  height: 350px;
  flex-grow: 1;
}

@media (min-width: 576px) and (max-width: 767px) {
  .historical-trends-chart-container {
    height: 300px;
  }
}

@media (min-width: 768px) {
  .historical-trends-chart-container {
    height: 100%;
    min-height: 400px;
  }
}

@media print {
  .historical-trends-chart-container {
    height: 300pt !important;
    max-height: 300pt !important;
    width: 100% !important;
    max-width: 100% !important;
    page-break-inside: avoid;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .historical-trends-chart-container canvas {
    max-width: 100% !important;
    max-height: 300pt !important;
    height: 300pt !important;
    width: 100% !important;
  }
}
</style>
