<template>
  <div class="weekly-report-page" :class="`locale-${$i18n.locale.split('-')[0]}`">
    <div class="container">
      <!-- Print-only header with date and selected products -->
      <header v-if="weekNumber && selectedYear" class="print-header">
        <div class="print-date-info">
          <strong>{{ $t('reporting_period') }}:</strong>
          {{ formatMonth(selectedMonth) }} {{ selectedYear }}, {{ $t('week') }} {{ weekNumber }}
        </div>
        <div class="print-products-info">
          <strong>{{ $t('selected_products') }}:</strong>
          {{ getSelectedProductNames() }}
        </div>
      </header>

      <!-- Filters -->
      <section class="filters-section">
        <button class="filters-toggle" @click="filterPanel = !filterPanel">
          <span>{{ $t('filter') }}</span>
          <span class="toggle-icon">{{ filterPanel ? '−' : '+' }}</span>
        </button>
        <div v-show="filterPanel" class="filters-content">
          <div class="filters-grid">
            <div class="filter-item">
              <v-select
                :label="$t('year') + ' *'"
                v-model="selectedYear"
                :items="availableYears"
                outlined
                dense
                hide-details
                required
                :loading="loadingYear"
                @change="onYearChange"
              ></v-select>
            </div>
            <div class="filter-item">
              <v-select
                :label="$t('month') + ' *'"
                v-model="selectedMonth"
                :items="availableMonthsFormatted"
                item-text="name"
                item-value="value"
                outlined
                dense
                hide-details
                required
                :disabled="!selectedYear"
                :loading="loadingMonth"
                @change="onMonthChange"
              ></v-select>
            </div>
            <div class="filter-item">
              <v-select
                :label="$t('week') + ' *'"
                v-model="weekNumber"
                :items="availableWeeks"
                item-text="formatted_date"
                item-value="week_number"
                outlined
                dense
                hide-details
                required
                :disabled="!selectedYear || !selectedMonth"
                :loading="loadingWeek"
                @change="onWeekChange"
              ></v-select>
            </div>
            <div class="filter-item filter-products-item">
              <v-combobox
                :label="$t('select_products') + ' *'"
                v-model="selectedProductsObjects"
                :items="availableProducts"
                item-text="name"
                item-value="id"
                multiple
                outlined
                dense
                hide-details
                small-chips
                required
                :disabled="!selectedYear || !selectedMonth || !weekNumber"
                :loading="loadingProducts"
                :error="productsHasError"
                @input="onProductsChange"
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip v-if="index < 3" small>
                    {{ item.name }}
                  </v-chip>
                  <span v-if="index === 3" class="grey--text text-caption">
                    (+{{ selectedProductsObjects.length - 3 }} {{ $t('selected_products').toLowerCase() }})
                  </span>
                </template>
                <template v-slot:append-item v-if="loadingProducts">
                  <div class="px-4 py-2 text-center">
                    <v-progress-circular
                      indeterminate
                      color="teal"
                      :size="20"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-combobox>
            </div>
            <div class="filter-actions">
              <v-btn @click="resetFilter" color="teal lighten-1" class="white--text">
                {{ $t('reset_filter') }}
              </v-btn>
            </div>
          </div>
        </div>
      </section>

      <!-- Selected Products Display -->
      <section class="selected-products-card" v-if="selectedProducts.length > 0">
        <h3 class="card-title">
          {{ $t('selected_products') }} ({{ selectedProducts.length }})
        </h3>
        <div class="card-content">
          <div class="products-grid">
            <div class="products-column" v-for="(column, index) in productColumns" :key="index">
              <ol :start="column.startNumber">
                <li v-for="(product, i) in column.items" :key="i">
                  {{ product.name }}<span v-if="product.unit">, {{ product.unit }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading Bar -->
      <div v-if="loading" class="loading-bar">
        <v-progress-linear
          indeterminate
          color="yellow darken-2"
        ></v-progress-linear>
      </div>

      <!-- WFP Report Layout -->
      <div class="wfp-report-header">
        <!-- Left Column: Metadata -->
        <div class="report-metadata">
          <div class="country-name">{{ countryName().toUpperCase() }}</div>
          <div v-if="weekNumber" class="issue-number">{{ $t('issue') }}{{ weekNumber }}</div>
          <div v-if="getWeekPeriod()" class="week-period">{{ getWeekPeriod() }}</div>
          <div v-if="weekNumber && selectedYear" class="week-year">{{ $t('week_number', { week: weekNumber, year: selectedYear }) }}</div>
        </div>

        <!-- Right Column: Report Title -->
        <div class="report-title">
          {{ $t('weekly_market_report') }}
        </div>
      </div>

      <!-- WFP Report Content -->
      <div class="wfp-report-content">
        <!-- Left Column: WFP Banner -->
        <div class="wfp-banner-column">
          <img src="/wfp-logo.svg" alt="WFP" class="wfp-banner" />
          <div class="wfp-taglines-wrapper">
            <p class="wfp-tagline">SAVING<br>LIVES</p>
            <p class="wfp-tagline">CHANGING<br>LIVES</p>
          </div>
        </div>

        <!-- Right Column: Data Tables -->
        <div class="report-data-column">
          <!-- National Summary Section -->
      <section class="national-summary-section">
        <h2 class="section-title">
          {{ $t('national_level') }}: {{ $t('wages_and_purchasing_power') }}
        </h2>
        <div v-if="loadingNationalSummary" class="loading-spinner-container">
          <v-progress-circular
            indeterminate
            color="teal"
            :size="50"
          ></v-progress-circular>
        </div>
        <div v-else-if="nationalSummaryData.length > 0" class="table-wrapper">
        <table class="national-summary-table">
          <thead>
            <tr>
              <th class="period-header">{{ $t('period') }}</th>
              <th class="text-center font-weight-bold currency-header">&nbsp;</th>
              <th class="text-right font-weight-bold currency-header">{{ $t('tjs') }}</th>
              <th class="text-right font-weight-bold currency-header">{{ $t('usd') }}</th>
              <th class="text-right font-weight-bold currency-header">%</th>
              <th class="text-center font-weight-bold currency-header">&nbsp;</th>
              <th class="text-right font-weight-bold currency-header">{{ $t('tjs') }}</th>
              <th class="text-right font-weight-bold currency-header">{{ $t('usd') }}</th>
              <th class="text-right font-weight-bold currency-header">%</th>
              <th class="text-center font-weight-bold currency-header">&nbsp;</th>
              <th class="text-right font-weight-bold currency-header">{{ $t('baskets') }}</th>
              <th class="text-right font-weight-bold currency-header">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in nationalSummaryData" :key="index" class="period-row">
              <!-- Period column - Left aligned -->
              <td class="period-cell" :style="{ fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                {{ item.period }}
              </td>

              <!-- Food Basket Icon column (rowspan for first row only) -->
              <td v-if="index === 0" :rowspan="nationalSummaryData.length" class="icon-column">
                <div class="metric-icon-cell">
                  <div class="metric-title">{{ $t('food_basket') }}</div>
                  <img src="/icons/food-basket-icon.jpg" :alt="$t('food_basket')" class="metric-icon" />
                </div>
              </td>

              <!-- Food Basket TJS -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.foodBasketChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                {{ formatNumber(item.foodBasketTjs) }}
              </td>

              <!-- Food Basket USD -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.foodBasketChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                {{ item.foodBasketUsd !== null ? '$' + formatNumber(item.foodBasketUsd, 2) : '-' }}
              </td>

              <!-- Food Basket Change % -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.foodBasketChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                <span v-if="item.foodBasketChange !== null">{{ item.foodBasketChange > 0 ? '+' : '' }}{{ item.foodBasketChange }}% <span v-html="getTrendIcon(item.foodBasketChange)"></span></span>
              </td>

              <!-- Wage Icon column (rowspan for first row only) -->
              <td v-if="index === 0" :rowspan="nationalSummaryData.length" class="icon-column">
                <div class="metric-icon-cell">
                  <div class="metric-title">{{ $t('temporary_wage') }}</div>
                  <img src="/icons/wage-icon.jpg" :alt="$t('temporary_wage')" class="metric-icon" />
                </div>
              </td>

              <!-- Wage TJS -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.wageChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                {{ formatNumber(item.wageTjs) }}
              </td>

              <!-- Wage USD -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.wageChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                {{ item.wageUsd !== null ? '$' + formatNumber(item.wageUsd, 2) : '-' }}
              </td>

              <!-- Wage Change % -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.wageChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                <span v-if="item.wageChange !== null">{{ item.wageChange > 0 ? '+' : '' }}{{ item.wageChange }}% <span v-html="getTrendIcon(item.wageChange)"></span></span>
              </td>

              <!-- Purchasing Power Icon column (rowspan for first row only) -->
              <td v-if="index === 0" :rowspan="nationalSummaryData.length" class="icon-column">
                <div class="metric-icon-cell">
                  <div class="metric-title">{{ $t('purchasing_power') }}</div>
                  <img src="/icons/purchasing-power-icon.jpg" :alt="$t('purchasing_power')" class="metric-icon" />
                </div>
              </td>

              <!-- Purchasing Power -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.purchasingPowerChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                {{ formatNumber(item.purchasingPower, 2) }}
              </td>

              <!-- Purchasing Power Change % -->
              <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(item.purchasingPowerChange), fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' } : { fontWeight: item.period === $t('current_week') ? 'bold' : 'normal' }">
                <span v-if="item.purchasingPowerChange !== null">{{ item.purchasingPowerChange > 0 ? '+' : '' }}{{ item.purchasingPowerChange }}% <span v-html="getTrendIcon(item.purchasingPowerChange)"></span></span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div v-else class="alert alert-info" role="alert">
          {{ $t('no_national_summary_data') }}
        </div>
      </section>

      <!-- Food Basket Price Trends Section -->
      <section class="trends-section">
        <h2 class="section-title">
          {{ $t('food_basket_price_trends') }}
        </h2>

        <div class="chart-wrapper">
          <div v-if="loadingTrends" class="loading-spinner-container">
            <v-progress-circular
              indeterminate
              color="teal"
              :size="50"
            ></v-progress-circular>
          </div>
          <div v-else-if="trendsData.length > 0" class="trends-chart">
            <trends-chart
              :trendsData="trendsData"
              :locale="$i18n.locale"
            ></trends-chart>
          </div>
          <div
            v-else
            class="alert alert-info"
            role="alert"
          >
            {{ $t('no_food_basket_trends_data') }}
          </div>
        </div>
      </section>

      <!-- Regional Wage and Purchasing Power Section -->
      <section class="regional-wage-section">
        <h2 class="section-title">
          {{ $t('regional_wage_purchasing_power') }}
        </h2>

        <div class="chart-wrapper">
          <div v-if="loadingRegionalWage" class="loading-spinner-container">
            <v-progress-circular
              indeterminate
              color="teal"
              :size="50"
            ></v-progress-circular>
          </div>
          <div v-else-if="regionalWageData.length > 0" class="regional-wage-chart">
            <regional-wage-chart
              :regionalData="regionalWageData"
              :locale="$i18n.locale"
            ></regional-wage-chart>
          </div>
          <div
            v-else
            class="alert alert-info"
            role="alert"
          >
            {{ $t('no_regional_wage_data') }}
          </div>
        </div>
      </section>

        </div>
      </div>

      <!-- Horizontal Metadata Bar -->
      <div v-if="isFilterValid && getHorizontalMetadata()" class="horizontal-metadata-bar">
        <span>{{ getHorizontalMetadata() }}</span>
      </div>

      <!-- National Price Trends Section -->
      <div v-if="isFilterValid" class="price-trends-content">
        <!-- Left Column: Exchange Rates and Energy Prices -->
        <div class="energy-prices-column">
          <!-- Exchange Rate Section - Display First -->
          <h2 class="section-title energy-section-title">
            {{ $t('exchange_rate') }}
          </h2>
          <div v-if="loadingExchangeRates" class="loading-spinner-container">
            <v-progress-circular
              indeterminate
              color="teal"
              :size="50"
            ></v-progress-circular>
          </div>
          <div v-else-if="exchangeRatesData && exchangeRatesData.rates">
            <table class="energy-prices-table exchange-rate-table">
              <thead>
                <!-- Headers row -->
                <tr>
                  <th class="text-right font-weight-bold currency-header">{{ $t('tjs') }}</th>
                  <th class="text-right font-weight-bold currency-header">%</th>
                </tr>
              </thead>
              <tbody>
                <!-- Exchange rate rows - always show 6 rows -->
                <tr v-for="index in 6"
                    :key="`exchange-rate-${index}`"
                    class="energy-product-row">
                  <template v-if="priceTrendsPeriods[index - 1] && (exchangeRatesData.rates[priceTrendsPeriods[index - 1].key] !== null || exchangeRatesData.changes[priceTrendsPeriods[index - 1].key] !== null)">
                    <!-- Exchange Rate TJS -->
                    <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(exchangeRatesData.changes[priceTrendsPeriods[index - 1].key] * 100), fontWeight: index === 1 ? 'bold' : 'normal' } : { fontWeight: index === 1 ? 'bold' : 'normal' }">
                      {{ exchangeRatesData.rates[priceTrendsPeriods[index - 1].key] !== null ? formatNumber(exchangeRatesData.rates[priceTrendsPeriods[index - 1].key], 2) : (index === 1 ? '' : '-') }}
                    </td>

                    <!-- Change % -->
                    <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(exchangeRatesData.changes[priceTrendsPeriods[index - 1].key] * 100), fontWeight: index === 1 ? 'bold' : 'normal' } : { fontWeight: index === 1 ? 'bold' : 'normal' }">
                      <span v-if="exchangeRatesData.changes[priceTrendsPeriods[index - 1].key] !== null">
                        {{ (exchangeRatesData.changes[priceTrendsPeriods[index - 1].key] * 100) > 0 ? '+' : '' }}{{ formatNumber(exchangeRatesData.changes[priceTrendsPeriods[index - 1].key] * 100, 1) }}%
                        <span v-html="getTrendIcon(exchangeRatesData.changes[priceTrendsPeriods[index - 1].key] * 100)"></span>
                      </span>
                      <span v-else>{{ index === 1 ? '' : '-' }}</span>
                    </td>
                  </template>
                  <template v-else>
                    <!-- Empty row with dashes (except first row) -->
                    <td class="text-right" :style="{ fontWeight: index === 1 ? 'bold' : 'normal' }">{{ index === 1 ? '' : '-' }}</td>
                    <td class="text-right" :style="{ fontWeight: index === 1 ? 'bold' : 'normal' }">{{ index === 1 ? '' : '-' }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-info" role="alert">
            {{ $t('no_exchange_rate_data') }}
          </div>

          <!-- Energy Prices Section -->
          <h2 class="section-title energy-section-title" style="margin-top: 16px;">
            {{ $t('energy_prices') }}
          </h2>
          <div v-if="loadingEnergyPrices" class="loading-spinner-container">
            <v-progress-circular
              indeterminate
              color="teal"
              :size="50"
            ></v-progress-circular>
          </div>
          <div v-else-if="energyPricesData.length > 0">
            <table class="energy-prices-table" v-for="product in energyPricesData" :key="product.product_key">
              <thead>
                <!-- Product name row -->
                <tr>
                  <th colspan="4" class="energy-product-cell">{{ $t(product.product_key) }}</th>
                </tr>
                <!-- Currency headers row -->
                <tr>
                  <th class="text-center font-weight-bold currency-header">&nbsp;</th>
                  <th class="text-right font-weight-bold currency-header">{{ $t('tjs') }}</th>
                  <th class="text-right font-weight-bold currency-header">{{ $t('usd') }}</th>
                  <th class="text-right font-weight-bold currency-header">%</th>
                </tr>
              </thead>
              <tbody>
                <!-- Price rows for each period -->
                <tr v-for="(period, index) in priceTrendsPeriods" :key="`${product.product_key}-${period.key}`" class="energy-product-row">
                  <!-- Period label icon column -->
                  <td class="text-center">{{ index === 0 ? '' : '' }}</td>

                  <!-- Price TJS -->
                  <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(product.changes[period.key]), fontWeight: index === 0 ? 'bold' : 'normal' } : { fontWeight: index === 0 ? 'bold' : 'normal' }">
                    {{ product.prices_tjs[period.key] !== null ? formatNumber(product.prices_tjs[period.key], 2) : '-' }}
                  </td>

                  <!-- Price USD -->
                  <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(product.changes[period.key]), fontWeight: index === 0 ? 'bold' : 'normal' } : { fontWeight: index === 0 ? 'bold' : 'normal' }">
                    {{ product.prices_usd[period.key] !== null ? '$' + formatNumber(product.prices_usd[period.key], 2) : '-' }}
                  </td>

                  <!-- Change % -->
                  <td class="text-right" :style="useColoredBackground ? { backgroundColor: getCellColor(product.changes[period.key]), fontWeight: index === 0 ? 'bold' : 'normal' } : { fontWeight: index === 0 ? 'bold' : 'normal' }">
                    <span v-if="product.changes[period.key] !== null">
                      {{ product.changes[period.key] > 0 ? '+' : '' }}{{ product.changes[period.key] }}%
                      <span v-html="getTrendIcon(product.changes[period.key])"></span>
                    </span>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-info" role="alert">
            {{ $t('no_energy_prices_data') }}
          </div>
        </div>

        <!-- Right Column: Food Commodities Data -->
        <div class="food-commodities-column">
          <!-- National Price Trends Section -->
      <section class="price-trends-table-section">
        <h2 class="section-title">
          {{ $t('national_price_trends') }}
        </h2>
        <div v-if="loadingNationalPriceTrends" class="loading-spinner-container">
          <v-progress-circular
            indeterminate
            color="teal"
            :size="50"
          ></v-progress-circular>
        </div>
        <div v-else-if="nationalPriceTrendsData.length > 0" class="table-wrapper">
        <table class="national-summary-table national-price-trends">
            <thead>
              <tr>
                <th class="period-header">{{ $t('period') }}</th>
                <template v-for="product in nationalPriceTrendsData">
                  <th :key="`${product.product_key}-icon`" class="text-center font-weight-bold currency-header">&nbsp;</th>
                  <th :key="`${product.product_key}-tjs`" class="text-right font-weight-bold currency-header">{{ $t('tjs') }}</th>
                  <th :key="`${product.product_key}-usd`" class="text-right font-weight-bold currency-header">{{ $t('usd') }}</th>
                  <th :key="`${product.product_key}-change`" class="text-right font-weight-bold currency-header">%</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(period, index) in priceTrendsPeriods" :key="period.key" class="period-row">
                <!-- Period column -->
                <td class="period-cell" :style="{ fontWeight: index === 0 ? 'bold' : 'normal' }">
                  {{ $t(period.label) }}
                </td>

                <!-- Product data with icon columns -->
                <template v-for="product in nationalPriceTrendsData">
                  <!-- Product Icon column (rowspan for first row only) -->
                  <td v-if="index === 0" :key="`${product.product_key}-icon-cell`" :rowspan="priceTrendsPeriods.length" class="icon-column">
                    <div class="metric-icon-cell">
                      <div class="metric-title">{{ $t(product.product_key) }}</div>
                      <img :src="`/icons/${product.product_key.replace('_', '-')}-icon.jpg`" :alt="$t(product.product_key)" class="metric-icon" />
                    </div>
                  </td>

                  <!-- Price TJS -->
                  <td :key="`${product.product_key}-${period.key}-tjs`" class="text-right"
                      :style="useColoredBackground ? { backgroundColor: getCellColor(product.changes[period.key]), fontWeight: index === 0 ? 'bold' : 'normal' } : { fontWeight: index === 0 ? 'bold' : 'normal' }">
                    {{ product.prices_tjs[period.key] !== null ? formatNumber(product.prices_tjs[period.key], 2) : '-' }}
                  </td>

                  <!-- Price USD -->
                  <td :key="`${product.product_key}-${period.key}-usd`" class="text-right"
                      :style="useColoredBackground ? { backgroundColor: getCellColor(product.changes[period.key]), fontWeight: index === 0 ? 'bold' : 'normal' } : { fontWeight: index === 0 ? 'bold' : 'normal' }">
                    {{ product.prices_usd[period.key] !== null ? '$' + formatNumber(product.prices_usd[period.key], 2) : '-' }}
                  </td>

                  <!-- Change % -->
                  <td :key="`${product.product_key}-${period.key}-change`" class="text-right"
                      :style="useColoredBackground ? { backgroundColor: getCellColor(product.changes[period.key]), fontWeight: index === 0 ? 'bold' : 'normal' } : { fontWeight: index === 0 ? 'bold' : 'normal' }">
                    <span v-if="product.changes[period.key] !== null">
                      {{ product.changes[period.key] > 0 ? '+' : '' }}{{ product.changes[period.key] }}%
                      <span v-html="getTrendIcon(product.changes[period.key])"></span>
                    </span>
                    <span v-else>{{ index === 0 ? '' : '-' }}</span>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="alert alert-info" role="alert">
          {{ $t('no_national_price_trends_data') }}
        </div>
      </section>

      <!-- Historical Price Trends Chart -->
      <section class="historical-trends-section">
        <div v-if="loadingHistoricalTrends" class="loading-spinner-container">
          <v-progress-circular
            indeterminate
            color="teal"
            :size="50"
          ></v-progress-circular>
        </div>
        <div v-else-if="historicalTrendsData && historicalTrendsData.series" class="chart-wrapper">
          <historical-trends-chart
            :historicalData="historicalTrendsData"
          ></historical-trends-chart>
        </div>
        <div v-else class="alert alert-info" role="alert">
          {{ $t('no_historical_trends_data') }}
        </div>
      </section>
        </div>
      </div>

      <!-- Horizontal Metadata Bar (Before Market Comparison) -->
      <div v-if="isFilterValid && getHorizontalMetadata()" class="horizontal-metadata-bar">
        <span>{{ getHorizontalMetadata() }}</span>
      </div>

      <!-- Market Comparison Section - Full Width -->
      <section v-if="isFilterValid" class="market-comparison-section">
        <h2 class="section-title">
          {{ $t('weekly_price_changes') }}
        </h2>

        <div v-if="loadingMarketPrices" class="loading-spinner-container">
          <v-progress-circular
            indeterminate
            color="teal"
            :size="50"
          ></v-progress-circular>
        </div>

        <!-- Empty state if no products have data -->
        <div v-else-if="selectedProducts.length > 0 && productsWithData.length === 0"
             class="alert alert-info"
             role="alert">
          {{ $t('no_market_comparison_data') }}
        </div>

            <!-- Market Comparison Table with 3 Products per Group -->
            <template v-else v-for="(productGroup, groupIdx) in getProductGroups()">
              <div :key="`group-${groupIdx}`" class="table-wrapper product-group">
                <table class="market-comparison-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="market-header">{{ marketComparisonHeaders[0].text }}</th>
                    <th v-for="product in productGroup" :key="`header-${product.id}`" colspan="4" class="product-header">
                      {{ product.name }}<span v-if="product.unit">, {{ product.unit }}</span>
                    </th>
                    <!-- Add empty columns to maintain 3-product width -->
                    <th v-for="emptyIdx in (3 - productGroup.length)" :key="`empty-${emptyIdx}`" colspan="4" class="product-header product-header-hidden"></th>
                  </tr>
                  <tr>
                    <template v-for="product in productGroup">
                      <th :key="`${product.id}-cw`" class="period-header">{{ marketComparisonHeaders[1].text }}</th>
                      <th :key="`${product.id}-lw`" class="period-header">{{ marketComparisonHeaders[2].text }}</th>
                      <th :key="`${product.id}-lm`" class="period-header">{{ marketComparisonHeaders[3].text }}</th>
                      <th :key="`${product.id}-ly`" class="period-header">{{ marketComparisonHeaders[4].text }}</th>
                    </template>
                    <!-- Add empty period headers for empty product columns -->
                    <template v-for="emptyIdx in (3 - productGroup.length)">
                      <th :key="`empty-${emptyIdx}-cw`" class="period-header period-header-hidden">&nbsp;</th>
                      <th :key="`empty-${emptyIdx}-lw`" class="period-header period-header-hidden">&nbsp;</th>
                      <th :key="`empty-${emptyIdx}-lm`" class="period-header period-header-hidden">&nbsp;</th>
                      <th :key="`empty-${emptyIdx}-ly`" class="period-header period-header-hidden">&nbsp;</th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(market, marketIdx) in getMarketsForComparison()" :key="`market-${groupIdx}-${market.marketId}-${market.isAverage}`">
                    <td class="market-cell">
                      <strong v-if="market.isAverage">{{ $t('average') }}</strong>
                      <span v-else>{{ market.marketName }}</span>
                    </td>
                    <template v-for="(product, productIdx) in productGroup">
                      <td :key="`${groupIdx}-${marketIdx}-${productIdx}-cw`" :style="{ backgroundColor: getProductMarketCellColor(product.id, market, 'currentWeek') }" :title="!getProductMarketData(product.id, market) ? $t('nd_abbreviation').split(' = ')[1] : (getProductMarketData(product.id, market).currentWeek === null ? $t('os_abbreviation').split(' = ')[1] : '')">
                        <template v-if="!getProductMarketData(product.id, market)">
                          {{ $t('nd_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else-if="getProductMarketData(product.id, market).currentWeek === null">
                          {{ $t('os_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else>
                          {{ formatProductMarketPrice(product.id, market, 'currentWeek') }}
                        </template>
                      </td>
                      <td :key="`${groupIdx}-${marketIdx}-${productIdx}-lw`" :style="{ backgroundColor: getProductMarketCellColor(product.id, market, 'lastWeek') }" :title="!getProductMarketData(product.id, market) ? $t('nd_abbreviation').split(' = ')[1] : (getProductMarketData(product.id, market).lastWeek === null ? $t('os_abbreviation').split(' = ')[1] : '')">
                        <template v-if="!getProductMarketData(product.id, market)">
                          {{ $t('nd_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else-if="getProductMarketData(product.id, market).lastWeek === null">
                          {{ $t('os_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else>
                          {{ formatProductMarketPrice(product.id, market, 'lastWeek') }}
                          <span v-if="getProductMarketChange(product.id, market, 'lastWeek') !== null && getProductMarketChange(product.id, market, 'lastWeek') !== 0">
                            ({{ getProductMarketChange(product.id, market, 'lastWeek') > 0 ? '+' : '' }}{{ getProductMarketChange(product.id, market, 'lastWeek') }}%)
                          </span>
                        </template>
                      </td>
                      <td :key="`${groupIdx}-${marketIdx}-${productIdx}-lm`" :style="{ backgroundColor: getProductMarketCellColor(product.id, market, 'lastMonth') }" :title="!getProductMarketData(product.id, market) ? $t('nd_abbreviation').split(' = ')[1] : (getProductMarketData(product.id, market).lastMonth === null ? $t('os_abbreviation').split(' = ')[1] : '')">
                        <template v-if="!getProductMarketData(product.id, market)">
                          {{ $t('nd_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else-if="getProductMarketData(product.id, market).lastMonth === null">
                          {{ $t('os_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else>
                          {{ formatProductMarketPrice(product.id, market, 'lastMonth') }}
                          <span v-if="getProductMarketChange(product.id, market, 'lastMonth') !== null && getProductMarketChange(product.id, market, 'lastMonth') !== 0">
                            ({{ getProductMarketChange(product.id, market, 'lastMonth') > 0 ? '+' : '' }}{{ getProductMarketChange(product.id, market, 'lastMonth') }}%)
                          </span>
                        </template>
                      </td>
                      <td :key="`${groupIdx}-${marketIdx}-${productIdx}-ly`" :style="{ backgroundColor: getProductMarketCellColor(product.id, market, 'lastYear') }" :title="!getProductMarketData(product.id, market) ? $t('nd_abbreviation').split(' = ')[1] : (getProductMarketData(product.id, market).lastYear === null ? $t('os_abbreviation').split(' = ')[1] : '')">
                        <template v-if="!getProductMarketData(product.id, market)">
                          {{ $t('nd_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else-if="getProductMarketData(product.id, market).lastYear === null">
                          {{ $t('os_abbreviation').split(' = ')[0] }}
                        </template>
                        <template v-else>
                          {{ formatProductMarketPrice(product.id, market, 'lastYear') }}
                          <span v-if="getProductMarketChange(product.id, market, 'lastYear') !== null && getProductMarketChange(product.id, market, 'lastYear') !== 0">
                            ({{ getProductMarketChange(product.id, market, 'lastYear') > 0 ? '+' : '' }}{{ getProductMarketChange(product.id, market, 'lastYear') }}%)
                          </span>
                        </template>
                      </td>
                    </template>
                    <!-- Add empty cells for empty product columns -->
                    <template v-for="emptyIdx in (3 - productGroup.length)">
                      <td :key="`empty-${groupIdx}-${marketIdx}-${emptyIdx}-cw`" class="market-cell-hidden">&nbsp;</td>
                      <td :key="`empty-${groupIdx}-${marketIdx}-${emptyIdx}-lw`" class="market-cell-hidden">&nbsp;</td>
                      <td :key="`empty-${groupIdx}-${marketIdx}-${emptyIdx}-lm`" class="market-cell-hidden">&nbsp;</td>
                      <td :key="`empty-${groupIdx}-${marketIdx}-${emptyIdx}-ly`" class="market-cell-hidden">&nbsp;</td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Horizontal Metadata Bar after every 3rd product group (for print page headers) -->
            <div v-if="(groupIdx + 1) % 3 === 0 && groupIdx < getProductGroups().length - 1"
                 :key="`metadata-${groupIdx}`"
                 class="horizontal-metadata-bar print-page-break-header">
              <span>{{ getHorizontalMetadata() }}</span>
            </div>
          </template>
      </section>

      <!-- Annex 1: Food Basket Breakdown Section (TEMPORARILY HIDDEN) -->
      <section v-if="nationalSummaryData.length > 0" class="annex-1-section">
        <h3 class="section-title">{{ $t('annex_1_title') }}</h3>

        <!-- Loading Spinner -->
        <div v-if="loadingFoodBasketBreakdown" class="loading-container">
          <v-progress-circular
            indeterminate
            color="primary"
            :size="50"
          ></v-progress-circular>
        </div>

        <!-- Food Basket Breakdown Table -->
        <div v-else-if="foodBasketBreakdownTableData && foodBasketBreakdownTableData.products">
          <food-basket-breakdown-table
            :tableData="foodBasketBreakdownTableData"
          ></food-basket-breakdown-table>

          <!-- Food Basket Breakdown Chart -->
          <div v-if="foodBasketBreakdownChartData && foodBasketBreakdownChartData.chart_data" class="chart-container">
            <food-basket-breakdown-chart
              :chartData="foodBasketBreakdownChartData"
            ></food-basket-breakdown-chart>
          </div>
        </div>

        <div v-else class="alert alert-info" role="alert">
          {{ $t('no_data_available') }}
        </div>
      </section>

      <!-- Appendix 2: Methodology and Market Locations Section -->
      <section v-if="nationalSummaryData.length > 0" class="appendix-section">
        <h3 class="appendix-title">{{ $t('appendix_2_title') }}</h3>
        <div class="appendix-content">
          <a :href="getMethodologyFileUrl()" :download="getMethodologyFileName()" class="appendix-download-link">
            {{ $t('download_methodology') }}
          </a>
        </div>
      </section>

      <!-- Abbreviations and Notes Section -->
      <section v-if="nationalSummaryData.length > 0" class="abbreviations-notes-section">
        <div class="abbreviations-notes-row">
          <div class="abbreviations-column">
            <h3 class="subsection-title">{{ $t('abbreviations') }}</h3>
            <div class="abbreviations-list">
              <p>{{ $t('hh_abbreviation') }}</p>
              <p>{{ $t('fb_abbreviation') }}</p>
              <p>{{ $t('os_abbreviation') }}</p>
              <p>{{ $t('nd_abbreviation') }}</p>
            </div>
          </div>

          <div class="notes-column">
            <h3 class="subsection-title">{{ $t('notes') }}</h3>
            <div class="notes-text">
              <p>{{ $t('note_food_basket') }}</p>
              <p>{{ $t('note_wage') }}</p>
              <p>{{ $t('note_purchasing_power') }}</p>
              <p>{{ $t('note_purchasing_power_formula') }}</p>
            </div>
          </div>
        </div>

        <div class="organization-info-row">
          <div class="organization-left">
            <p><strong>{{ $t('wfp_office') }}</strong></p>
            <p>{{ $t('wfp_country_office') }}</p>
            <p>{{ $t('wfp_contact_1') }}</p>
            <p>{{ $t('wfp_contact_2') }}</p>
            <p>{{ $t('wfp_website') }}</p>
          </div>
          <div class="organization-right">
            <p><strong>{{ $t('neksigol_company') }}</strong></p>
            <p>{{ $t('neksigol_contact_1') }}</p>
            <p>{{ $t('neksigol_website') }}</p>
          </div>
        </div>
      </section>

      <!-- Error Notification -->
      <v-snackbar
        v-model="axiosError"
        :timeout="5000"
        color="error"
        top
      >
        {{ axiosErrorMsg }}
        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="axiosError = false"
          >
            {{ $t('close') }}
          </v-btn>
        </template>
      </v-snackbar>

      <!-- Success Notification -->
      <v-snackbar
        v-model="pdfSuccess"
        :timeout="3000"
        color="success"
        top
      >
        {{ pdfSuccessMsg }}
        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="pdfSuccess = false"
          >
            {{ $t('close') }}
          </v-btn>
        </template>
      </v-snackbar>

      <!-- PDF Download Button - Fixed Bottom Right (only show if PDF service is healthy) -->
      <v-tooltip v-if="pdfServiceHealthy" left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            fixed
            bottom
            right
            color="#ca5216"
            dark
            large
            :disabled="isPdfButtonDisabled && !generatingPdf"
            @click="downloadPdfReport"
            class="pdf-download-btn"
            v-bind="attrs"
            v-on="on"
          >
            <v-progress-circular
              v-if="generatingPdf"
              indeterminate
              color="white"
              :size="28"
              :width="3"
            ></v-progress-circular>
            <v-icon v-else>mdi-file-pdf-box</v-icon>
          </v-btn>
        </template>
        <span>{{ generatingPdf ? $t('generating_pdf') : (isPdfButtonDisabled ? $t('pdf_not_available') : $t('download_pdf')) }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import TrendsChart from '~/components/TrendsChart.vue';
import RegionalWageChart from '~/components/RegionalWageChart.vue';
import HistoricalTrendsChart from '~/components/HistoricalTrendsChart.vue';
import FoodBasketBreakdownTable from '~/components/FoodBasketBreakdownTable.vue';
import FoodBasketBreakdownChart from '~/components/FoodBasketBreakdownChart.vue';

export default {
  name: 'WeeklyReport',

  layout: 'clean',

  components: {
    TrendsChart,
    RegionalWageChart,
    HistoricalTrendsChart,
    FoodBasketBreakdownTable,
    FoodBasketBreakdownChart
  },

  head() {
    return {
      title: this.$i18n.t('weekly_market_report')
    };
  },

  data() {
    return {
      loading: false,
      filterPanel: true,
      selectedYear: null,
      selectedMonth: null,
      weekNumber: null,
      axiosError: false,
      axiosErrorMsg: '',
      isRestoringFromUrl: false, // Flag to prevent duplicate API calls during URL restore

      // Saved product IDs for restoration after filter changes
      savedProductIds: [],

      // Loading states for filter fields
      loadingYear: false,
      loadingMonth: false,
      loadingWeek: false,
      loadingProducts: false,

      // Filter options from API
      availableYears: [],
      availableMonths: [],
      availableWeeks: [],

      // Week date range from API
      weekStartDate: null,
      weekEndDate: null,

      // API data
      allProducts: [],
      allMarkets: [],
      marketPricesData: [],
      nationalSummaryData: [],
      trendsData: [],
      regionalWageData: [],
      nationalPriceTrendsData: [],
      energyPricesData: [],
      exchangeRatesData: null,
      historicalTrendsData: null,
      foodBasketBreakdownTableData: null,
      foodBasketBreakdownChartData: null,

      // Selected products (objects for v-combobox)
      selectedProductsObjects: [],

      // Conditional colored backgrounds
      useColoredBackground: false,

      // Section-specific loading states (default false - only show spinners after valid filter selection)
      loadingNationalSummary: false,
      loadingMarketPrices: false,
      loadingTrends: false,
      loadingRegionalWage: false,
      loadingNationalPriceTrends: false,
      loadingEnergyPrices: false,
      loadingExchangeRates: false,
      loadingHistoricalTrends: false,
      loadingFoodBasketBreakdown: false,

      // PDF Generation State
      generatingPdf: false,
      pdfError: false,
      pdfErrorMsg: '',
      pdfSuccess: false,
      pdfSuccessMsg: '',
      pdfServiceHealthy: false
    };
  },

  computed: {
    availableProducts() {
      // Sort products: selected products first, then unselected
      // This makes it easy for users to see and remove selected products
      if (!this.allProducts || this.allProducts.length === 0) {
        return [];
      }

      const selectedIds = this.selectedProductIds;

      return [...this.allProducts].sort((a, b) => {
        const aSelected = selectedIds.includes(a.id);
        const bSelected = selectedIds.includes(b.id);

        // Selected items come first
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;

        // Within same group (both selected or both unselected), maintain original order
        return 0;
      });
    },

    selectedProducts() {
      // Return selected product objects
      return this.selectedProductsObjects;
    },

    selectedProductIds() {
      // Extract IDs from selected product objects
      return this.selectedProductsObjects.map(p => p.id || p);
    },

    availableMonthsFormatted() {
      // Convert month numbers to localized names
      return this.availableMonths.map(monthNum => ({
        value: monthNum,
        name: this.getMonthName(monthNum)
      }));
    },

    nationalSummaryHeaders() {
      return [
        { value: 'period', sortable: false, align: 'start' },
        { value: 'foodBasketTjs', sortable: false, align: 'center' },
        { value: 'foodBasketUsd', sortable: false, align: 'center' },
        { value: 'wageTjs', sortable: false, align: 'center' },
        { value: 'wageUsd', sortable: false, align: 'center' },
        { value: 'purchasingPower', sortable: false, align: 'center' }
      ];
    },

    marketComparisonHeaders() {
      return [
        { text: this.$t('markets'), value: 'market', sortable: false },
        { text: this.$t('current_week'), value: 'currentWeek', sortable: false },
        { text: this.$t('last_week'), value: 'lastWeek', sortable: false },
        { text: this.$t('last_month'), value: 'lastMonth', sortable: false },
        { text: this.$t('last_year'), value: 'lastYear', sortable: false }
      ];
    },

    priceTrendsPeriods() {
      return [
        { key: 'current', label: 'this_week' },
        { key: 'lastWeek', label: 'last_week' },
        { key: 'lastMonth', label: 'last_month' },
        { key: 'threeMonthsAgo', label: 'three_months_ago' },
        { key: 'lastYear', label: 'last_year' },
        { key: 'threeYearsAgo', label: 'three_years_ago' }
      ];
    },

    productsWithData() {
      // Filter selected products that have actual market data
      // Cache this computation to avoid repeated filtering
      return this.selectedProducts.filter(product => {
        const marketData = this.marketPricesData.filter(item => item.productId === product.id);
        return marketData && marketData.length > 0;
      });
    },

    // Cache product groups to avoid recomputation
    productGroups() {
      const groups = [];
      for (let i = 0; i < this.productsWithData.length; i += 3) {
        groups.push(this.productsWithData.slice(i, i + 3));
      }
      return groups;
    },

    // Cache markets for comparison
    marketsForComparison() {
      if (this.allMarkets.length === 0) return [];

      // First, add the Average market (if it exists in marketPricesData)
      const averageMarket = this.marketPricesData.find(item => item.isAverage === true);
      const markets = [];

      if (averageMarket) {
        markets.push({
          marketId: averageMarket.marketId,
          marketName: averageMarket.marketName,
          isAverage: true
        });
      }

      // Then add all markets from allMarkets array
      this.allMarkets.forEach(market => {
        markets.push({
          marketId: market.id,
          marketName: market.name,
          isAverage: false
        });
      });

      return markets;
    },

    productColumns() {
      // Always organize products into 3 columns
      const columns = [];
      const itemsPerCol = 5; // Fixed 5 items per column

      for (let col = 0; col < 3; col++) {
        const startIdx = col * itemsPerCol;
        const items = this.selectedProducts.slice(startIdx, startIdx + itemsPerCol);

        if (items.length > 0) {
          columns.push({
            startNumber: startIdx + 1,
            items: items
          });
        }
      }

      return columns;
    },

    isFilterValid() {
      // All filters must be selected and products must be exactly 15
      return this.selectedYear &&
             this.selectedMonth &&
             this.weekNumber &&
             this.selectedProductsObjects.length === 15;
    },

    productsHasError() {
      // Show error (red border) when products loaded but count is not 15
      // Don't show error while loading or if week not selected
      return !this.loadingProducts &&
             this.weekNumber &&
             this.allProducts.length > 0 &&
             this.selectedProductsObjects.length > 0 &&
             this.selectedProductsObjects.length !== 15;
    },

    isPdfButtonDisabled() {
      // Disable PDF button if:
      // 1. Report data not loaded yet
      // 2. Currently generating PDF
      // 3. Filters not valid
      return !this.nationalSummaryData.length ||
             this.generatingPdf ||
             !this.isFilterValid ||
             this.loading;
    }
  },

  beforeDestroy() {
    // Clear store cache when leaving the page to ensure fresh data when returning
    // This also ensures locale changes get fresh data
    this.$store.commit('clearWeeklyReportState');
  },

  async mounted() {
    // Initialize with current country
    let countryId = this.$cookies.get('country_id');
    if (countryId) {
      this.$store.commit('setCountryID', countryId);

      // Priority 1: Try to restore from store (user navigated back)
      const restoredFromStore = this.restoreStateFromStore();
      if (restoredFromStore) {
        // Update URL to match restored state
        this.updateUrlParams();
        return;
      }

      // Priority 2: Check if we have query params to restore state
      const urlParams = this.$route.query;
      if (urlParams.year || urlParams.month || urlParams.week || urlParams.products) {
        await this.restoreFromQueryParams(urlParams);
      } else {
        // Priority 3: No stored state or query params, start fresh
        this.fetchAvailableYears();
      }
    }
    // Check PDF service health
    this.checkPdfServiceHealth();
  },

  methods: {
    countryName() {
      if (this.$store.state.countryId == 1) return this.$t('tajikistan_menu');
      else if (this.$store.state.countryId == 2) return this.$t('kyrgyzstan');
      else return '';
    },

    async checkPdfServiceHealth() {
      try {
        const response = await this.$axios.get(`${this.$config.pdfServiceURL}/health`, {
          timeout: 5000 // 5 second timeout
        });
        this.pdfServiceHealthy = response.data?.status === 'ok';
      } catch (error) {
        console.warn('PDF service health check failed:', error.message);
        this.pdfServiceHealthy = false;
      }
    },

    async downloadPdfReport() {
      // Reset previous errors and success messages
      this.pdfError = false;
      this.pdfErrorMsg = '';
      this.pdfSuccess = false;
      this.pdfSuccessMsg = '';
      this.generatingPdf = true;

      try {
        // Prepare request payload
        const payload = {
          countryId: this.$store.state.countryId,
          locale: this.$i18n.locale,
          year: this.selectedYear,
          week: this.weekNumber,
          products: this.selectedProductIds,
          page: 'all'  // Always generate full report
        };

        // Call PDF service API
        const response = await this.$axios.post(
          `${this.$config.pdfServiceURL}/reports/weekly`,
          payload
        );

        if (response.status === 200 && response.data.success) {
          // Construct full download URL
          const downloadUrl = `${this.$config.pdfServiceURL}${response.data.url}&locale=${this.$i18n.locale}&year=${this.selectedYear}&week=${this.weekNumber}&page=all`;

          // Download PDF file (instead of opening in new tab)
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = response.data.filename || `weekly-report-${this.$i18n.locale}-${this.selectedYear}-w${this.weekNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Show success message
          this.pdfSuccess = true;
          this.pdfSuccessMsg = this.$t('pdf_generated_successfully');
          setTimeout(() => {
            this.pdfSuccess = false;
          }, 3000);

        } else {
          throw new Error('PDF generation failed');
        }

      } catch (error) {
        // Show error message - use error code for translation if available
        this.pdfError = true;
        const errorCode = error.response?.data?.code;
        if (errorCode) {
          // Try to get translated error message using error code
          const translationKey = `pdf_error_${errorCode}`;
          this.pdfErrorMsg = this.$t(translationKey);
        } else {
          this.pdfErrorMsg = this.$t('pdf_generation_failed');
        }
        this.axiosError = true;
        this.axiosErrorMsg = this.pdfErrorMsg;

        // Auto-hide error after 5 seconds
        setTimeout(() => {
          this.pdfError = false;
          this.axiosError = false;
        }, 5000);

      } finally {
        this.generatingPdf = false;
      }
    },

    getMethodologyFileUrl() {
      const locale = this.$i18n.locale;
      const fileMap = {
        'en': '/downloads/ZZ-Market-Update-TJ-En-Page-10.pdf',
        'ru': '/downloads/ZZ-Market-Update-TJ-Ru-Page-10.pdf',
        'tj': '/downloads/ZZ-Market-Update-TJ-Tj-Page-10.pdf'
      };
      return fileMap[locale] || fileMap['en']; // Fallback to English
    },

    getMethodologyFileName() {
      const locale = this.$i18n.locale;
      const fileMap = {
        'en': 'Methodology-Market-Locations-EN.pdf',
        'ru': 'Metodologiya-Raspolozheniya-Rynkov-RU.pdf',
        'tj': 'Metodologiya-Joygiri-Bozorho-TJ.pdf'
      };
      return fileMap[locale] || fileMap['en'];
    },

    getMonthName(monthNum) {
      const monthNames = [
        this.$t('Jan'), this.$t('Feb'), this.$t('March'), this.$t('April'),
        this.$t('May'), this.$t('June'), this.$t('July'), this.$t('Aug'),
        this.$t('Sep'), this.$t('Oct'), this.$t('Nov'), this.$t('Dec')
      ];
      return monthNames[monthNum - 1] || '';
    },

    formatMonth(monthNum) {
      return this.getMonthName(monthNum);
    },

    getWeekPeriod() {
      // Use dates from API response if available
      if (this.weekStartDate && this.weekEndDate) {
        const start = new Date(this.weekStartDate);
        const end = new Date(this.weekEndDate);

        const monthNames = [
          this.$t('Jan'), this.$t('Feb'), this.$t('March'), this.$t('April'),
          this.$t('May'), this.$t('June'), this.$t('July'), this.$t('Aug'),
          this.$t('Sep'), this.$t('Oct'), this.$t('Nov'), this.$t('Dec')
        ];

        const startMonth = monthNames[start.getMonth()];
        const startDay = start.getDate();
        const endMonth = monthNames[end.getMonth()];
        const endDay = end.getDate();

        if (start.getMonth() === end.getMonth()) {
          return `${startMonth} ${startDay} - ${endDay}, ${start.getFullYear()}`;
        } else {
          return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${start.getFullYear()}`;
        }
      }
      return '';
    },

    getHorizontalMetadata() {
      // Format for horizontal metadata bar: "TAJIKISTAN | Issue №13 | March 21-31 | Week 13 | 2024"
      if (this.weekStartDate && this.weekEndDate) {
        const start = new Date(this.weekStartDate);
        const end = new Date(this.weekEndDate);

        // Use full month names
        const monthNames = [
          'January', 'February', 'March', 'April',
          'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December'
        ];

        const monthNamesTranslated = monthNames.map(m => this.$t(m));

        const startMonth = monthNamesTranslated[start.getMonth()];
        const startDay = start.getDate();
        const endDay = end.getDate();

        const country = this.countryName().toUpperCase();
        const issue = `${this.$t('issue')}${this.weekNumber}`;
        const period = `${startMonth} ${startDay}-${endDay}`;
        const week = `${this.$t('week')} ${this.weekNumber}`;
        const year = this.selectedYear;

        return `${country} | ${issue} | ${period} | ${week} | ${year}`;
      }
      return '';
    },

    async fetchAvailableYears() {
      // Show loading bar during initial data fetch (only if not restoring from URL)
      if (!this.isRestoringFromUrl) {
        this.loading = true;
      }

      try {
        const targetProductIds = [22, 64, 3, 29, 17, 63, 69, 67, 195, 13, 15, 78, 44, 32, 197];

        let yearsResponse = await this.$axios.get(
          `/v1/weekly-report-filters/${this.$store.state.countryId}`
        );

        if (yearsResponse.status == 200) {
          this.availableYears = yearsResponse.data.years || [];

          // Only apply defaults if NOT restoring from URL params
          if (!this.isRestoringFromUrl) {
            // Use the latest available year (max value from array)
            const targetYear = Math.max(...this.availableYears);

            // Set year to latest year
            if (this.availableYears.includes(targetYear)) {
              this.selectedYear = targetYear;
              await this.$nextTick();
              await this.fetchAvailableMonths();

              // Use the latest available month (max value from array)
              const targetMonth = Math.max(...this.availableMonths);

              // Set month to latest month if available
              if (this.availableMonths.includes(targetMonth)) {
                this.selectedMonth = targetMonth;
                await this.$nextTick();
                await this.fetchAvailableWeeks();

                // Get the latest available week (max week_number from array)
                let targetWeek;
                if (this.availableWeeks.length > 0) {
                  // Handle both object and primitive week formats
                  const weekNumbers = this.availableWeeks.map(w =>
                    typeof w === 'object' ? w.week_number : w
                  );
                  targetWeek = Math.max(...weekNumbers);
                }

                // Set week to latest week if available
                const weekExists = this.availableWeeks.some(w =>
                  typeof w === 'object' ? w.week_number === targetWeek : w === targetWeek
                );

                if (weekExists) {
                  this.weekNumber = targetWeek;
                  await this.$nextTick();
                  await this.fetchProductsForWeek();

                  // Auto-select specific 15 products matching the default list
                  if (this.allProducts.length > 0) {
                    const matchingProducts = this.allProducts.filter(p => targetProductIds.includes(p.id));

                    if (matchingProducts.length === 15) {
                      this.selectedProductsObjects = matchingProducts;
                    } else if (this.allProducts.length >= 15) {
                      // Fallback to first 15 if specific products not found
                      this.selectedProductsObjects = this.allProducts.slice(0, 15);
                    }

                    await this.$nextTick();

                    // Update URL with defaults
                    this.updateUrlParams();

                    // Auto-fetch report with defaults
                    if (this.selectedProductsObjects.length === 15) {
                      await this.fetchWeeklyReport();
                    }
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        // Turn off loading after defaults are applied (only if we turned it on)
        if (!this.isRestoringFromUrl) {
          this.loading = false;
        }
      }
    },


    async fetchAvailableMonths() {
      if (!this.selectedYear) return;

      this.loadingMonth = true;

      try {
        let response = await this.$axios.get(
          `/v1/weekly-report-filters/${this.$store.state.countryId}`,
          { params: { year: this.selectedYear } }
        );
        if (response.status == 200) {
          this.availableMonths = response.data.months || [];
        }
      } catch (err) {
        console.error('Error fetching months:', err);
      } finally {
        this.loadingMonth = false;
      }
    },

    async fetchAvailableWeeks() {
      if (!this.selectedYear || !this.selectedMonth) return;

      this.loadingWeek = true;

      try {
        let response = await this.$axios.get(
          `/v1/weekly-report-filters/${this.$store.state.countryId}`,
          { params: { year: this.selectedYear, month: this.selectedMonth } }
        );
        if (response.status == 200) {
          this.availableWeeks = response.data.weeks || [];
        }
      } catch (err) {
        console.error('Error fetching weeks:', err);
      } finally {
        this.loadingWeek = false;
      }
    },

    async fetchProductsForWeek() {
      if (!this.selectedYear || !this.weekNumber) return;

      this.loadingProducts = true;

      try {
        let response = await this.$axios.get(
          `/v1/weekly-report/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber,
              exclude_empty: false // Get all products for selection
            }
          }
        );

        if (response.status == 200) {
          this.allProducts = response.data.products || [];
          this.allMarkets = response.data.markets || [];
        }
      } catch (err) {
        console.error('Error fetching products for week:', err);
        this.allProducts = [];
      } finally {
        this.loadingProducts = false;
      }
    },

    async onYearChange() {
      // Clear all report data FIRST to immediately hide old data from UI
      this.clearAllData();

      // Clear error messages when changing filters
      this.axiosError = false;
      this.axiosErrorMsg = '';

      // Save current product IDs before resetting
      if (this.selectedProductsObjects.length > 0) {
        this.savedProductIds = this.selectedProductsObjects.map(p => p.id || p);
      }

      // Reset cascade: when year changes, clear month, week, and products
      this.selectedMonth = null;
      this.weekNumber = null;
      this.selectedProductsObjects = [];
      this.availableMonths = [];
      this.availableWeeks = [];
      this.allProducts = [];

      if (!this.selectedYear) {
        if (!this.isRestoringFromUrl) this.updateUrlParams();
        return;
      }

      await this.fetchAvailableMonths();

      // Update URL params (only if not restoring from URL)
      if (!this.isRestoringFromUrl) {
        this.updateUrlParams();
      }
    },

    async onMonthChange() {
      // Clear all report data FIRST to immediately hide old data from UI
      this.clearAllData();

      // Clear error messages when changing filters
      this.axiosError = false;
      this.axiosErrorMsg = '';

      // Save current product IDs before resetting
      if (this.selectedProductsObjects.length > 0) {
        this.savedProductIds = this.selectedProductsObjects.map(p => p.id || p);
      }

      // Reset cascade: when month changes, clear week and products
      this.weekNumber = null;
      this.selectedProductsObjects = [];
      this.availableWeeks = [];
      this.allProducts = [];

      if (!this.selectedMonth) {
        if (!this.isRestoringFromUrl) this.updateUrlParams();
        return;
      }

      await this.fetchAvailableWeeks();

      // Update URL params (only if not restoring from URL)
      if (!this.isRestoringFromUrl) {
        this.updateUrlParams();
      }
    },

    async onWeekChange() {
      // Clear all report data FIRST to immediately hide old data from UI
      this.clearAllData();

      // Clear error messages when changing filters
      this.axiosError = false;
      this.axiosErrorMsg = '';

      // Save currently selected product IDs before resetting (if any)
      if (this.selectedProductsObjects.length > 0) {
        this.savedProductIds = this.selectedProductsObjects.map(p => p.id || p);
      }

      // Reset products first (always)
      this.selectedProductsObjects = [];
      this.allProducts = [];

      if (!this.weekNumber) {
        if (!this.isRestoringFromUrl) this.updateUrlParams();
        return;
      }

      // Fetch products for the selected week (shows loading state in combobox)
      await this.fetchProductsForWeek();

      // Auto-select products based on saved product IDs (from any previous selection)
      if (this.savedProductIds.length > 0 && this.allProducts.length > 0) {
        const matchingProducts = this.allProducts.filter(p =>
          this.savedProductIds.includes(p.id)
        );

        if (matchingProducts.length > 0) {
          // Restore matching products (up to 15)
          this.selectedProductsObjects = matchingProducts.slice(0, 15);

          // Show notification if not all products were found
          if (matchingProducts.length < this.savedProductIds.length) {
            const missingCount = this.savedProductIds.length - matchingProducts.length;
            this.axiosError = true;
            this.axiosErrorMsg = this.$t('products_partially_restored', {
              found: matchingProducts.length,
              missing: missingCount
            });
          }

          // Show notification if less than 15 products selected
          if (this.selectedProductsObjects.length < 15) {
            const remaining = 15 - this.selectedProductsObjects.length;
            this.axiosError = true;
            this.axiosErrorMsg = this.$t('please_select_remaining_products', {
              selected: this.selectedProductsObjects.length,
              required: remaining
            });
          } else if (this.selectedProductsObjects.length === 15) {
            // Auto-fetch report when exactly 15 products are restored
            await this.$nextTick();
            await this.fetchWeeklyReport();
          }
        } else {
          // No matching products found, clear selection
          this.selectedProductsObjects = [];
          this.axiosError = true;
          this.axiosErrorMsg = this.$t('no_matching_products_found');
        }
      } else {
        // No previous selection, clear
        this.selectedProductsObjects = [];
      }

      // Update URL params (only if not restoring from URL)
      if (!this.isRestoringFromUrl) {
        this.updateUrlParams();
      }
    },

    clearAllData() {
      // Reset all API data
      this.marketPricesData = [];
      this.nationalSummaryData = [];
      this.trendsData = [];
      this.regionalWageData = [];
      this.nationalPriceTrendsData = [];
      this.energyPricesData = [];
      this.exchangeRatesData = null;
      this.historicalTrendsData = null;
      this.foodBasketBreakdownTableData = null;
      this.foodBasketBreakdownChartData = null;

      // Reset week dates
      this.weekStartDate = null;
      this.weekEndDate = null;

      // Reset section loading states to false (show empty states instead of spinners)
      this.loadingNationalSummary = false;
      this.loadingMarketPrices = false;
      this.loadingTrends = false;
      this.loadingRegionalWage = false;
      this.loadingNationalPriceTrends = false;
      this.loadingEnergyPrices = false;
      this.loadingExchangeRates = false;
      this.loadingHistoricalTrends = false;
    },

    async fetchWeeklyReport() {
      this.loading = true;

      // Set all section loading states to true before fetching
      this.loadingMarketPrices = true;
      this.loadingNationalSummary = true;

      try {
        // Validate that products have been selected
        if (this.selectedProductIds.length === 0) {
          this.axiosError = true;
          this.axiosErrorMsg = this.$t('please_select_products');
          this.loading = false;
          this.loadingMarketPrices = false;
          this.loadingNationalSummary = false;
          return;
        }

        // Update URL params (only if not restoring from URL to prevent duplicate updates)
        if (!this.isRestoringFromUrl) {
          this.updateUrlParams();
        }

        const productParams = this.selectedProductIds.join(',');

        // Call weekly report API for market prices data with selected products
        let response = await this.$axios.get(
          `/v1/weekly-report/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber,
              products: productParams,
              exclude_empty: true
            }
          }
        );

        if (response.status == 200) {
          this.weekStartDate = response.data.week_start_date;
          this.weekEndDate = response.data.week_end_date;
          this.marketPricesData = response.data.marketPrices || [];
          this.loadingMarketPrices = false;
        }

        // Call food-basket-breakdown API for national summary data (uses official basket)
        let foodBasketResponse = await this.$axios.get(
          `/v1/food-basket-breakdown/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber
              // No products parameter - uses all 16 official food basket products
            }
          }
        );

        if (foodBasketResponse.status == 200) {
          // Generate national summary from food basket breakdown data
          this.generateNationalSummary(foodBasketResponse.data.periods);
          this.loadingNationalSummary = false;
        }

        // Fetch all section data in parallel for better performance
        // Using Promise.allSettled to ensure all requests complete even if some fail
        await Promise.allSettled([
          this.fetchTrendsData(),
          this.fetchRegionalWageData(),
          this.fetchNationalPriceTrends(),
          this.fetchEnergyPrices(),
          this.fetchExchangeRates(),
          this.fetchHistoricalTrends(),
          this.fetchFoodBasketBreakdown()
        ]);

        // Save complete state to store for navigation persistence
        this.saveStateToStore();

      } catch (err) {
        this.axiosError = true;
        this.axiosErrorMsg = this.$t('no_data_available');
        console.error(err);
        this.loadingMarketPrices = false;
        this.loadingNationalSummary = false;
      } finally {
        this.loading = false;
      }
    },

    generateNationalSummary(periodsData) {
      // Process national summary data from food basket breakdown API
      if (!periodsData) {
        this.nationalSummaryData = [];
        return;
      }

      // Extract data from periods
      const current = periodsData.currentWeek || {};
      const lastWeek = periodsData.lastWeek || {};
      const lastMonth = periodsData.lastMonth || {};
      const threeMonthsAgo = periodsData.threeMonthsAgo || {};
      const lastYear = periodsData.lastYear || {};
      const threeYearsAgo = periodsData.threeYearsAgo || {};

      // Calculate percentage changes (comparing current to other periods)
      const calculateChange = (current, previous) => {
        if (previous === null || previous === undefined || previous === 0 || current === null || current === undefined) {
          return null;
        }
        return parseFloat((((current - previous) / previous) * 100).toFixed(1));
      };

      // Helper function to extract TJS value from currency object
      const getTjsValue = (obj) => obj && obj.tjs !== undefined ? obj.tjs : null;

      // Helper function to extract USD value from currency object
      const getUsdValue = (obj) => obj && obj.usd !== undefined ? obj.usd : null;

      // Helper function to extract purchasing power value
      const getPowerValue = (obj) => obj && obj.value !== undefined ? obj.value : null;

      this.nationalSummaryData = [
        {
          period: this.$t('current_week'),
          foodBasketTjs: getTjsValue(current.food_basket),
          foodBasketUsd: getUsdValue(current.food_basket),
          foodBasketChange: null,
          wageTjs: getTjsValue(current.wage),
          wageUsd: getUsdValue(current.wage),
          wageChange: null,
          purchasingPower: getPowerValue(current.purchasing_power),
          purchasingPowerChange: null
        },
        {
          period: this.$t('last_week'),
          foodBasketTjs: getTjsValue(lastWeek.food_basket),
          foodBasketUsd: getUsdValue(lastWeek.food_basket),
          foodBasketChange: calculateChange(getTjsValue(current.food_basket), getTjsValue(lastWeek.food_basket)),
          wageTjs: getTjsValue(lastWeek.wage),
          wageUsd: getUsdValue(lastWeek.wage),
          wageChange: calculateChange(getTjsValue(current.wage), getTjsValue(lastWeek.wage)),
          purchasingPower: getPowerValue(lastWeek.purchasing_power),
          purchasingPowerChange: calculateChange(getPowerValue(current.purchasing_power), getPowerValue(lastWeek.purchasing_power))
        },
        {
          period: this.$t('last_month'),
          foodBasketTjs: getTjsValue(lastMonth.food_basket),
          foodBasketUsd: getUsdValue(lastMonth.food_basket),
          foodBasketChange: calculateChange(getTjsValue(current.food_basket), getTjsValue(lastMonth.food_basket)),
          wageTjs: getTjsValue(lastMonth.wage),
          wageUsd: getUsdValue(lastMonth.wage),
          wageChange: calculateChange(getTjsValue(current.wage), getTjsValue(lastMonth.wage)),
          purchasingPower: getPowerValue(lastMonth.purchasing_power),
          purchasingPowerChange: calculateChange(getPowerValue(current.purchasing_power), getPowerValue(lastMonth.purchasing_power))
        },
        {
          period: this.$t('three_months_ago'),
          foodBasketTjs: getTjsValue(threeMonthsAgo.food_basket),
          foodBasketUsd: getUsdValue(threeMonthsAgo.food_basket),
          foodBasketChange: calculateChange(getTjsValue(current.food_basket), getTjsValue(threeMonthsAgo.food_basket)),
          wageTjs: getTjsValue(threeMonthsAgo.wage),
          wageUsd: getUsdValue(threeMonthsAgo.wage),
          wageChange: calculateChange(getTjsValue(current.wage), getTjsValue(threeMonthsAgo.wage)),
          purchasingPower: getPowerValue(threeMonthsAgo.purchasing_power),
          purchasingPowerChange: calculateChange(getPowerValue(current.purchasing_power), getPowerValue(threeMonthsAgo.purchasing_power))
        },
        {
          period: this.$t('last_year'),
          foodBasketTjs: getTjsValue(lastYear.food_basket),
          foodBasketUsd: getUsdValue(lastYear.food_basket),
          foodBasketChange: calculateChange(getTjsValue(current.food_basket), getTjsValue(lastYear.food_basket)),
          wageTjs: getTjsValue(lastYear.wage),
          wageUsd: getUsdValue(lastYear.wage),
          wageChange: calculateChange(getTjsValue(current.wage), getTjsValue(lastYear.wage)),
          purchasingPower: getPowerValue(lastYear.purchasing_power),
          purchasingPowerChange: calculateChange(getPowerValue(current.purchasing_power), getPowerValue(lastYear.purchasing_power))
        },
        {
          period: this.$t('three_years_ago'),
          foodBasketTjs: getTjsValue(threeYearsAgo.food_basket),
          foodBasketUsd: getUsdValue(threeYearsAgo.food_basket),
          foodBasketChange: calculateChange(getTjsValue(current.food_basket), getTjsValue(threeYearsAgo.food_basket)),
          wageTjs: getTjsValue(threeYearsAgo.wage),
          wageUsd: getUsdValue(threeYearsAgo.wage),
          wageChange: calculateChange(getTjsValue(current.wage), getTjsValue(threeYearsAgo.wage)),
          purchasingPower: getPowerValue(threeYearsAgo.purchasing_power),
          purchasingPowerChange: calculateChange(getPowerValue(current.purchasing_power), getPowerValue(threeYearsAgo.purchasing_power))
        }
      ];
    },

    async fetchTrendsData() {
      this.loadingTrends = true;
      try {
        let response = await this.$axios.get(
          `/v1/food-basket-trends/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber
            }
          }
        );

        if (response.status == 200) {
          this.trendsData = response.data.data || [];
        }
      } catch (err) {
        console.error('Error fetching trends data:', err);
        this.trendsData = [];
      } finally {
        this.loadingTrends = false;
      }
    },

    async fetchRegionalWageData() {
      this.loadingRegionalWage = true;
      try {
        // Use full food basket (16 products) from backend config
        // Products parameter removed to allow backend to use config/food_basket_products.php
        let response = await this.$axios.get(
          `/v1/regional-wage-purchasing-power/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber
            }
          }
        );

        if (response.status == 200) {
          this.regionalWageData = response.data.regional_data || [];
        }
      } catch (err) {
        console.error('Error fetching regional wage data:', err);
        this.regionalWageData = [];
      } finally {
        this.loadingRegionalWage = false;
      }
    },

    async fetchNationalPriceTrends() {
      this.loadingNationalPriceTrends = true;
      try {
        let response = await this.$axios.get(
          `/v1/national-price-trends/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber
            }
          }
        );

        if (response.status == 200) {
          this.nationalPriceTrendsData = response.data.products || [];
        }
      } catch (err) {
        console.error('Error fetching national price trends:', err);
        this.nationalPriceTrendsData = [];
      } finally {
        this.loadingNationalPriceTrends = false;
      }
    },

    async fetchEnergyPrices() {
      this.loadingEnergyPrices = true;
      try {
        let response = await this.$axios.get(
          `/v1/energy-prices/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber
            }
          }
        );

        if (response.status == 200) {
          this.energyPricesData = response.data.products || [];
        }
      } catch (err) {
        console.error('Error fetching energy prices:', err);
        this.energyPricesData = [];
      } finally {
        this.loadingEnergyPrices = false;
      }
    },

    async fetchExchangeRates() {
      this.loadingExchangeRates = true;
      try {
        let response = await this.$axios.get(
          `/v1/exchange-rates/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber
            }
          }
        );

        if (response.status == 200) {
          this.exchangeRatesData = response.data;
        }
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        this.exchangeRatesData = null;
      } finally {
        this.loadingExchangeRates = false;
      }
    },

    async fetchHistoricalTrends() {
      this.loadingHistoricalTrends = true;
      try {
        let response = await this.$axios.get(
          `/v1/historical-price-trends/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              week: this.weekNumber
            }
          }
        );

        if (response.status == 200) {
          this.historicalTrendsData = response.data;
        }
      } catch (err) {
        console.error('Error fetching historical trends:', err);
        this.historicalTrendsData = null;
      } finally {
        this.loadingHistoricalTrends = false;
      }
    },

    async fetchFoodBasketBreakdown() {
      this.loadingFoodBasketBreakdown = true;
      try {
        // Fetch both table and chart data in parallel
        const [tableResponse, chartResponse] = await Promise.all([
          this.$axios.get(
            `/v1/food-basket-breakdown-table/${this.$store.state.countryId}/${this.$i18n.locale}`,
            {
              params: {
                year: this.selectedYear,
                week: this.weekNumber
              }
            }
          ),
          this.$axios.get(
            `/v1/food-basket-breakdown-chart/${this.$store.state.countryId}/${this.$i18n.locale}`,
            {
              params: {
                year: this.selectedYear,
                week: this.weekNumber
              }
            }
          )
        ]);

        if (tableResponse.status == 200) {
          this.foodBasketBreakdownTableData = tableResponse.data;
        }
        if (chartResponse.status == 200) {
          this.foodBasketBreakdownChartData = chartResponse.data;
        }
      } catch (err) {
        console.error('Error fetching food basket breakdown:', err);
        this.foodBasketBreakdownTableData = null;
        this.foodBasketBreakdownChartData = null;
      } finally {
        this.loadingFoodBasketBreakdown = false;
      }
    },

    getMarketDataForProduct(productId) {
      return this.marketPricesData.filter(item => item.productId === productId);
    },

    getProductGroups() {
      // Use cached computed property
      return this.productGroups;
    },

    getSelectedProductNames() {
      return this.productsWithData.map(p => p.name).join(', ');
    },

    getMarketsForComparison() {
      // Use cached computed property
      return this.marketsForComparison;
    },

    getProductMarketData(productId, market) {
      const marketData = this.getMarketDataForProduct(productId);
      return marketData.find(item =>
        item.marketId === market.marketId &&
        item.isAverage === market.isAverage
      );
    },

    formatProductMarketPrice(productId, market, period) {
      const data = this.getProductMarketData(productId, market);
      if (!data) return '-';

      const value = data[period];
      return this.formatNumber(value, 1);
    },

    getProductMarketChange(productId, market, period) {
      const data = this.getProductMarketData(productId, market);
      if (!data) return null;

      if (period === 'lastWeek') return data.lastWeekChange;
      if (period === 'lastMonth') return data.lastMonthChange;
      if (period === 'lastYear') return data.lastYearChange;
      return null;
    },

    getProductMarketCellColor(productId, market, period) {
      const data = this.getProductMarketData(productId, market);
      if (!data) return 'rgb(207, 226, 243)';

      return this.getCellColorForMarket(data, period);
    },

    getCellColor(percentChange) {
      if (percentChange === null) return 'rgb(207, 226, 243)';

      const change = parseFloat(percentChange);
      // REVERSED LOGIC: For prices, increases are bad (red), decreases are good (green)
      if (change >= 20) return '#ff7d7d';       // Strong increase - dark red
      if (change >= 10) return '#ffbcb1';       // Moderate increase - medium red
      if (change >= 5) return '#fec6c2';        // Light increase - light red
      if (change >= 2) return '#f7ddd6';        // Very light increase - very light red
      if (change >= -2) return '#cfe2f3';       // Neutral - light blue
      if (change >= -5) return '#d5ecc9';       // Very light decrease - very light green
      if (change >= -10) return '#c8e7bf';      // Light decrease - light green
      if (change >= -20) return '#afdeb2';      // Moderate decrease - medium green
      return '#87b189';                          // Strong decrease - dark green
    },

    getCellColorForMarket(item, period) {
      let change = null;
      if (period === 'lastWeek') change = item.lastWeekChange;
      else if (period === 'lastMonth') change = item.lastMonthChange;
      else if (period === 'lastYear') change = item.lastYearChange;

      return this.getCellColor(change);
    },

    getTrendIcon(percentChange) {
      if (percentChange === null) return '';

      const change = parseFloat(percentChange);
      if (Math.abs(change) < 2) {
        return '<div class="triangle-right"></div>';
      }
      if (change > 0) {
        return '<div class="triangle-top"></div>';
      }
      return '<div class="triangle-bottom"></div>';
    },

    formatNumber(value, decimals = 0) {
      if (value === null || value === undefined) return '-';
      const number = Number(value);
      return number.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },

    onProductsChange(value) {
      // Enforce max 15 products selection
      if (value && value.length > 15) {
        this.$nextTick(() => {
          this.selectedProductsObjects = value.slice(0, 15);
        });
        return;
      }

      // Auto-fetch report when exactly 15 products selected
      if (value && value.length === 15 && this.selectedYear && this.selectedMonth && this.weekNumber) {
        this.$nextTick(() => {
          this.fetchWeeklyReport();
        });
      }
    },

    saveStateToStore() {
      // Save complete state to Vuex store for navigation persistence
      this.$store.commit('setWeeklyReportState', {
        selectedYear: this.selectedYear,
        selectedMonth: this.selectedMonth,
        weekNumber: this.weekNumber,
        selectedProductsObjects: this.selectedProductsObjects,
        availableYears: this.availableYears,
        availableMonths: this.availableMonths,
        availableWeeks: this.availableWeeks,
        allProducts: this.allProducts,
        allMarkets: this.allMarkets,
        weekStartDate: this.weekStartDate,
        weekEndDate: this.weekEndDate,
        marketPricesData: this.marketPricesData,
        nationalSummaryData: this.nationalSummaryData,
        trendsData: this.trendsData,
        regionalWageData: this.regionalWageData,
        nationalPriceTrendsData: this.nationalPriceTrendsData,
        energyPricesData: this.energyPricesData,
        exchangeRatesData: this.exchangeRatesData,
        historicalTrendsData: this.historicalTrendsData,
        foodBasketBreakdownTableData: this.foodBasketBreakdownTableData,
        foodBasketBreakdownChartData: this.foodBasketBreakdownChartData
      });
    },

    restoreStateFromStore() {
      // Restore state from Vuex store
      const stored = this.$store.state.weeklyReport;

      // Check if we have cached data
      if (!stored.cachedAt) return false;

      // Restore all state
      this.selectedYear = stored.selectedYear;
      this.selectedMonth = stored.selectedMonth;
      this.weekNumber = stored.weekNumber;
      this.selectedProductsObjects = stored.selectedProductsObjects;
      this.availableYears = stored.availableYears;
      this.availableMonths = stored.availableMonths;
      this.availableWeeks = stored.availableWeeks;
      this.allProducts = stored.allProducts;
      this.allMarkets = stored.allMarkets;
      this.weekStartDate = stored.weekStartDate;
      this.weekEndDate = stored.weekEndDate;
      this.marketPricesData = stored.marketPricesData;
      this.nationalSummaryData = stored.nationalSummaryData;
      this.trendsData = stored.trendsData;
      this.regionalWageData = stored.regionalWageData;
      // Validate stored data has correct format (must have product_key)
      this.nationalPriceTrendsData = (stored.nationalPriceTrendsData &&
        stored.nationalPriceTrendsData.length > 0 &&
        stored.nationalPriceTrendsData[0].product_key)
        ? stored.nationalPriceTrendsData
        : [];
      this.energyPricesData = stored.energyPricesData;
      this.exchangeRatesData = stored.exchangeRatesData;
      this.historicalTrendsData = stored.historicalTrendsData;
      this.foodBasketBreakdownTableData = stored.foodBasketBreakdownTableData;
      this.foodBasketBreakdownChartData = stored.foodBasketBreakdownChartData;

      return true;
    },

    updateUrlParams() {
      // Update URL query params without causing navigation
      const query = {};

      if (this.selectedYear) query.year = this.selectedYear;
      if (this.selectedMonth) query.month = this.selectedMonth;
      if (this.weekNumber) query.week = this.weekNumber;
      if (this.selectedProductIds.length > 0) {
        query.products = this.selectedProductIds.join(',');
      }

      // Only update if query params changed
      const currentQuery = this.$route.query;
      const queriesEqual = Object.keys(query).length === Object.keys(currentQuery).length &&
        Object.keys(query).every(key => query[key] === currentQuery[key]);

      if (!queriesEqual) {
        this.$router.replace({ query }).catch(() => {});
      }
    },

    async restoreFromQueryParams(urlParams) {
      // Set flag to prevent duplicate API calls
      this.isRestoringFromUrl = true;

      // Show loading bar during restoration
      this.loading = true;

      try {
        // Step 1: Fetch available years first
        await this.fetchAvailableYears();

        // Step 2: Restore year
        if (urlParams.year) {
          const year = parseInt(urlParams.year);
          if (this.availableYears.includes(year)) {
            this.selectedYear = year;
            // Wait for next tick to ensure reactivity
            await this.$nextTick();
            await this.fetchAvailableMonths();
          } else {
            console.warn(`Year ${year} not available in:`, this.availableYears);
            this.isRestoringFromUrl = false;
            return;
          }
        }

        // Step 3: Restore month
        if (urlParams.month && this.selectedYear) {
          const month = parseInt(urlParams.month);
          // availableMonths is array of numbers [1, 2, 3, ...]
          if (this.availableMonths.includes(month)) {
            this.selectedMonth = month;
            // Wait for next tick to ensure reactivity
            await this.$nextTick();
            await this.fetchAvailableWeeks();
          } else {
            console.warn(`Month ${month} not available in:`, this.availableMonths);
            this.isRestoringFromUrl = false;
            return;
          }
        }

        // Step 4: Restore week
        if (urlParams.week && this.selectedMonth) {
          const week = parseInt(urlParams.week);
          // Check if week exists in availableWeeks array
          const weekExists = this.availableWeeks.some(w =>
            typeof w === 'object' ? w.week_number === week : w === week
          );

          if (weekExists) {
            this.weekNumber = week;
            // Wait for next tick to ensure reactivity
            await this.$nextTick();
            await this.fetchProductsForWeek();
          } else {
            console.warn(`Week ${week} not available in:`, this.availableWeeks);
            this.isRestoringFromUrl = false;
            return;
          }
        }

        // Step 5: Restore products
        if (urlParams.products && this.weekNumber && this.allProducts.length > 0) {
          const productIds = urlParams.products.split(',').map(id => parseInt(id));
          const validProducts = this.allProducts.filter(p => productIds.includes(p.id));

          if (validProducts.length === 15) {
            this.selectedProductsObjects = validProducts;
            // Wait for next tick to ensure reactivity
            await this.$nextTick();

            // Fetch report data automatically if all filters are valid
            await this.fetchWeeklyReport();
          } else {
            console.warn(`Only ${validProducts.length} out of 15 products found`);
          }
        }
      } catch (err) {
        console.error('Error restoring from query params:', err);
      } finally {
        this.isRestoringFromUrl = false;
        this.loading = false;
      }
    },

    async resetFilter() {
      // Clear all filters
      this.selectedYear = null;
      this.selectedMonth = null;
      this.weekNumber = null;
      this.selectedProductsObjects = [];
      this.savedProductIds = []; // Clear saved product IDs

      // Clear available options
      this.availableMonths = [];
      this.availableWeeks = [];
      this.allProducts = [];
      this.allMarkets = [];

      // Clear all data
      this.clearAllData();

      // Clear URL params
      this.$router.replace({ query: {} }).catch(() => {});

      // Clear store cache
      this.$store.commit('clearWeeklyReportState');

      // Reset to defaults and auto-fetch report
      // Set isRestoringFromUrl to false to enable default selection
      this.isRestoringFromUrl = false;
      await this.fetchAvailableYears();
    }
  }
};
</script>

<style scoped>
/* ============================================================================
   MOBILE-FIRST CSS ARCHITECTURE
   Base: 320px+ (Mobile)
   Breakpoints: 768px (Tablet), 1024px (Desktop), 1440px (Large Desktop)
   ============================================================================ */

/* ============================================================================
   1. RESET & BASE STYLES (Mobile 320px+)
   ============================================================================ */

* {
  box-sizing: border-box;
}

html,
body {
  overflow-x: hidden;
}

.weekly-report-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  padding: 20px 24px 0 24px;
}

.container {
  width: 100%;
  padding: 0;
  max-width: 100%;
  margin: 0 auto;
}

/* ============================================================================
   2. TYPOGRAPHY
   ============================================================================ */

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #009688;
  margin: 0 0 12px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #ca5216;
  margin: 0 0 12px;
}

/* ============================================================================
   3. PRINT HEADER (Hidden on screen)
   ============================================================================ */

.print-header {
  display: none;
}

/* ============================================================================
   4. FILTERS SECTION
   ============================================================================ */

.filters-section {
  margin-bottom: 16px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.filters-toggle {
  width: 100%;
  background-color: #007dbc;
  color: white;
  border: none;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.filters-toggle:hover {
  background-color: #0091d5;
}

.toggle-icon {
  font-size: 24px;
  font-weight: 300;
  line-height: 1;
}

.filters-content {
  background: white;
}

.filters-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.filter-item {
  width: 100%;
}

.filter-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 0 16px 12px;
  justify-content: flex-end;
  align-items: flex-end;
  flex-wrap: nowrap;
}

.filter-actions .v-btn {
  background-color: #007dbc !important;
}

.filter-actions .v-btn:hover {
  background-color: #0091d5 !important;
}

.filter-products-row {
  margin-top: 16px;
  padding: 0 16px 12px;
}

/* ============================================================================
   5. SELECTED PRODUCTS CARD
   ============================================================================ */

.selected-products-card {
  background: white;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.products-column ol {
  padding-left: 20px;
  margin: 0;
}

.products-column ol li {
  padding: 4px 0;
  font-size: 14px;
  line-height: 1.5;
}

/* ============================================================================
   6. LOADING BAR
   ============================================================================ */

.loading-bar {
  margin-bottom: 16px;
}

/* ============================================================================
   7. WFP REPORT HEADER
   ============================================================================ */

.wfp-report-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-metadata {
  background-color: #ca5216;
  color: white;
  padding: 12px;
  border-radius: 4px 4px 0 0;
}

.country-name {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.issue-number,
.week-period,
.week-year {
  font-size: 12px;
  margin: 2px 0;
}

.report-title {
  background-color: #007dbc;
  color: white;
  padding: 20px 12px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  border-radius: 0 0 4px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Horizontal Metadata Bar */
.horizontal-metadata-bar {
  background-color: #ca5216;
  color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 16px;
  margin-top: 16px;
  font-size: 10px;
  font-weight: 500;
  text-align: right;
  letter-spacing: 1px;
}

@media (min-width: 576px) {
  .horizontal-metadata-bar {
    font-size: 11px;
  }
}

@media (min-width: 768px) {
  .horizontal-metadata-bar {
    font-size: 12px;
    padding: 12px 16px;
  }
}

@media (min-width: 1024px) {
  .horizontal-metadata-bar {
    font-size: 13px;
  }
}

@media (min-width: 1280px) {
  .horizontal-metadata-bar {
    font-size: 14px;
  }
}

@media (min-width: 1920px) {
  .horizontal-metadata-bar {
    font-size: 15px;
  }
}

/* Hide print-only metadata bars in normal view */
.print-page-break-header {
  display: none;
}

/* ============================================================================
   8. WFP REPORT CONTENT LAYOUT
   ============================================================================ */

.wfp-report-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wfp-banner-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #007dbc;
  margin-bottom: 16px;
  overflow: hidden;
}

.wfp-banner {
  width: 80px;
  height: auto;
  margin-bottom: 70px;
  max-width: 100%;
}

.wfp-taglines-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
  width: 80%;
  margin-bottom: 100px;
}

.wfp-tagline {
  font-size: 14px;
  font-weight: 300;
  color: white;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
}

.report-data-column {
  width: 100%;
  overflow: hidden;
  min-width: 0;
  background-color: white;
}

/* ============================================================================
   9. NATIONAL SUMMARY SECTION
   ============================================================================ */

.national-summary-section {
  background: white;
  padding: 16px;
}

.national-summary-section .section-title {
  color: #ca5216;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0;
  width: 100%;
}

/* National Summary Table */
.national-summary-table {
  width: 100%;
  border-collapse: collapse;
  border: none;
  font-size: 9px;
}

.national-summary-table th {
  font-weight: 700;
  padding: 6px 4px;
  background-color: #f5f5f5;
  border: none;
  vertical-align: middle;
  text-align: center;
}

.national-summary-table th.currency-header {
  font-weight: 700;
  color: #424242;
  text-align: center;
  background-color: #e0e0e0;
}

.national-summary-table th.product-header {
  background-color: #007dbc;
  color: white;
  font-weight: 700;
  font-size: 9px;
  padding: 6px 4px;
  border: none;
  text-align: center;
}

.national-summary-table tbody td {
  padding: 6px 4px;
  border: none;
  vertical-align: middle;
  background-color: #ffffff;
}

.national-summary-table tbody td.text-center {
  text-align: center;
}

.national-summary-table tbody td.text-right {
  text-align: right;
  white-space: nowrap;
}

.national-summary-table tbody tr {
  border-bottom: none;
}

.period-header {
  vertical-align: middle;
  text-align: left;
  white-space: nowrap;
  font-weight: 600;
  width: 1%;
  padding: 6px 8px;
}

.period-cell {
  background-color: #007dbc !important;
  color: #ffffff;
  padding: 6px 8px !important;
  font-weight: 600;
  white-space: nowrap;
  text-align: left;
  width: 1%;
}

.icon-column {
  min-width: 80px;
  width: 80px;
  padding: 8px 4px !important;
  vertical-align: middle;
  text-align: center;
}

.metric-icon-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 4px;
}

/* Price Trends Content Grid - matches wfp-report-content structure */
.price-trends-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 0;
}

.energy-prices-column {
  width: 100%;
  overflow: hidden;
  padding-top: 16px;
  padding-left: 16px;
  padding-bottom: 0;
  background-color: white;
}

.energy-section-title {
  background: white;
  padding: 0 16px 0 0;
  margin: 0 0 12px 0;
  border-radius: 4px 4px 0 0;
  color: black;
}

.food-commodities-column {
  width: 100%;
  overflow: hidden;
  min-width: 0;
  background-color: white;
}

.price-trends-table-section {
  background: white;
  border-radius: 4px;
  padding: 16px 16px 0 16px;
  margin-top: 0;
}

.price-trends-table-section .section-title {
  color: #ca5216;
}

.historical-trends-section {
  background: white;
  border-radius: 4px;
  padding: 0 16px 16px 16px;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.historical-trends-section .chart-wrapper {
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.energy-prices-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  background: white;
}

.energy-prices-table:last-child {
  margin-bottom: 0;
  border-radius: 0 0 4px 4px;
}

.energy-prices-table th {
  background-color: #e0e0e0;
  padding: 6px 4px;
  text-align: center;
  font-weight: 700;
  border: none;
  font-size: 10px;
}

.energy-prices-table th.energy-product-cell {
  background-color: #007dbc;
  color: white;
  text-align: left;
  padding: 6px 8px;
  font-weight: 700;
  font-size: 11px;
}

.energy-product-row {
  border-bottom: 1px solid #e0e0e0;
}

.energy-prices-table tbody td {
  padding: 6px 4px;
  border: none;
  vertical-align: middle;
  background-color: #ffffff;
  font-size: 10px;
}

.energy-prices-table tbody td.text-center {
  text-align: center;
}

.energy-prices-table tbody td.text-right {
  text-align: right;
  white-space: nowrap;
}

.energy-prices-table tbody td.period-label-cell {
  text-align: left;
  padding-left: 8px;
  font-size: 10px;
  font-weight: normal;
}

.energy-prices-table th:last-child,
.energy-prices-table td:last-child {
  padding-right: 16px;
}

.metric-title {
  font-size: 9px;
  text-align: center;
  color: #424242;
  font-weight: 600;
  width: 100%;
  line-height: 1.2;
}

.metric-icon {
  width: 90%;
  height: auto;
  max-width: 60px;
  display: block;
  flex-shrink: 0;
  margin: 0 auto;
}

/* Currency and percentage columns - compact */
.national-summary-table tbody td.text-right,
.national-summary-table th.text-right {
  width: 1%;
  white-space: nowrap;
  padding: 8px 6px;
}

/* ============================================================================
   10. TRENDS CHART SECTION
   ============================================================================ */

.trends-section {
  background: white;
  padding: 0 16px 16px 16px;
}

.trends-section .section-title {
  background-color: #007dbc;
  color: white;
  text-align: center;
  padding: 10px;
  margin: 0 0 16px 0;
  border-radius: 4px;
}

.regional-wage-section {
  background: white;
  padding: 0 16px 16px 16px;
}

.regional-wage-section .section-title {
  background-color: #007dbc;
  color: white;
  text-align: center;
  padding: 10px;
  margin: 0 0 16px 0;
  border-radius: 4px;
}

.price-trends-table-section {
  background: white;
  border-radius: 4px;
  padding: 16px 16px 0 16px;
  margin-top: 0;
}

.chart-wrapper {
  margin-top: 12px;
  width: 100%;
  overflow: hidden;
}

.trends-chart {
  margin: 0;
  width: 100%;
  max-width: 100%;
}

.regional-wage-chart {
  margin: 0;
  width: 100%;
  max-width: 100%;
}

/* Alert styles */
.alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin: 12px 0;
}

.alert-info {
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1976d2;
}

/* ============================================================================
   11. MARKET COMPARISON SECTION
   ============================================================================ */

.market-comparison-section {
  background: white;
  border-radius: 4px;
  padding: 16px;
}

.market-comparison-section .section-title {
  color: #ca5216;
}

.product-group {
  margin-bottom: 20px;
}

.product-group:last-child {
  margin-bottom: 0;
}

/* Market Comparison Table */
.market-comparison-table {
  width: 100%;
  border-collapse: collapse;
  border: none;
  font-size: 9px;
  table-layout: fixed;
}

.market-comparison-table th,
.market-comparison-table td {
  border: 1px solid #efecec;
  padding: 6px 4px;
  text-align: center;
  vertical-align: middle;
}

.market-comparison-table .market-header {
  background-color: #f5f5f5;
  font-weight: 700;
  font-size: 9px;
  text-align: left;
  padding: 6px 8px;
  width: 12%;
  white-space: nowrap;
}

.market-comparison-table .product-header {
  background-color: #e5e5e5;
  color: black;
  font-weight: 700;
  font-size: 9px;
  border-bottom: none;
  width: 29.33%;
}

.market-comparison-table .product-header-hidden {
  visibility: hidden;
  border-color: transparent;
}

.market-comparison-table .period-header {
  background-color: #007dbc;
  color: white;
  font-size: 8px;
  font-weight: 400;
  border-top: none;
}

.market-comparison-table .period-header-hidden {
  visibility: hidden;
  border-color: transparent;
}

.market-comparison-table tbody td {
  background-color: rgb(207, 226, 243);
  font-size: 9px;
}

.market-comparison-table .market-cell {
  text-align: left;
  padding: 6px 8px;
  font-weight: 600;
  width: 12%;
  white-space: nowrap;
  background-color: #ffffff;
}

.market-comparison-table .market-cell-hidden {
  visibility: hidden;
  border-color: transparent;
  background-color: transparent;
}

/* Product separators */
.market-comparison-table thead tr:first-child th:nth-child(2),
.market-comparison-table thead tr:first-child th:nth-child(3),
.market-comparison-table thead tr:nth-child(2) th:nth-child(4),
.market-comparison-table thead tr:nth-child(2) th:nth-child(8),
.market-comparison-table tbody td:nth-child(5),
.market-comparison-table tbody td:nth-child(9) {
  border-right: 3px solid white;
}

/* ============================================================================
   12. ANNEX 1 SECTION
   ============================================================================ */

.annex-1-section {
  background: white;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.annex-1-section .section-title {
  color: #ca5216;
}

/* ============================================================================
   13. APPENDIX SECTION
   ============================================================================ */

.appendix-section {
  background: white;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.appendix-title {
  color: #ca5216;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.appendix-content {
  margin-top: 8px;
}

.appendix-download-link {
  display: inline-block;
  color: #1976D2;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 16px;
  border: 2px solid #1976D2;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.appendix-download-link:hover {
  background-color: #1976D2;
  color: white;
}

/* ============================================================================
   13. ABBREVIATIONS & NOTES SECTION
   ============================================================================ */

.abbreviations-notes-section {
  background: white;
  border-radius: 4px;
  padding: 0 16px 16px 16px;
  margin-bottom: 16px;
}

.abbreviations-notes-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.abbreviations-column {
  width: 100%;
}

.notes-column {
  width: 100%;
  max-width: 900px;
}

.abbreviations-column .subsection-title {
  color: #ca5216;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.notes-column .subsection-title {
  color: #ca5216;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.abbreviations-list {
  display: flex;
  gap: 30px;
}

.abbreviations-list p {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  white-space: nowrap;
}

.notes-text p {
  margin: 6px 0;
  font-size: 11px;
  line-height: 1.6;
  text-align: justify;
}

.organization-info-row {
  display: flex;
  gap: 60px;
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
}

.organization-left,
.organization-right {
  flex: 0 1 auto;
}

.organization-left p,
.organization-right p {
  margin: 3px 0;
  font-size: 10px;
  line-height: 1.4;
}

.organization-left strong,
.organization-right strong {
  color: #1a1a1a;
  font-weight: 700;
}

.organization-info p {
  line-height: 1.6;
  margin: 8px 0;
  font-size: 14px;
}

/* ============================================================================
   13. ERROR SNACKBAR
   ============================================================================ */

.error-snackbar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f44336;
  color: white;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  z-index: 9999;
  max-width: calc(100% - 32px);
  width: 100%;
}

.success-snackbar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  z-index: 9999;
  max-width: calc(100% - 32px);
  width: 100%;
}

.snackbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.snackbar-close {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.snackbar-close:hover {
  background: rgba(255,255,255,0.1);
}

/* ============================================================================
   13. LOADING SPINNER
   ============================================================================ */

.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Smooth transitions for content appearance */
.trends-chart,
.chart-wrapper,
.table-wrapper,
.alert {
  animation: fadeIn 0.4s ease-in-out;
}

/* ============================================================================
   14. SMALL TABLET BREAKPOINT (576px+)
   ============================================================================ */

@media (min-width: 576px) {
  /* Selected Products - 2 columns */
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* WFP Header - side by side */
  .wfp-report-header {
    display: grid;
    grid-template-columns: 20% 80%;
    gap: 0;
  }

  .report-metadata {
    border-radius: 4px 0 0 0;
  }

  .report-title {
    border-radius: 0 4px 0 0;
  }

  /* WFP Content - side by side */
  .wfp-report-content {
    display: grid;
    grid-template-columns: 20% 80%;
    gap: 0;
    align-items: stretch;
  }

  .wfp-banner-column {
    height: 100%;
    margin-bottom: 0;
  }

  .report-data-column {
    height: 100%;
  }

  /* Price Trends Content - side by side (matches wfp-report-content) */
  .price-trends-content {
    display: grid;
    grid-template-columns: 20% 80%;
    gap: 0;
    align-items: stretch;
  }

  .energy-prices-column,
  .food-commodities-column {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .energy-prices-column > div:last-child,
  .food-commodities-column > section:last-child {
    flex-grow: 1;
  }

  .energy-section-title {
    border-radius: 0;
  }

  .energy-prices-table {
    border-radius: 0;
    font-size: 9px;
  }

  .energy-prices-table th {
    font-size: 9px;
  }

  .energy-prices-table th.energy-product-cell {
    font-size: 10px;
  }

  .energy-prices-table tbody td {
    font-size: 9px;
  }

  .energy-prices-table tbody td.period-label-cell {
    font-size: 9px;
  }

  .price-trends-table-section {
    border-radius: 0;
  }

  .historical-trends-section {
    border-radius: 0;
  }

  /* National Summary Table - optimize for 576px-767px screens */
  .national-summary-table {
    font-size: 8px;
  }

  .national-summary-table tbody td.text-right,
  .national-summary-table th.text-right {
    width: 1%;
    white-space: nowrap;
    padding: 4px 2px;
  }

  .national-summary-table th {
    padding: 4px 2px;
  }

  .national-summary-table tbody td {
    padding: 4px 2px;
  }

  .period-header {
    padding: 4px 4px;
    font-size: 8px;
  }

  .period-cell {
    padding: 4px 4px;
    font-size: 8px;
  }

  /* Icon columns - smaller and more compact */
  .icon-column {
    min-width: 50px;
    width: 50px;
    padding: 4px 2px !important;
  }

  .metric-icon-cell {
    gap: 20px;
  }

  .metric-icon {
    width: 80%;
    height: auto;
    max-width: 35px;
  }

  .metric-title {
    font-size: 7px;
    line-height: 1.1;
  }

  /* WFP Banner tagline */
  .wfp-tagline {
    font-size: 19px;
  }
}

/* ============================================================================
   15. TABLET BREAKPOINT (768px+)
   ============================================================================ */

@media (min-width: 768px) {
  .container {
    padding: 0;
    max-width: 100%;
  }

  /* Notes column - constrain width on tablet */
  .notes-column {
    max-width: 750px;
  }

  /* Abbreviations and Notes - tablet font sizes */
  .abbreviations-column .subsection-title,
  .notes-column .subsection-title {
    font-size: 14px;
  }

  .abbreviations-list {
    gap: 35px;
  }

  .abbreviations-list p {
    font-size: 12px;
  }

  .notes-text p {
    font-size: 12px;
  }

  .organization-left p,
  .organization-right p {
    font-size: 11px;
  }

  /* Filters - 3 row layout: filters, products, actions */
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 20px;
  }

  .filter-products-item {
    grid-column: 1 / -1;
    width: 100%;
  }

  .filter-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
  }

  /* Selected Products - 3 columns */
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* WFP Report - additional tablet styles */
  .report-title {
    font-size: 28px;
  }

  .wfp-banner-column {
    border-radius: 0;
    margin-bottom: 0;
    padding-top: 80px;
  }

  .wfp-banner {
    width: 80%;
  }

  .wfp-tagline {
    font-size: 16px;
  }

  /* Energy Prices Table - larger font on tablet */
  .energy-prices-table {
    font-size: 12px;
  }

  .energy-prices-table th {
    font-size: 12px;
  }

  .energy-prices-table th.energy-product-cell {
    font-size: 13px;
  }

  .energy-prices-table tbody td {
    font-size: 12px;
  }

  .energy-prices-table tbody td.period-label-cell {
    font-size: 12px;
  }

  .exchange-rate-table th {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }

  .exchange-rate-table td {
    padding-top: 9px !important;
    padding-bottom: 9px !important;
  }

  /* National Summary Table */
  .national-summary-table {
    font-size: 12px;
  }

  .icon-column {
    min-width: 100px;
    width: 100px;
  }

  .metric-icon-cell {
    gap: 12px;
  }

  .metric-icon {
    width: 85%;
    height: auto;
    max-width: 90px;
  }

  .metric-title {
    font-size: 13px;
  }

  /* Market Comparison */
  .market-comparison-table {
    font-size: 11px;
  }

  .market-comparison-table .market-header {
    font-size: 11px;
  }

  .market-comparison-table .product-header {
    font-size: 11px;
  }

  .market-comparison-table .period-header {
    font-size: 9px;
  }

  /* Error Snackbar */
  .error-snackbar {
    max-width: 600px;
  }
}

/* ============================================================================
   16. DESKTOP BREAKPOINT (1024px+)
   ============================================================================ */

@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 100%;
  }

  /* Notes column - constrain width on desktop */
  .notes-column {
    max-width: 850px;
  }

  /* Abbreviations and Notes - desktop font sizes */
  .abbreviations-column .subsection-title,
  .notes-column .subsection-title {
    font-size: 15px;
  }

  .abbreviations-list {
    gap: 40px;
  }

  .abbreviations-list p {
    font-size: 13px;
  }

  .notes-text p {
    font-size: 13px;
  }

  .organization-left p,
  .organization-right p {
    font-size: 12px;
  }

  .section-title {
    font-size: 24px;
  }

  .appendix-title {
    font-size: 24px;
  }

  .card-title {
    font-size: 20px;
  }

  /* Filters - year, month, week in first row; products and actions in second row */
  .filters-grid {
    grid-template-columns: 150px 200px 150px 1fr;
    grid-template-rows: auto auto auto;
    align-items: flex-end;
  }

  .filter-products-item {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
    max-width: 100%;
  }

  .filter-actions {
    grid-column: 1 / -1;
    grid-row: 3;
    padding: 0;
    flex-direction: row;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .filter-actions .v-btn {
    height: 40px;
  }

  /* WFP Header */
  .wfp-report-header {
    grid-template-columns: 20% 80%;
  }

  .country-name {
    font-size: 16px;
  }

  .issue-number,
  .week-period,
  .week-year {
    font-size: 14px;
  }

  .report-title {
    font-size: 36px;
    padding: 30px 20px;
  }

  /* WFP Content */
  .wfp-report-content {
    grid-template-columns: 20% 80%;
    align-items: stretch;
  }

  .wfp-banner-column {
    padding-top: 80px;
    height: 100%;
  }

  .report-data-column {
    height: 100%;
  }

  .wfp-banner {
    width: 80%;
  }

  .wfp-tagline {
    font-size: 40px;
  }

  /* National Summary Table */
  .national-summary-table {
    font-size: 12px;
  }

  .icon-column {
    min-width: 90px;
    width: 90px;
  }

  .metric-icon-cell {
    gap: 15px;
  }

  .metric-icon {
    width: 80%;
    height: auto;
    max-width: 80px;
  }

  .metric-title {
    font-size: 13px;
  }

  .period-header,
  .period-cell {
    font-size: 12px;
  }

  .national-summary-table tbody td.text-right,
  .national-summary-table th.text-right {
    padding: 4px 3px;
  }

  /* Market Comparison */
  .market-comparison-table {
    font-size: 11px;
  }

  .market-comparison-table th,
  .market-comparison-table td {
    padding: 8px;
  }

  .market-comparison-table .market-header {
    font-size: 11px;
  }

  .market-comparison-table .product-header {
    font-size: 11px;
  }

  .market-comparison-table .period-header {
    font-size: 10px;
  }

  /* Energy Prices Table - larger font on desktop */
  .energy-prices-table {
    font-size: 13px;
  }

  .energy-prices-table th {
    font-size: 13px;
  }

  .energy-prices-table th.energy-product-cell {
    font-size: 14px;
  }

  .energy-prices-table tbody td {
    font-size: 13px;
  }

  .energy-prices-table tbody td.period-label-cell {
    font-size: 13px;
  }
}

/* ============================================================================
   17. MEDIUM-LARGE DESKTOP BREAKPOINT (1280px+)
   ============================================================================ */

@media (min-width: 1280px) {
  /* National Summary Table */
  .national-summary-table {
    font-size: 13px;
  }

  .icon-column {
    min-width: 100px;
    width: 100px;
  }

  .metric-icon-cell {
    gap: 18px;
  }

  .metric-icon {
    width: 85%;
    height: auto;
    max-width: 95px;
  }

  .metric-title {
    font-size: 14px;
  }

  /* Market Comparison Table */
  .market-comparison-table {
    font-size: 14px;
  }

  .market-comparison-table .market-header {
    font-size: 14px;
  }

  .market-comparison-table .market-cell {
    font-size: 13px;
  }

  .market-comparison-table .product-header {
    font-size: 16px;
  }

  .market-comparison-table .period-header {
    font-size: 11px;
  }

  .market-comparison-table tbody td {
    font-size: 11px;
  }

  /* Energy Prices Table - larger font on large desktop */
  .energy-prices-table {
    font-size: 14px;
  }

  .energy-prices-table th {
    font-size: 14px;
  }

  .energy-prices-table th.energy-product-cell {
    font-size: 15px;
  }

  .energy-prices-table tbody td {
    font-size: 14px;
  }

  .energy-prices-table tbody td.period-label-cell {
    font-size: 14px;
  }

  .national-summary-table tbody td.text-right,
  .national-summary-table th.text-right {
    padding: 7px 7px;
  }

  .national-price-trends tbody td.text-right,
  .national-price-trends th.text-right {
    padding: 8px;
  }
}

/* ============================================================================
   18. LARGE DESKTOP BREAKPOINT (1440px+)
   ============================================================================ */

@media (min-width: 1440px) {
  .container {
    max-width: 100%;
    padding: 40px;
  }

  /* Notes column - slightly larger on large desktop */
  .notes-column {
    max-width: 1000px;
  }

  /* Abbreviations and Notes - large desktop font sizes */
  .abbreviations-column .subsection-title,
  .notes-column .subsection-title {
    font-size: 16px;
  }

  .abbreviations-list {
    gap: 50px;
  }

  .abbreviations-list p {
    font-size: 14px;
  }

  .notes-text p {
    font-size: 14px;
  }

  .organization-left p,
  .organization-right p {
    font-size: 13px;
  }

  /* Filters - all in single row including action buttons */
  .filters-grid {
    grid-template-columns: 150px 200px 150px 1fr auto;
    grid-template-rows: auto;
    align-items: flex-end;
  }

  .filter-products-item {
    grid-column: 4;
    grid-row: 1;
    width: auto;
    max-width: none;
  }

  .filter-actions {
    grid-column: 5;
    grid-row: 1;
    padding: 0;
    flex-direction: row;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 0;
  }

  .national-summary-table {
    font-size: 16px;
  }

  .metric-title {
    font-size: 16px;
  }

  .period-header {
    font-size: 16px;
  }

  .period-cell {
    font-size: 16px;
    padding: 8px;
  }

  .icon-column {
    min-width: 120px;
    width: 120px;
  }

  .metric-icon {
    width: 85%;
    height: auto;
    max-width: 120px;
  }

  .market-comparison-table {
    font-size: 16px;
  }

  .market-comparison-table th,
  .market-comparison-table td {
    padding: 10px;
  }

  .market-comparison-table .market-header {
    font-size: 16px;
  }

  .market-comparison-table .market-cell {
    font-size: 16px;
  }

  .market-comparison-table .product-header {
    font-size: 18px;
  }

  .market-comparison-table .period-header {
    font-size: 16px;
  }

  .market-comparison-table tbody td {
    font-size: 16px;
  }

  .wfp-report-content {
    grid-template-columns: 20% 80%;
    align-items: stretch;
  }

  .wfp-banner-column {
    padding-top: 80px;
    height: 100%;
  }

  .report-data-column {
    height: 100%;
  }

  .wfp-banner {
    width: 80%;
  }

  .wfp-tagline {
    font-size: 44px;
  }
}

/* ============================================================================
   18.5. MACBOOK PRO 14"/16" BREAKPOINT (1440px - 1680px)
   ============================================================================ */

@media (min-width: 1440px) and (max-width: 1680px) {
  /* Market Comparison Table - optimized for MacBook displays */
  .market-comparison-table th,
  .market-comparison-table td {
    padding: 6px;
  }

  .market-comparison-table .period-header {
    font-size: 13px;
  }

  .market-comparison-table tbody td {
    font-size: 13px;
  }

  /* National Summary Table - optimized for MacBook displays */
  .metric-title {
    font-size: 14px;
  }

  /* Section titles - optimized for MacBook displays */
  .section-title {
    font-size: 20px;
  }

  .appendix-title {
    font-size: 20px;
  }
}

/* ============================================================================
   19. EXTRA LARGE DESKTOP BREAKPOINT (1920px+)
   ============================================================================ */

@media (min-width: 1920px) {
  .container {
    max-width: 100%;
    padding: 48px;
  }

  .section-title {
    font-size: 28px;
  }

  .appendix-title {
    font-size: 28px;
  }

  /* National Summary Table */
  .national-summary-table {
    font-size: 15px;
  }

  .icon-column {
    min-width: 130px;
    width: 130px;
  }

  .metric-icon {
    width: 85%;
    height: auto;
    max-width: 130px;
  }

  .metric-title {
    font-size: 16px;
  }

  /* Market Comparison Table */
  .market-comparison-table {
    font-size: 16px;
  }

  .market-comparison-table th,
  .market-comparison-table td {
    padding: 12px;
  }

  .market-comparison-table .market-header {
    font-size: 16px;
  }

  .market-comparison-table .market-cell {
    font-size: 16px;
  }

  .market-comparison-table .product-header {
    font-size: 18px;
  }

  .market-comparison-table .period-header {
    font-size: 16px;
  }

  .market-comparison-table tbody td {
    font-size: 16px;
  }

  /* WFP Content */
  .wfp-tagline {
    font-size: 55px;
  }
}

/* ============================================================================
   17. PDF DOWNLOAD BUTTON
   ============================================================================ */

/* PDF Download Button */
.pdf-download-btn {
  z-index: 100;
  margin-bottom: 20px;
  margin-right: 20px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .pdf-download-btn {
    margin-bottom: 16px;
    margin-right: 16px;
  }
}

/* ============================================================================
   18. PRINT STYLES
   ============================================================================ */

@media print {
  @page {
    size: A4;
    margin: 15mm 10mm;
  }

  body {
    background-color: white !important;
  }

  .print-header {
    display: block !important;
    margin-top: 0 !important;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    background: #f9f9f9;
  }

  .filters-section,
  .loading-bar,
  .error-snackbar,
  .success-snackbar,
  .selected-products-card,
  .pdf-download-btn {
    display: none !important;
  }

  .weekly-report-page {
    padding: 0 !important;
    margin: 0 !important;
    background-color: white !important;
  }

  .container {
    max-width: 100%;
    padding: 0 !important;
    margin: 0 !important;
  }

  .wfp-report-header {
    grid-template-columns: 15% 85%;
    page-break-inside: avoid;
    min-height: auto !important;
  }

  .report-metadata {
    padding: 8pt !important;
  }

  .country-name {
    font-size: 7pt !important;
    line-height: 1.2 !important;
  }

  .issue-number,
  .week-period,
  .week-year {
    font-size: 6pt !important;
  }

  .horizontal-metadata-bar {
    padding: 6pt 8pt !important;
    margin-top: 8pt !important;
    font-size: 6pt !important;
    page-break-inside: avoid;
  }

  /* Second horizontal metadata bar before market comparison - force page break before */
  .price-trends-content + .horizontal-metadata-bar {
    page-break-before: always !important;
    margin-top: 0 !important;
    margin-bottom: 6pt !important;
  }

  /* Keep horizontal bar and market comparison together */
  .horizontal-metadata-bar + .market-comparison-section {
    page-break-before: avoid !important;
  }

  /* Add page break after every 3rd product group, but NOT after the last group */
  .market-comparison-section .table-wrapper.product-group:nth-of-type(3n):not(:nth-last-of-type(-n+2)) {
    page-break-after: always !important;
  }

  /* Horizontal metadata bars after every 3rd product group (page headers) */
  .print-page-break-header {
    display: block !important;
    page-break-before: avoid !important;
    page-break-after: avoid !important;
    margin-top: 0 !important;
    margin-bottom: 6pt !important;
  }

  /* Avoid page break inside product groups */
  .market-comparison-section .table-wrapper.product-group {
    page-break-inside: avoid !important;
  }

  /* Keep last product groups and abbreviations together on same page */
  .market-comparison-section .table-wrapper.product-group:nth-last-of-type(-n+2) {
    page-break-after: avoid !important;
  }

  .wfp-report-content {
    display: grid;
    grid-template-columns: 15% 85%;
    align-items: stretch;
    page-break-inside: avoid;
    page-break-after: always;
    margin: 0 !important;
    padding: 0 !important;
    position: relative;
  }

  body {
    counter-reset: pagenum 0;
  }

  .wfp-report-content {
    counter-increment: pagenum;
  }

  .wfp-report-content::after {
    content: counter(pagenum);
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #ca5216;
    color: white;
    padding: 3pt 6pt;
    font-size: 8pt;
    font-weight: bold;
    z-index: 1000;
  }

  /* Page 2 - after historical-trends-section (last element of price-trends-content) */
  .historical-trends-section {
    position: relative;
  }

  .historical-trends-section::after {
    content: "2";
    display: block;
    text-align: right;
    margin-top: 210pt;
    margin-right: 0;
    background-color: #ca5216;
    color: white;
    padding: 3pt 6pt;
    font-size: 8pt;
    font-weight: bold;
    width: fit-content;
    margin-left: auto;
  }

  /* Page 3 - after 3rd product group */
  .market-comparison-section .table-wrapper.product-group:nth-of-type(3):after {
    content: "3";
    display: block;
    text-align: right;
    margin-top: 100pt;
    background-color: #ca5216;
    color: white;
    padding: 3pt 6pt;
    font-size: 8pt;
    font-weight: bold;
    width: fit-content;
    margin-left: auto;
  }

  /* Page 4 - after abbreviations section */
  .abbreviations-notes-section::after {
    content: "4";
    display: block;
    text-align: right;
    margin-top: 100pt;
    background-color: #ca5216;
    color: white;
    padding: 3pt 6pt;
    font-size: 8pt;
    font-weight: bold;
    width: fit-content;
    margin-left: auto;
  }

  .locale-ru .abbreviations-notes-section::after,
  .locale-tj .abbreviations-notes-section::after {
    margin-top: 50pt !important;
  }

  .locale-ru .report-data-column .national-summary-section h2.section-title {
    font-size: 14px !important;
  }

  .wfp-banner-column {
    padding: 8pt !important;
    padding-top: 64px !important;
    min-width: auto !important;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .wfp-taglines-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .report-data-column {
    padding: 0 !important;
    height: 100%;
  }

  .national-summary-section {
    padding: 4pt !important;
    margin-bottom: 4pt !important;
  }

  /* Russian locale - smaller padding */
  .locale-ru .national-summary-section {
    padding: 2pt 4pt !important;
  }

  .national-summary-section .section-title {
    margin-bottom: 3pt !important;
    font-size: 12pt !important;
  }

  .national-summary-table,
  .market-comparison-table {
    font-size: 6pt;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 12pt;
    color: #ca5216 !important;
  }

  /* .national-summary-table tbody td.text-right,
  .national-summary-table th.text-right {
    padding: 2px 2px;
  } */

  /* Russian locale - smaller padding for table cells */
  /* .locale-ru .national-summary-table tbody td.text-right,
  .locale-ru .national-summary-table th.text-right {
    padding: 2px 2px !important;
  }
*/
  .locale-ru .report-data-column .national-summary-table th,
  .locale-ru .report-data-column .national-summary-table tbody td {
    padding: 4px 4px !important;
  }

  /* National Summary Table - icons for print */
  .icon-column {
    min-width: 40px;
    width: 40px;
  }

  .metric-icon {
    width: 100%;
    height: auto;
    max-width: 40px;
  }

  .metric-icon-cell {
    gap: 30px;
  }

  .metric-title {
    font-size: 6pt;
  }

  .period-header,
  .period-cell,
  .currency-header {
    font-size: 7pt;
  }

  /* WFP Banner and Tagline - compact for print */
  .wfp-banner {
    width: 80% !important;
    max-width: 120px !important;
    margin-bottom: 15px !important;
  }

  .wfp-taglines-wrapper {
    margin-bottom: 20px !important;
  }

  .wfp-tagline {
    font-size: 12pt !important;
  }

  /* Price Trends Content - match wfp-report-content layout */
  .price-trends-content {
    grid-template-columns: 15% 85%;
  }

  /* Energy Prices Column - remove left padding and adjust top alignment */
  .energy-prices-column {
    padding-left: 0 !important;
    padding-top: 12pt !important;
    padding-bottom: 0 !important;
  }

  /* Energy Section Title - smaller font size and adjust spacing to match */
  .section-title.energy-section-title {
    font-size: 8pt !important;
    color: black !important;
    margin-bottom: 8pt !important;
  }

  /* First energy section title - add top padding to compensate for smaller font size */
  .energy-prices-column .section-title.energy-section-title:first-child {
    margin-top: 0 !important;
    padding-top: 6pt !important;
  }

  /* Energy Prices Table - print styling */
  .energy-prices-table {
    font-size: 5pt !important;
  }

  .energy-prices-table th {
    font-size: 5pt !important;
    padding: 2pt 2pt !important;
  }

  .energy-prices-table th.energy-product-cell {
    font-size: 6pt !important;
    padding: 3pt 4pt !important;
  }

  .energy-prices-table tbody td {
    font-size: 5pt !important;
    padding: 2pt 2pt !important;
  }

  .energy-prices-table tbody td.period-label-cell {
    font-size: 5pt !important;
    padding-left: 4pt !important;
  }

  /* Chart - basic print styling */
  .trends-section .chart-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    height: 162pt !important;
    max-height: 162pt !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-inside: avoid;
  }

  .regional-wage-section .chart-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    height: 162pt !important;
    max-height: 162pt !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-inside: avoid;
  }

  .trends-chart {
    width: 100% !important;
    max-width: 100% !important;
    height: 162pt !important;
    max-height: 162pt !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .trends-section {
    page-break-inside: avoid;
    padding: 0 4pt 4pt 4pt !important;
    margin-bottom: 4pt !important;
  }

  .trends-section .section-title {
    margin-bottom: 3pt !important;
    font-size: 12pt !important;
    color: white !important;
    padding-top: 2pt !important;
    padding-bottom: 2pt !important;
  }

  .regional-wage-section {
    page-break-inside: avoid;
    padding: 0 4pt 4pt 4pt !important;
    margin-bottom: 4pt !important;
  }

  .regional-wage-section .section-title {
    margin-bottom: 3pt !important;
    font-size: 12pt !important;
    color: white !important;
    padding-top: 2pt !important;
    padding-bottom: 2pt !important;
  }

  .regional-wage-chart {
    width: 100% !important;
    max-width: 100% !important;
    height: 162pt !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .price-trends-table-section {
    page-break-inside: avoid;
    padding: 12pt 12pt 0 12pt !important;
    margin-bottom: 0 !important;
  }

  .price-trends-table-section .section-title {
    margin-bottom: 8pt !important;
    font-size: 12pt !important;
  }

  .historical-trends-section {
    page-break-inside: avoid;
    padding: 0 12pt 12pt 12pt !important;
    margin-top: 0 !important;
    margin-bottom: 12pt !important;
  }

  .historical-trends-section .section-title {
    margin-bottom: 8pt !important;
    font-size: 12pt !important;
  }

  .historical-trends-section .chart-wrapper {
    height: 300pt !important;
    max-height: 300pt !important;
  }

  /* Appendix section - print styles */
  .appendix-section {
    page-break-before: avoid;
    page-break-after: avoid;
    page-break-inside: avoid;
    padding: 8pt !important;
    margin-bottom: 8pt !important;
  }

  .appendix-title {
    font-size: 10pt !important;
    margin-bottom: 6pt !important;
  }

  .appendix-download-link {
    font-size: 8pt !important;
    padding: 4pt 8pt !important;
    border-width: 1pt !important;
  }

  /* Abbreviations and Notes - remove spacing and prevent orphan page */
  .abbreviations-notes-section {
    page-break-before: avoid;
    page-break-after: avoid;
    page-break-inside: avoid;
    padding: 0 8pt 8pt 8pt !important;
    margin-bottom: 0 !important;
  }

  .abbreviations-notes-row {
    gap: 6pt !important;
    margin-bottom: 6pt !important;
  }

  .abbreviations-column .subsection-title,
  .notes-column .subsection-title {
    font-size: 9pt !important;
    margin-bottom: 3pt !important;
    font-weight: 700 !important;
  }

  .abbreviations-list {
    gap: 15pt !important;
  }

  .abbreviations-list p {
    font-size: 7pt !important;
    margin: 0 !important;
    line-height: 1.3 !important;
  }

  .notes-text p {
    font-size: 7pt !important;
    margin: 2pt 0 !important;
    line-height: 1.4 !important;
  }

  .organization-info-row {
    gap: 30pt !important;
    padding-top: 6pt !important;
    border-top: 0.5pt solid #e0e0e0 !important;
  }

  .organization-left p,
  .organization-right p {
    font-size: 6pt !important;
    margin: 0.5pt 0 !important;
    line-height: 1.3 !important;
  }

  .organization-left strong,
  .organization-right strong {
    font-weight: 700 !important;
  }

  /* Market Comparison Section */
  .market-comparison-section {
    padding: 8pt 8pt 4pt 8pt !important;
  }

  .market-comparison-section .section-title {
    color: #ca5216 !important;
    margin-bottom: 4pt !important;
  }

  /* Product group tables - minimize spacing and reduce cell padding */
  .table-wrapper.product-group {
    margin-bottom: 4pt !important;
  }

  .table-wrapper.product-group td {
    padding-top: 1px !important;
    padding-bottom: 1px !important;
  }

  /* Market comparison table - increase font sizes */
  .market-comparison-table {
    table-layout: fixed !important;
  }

  .market-comparison-table .market-header {
    width: 12% !important;
  }

  .market-comparison-table .product-header {
    font-size: 8pt !important;
    background-color: #e5e5e5 !important;
    color: black !important;
    width: 29.33% !important;
  }

  .market-comparison-table .product-header-hidden {
    visibility: hidden !important;
    border-color: transparent !important;
  }

  .market-comparison-table .period-header-hidden {
    visibility: hidden !important;
    border-color: transparent !important;
  }

  .market-comparison-table .market-cell {
    width: 12% !important;
  }

  .market-comparison-table .market-cell-hidden {
    visibility: hidden !important;
    border-color: transparent !important;
    background-color: transparent !important;
  }

  .market-comparison-table tbody td {
    font-size: 6px;
  }

  .market-comparison-table td {
    padding: 0;
  }

  .market-comparison-table .market-cell, .market-comparison-table .market-header {
    font-size: 5pt !important;
  }

  .market-comparison-table .period-header {
    font-size: 5pt !important;
    padding: 2px;
  }

  .market-comparison-table thead tr:first-child th:nth-child(2),
  .market-comparison-table thead tr:first-child th:nth-child(3),
  .market-comparison-table thead tr:nth-child(2) th:nth-child(4),
  .market-comparison-table thead tr:nth-child(2) th:nth-child(8),
  .market-comparison-table tbody td:nth-child(5),
  .market-comparison-table tbody td:nth-child(9) {
    border-right: 2px solid white;
  }

  .market-comparison-table th,
  .market-comparison-table td {
    border: 1px solid #f3f0f0;
  }

  .exchange-rate-table thead th {
    padding-top: 6px !important;
    padding-bottom: 6px !important;
  }

  .exchange-rate-table tbody td {
    padding-top: 7.5px !important;
    padding-bottom: 7.5px !important;
  }

  * {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>

<style>
/* Non-scoped styles for v-html rendered content */
/* Trend arrow styling - CSS triangle arrows */
.triangle-left,
.triangle-right,
.triangle-top,
.triangle-bottom {
  width: 0;
  height: 0;
  display: inline-block;
  margin-left: 5px;
  vertical-align: baseline;
}

.triangle-left,
.triangle-right {
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.triangle-top,
.triangle-bottom {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
}

/* Right arrow - Gray for neutral (< 2% change) */
.triangle-right {
  border-left: 10px solid #666666;
}

/* Up arrow - Red for price increase */
.triangle-top {
  border-bottom: 10px solid #ff0000;
}

/* Down arrow - Green for price decrease */
.triangle-bottom {
  border-top: 10px solid #00aa00;
}

/* Tablet/Print size (794px - A4 width) - Arrow size overrides */
@media (min-width: 600px) and (max-width: 959px) {
  .triangle-right,
  .triangle-top,
  .triangle-bottom {
    margin-left: 2px;
  }

  .triangle-left,
  .triangle-right {
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
  }

  .triangle-top,
  .triangle-bottom {
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
  }

  .triangle-right {
    border-left: 6px solid #666666;
  }

  .triangle-top {
    border-bottom: 6px solid #ff0000;
  }

  .triangle-bottom {
    border-top: 6px solid #00aa00;
  }
}
</style>
