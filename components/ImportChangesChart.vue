<template>
  <div class="import-changes-chart-container">
    <h4 v-if="title" class="chart-title">{{ title }}</h4>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default {
  name: 'ImportChangesChart',

  props: {
    chartData: {
      type: Array,
      required: true,
      default: () => []
    },
    dataType: {
      type: String,
      default: 'quantity',
      validator: (value) => ['quantity', 'amount'].includes(value)
    },
    locale: {
      type: String,
      default: 'en'
    },
    title: {
      type: String,
      default: ''
    },
    translationPrefix: {
      type: String,
      default: 'commodity_'
    }
  },

  data() {
    return {
      chartInstance: null
    };
  },

  computed: {
    labels() {
      return this.chartData.map(item => this.$t(this.translationPrefix + item.commodity_key));
    },

    threeMonthsData() {
      if (this.dataType === 'quantity') {
        return this.chartData.map(item => item.three_months_qty_change || 0);
      }
      return this.chartData.map(item => item.three_months_amt_change || 0);
    },

    oneYearData() {
      if (this.dataType === 'quantity') {
        return this.chartData.map(item => item.one_year_qty_change || 0);
      }
      return this.chartData.map(item => item.one_year_amt_change || 0);
    },

    unitLabel() {
      return this.dataType === 'quantity' ? this.$t('tmt') : this.$t('mln_usd');
    },

    legendLabels() {
      return {
        threeMonths: `${this.$t('three_months_ago')}, ${this.unitLabel}*`,
        oneYear: `${this.$t('one_year_ago')}, ${this.unitLabel}*`
      };
    }
  },

  watch: {
    chartData: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    dataType() {
      this.updateChart();
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },

  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },

  methods: {
    initChart() {
      if (!this.$refs.chartCanvas) return;

      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Calculate max value for proper scaling
      const allValues = [...this.threeMonthsData, ...this.oneYearData];
      const maxVal = Math.max(...allValues.map(v => Math.abs(v)));
      const minVal = Math.min(...allValues);

      // Add padding to max
      const suggestedMax = Math.ceil(maxVal * 1.15);
      const suggestedMin = minVal < 0 ? Math.floor(minVal * 1.15) : 0;

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: this.legendLabels.threeMonths,
              data: this.threeMonthsData,
              backgroundColor: '#4472C4',
              borderColor: '#4472C4',
              borderWidth: 1,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            },
            {
              label: this.legendLabels.oneYear,
              data: this.oneYearData,
              backgroundColor: '#FFC000',
              borderColor: '#FFC000',
              borderWidth: 1,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              right: 60
            }
          },
          scales: {
            x: {
              min: suggestedMin,
              max: suggestedMax,
              grid: {
                color: '#e0e0e0',
                drawBorder: true
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                },
                font: {
                  size: 11
                }
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'rect',
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + context.raw + '%';
                }
              }
            },
            datalabels: {
              anchor: function(context) {
                const value = context.dataset.data[context.dataIndex];
                return value >= 0 ? 'end' : 'start';
              },
              align: function(context) {
                const value = context.dataset.data[context.dataIndex];
                return value >= 0 ? 'end' : 'start';
              },
              offset: 4,
              formatter: function(value) {
                return value + '%';
              },
              font: {
                size: 11,
                weight: 'normal'
              },
              color: function(context) {
                return context.dataset.backgroundColor;
              }
            }
          }
        }
      });
    },

    updateChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      this.$nextTick(() => {
        this.initChart();
      });
    }
  }
};
</script>

<style scoped>
.import-changes-chart-container {
  width: 100%;
  margin: 20px 0;
}

.import-changes-chart-container .chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #2E75B6;
  text-align: center;
  margin: 0 0 16px 0;
}

.import-changes-chart-container canvas {
  width: 100% !important;
  height: 350px !important;
}
</style>
