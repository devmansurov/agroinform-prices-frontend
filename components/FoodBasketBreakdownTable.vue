<template>
  <div class="food-basket-breakdown-table">
    <div class="table-header-notes">
      <p>{{ $t('annex_1_note_hh_pp') }}</p>
      <p>{{ $t('annex_1_note_nap') }}</p>
    </div>

    <div class="table-wrapper">
      <table class="breakdown-table">
        <thead>
          <tr>
            <th rowspan="3" class="text-center">№</th>
            <th rowspan="3" class="text-left">{{ $t('category') }}</th>
            <th rowspan="3" class="text-left">{{ $t('item') }}</th>
            <th rowspan="3" class="text-center">{{ $t('unit') }}</th>
            <th colspan="2" rowspan="2" class="text-center">{{ $t('qty_per_month') }}</th>
            <th colspan="2" rowspan="2" class="text-center">{{ $t('nap') }}</th>
            <th colspan="4" class="text-center">{{ $t('total') }}</th>
          </tr>
          <tr>
            <th colspan="2" class="text-center">{{ $t('pp') }}</th>
            <th colspan="2" class="text-center">{{ $t('hh') }}</th>
          </tr>
          <tr class="unit-row">
            <th class="text-right">{{ $t('pp') }}</th>
            <th class="text-right">{{ $t('hh') }}</th>
            <th class="text-right">{{ $t('tjs') }}</th>
            <th class="text-right">{{ $t('usd') }}</th>
            <th class="text-right">{{ $t('tjs') }}</th>
            <th class="text-right">{{ $t('usd') }}</th>
            <th class="text-right">{{ $t('tjs') }}</th>
            <th class="text-right">{{ $t('usd') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in tableData.products" :key="product.no">
            <td class="text-center">{{ product.no }}</td>
            <td class="text-left">{{ $t(product.category_key) }}</td>
            <td class="text-left">{{ $t(product.product_key) }}</td>
            <td class="text-center">{{ $t(product.unit_key) }}</td>
            <td class="text-right">{{ formatNumber(product.qty_pp, 2) }}</td>
            <td class="text-right">{{ formatNumber(product.qty_hh, 2) }}</td>
            <td class="text-right">{{ formatPrice(product.nap) }}</td>
            <td class="text-right">${{ formatPrice(product.nap_usd) }}</td>
            <td class="text-right">{{ formatCost(product.cost_pp) }}</td>
            <td class="text-right">${{ formatCost(product.cost_pp_usd) }}</td>
            <td class="text-right">{{ formatCost(product.cost_hh) }}</td>
            <td class="text-right">${{ formatCost(product.cost_hh_usd) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="8" class="text-right font-weight-bold">{{ $t('total_fb') }}</td>
            <td class="text-right font-weight-bold">{{ formatCost(tableData.total_pp) }}</td>
            <td class="text-right font-weight-bold">${{ formatCost(tableData.total_pp_usd) }}</td>
            <td class="text-right font-weight-bold">{{ formatCost(tableData.total_hh) }}</td>
            <td class="text-right font-weight-bold">${{ formatCost(tableData.total_hh_usd) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="table-footer-note">
      <p>{{ $t('note_food_basket') }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodBasketBreakdownTable',

  props: {
    tableData: {
      type: Object,
      required: true,
      default: () => ({
        products: [],
        total_pp: 0,
        total_hh: 0
      })
    }
  },

  methods: {
    formatNumber(value, decimals = 2) {
      if (value === null || value === undefined) return '-';
      return parseFloat(value).toFixed(decimals);
    },

    formatPrice(value) {
      if (value === null || value === undefined) return '-';
      return parseFloat(value).toFixed(2);
    },

    formatCost(value) {
      if (value === null || value === undefined) return '-';
      return value < 1 ? value : Math.round(value);
    }
  }
};
</script>

<style scoped>
.food-basket-breakdown-table {
  margin: 20px 0;
}

.table-header-notes {
  margin-bottom: 15px;
  font-size: 10px;
  line-height: 1.5;
}

.table-header-notes p {
  margin: 5px 0;
  font-weight: bold;
}

.table-wrapper {
  overflow-x: auto;
  margin: 15px 0;
}

.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  background: white;
}

.breakdown-table th,
.breakdown-table td {
  border: 1px solid #dee2e6;
  padding: 6px 4px;
  vertical-align: middle;
}

.breakdown-table thead th {
  background-color: #007dbc;
  color: white;
  font-weight: bold;
  white-space: nowrap;
}

.breakdown-table thead tr:first-child th {
  background-color: #007dbc;
  color: white;
}

.breakdown-table thead .unit-row th {
  background-color: #007dbc;
  color: white;
  font-size: 9px;
  padding: 4px 4px;
}

.breakdown-table tbody tr:hover {
  background-color: #f8f9fa;
}

.breakdown-table tbody td {
  font-size: 10px;
}

.breakdown-table tfoot .total-row {
  background-color: #007dbc;
  color: white;
  font-weight: bold;
}

.breakdown-table tfoot .total-row td {
  padding: 8px 4px;
  border-top: 2px solid #adb5bd;
}

.text-left {
  text-align: left !important;
}

.text-center {
  text-align: center !important;
}

.text-right {
  text-align: right !important;
}

.font-weight-bold {
  font-weight: bold;
}

.table-footer-note {
  margin-top: 15px;
  font-size: 10px;
  line-height: 1.6;
  color: #6c757d;
}

.table-footer-note p {
  margin: 5px 0;
}

/* Responsive breakpoints */
@media (min-width: 576px) {
  .table-header-notes {
    font-size: 11px;
  }

  .breakdown-table {
    font-size: 9px;
  }

  .breakdown-table tbody td {
    font-size: 9px;
  }

  .breakdown-table thead .unit-row th {
    font-size: 8px;
  }

  .table-footer-note {
    font-size: 9px;
  }
}

@media (min-width: 768px) {
  .table-header-notes {
    font-size: 12px;
  }

  .breakdown-table {
    font-size: 11px;
  }

  .breakdown-table th,
  .breakdown-table td {
    padding: 8px 6px;
  }

  .breakdown-table tbody td {
    font-size: 11px;
  }

  .breakdown-table thead .unit-row th {
    font-size: 9px;
    padding: 4px 6px;
  }

  .breakdown-table tfoot .total-row td {
    padding: 10px 6px;
  }

  .table-footer-note {
    font-size: 11px;
  }
}

@media (min-width: 1024px) {
  .breakdown-table {
    font-size: 12px;
  }

  .breakdown-table tbody td {
    font-size: 12px;
  }

  .breakdown-table thead .unit-row th {
    font-size: 10px;
  }

  .table-footer-note {
    font-size: 12px;
  }
}

@media (min-width: 1280px) {
  .table-header-notes {
    font-size: 13px;
  }

  .breakdown-table {
    font-size: 13px;
  }

  .breakdown-table tbody td {
    font-size: 13px;
  }

  .breakdown-table thead .unit-row th {
    font-size: 11px;
  }

  .table-footer-note {
    font-size: 13px;
  }
}

@media (min-width: 1440px) {
  .table-header-notes {
    font-size: 14px;
  }

  .breakdown-table {
    font-size: 14px;
  }

  .breakdown-table th,
  .breakdown-table td {
    padding: 8px 8px;
  }

  .breakdown-table tbody td {
    font-size: 14px;
  }

  .breakdown-table thead .unit-row th {
    font-size: 12px;
  }

  .table-footer-note {
    font-size: 14px;
  }
}

@media (min-width: 1920px) {
  .table-header-notes {
    font-size: 15px;
  }

  .breakdown-table {
    font-size: 16px;
  }

  .breakdown-table tbody td {
    font-size: 16px;
  }

  .breakdown-table thead .unit-row th {
    font-size: 14px;
  }

  .table-footer-note {
    font-size: 16px;
  }
}

/* Print styles */
@media print {
  .food-basket-breakdown-table {
    page-break-inside: avoid;
  }

  .breakdown-table {
    font-size: 6pt;
  }

  .breakdown-table th,
  .breakdown-table td {
    padding: 3pt 2pt;
  }

  .breakdown-table tbody td {
    font-size: 6pt;
  }

  .breakdown-table thead .unit-row th {
    font-size: 5pt;
  }

  .table-header-notes {
    font-size: 7pt;
  }

  .table-footer-note {
    font-size: 7pt;
  }
}
</style>
