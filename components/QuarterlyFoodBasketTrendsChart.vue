<template>
  <div class="fb-trends-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'QuarterlyFoodBasketTrendsChart',

  props: {
    trendsData: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  data() {
    return {
      chart: null
    };
  },

  watch: {
    trendsData: {
      handler() {
        this.renderChart();
      },
      deep: true
    }
  },

  mounted() {
    this.renderChart();
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },

  methods: {
    renderChart() {
      if (!this.trendsData || this.trendsData.length === 0) {
        return;
      }

      // Destroy existing chart
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Extract labels and data
      const labels = this.trendsData.map(item => item.month_label);
      const costs = this.trendsData.map(item => item.cost || 0);

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Food Basket Cost (TJS)',
            data: costs,
            borderColor: '#009688',
            backgroundColor: 'rgba(0, 150, 136, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += context.parsed.y.toFixed(2) + ' TJS';
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Cost (TJS)'
              },
              ticks: {
                callback: function(value) {
                  return value.toFixed(0);
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.fb-trends-chart {
  width: 100%;
  height: 400px;
  margin: 20px 0;
}
</style>
