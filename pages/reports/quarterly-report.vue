<template>
  <div class="quarterly-report-page" :class="`locale-${$i18n.locale.split('-')[0]}`">
    <div class="container">
      <!-- Print-only header with date and quarter -->
      <header v-if="selectedQuarter && selectedYear" class="print-header">
        <div class="print-date-info">
          <strong>{{ $t('reporting_period') }}:</strong>
          {{ $t(`q${selectedQuarter}`) }} {{ selectedYear }}
        </div>
      </header>

      <!-- Filters Section -->
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
                :label="$t('quarter') + ' *'"
                v-model="selectedQuarter"
                :items="availableQuartersFormatted"
                item-text="label"
                item-value="value"
                outlined
                dense
                hide-details
                required
                :disabled="!selectedYear"
                :loading="loadingQuarter"
                @change="onQuarterChange"
              ></v-select>
            </div>
            <div class="filter-actions">
              <v-btn @click="resetFilter" color="teal lighten-1" class="white--text">
                {{ $t('reset_filter') }}
              </v-btn>
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
          <div v-if="selectedQuarter" class="issue-number">Q{{ selectedQuarter }}</div>
          <div v-if="getQuarterPeriod()" class="quarter-period">{{ getQuarterPeriod() }}</div>
        </div>

        <!-- Right Column: Report Title -->
        <div class="report-title">
          {{ $t('quarterly_market_report') }}
        </div>
      </div>

      <!-- WFP Report Content - Two Column Section (Highlights + Volatile Products) -->
      <div class="wfp-report-content">
        <!-- Left Column: WFP Banner -->
        <div class="wfp-banner-column">
          <img src="/wfp-logo.svg" alt="WFP" class="wfp-banner" />
          <div class="wfp-taglines-wrapper">
            <p class="wfp-tagline">SAVING<br>LIVES</p>
            <p class="wfp-tagline">CHANGING<br>LIVES</p>
          </div>
        </div>

        <!-- Right Column: Highlights + Volatile Products Only -->
        <div class="report-data-column">
          <!-- Highlights Section -->
          <section v-if="highlightsData.length > 0" class="highlights-section">
            <h2 class="section-title">{{ $t('highlights') }}</h2>
            <ul class="highlights-list">
              <li v-for="(highlight, index) in highlightsData" :key="index">
                {{ highlight.text }}
                <ul v-if="highlight.children && highlight.children.length > 0" class="highlights-sublist">
                  <li v-for="(child, childIndex) in highlight.children" :key="`${index}-${childIndex}`">
                    {{ child.text }}
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          <!-- Market Monitoring Results Section - Only Food Prices + Volatile Products -->
          <section v-if="foodPriceAnalysisData" class="market-monitoring-section">
            <h2 class="section-title section-title-primary">{{ $t('market_monitoring_results') }}</h2>

            <!-- Food Price Analysis Subsection -->
            <h3 class="subsection-title">{{ $t('food_prices') }}</h3>

            <!-- Quarter-on-Quarter Analysis -->
            <p v-if="foodPriceAnalysisData.qoq_text" class="analysis-text">
              {{ foodPriceAnalysisData.qoq_text }}
            </p>

            <!-- Year-on-Year Analysis -->
            <p v-if="foodPriceAnalysisData.yoy_text" class="analysis-text">
              {{ foodPriceAnalysisData.yoy_text }}
            </p>

            <!-- TOP-3 Volatile Products Chart -->
            <div v-if="foodPriceAnalysisData.volatile_products && foodPriceAnalysisData.volatile_products.length > 0" class="volatile-products-section">
              <h4 class="chart-title">{{ foodPriceAnalysisData.chart_title }}</h4>
              <div class="chart-container">
                <canvas ref="volatileProductsChart"></canvas>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Full Width Content (Energy Prices + All Subsequent Sections) -->
      <div class="full-width-content">
        <!-- Energy Prices Section -->
        <section v-if="energyPricesData && energyPricesData.analysis_text" class="energy-prices-section">
          <h3 class="subsection-title">{{ $t('energy_prices') }}</h3>

          <!-- Energy Analysis Text -->
          <p class="analysis-text">
            {{ energyPricesData.analysis_text }}
          </p>

          <!-- Energy Price Trends Chart -->
          <div v-if="energyPricesData.trends && energyPricesData.trends.length > 0" class="energy-chart-wrapper">
            <div class="energy-chart-container">
              <canvas ref="energyPricesChart"></canvas>
            </div>
          </div>
        </section>

        <!-- Food Basket Section -->
        <section v-if="foodBasketChartData && foodBasketChartData.products && foodBasketChartData.products.length > 0" class="food-basket-section">
          <h3 class="subsection-title">{{ foodBasketChartData.title }}</h3>

          <div class="food-basket-content">
            <!-- Left side: Analysis text -->
            <div class="food-basket-analysis">
              <p class="analysis-text">
                {{ foodBasketChartData.analysis_text }}
                <span v-if="foodBasketChartData.regional_analysis"> {{ foodBasketChartData.regional_analysis }}</span>
              </p>
            </div>

            <!-- Right side: Stacked bar chart -->
            <div class="food-basket-chart-wrapper">
              <div class="food-basket-chart-container">
                <canvas ref="foodBasketChart"></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Food Basket Cost Per Region Chart -->
        <section v-if="foodBasketRegionChartData && foodBasketRegionChartData.regions && foodBasketRegionChartData.regions.length > 0" class="food-basket-region-section">
          <div class="food-basket-region-chart-container">
            <canvas ref="foodBasketRegionChart"></canvas>
          </div>
          <div class="chart-notes">
            <span class="note-item">{{ foodBasketRegionChartData.labels.pp_note }}</span>
            <span class="note-item">{{ foodBasketRegionChartData.labels.hh_note }}</span>
          </div>
        </section>

        <!-- FB Cost Trends Chart -->
        <section v-if="foodBasketTrendsData && foodBasketTrendsData.trends && foodBasketTrendsData.trends.length > 0" class="fb-cost-trends-section">
          <div class="fb-cost-trends-chart-container">
            <canvas ref="fbCostTrendsChart"></canvas>
          </div>
          <p v-if="foodBasketTrendsData.analysis_text" class="chart-description">
            {{ foodBasketTrendsData.analysis_text }}
          </p>
        </section>

        <!-- Food Basket Trends Chart -->
        <section v-if="foodBasketTrendsData && foodBasketTrendsData.length > 0" class="fb-trends-section">
          <h2 class="section-title">{{ $t('food_basket_section') }} - Trends</h2>
          <QuarterlyFoodBasketTrendsChart :trendsData="foodBasketTrendsData" />
        </section>

        <!-- Wage & Purchasing Power Section -->
        <section v-if="wageData && wageData.regional_data && wageData.regional_data.length > 0" class="wage-section">
          <h2 class="section-title">{{ $t('casual_labour_wage_purchasing_power') }}</h2>

          <!-- Analysis Text -->
          <p v-if="wageData.analysis_text" class="analysis-text wage-analysis-text">
            {{ wageData.analysis_text }}
          </p>

          <!-- Regional Wage Chart -->
          <div class="wage-chart-section">
            <h3 class="chart-subtitle">{{ $t('regional_wage_purchasing_power') }}: <span class="chart-period">{{ wageData.chart_subtitle }}</span></h3>
            <div class="wage-chart-container">
              <canvas ref="wageRegionalChart"></canvas>
            </div>
            <div class="chart-legend-notes">
              <span class="legend-note">{{ wageData.legend?.sl }}</span>
              <span class="legend-note">{{ wageData.legend?.ul }}</span>
            </div>
          </div>
        </section>

        <!-- National Level Economic Indicators Section -->
        <section v-if="nationalEconomicData && nationalEconomicData.subsections && nationalEconomicData.subsections.length > 0" class="economic-indicators-section">
          <h2 class="section-title">{{ nationalEconomicData.section_title }}</h2>

          <!-- Inflation Trends Subsection -->
          <div class="subsection">
            <h3 class="subsection-title">{{ nationalEconomicData.subsections[0].title }}</h3>

            <!-- Monthly Inflation Chart -->
            <div v-if="nationalEconomicData.subsections[0].charts && nationalEconomicData.subsections[0].charts[0]" class="inflation-chart-block">
              <div class="chart-description-container">
                <p v-if="nationalEconomicData.subsections[0].charts[0].description" class="chart-description">{{ nationalEconomicData.subsections[0].charts[0].description }}</p>
                <div class="chart-container">
                  <h4 class="chart-title">{{ nationalEconomicData.subsections[0].charts[0].title }}</h4>
                  <span class="chart-subtitle-text">{{ nationalEconomicData.subsections[0].charts[0].subtitle }}</span>
                  <div class="inflation-chart-wrapper">
                    <canvas ref="monthlyInflationChart"></canvas>
                  </div>
                </div>
              </div>
            </div>

            <!-- Annual Inflation Chart -->
            <div v-if="nationalEconomicData.subsections[0].charts && nationalEconomicData.subsections[0].charts[1]" class="inflation-chart-block annual-chart-block">
              <div class="chart-description-container">
                <p v-if="nationalEconomicData.subsections[0].charts[1].description" class="chart-description">{{ nationalEconomicData.subsections[0].charts[1].description }}</p>
                <div class="chart-container">
                  <h4 class="chart-title">{{ nationalEconomicData.subsections[0].charts[1].title }}</h4>
                  <span class="chart-subtitle-text">{{ nationalEconomicData.subsections[0].charts[1].subtitle }}</span>
                  <div class="inflation-chart-wrapper annual-chart-wrapper">
                    <canvas ref="annualInflationChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Import and Export of Key Commodities -->
        <section v-if="importExportData && importExportData.highlight_text" class="import-export-section">
          <h2 class="section-title">{{ importExportData.title }}</h2>

          <!-- Highlight Text -->
          <p class="import-export-highlight-text">{{ importExportData.highlight_text }}</p>

          <!-- Import/Export Table -->
          <div v-if="importExportData.table_data" class="import-export-table-wrapper">
            <table class="import-export-table">
              <thead>
                <tr>
                  <th rowspan="2"></th>
                  <th>{{ $t('cur_month') }}</th>
                  <th>{{ $t('last_month') }}</th>
                  <th>{{ $t('changes') }}</th>
                  <th>{{ $t('cur_quarter') }}</th>
                  <th>{{ $t('three_months_ago') }}</th>
                  <th>{{ $t('changes') }}</th>
                  <th>{{ $t('one_year_ago') }}</th>
                  <th>{{ $t('changes') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in importExportData.table_data.rows" :key="index">
                  <td class="indicator-cell">{{ $t('import_export_' + row.indicator) }}</td>
                  <td>{{ formatImportExportValue(row.indicator, row.cur_month) }}</td>
                  <td>{{ formatImportExportValue(row.indicator, row.last_month) }}</td>
                  <td :class="getImportExportChangeClass(row.mom_change)">{{ formatImportExportChange(row.mom_change) }}</td>
                  <td>{{ formatImportExportValue(row.indicator, row.cur_quarter) }}</td>
                  <td>{{ formatImportExportValue(row.indicator, row.three_months_ago) }}</td>
                  <td :class="getImportExportChangeClass(row.qoq_change)">{{ formatImportExportChange(row.qoq_change) }}</td>
                  <td>{{ formatImportExportValue(row.indicator, row.one_year_ago) }}</td>
                  <td :class="getImportExportChangeClass(row.yoy_change)">{{ formatImportExportChange(row.yoy_change) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Changes in Imports of Key Commodities -->
        <section v-if="hasImportChangesData" class="import-changes-section">
          <h2 class="section-title">{{ importChangesData.title }}: <span class="period-highlight">{{ importChangesData.period_label }}</span></h2>

          <div class="import-changes-table-wrapper">
            <table class="import-changes-table">
              <thead>
                <tr>
                  <th rowspan="3" class="col-no">{{ $t('no') }}</th>
                  <th rowspan="3" class="col-item">{{ $t('item') }}</th>
                  <th colspan="2" class="col-group">{{ $t('cur_quarter') }}</th>
                  <th colspan="4" class="col-group">{{ $t('three_months_ago') }}</th>
                  <th colspan="4" class="col-group">{{ $t('one_year_ago') }}</th>
                </tr>
                <tr>
                  <th rowspan="2" class="col-qty">{{ $t('quantity_short') }}</th>
                  <th rowspan="2" class="col-amt">{{ $t('amount_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('quantity_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('amount_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('quantity_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('amount_short') }}</th>
                </tr>
                <tr>
                  <th class="col-unit">{{ $t('tmt') }}</th>
                  <th class="col-percent">%</th>
                  <th class="col-unit">{{ $t('mln_usd') }}</th>
                  <th class="col-percent">%</th>
                  <th class="col-unit">{{ $t('tmt') }}</th>
                  <th class="col-percent">%</th>
                  <th class="col-unit">{{ $t('mln_usd') }}</th>
                  <th class="col-percent">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in importChangesData.table_data.rows" :key="row.commodity_key">
                  <td class="text-center">{{ row.no }}</td>
                  <td class="col-item-name">{{ $t('commodity_' + row.commodity_key) }}</td>
                  <td class="text-right">{{ formatNumber(row.cur_qty) }}</td>
                  <td class="text-right">{{ formatNumber(row.cur_amt) }}</td>
                  <td class="text-right">{{ formatNumber(row.three_months_qty) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.three_months_qty_change)">{{ formatImportChangePercent(row.three_months_qty_change) }}</td>
                  <td class="text-right">{{ formatNumber(row.three_months_amt) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.three_months_amt_change)">{{ formatImportChangePercent(row.three_months_amt_change) }}</td>
                  <td class="text-right">{{ formatNumber(row.one_year_qty) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.one_year_qty_change)">{{ formatImportChangePercent(row.one_year_qty_change) }}</td>
                  <td class="text-right">{{ formatNumber(row.one_year_amt) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.one_year_amt_change)">{{ formatImportChangePercent(row.one_year_amt_change) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="tmt-abbreviation">* {{ $t('tmt_abbreviation') }}</p>

          <!-- Import Changes Chart - Quantity (TMT) -->
          <div v-if="importChangesData.table_data.rows && importChangesData.table_data.rows.length > 0" class="import-changes-chart-section">
            <import-changes-chart
              :chartData="importChangesData.table_data.rows"
              dataType="quantity"
              :locale="$i18n.locale"
              :title="importChangesData.title + ': ' + importChangesData.period_label + ', ' + $t('tmt') + '*'"
            />
          </div>

          <!-- Import Changes Chart - Amount (mln. USD) -->
          <div v-if="importChangesData.table_data.rows && importChangesData.table_data.rows.length > 0" class="import-changes-chart-section">
            <import-changes-chart
              :chartData="importChangesData.table_data.rows"
              dataType="amount"
              :locale="$i18n.locale"
              :title="importChangesData.title + ': ' + importChangesData.period_label + ', ' + $t('mln_usd') + '*'"
            />
          </div>
        </section>

        <!-- Changes in Exports of Key Commodities -->
        <section v-if="hasExportChangesData" class="export-changes-section">
          <h2 class="section-title">{{ exportChangesData.title }}: <span class="period-highlight">{{ exportChangesData.period_label }}</span></h2>

          <div class="export-changes-table-wrapper">
            <table class="export-changes-table">
              <thead>
                <tr>
                  <th rowspan="3" class="col-no">{{ $t('no') }}</th>
                  <th rowspan="3" class="col-item">{{ $t('item') }}</th>
                  <th colspan="2" class="col-group">{{ $t('cur_quarter') }}</th>
                  <th colspan="4" class="col-group">{{ $t('three_months_ago') }}</th>
                  <th colspan="4" class="col-group">{{ $t('one_year_ago') }}</th>
                </tr>
                <tr>
                  <th rowspan="2" class="col-qty">{{ $t('quantity_short') }}</th>
                  <th rowspan="2" class="col-amt">{{ $t('amount_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('quantity_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('amount_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('quantity_short') }}</th>
                  <th colspan="2" class="col-subgroup">{{ $t('amount_short') }}</th>
                </tr>
                <tr>
                  <th class="col-unit">{{ $t('tmt') }}</th>
                  <th class="col-percent">%</th>
                  <th class="col-unit">{{ $t('mln_usd') }}</th>
                  <th class="col-percent">%</th>
                  <th class="col-unit">{{ $t('tmt') }}</th>
                  <th class="col-percent">%</th>
                  <th class="col-unit">{{ $t('mln_usd') }}</th>
                  <th class="col-percent">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in exportChangesData.table_data.rows" :key="row.commodity_key">
                  <td class="text-center">{{ row.no }}</td>
                  <td class="col-item-name">{{ $t('commodity_export_' + row.commodity_key) }}</td>
                  <td class="text-right">{{ formatNumber(row.cur_qty) }}</td>
                  <td class="text-right">{{ formatNumber(row.cur_amt) }}</td>
                  <td class="text-right">{{ formatNumber(row.three_months_qty) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.three_months_qty_change)">{{ formatImportChangePercent(row.three_months_qty_change) }}</td>
                  <td class="text-right">{{ formatNumber(row.three_months_amt) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.three_months_amt_change)">{{ formatImportChangePercent(row.three_months_amt_change) }}</td>
                  <td class="text-right">{{ formatNumber(row.one_year_qty) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.one_year_qty_change)">{{ formatImportChangePercent(row.one_year_qty_change) }}</td>
                  <td class="text-right">{{ formatNumber(row.one_year_amt) }}</td>
                  <td class="text-right" :class="getImportChangeClass(row.one_year_amt_change)">{{ formatImportChangePercent(row.one_year_amt_change) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="tmt-abbreviation">* {{ $t('tmt_abbreviation') }}</p>

          <!-- Export Changes Chart - Quantity (TMT) -->
          <div v-if="exportChangesData.table_data.rows && exportChangesData.table_data.rows.length > 0" class="export-changes-chart-section">
            <import-changes-chart
              :chartData="exportChangesData.table_data.rows"
              dataType="quantity"
              :locale="$i18n.locale"
              :title="exportChangesData.title + ': ' + exportChangesData.period_label + ', ' + $t('tmt') + '*'"
              translationPrefix="commodity_export_"
            />
          </div>

          <!-- Export Changes Chart - Amount (mln. USD) -->
          <div v-if="exportChangesData.table_data.rows && exportChangesData.table_data.rows.length > 0" class="export-changes-chart-section">
            <import-changes-chart
              :chartData="exportChangesData.table_data.rows"
              dataType="amount"
              :locale="$i18n.locale"
              :title="exportChangesData.title + ': ' + exportChangesData.period_label + ', ' + $t('mln_usd') + '*'"
              translationPrefix="commodity_export_"
            />
          </div>
        </section>

        <!-- Annex 1: Food Basket Breakdown -->
        <section v-if="annex1Data && annex1Data.table_data && annex1Data.table_data.products" class="annex1-section">
          <h2 class="section-title">{{ $t('annex_1_fb_calculation') }}</h2>

          <!-- Food Basket Breakdown Table -->
          <food-basket-breakdown-table
            :tableData="annex1Data.table_data"
          ></food-basket-breakdown-table>

          <!-- Food Basket Breakdown Chart (Doughnut) -->
          <div v-if="annex1Data.chart_data && annex1Data.chart_data.chart_data && annex1Data.chart_data.chart_data.length > 0" class="annex1-chart-container">
            <food-basket-breakdown-chart
              :chartData="annex1Data.chart_data"
            ></food-basket-breakdown-chart>
          </div>
        </section>

        <!-- Annex 2: Changes in Retail Prices -->
        <section v-if="annex2Data && annex2Data.length > 0" class="annex2-section">
          <h2 class="section-title">{{ $t('annex_2_price_changes') }}</h2>

          <div class="table-wrapper">
            <table class="annex2-table">
              <thead>
                <tr>
                  <th rowspan="2" class="text-center">№</th>
                  <th rowspan="2" class="text-left">{{ $t('item') }}</th>
                  <th rowspan="2" class="text-center">{{ $t('unit') }}</th>
                  <th colspan="4" class="text-center">{{ $t('average') }} {{ $t('price') }} (TJS)</th>
                </tr>
                <tr>
                  <th class="text-center">{{ $t('current_month') }}</th>
                  <th class="text-center">{{ $t('last_month') }}</th>
                  <th class="text-center">{{ $t('three_months_ago') }}</th>
                  <th class="text-center">{{ $t('one_year_ago') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in annex2Data" :key="`annex2-${index}`">
                  <td class="text-center">{{ product.no }}</td>
                  <td class="text-left">{{ product.name }}</td>
                  <td class="text-center">{{ product.unit }}</td>
                  <td class="text-right">{{ formatPrice(product.prices.current_month) }}</td>
                  <td class="text-right">
                    {{ formatPrice(product.prices.last_month) }}
                    <span :class="getTrendClass(product.changes.vs_last_month_trend)">
                      {{ product.changes.vs_last_month_trend }}
                    </span>
                    <span class="change-percent" :class="getChangeClass(product.changes.vs_last_month)">
                      {{ formatChange(product.changes.vs_last_month) }}
                    </span>
                  </td>
                  <td class="text-right">
                    {{ formatPrice(product.prices.three_months_ago) }}
                    <span :class="getTrendClass(product.changes.vs_three_months_ago_trend)">
                      {{ product.changes.vs_three_months_ago_trend }}
                    </span>
                    <span class="change-percent" :class="getChangeClass(product.changes.vs_three_months_ago)">
                      {{ formatChange(product.changes.vs_three_months_ago) }}
                    </span>
                  </td>
                  <td class="text-right">
                    {{ formatPrice(product.prices.one_year_ago) }}
                    <span :class="getTrendClass(product.changes.vs_one_year_ago_trend)">
                      {{ product.changes.vs_one_year_ago_trend }}
                    </span>
                    <span class="change-percent" :class="getChangeClass(product.changes.vs_one_year_ago)">
                      {{ formatChange(product.changes.vs_one_year_ago) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="annex2-legend-wrapper">
            <p class="annex2-legend-title">{{ $t('annex2_legend_title') }}</p>
            <div class="annex2-legend">
              <span class="legend-item">
                <span class="trend-icon increase">▲</span> {{ $t('annex2_increase_label') || 'Increase when % > 5' }}
              </span>
              <span class="legend-item">
                <span class="trend-icon decrease">▼</span> {{ $t('annex2_decrease_label') || 'Decrease when % < -5' }}
              </span>
              <span class="legend-item">
                <span class="trend-icon stable">▶</span> {{ $t('annex2_stable_label') || 'Stable when % between 5 and -5' }}
              </span>
            </div>
          </div>
        </section>
      </div>

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
            color="red darken-2"
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
import QuarterlyFoodBasketTrendsChart from '~/components/QuarterlyFoodBasketTrendsChart.vue';
import FoodBasketBreakdownTable from '~/components/FoodBasketBreakdownTable.vue';
import FoodBasketBreakdownChart from '~/components/FoodBasketBreakdownChart.vue';
import ImportChangesChart from '~/components/ImportChangesChart.vue';
import { Chart, registerables } from 'chart.js';

if (process.client) {
  Chart.register(...registerables);
}

export default {
  name: 'QuarterlyReport',

  components: {
    QuarterlyFoodBasketTrendsChart,
    FoodBasketBreakdownTable,
    FoodBasketBreakdownChart,
    ImportChangesChart
  },

  layout: 'clean',

  head() {
    return {
      title: this.$i18n.t('quarterly_market_report')
    };
  },

  data() {
    return {
      loading: false,
      filterPanel: true,
      selectedYear: null,
      selectedQuarter: null,
      axiosError: false,
      axiosErrorMsg: '',

      // Loading states for filters
      loadingYear: false,
      loadingQuarter: false,

      // Filter options from API
      availableYears: [],
      availableQuarters: {},

      // Report data
      highlightsData: [],
      foodPriceAnalysisData: null,
      foodPricesData: [],
      energyPricesData: null,
      foodBasketChartData: null,
      foodBasketRegionChartData: null,
      foodBasketRegionData: [],
      foodBasketTrendsData: null,
      wageData: null,
      nationalEconomicData: null,
      inflationMonthlyData: null,
      inflationAnnualData: null,
      importExportData: null,
      importChangesData: null,
      exportChangesData: null,
      annex1Data: null,
      annex2Data: [],

      // Chart instances
      volatileChart: null,
      energyChart: null,
      foodBasketChart: null,
      foodBasketRegionChart: null,
      fbCostTrendsChart: null,
      wageRegionalChart: null,
      monthlyInflationChart: null,
      annualInflationChart: null,

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
    availableQuartersFormatted() {
      if (!this.selectedYear || !this.availableQuarters[this.selectedYear]) {
        return [];
      }

      return this.availableQuarters[this.selectedYear].map(q => ({
        value: q,
        label: this.$t(`q${q}`)
      }));
    },

    isFilterValid() {
      return this.selectedYear && this.selectedQuarter;
    },

    hasImportChangesData() {
      if (!this.importChangesData?.table_data?.rows) return false;
      return this.importChangesData.table_data.rows.some(
        row => row.cur_qty > 0 || row.cur_amt > 0
      );
    },

    hasExportChangesData() {
      if (!this.exportChangesData?.table_data?.rows) return false;
      return this.exportChangesData.table_data.rows.some(
        row => row.cur_qty > 0 || row.cur_amt > 0
      );
    },

    isPdfButtonDisabled() {
      // Disable PDF button if:
      // 1. Report data not loaded yet
      // 2. Currently generating PDF
      // 3. Filters not valid
      return !this.highlightsData.length ||
             this.generatingPdf ||
             !this.isFilterValid;
    }
  },

  async mounted() {
    let countryId = this.$cookies.get('country_id');
    if (countryId) {
      this.$store.commit('setCountryID', countryId);
      await this.fetchAvailableFilters();
    }
    // Check PDF service health
    this.checkPdfServiceHealth();
  },

  watch: {
    foodPriceAnalysisData: {
      handler(newVal) {
        if (newVal && newVal.volatile_products && newVal.volatile_products.length > 0) {
          this.$nextTick(() => {
            this.renderVolatileProductsChart();
          });
        }
      },
      deep: true
    },
    energyPricesData: {
      handler(newVal) {
        if (newVal && newVal.trends && newVal.trends.length > 0) {
          this.$nextTick(() => {
            this.renderEnergyPricesChart();
          });
        }
      },
      deep: true
    },
    foodBasketChartData: {
      handler(newVal) {
        if (newVal && newVal.products && newVal.products.length > 0) {
          this.$nextTick(() => {
            this.renderFoodBasketChart();
          });
        }
      },
      deep: true
    },
    foodBasketRegionChartData: {
      handler(newVal) {
        if (newVal && newVal.regions && newVal.regions.length > 0) {
          this.$nextTick(() => {
            this.renderFoodBasketRegionChart();
          });
        }
      },
      deep: true
    },
    foodBasketTrendsData: {
      handler(newVal) {
        if (newVal && newVal.trends && newVal.trends.length > 0) {
          this.$nextTick(() => {
            this.renderFBCostTrendsChart();
          });
        }
      },
      deep: true
    },
    wageData: {
      handler(newVal) {
        if (newVal && newVal.regional_data && newVal.regional_data.length > 0) {
          this.$nextTick(() => {
            this.renderWageRegionalChart();
          });
        }
      },
      deep: true
    },
    nationalEconomicData: {
      handler(newVal) {
        if (newVal && newVal.subsections && newVal.subsections.length > 0) {
          this.$nextTick(() => {
            this.renderInflationCharts();
          });
        }
      },
      deep: true
    }
  },

  methods: {
    countryName() {
      if (this.$store.state.countryId == 1) return this.$t('tajikistan_menu');
      else if (this.$store.state.countryId == 2) return this.$t('kyrgyzstan');
      else return '';
    },

    getQuarterPeriod() {
      // Return quarter date range (e.g., "Jan - March, 2024")
      if (!this.selectedQuarter || !this.selectedYear) {
        return '';
      }

      const quarterMonths = {
        1: [this.$t('Jan'), this.$t('March')],
        2: [this.$t('April'), this.$t('June')],
        3: [this.$t('July'), this.$t('Sep')],
        4: [this.$t('Oct'), this.$t('Dec')]
      };

      const months = quarterMonths[this.selectedQuarter];
      if (months) {
        return `${months[0]} - ${months[1]}, ${this.selectedYear}`;
      }
      return '';
    },

    async fetchAvailableFilters() {
      this.loadingYear = true;

      try {
        let response = await this.$axios.get(
          `/v1/quarterly-report-filters/${this.$store.state.countryId}`
        );

        if (response.status == 200) {
          this.availableYears = response.data.years || [];
          this.availableQuarters = response.data.quarters || {};

          // Auto-select latest year and quarter
          if (this.availableYears.length > 0) {
            this.selectedYear = Math.max(...this.availableYears);
            await this.$nextTick();

            if (this.availableQuarters[this.selectedYear]) {
              const quarters = this.availableQuarters[this.selectedYear];
              this.selectedQuarter = Math.max(...quarters);
              await this.$nextTick();

              // Auto-fetch report
              await this.fetchQuarterlyReport();
            }
          }
        }
      } catch (err) {
        console.error(err);
        this.axiosError = true;
        this.axiosErrorMsg = err.response?.data?.message || 'Error loading filters';
      } finally {
        this.loadingYear = false;
      }
    },

    async onYearChange() {
      this.selectedQuarter = null;
      this.clearAllData();
    },

    async onQuarterChange() {
      if (this.isFilterValid) {
        await this.fetchQuarterlyReport();
      }
    },

    async fetchQuarterlyReport() {
      this.loading = true;

      try {
        let response = await this.$axios.get(
          `/v1/quarterly-report/${this.$store.state.countryId}/${this.$i18n.locale}`,
          {
            params: {
              year: this.selectedYear,
              quarter: this.selectedQuarter
            }
          }
        );

        if (response.status == 200) {
          const data = response.data;

          // Populate report data
          this.highlightsData = data.highlights || [];
          this.foodPriceAnalysisData = data.food_price_analysis;
          this.foodPricesData = data.food_prices || [];
          this.energyPricesData = data.energy_prices || null;
          this.foodBasketChartData = data.food_basket_chart || null;
          this.foodBasketRegionChartData = data.food_basket_region_chart || null;
          this.foodBasketRegionData = data.food_basket_region || [];
          this.foodBasketTrendsData = data.food_basket_trends;
          this.wageData = data.wage_purchasing_power || null;
          this.nationalEconomicData = data.national_economic_indicators || null;
          this.inflationMonthlyData = data.inflation_monthly;
          this.inflationAnnualData = data.inflation_annual;
          this.importExportData = data.import_export;
          this.importChangesData = data.import_changes || null;
          this.exportChangesData = data.export_changes || null;
          this.annex1Data = data.annex1_food_basket || null;
          this.annex2Data = data.annex2_price_changes || [];
        }
      } catch (err) {
        console.error(err);
        this.axiosError = true;
        this.axiosErrorMsg = err.response?.data?.message || 'Error loading report';
      } finally {
        this.loading = false;
      }
    },

    clearAllData() {
      this.highlightsData = [];
      this.foodPriceAnalysisData = null;
      this.foodPricesData = [];
      this.energyPricesData = null;
      this.foodBasketChartData = null;
      this.foodBasketRegionChartData = null;
      this.foodBasketRegionData = [];
      this.foodBasketTrendsData = null;
      this.wageData = null;
      this.nationalEconomicData = null;
      this.inflationMonthlyData = null;
      this.inflationAnnualData = null;
      this.importExportData = null;
      this.importChangesData = null;
      this.exportChangesData = null;
      this.annex1Data = null;
      this.annex2Data = [];
    },

    resetFilter() {
      this.selectedYear = null;
      this.selectedQuarter = null;
      this.clearAllData();
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
        // Prepare payload for quarterly report PDF
        const payload = {
          year: this.selectedYear,
          quarter: this.selectedQuarter,
          locale: this.$i18n.locale,
          page: 'all'  // Always generate full report
        };

        // Call PDF service API for quarterly report
        const response = await this.$axios.post(
          `${this.$config.pdfServiceURL}/reports/quarterly`,
          payload
        );

        if (response.status === 200 && response.data.success) {
          // Construct full download URL
          const downloadUrl = `${this.$config.pdfServiceURL}${response.data.url}&locale=${this.$i18n.locale}&year=${this.selectedYear}&quarter=${this.selectedQuarter}&page=all`;

          // Download PDF file
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = response.data.filename || `quarterly-report-${this.$i18n.locale}-${this.selectedYear}-q${this.selectedQuarter}.pdf`;
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

    formatPrice(price) {
      if (price === null || price === undefined) return '-';
      return parseFloat(price).toFixed(2);
    },

    formatChange(change) {
      if (change === null || change === undefined) return '';
      const formatted = parseFloat(change).toFixed(2);
      return change > 0 ? `+${formatted}%` : `${formatted}%`;
    },

    getTrendClass(trend) {
      if (!trend) return '';
      if (trend === '▲') return 'trend-icon increase';
      if (trend === '▼') return 'trend-icon decrease';
      return 'trend-icon stable';
    },

    getChangeClass(change) {
      if (change === null || change === undefined) return '';
      if (change > 5) return 'change-increase';
      if (change < -5) return 'change-decrease';
      return 'change-stable';
    },

    async renderVolatileProductsChart() {
      if (!process.client || !this.$refs.volatileProductsChart) return;

      const products = this.foodPriceAnalysisData.volatile_products;

      // We need monthly data for the entire year to match Excel chart
      // For now, we'll fetch this data from the API
      // The chart should show 12 months (Jan-Dec) with lines for 2024 and 2023

      // Destroy existing chart if any
      if (this.volatileChart) {
        this.volatileChart.destroy();
      }

      // Month labels
      const monthLabels = [
        this.$t('Jan'), this.$t('Feb'), this.$t('March'), this.$t('April'),
        this.$t('May'), this.$t('June'), this.$t('July'), this.$t('Aug'),
        this.$t('Sep'), this.$t('Oct'), this.$t('Nov'), this.$t('Dec')
      ];

      // For demonstration, create datasets for top 3 products
      // Each product will have 2 lines: solid for current year, dashed for previous year
      const datasets = [];
      const colors = ['#5470c6', '#fc8452', '#91cc75']; // Blue, Red, Green

      products.forEach((product, index) => {
        // Solid line for 2024
        datasets.push({
          label: `${product.name}, kg, ${this.selectedYear}`,
          data: this.generateMonthlyData(product, 'current'),
          borderColor: colors[index],
          backgroundColor: colors[index],
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderDash: []
        });

        // Dashed line for 2023
        datasets.push({
          label: `${product.name}, kg, ${this.selectedYear - 1}`,
          data: this.generateMonthlyData(product, 'previous'),
          borderColor: colors[index],
          backgroundColor: colors[index],
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderDash: [5, 5]
        });
      });

      const ctx = this.$refs.volatileProductsChart.getContext('2d');
      this.volatileChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 11
                },
                usePointStyle: true,
                padding: 15,
                generateLabels: function(chart) {
                  const datasets = chart.data.datasets;
                  return datasets.map((dataset, i) => ({
                    text: dataset.label,
                    fillStyle: dataset.borderColor,
                    strokeStyle: dataset.borderColor,
                    lineWidth: 2,
                    hidden: !chart.isDatasetVisible(i),
                    lineDash: dataset.borderDash,
                    index: i
                  }));
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y.toFixed(2);
                  return `${label}: ${value} TJS`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'TJS per unit',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            },
            x: {
              title: {
                display: false
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    },

    generateMonthlyData(product, type) {
      // This is a placeholder - in production, you'd fetch actual monthly data
      // For now, simulate seasonal variation based on current and previous prices
      const currentPrice = product.current_price;
      const previousPrice = product.previous_price;
      const basePrice = type === 'current' ? currentPrice : previousPrice;

      // Simulate monthly variation (this should be replaced with actual API data)
      const months = 12;
      const data = [];
      const volatility = Math.abs(currentPrice - previousPrice) / previousPrice;

      for (let i = 0; i < months; i++) {
        // Create a sine wave pattern for seasonal variation
        const seasonal = Math.sin((i / months) * Math.PI * 2) * volatility * basePrice;
        const monthlyPrice = basePrice + seasonal;
        data.push(monthlyPrice > 0 ? parseFloat(monthlyPrice.toFixed(2)) : 0);
      }

      return data;
    },

    getEnergyChartYearRange() {
      if (!this.energyPricesData || !this.energyPricesData.trends || this.energyPricesData.trends.length === 0) {
        return '';
      }
      const trends = this.energyPricesData.trends;
      const years = trends.map(t => t.year).filter(y => y);
      if (years.length === 0) return '';
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      return minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`;
    },

    async renderEnergyPricesChart() {
      if (!process.client || !this.$refs.energyPricesChart) return;

      const trends = this.energyPricesData.trends;
      if (!trends || trends.length === 0) return;

      // Destroy existing chart if any
      if (this.energyChart) {
        this.energyChart.destroy();
      }

      // Prepare data - trends are sorted from newest to oldest, reverse for chart
      const sortedTrends = [...trends].reverse();

      // Quarter labels (e.g., "Q3 2020", "Q4 2020", ...)
      const labels = sortedTrends.map(t => t.quarter_label);

      // Extract data for each energy type
      const dieselData = sortedTrends.map(t => t.diesel !== null ? parseFloat(t.diesel.toFixed(2)) : null);
      const petrolData = sortedTrends.map(t => t.petrol !== null ? parseFloat(t.petrol.toFixed(2)) : null);
      const gasData = sortedTrends.map(t => t.gas !== null ? parseFloat(t.gas.toFixed(2)) : null);

      // Calculate dynamic Y-axis max
      const allEnergyValues = [...dieselData, ...petrolData, ...gasData].filter(v => v !== null);
      const maxEnergyValue = allEnergyValues.length > 0 ? Math.max(...allEnergyValues) : 16;
      const energyYAxisMax = Math.ceil(maxEnergyValue / 2) * 2; // Round up to nearest 2

      // Colors matching Excel chart
      const colors = {
        diesel: '#4472C4',  // Blue
        petrol: '#ED7D31',  // Orange
        gas: '#A5A5A5'      // Gray
      };

      const datasets = [
        {
          label: this.$t('diesel'),
          data: dieselData,
          backgroundColor: colors.diesel,
          borderColor: colors.diesel,
          borderWidth: 1,
          barPercentage: 0.8,
          categoryPercentage: 0.9
        },
        {
          label: this.$t('petrol'),
          data: petrolData,
          backgroundColor: colors.petrol,
          borderColor: colors.petrol,
          borderWidth: 1,
          barPercentage: 0.8,
          categoryPercentage: 0.9
        },
        {
          label: this.$t('gas'),
          data: gasData,
          backgroundColor: colors.gas,
          borderColor: colors.gas,
          borderWidth: 1,
          barPercentage: 0.8,
          categoryPercentage: 0.9
        }
      ];

      // Build chart title with year range
      const chartTitle = `${this.$t('energy_price_trends')}: ${this.getEnergyChartYearRange()}`;

      const ctx = this.$refs.energyPricesChart.getContext('2d');
      this.energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: chartTitle,
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 20
              },
              align: 'center'
            },
            legend: {
              position: 'bottom',
              align: 'center',
              labels: {
                font: {
                  size: 11
                },
                usePointStyle: true,
                pointStyle: 'rect',
                padding: 20,
                boxWidth: 12,
                boxHeight: 12
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y !== null ? context.parsed.y.toFixed(2) : '-';
                  return `${label}: ${value} TJS`;
                }
              }
            },
            // Disable chartjs-plugin-datalabels default behavior
            datalabels: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: energyYAxisMax,
              title: {
                display: true,
                text: this.$t('tjs_per_unit'),
                font: {
                  size: 11,
                  weight: 'normal'
                },
                padding: {
                  bottom: 10
                }
              },
              ticks: {
                font: {
                  size: 10
                },
                stepSize: 2
              },
              grid: {
                color: '#e0e0e0'
              }
            },
            x: {
              title: {
                display: false
              },
              ticks: {
                font: {
                  size: 9
                },
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                display: false
              }
            }
          }
        },
        plugins: [{
          // Custom plugin to display values on top of bars
          id: 'datalabels',
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, datasetIndex) => {
              const meta = chart.getDatasetMeta(datasetIndex);
              meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                if (value !== null && value !== undefined) {
                  ctx.save();
                  ctx.fillStyle = '#333';
                  ctx.font = '9px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  ctx.fillText(value.toFixed(1), bar.x, bar.y - 2);
                  ctx.restore();
                }
              });
            });
          }
        }]
      });
    },

    async renderFoodBasketChart() {
      if (!process.client || !this.$refs.foodBasketChart) return;

      const chartData = this.foodBasketChartData;
      if (!chartData || !chartData.products || chartData.products.length === 0) return;

      // Destroy existing chart if any
      if (this.foodBasketChart) {
        this.foodBasketChart.destroy();
      }

      // Period labels for X-axis
      const labels = [
        chartData.period_labels.current_month,
        chartData.period_labels.last_month,
        chartData.period_labels.three_months_ago,
        chartData.period_labels.one_year_ago
      ];

      // Colors matching Excel chart (16 products, bottom to top)
      const productColors = [
        '#4472C4', // Rice (blue)
        '#C00000', // Potatoes (dark red)
        '#FFC000', // Haricot bean (gold)
        '#70AD47', // Milk (green)
        '#ED7D31', // Eggs (orange)
        '#5B9BD5', // Cabbage (light blue)
        '#FF6600', // Carrots (dark orange)
        '#9DC3E6', // Onions (pale blue)
        '#BF9000', // Cauliflower/Chinese cabbage (dark gold)
        '#7030A0', // Salt (purple)
        '#C55A11', // Sugar (brown)
        '#2E75B6', // Tea green (medium blue)
        '#8FAADC', // Apple (light blue)
        '#FF0000', // Vegetable oil (red)
        '#FFD966', // Chicken (light gold)
        '#A9D18E'  // Wheat flour (light green)
      ];

      // Build datasets for stacked chart (each product is a dataset)
      const datasets = chartData.products.map((product, index) => {
        return {
          label: product.name,
          data: [
            product.current_month,
            product.last_month,
            product.three_months_ago,
            product.one_year_ago
          ],
          backgroundColor: productColors[index % productColors.length],
          borderColor: productColors[index % productColors.length],
          borderWidth: 0.5
        };
      });

      // Totals for each period (displayed on top of stacked bars)
      const totals = [
        chartData.totals.current_month,
        chartData.totals.last_month,
        chartData.totals.three_months_ago,
        chartData.totals.one_year_ago
      ];

      // Calculate dynamic Y-axis max based on totals
      const maxTotal = Math.max(...totals.filter(v => v !== null && v !== undefined));
      const foodBasketYAxisMax = Math.ceil(maxTotal / 50) * 50 + 10; // Round up to nearest 50 with small buffer

      const ctx = this.$refs.foodBasketChart.getContext('2d');
      this.foodBasketChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: chartData.chart_title,
              font: {
                size: 13,
                weight: 'bold'
              },
              color: '#2E75B6',
              padding: {
                top: 5,
                bottom: 15
              },
              align: 'center'
            },
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                font: {
                  size: 10
                },
                usePointStyle: true,
                pointStyle: 'rect',
                padding: 8,
                boxWidth: 12,
                boxHeight: 12
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y !== null ? context.parsed.y.toFixed(1) : '-';
                  return `${label}: ${value} TJS`;
                }
              }
            },
            datalabels: {
              display: false
            }
          },
          scales: {
            y: {
              stacked: true,
              beginAtZero: true,
              max: foodBasketYAxisMax,
              title: {
                display: false
              },
              ticks: {
                font: {
                  size: 10
                },
                stepSize: 100
              },
              grid: {
                color: '#e0e0e0'
              }
            },
            x: {
              stacked: true,
              title: {
                display: false
              },
              ticks: {
                font: {
                  size: 10
                }
              },
              grid: {
                display: false
              }
            }
          }
        },
        plugins: [{
          // Custom plugin to display totals on top of stacked bars and values inside bars
          id: 'stackedLabels',
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const datasets = chart.data.datasets;
            const meta = chart.getDatasetMeta(datasets.length - 1);

            // Draw totals on top of each stacked bar
            meta.data.forEach((bar, index) => {
              const total = totals[index];
              if (total !== null && total !== undefined) {
                ctx.save();
                ctx.fillStyle = '#1F4E79';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(Math.round(total), bar.x, bar.y - 5);
                ctx.restore();
              }
            });

            // Draw values inside each segment of the stacked bars
            chart.data.datasets.forEach((dataset, datasetIndex) => {
              const meta = chart.getDatasetMeta(datasetIndex);
              meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                // Only show label if segment is tall enough (> 8px height)
                const barHeight = bar.height;
                if (value !== null && value !== undefined && barHeight > 15) {
                  ctx.save();
                  ctx.fillStyle = '#FFFFFF';
                  ctx.font = '9px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  // Position text in the middle of the bar segment
                  const yPos = bar.y + (barHeight / 2);
                  ctx.fillText(Math.round(value), bar.x, yPos);
                  ctx.restore();
                }
              });
            });
          }
        }]
      });
    },

    async renderFoodBasketRegionChart() {
      if (!process.client || !this.$refs.foodBasketRegionChart) return;

      const chartData = this.foodBasketRegionChartData;
      if (!chartData || !chartData.regions || chartData.regions.length === 0) return;

      // Destroy existing chart if any
      if (this.foodBasketRegionChart) {
        this.foodBasketRegionChart.destroy();
      }

      // Region labels for X-axis
      const labels = chartData.regions.map(r => r.name);

      // PP data (blue bars - bottom of stack)
      const ppData = chartData.regions.map(r => r.pp);

      // HH additional data (red bars - stacked on top of PP)
      // The red portion shows HH - PP (the additional amount for household)
      const hhAdditionalData = chartData.regions.map(r => r.hh - r.pp);

      // Full HH data for labels
      const hhData = chartData.regions.map(r => r.hh);

      // YoY change data (green line, right Y-axis)
      const yoyData = chartData.regions.map(r => r.yoy_change);

      // Calculate dynamic Y-axis max for left axis (HH values)
      const maxHH = Math.max(...hhData.filter(v => v !== null));
      const regionYAxisMax = Math.ceil(maxHH / 500) * 500 + 200; // Round up to nearest 500 and add buffer

      // Calculate dynamic Y-axis range for right axis (YoY change %)
      const yoyFiltered = yoyData.filter(v => v !== null);
      const maxYoY = yoyFiltered.length > 0 ? Math.max(...yoyFiltered) : 10;
      const minYoY = yoyFiltered.length > 0 ? Math.min(...yoyFiltered) : -10;
      const yoyAxisMax = Math.ceil(Math.max(Math.abs(maxYoY), Math.abs(minYoY)) / 5) * 5 + 5;
      const yoyAxisMin = -yoyAxisMax;

      const ctx = this.$refs.foodBasketRegionChart.getContext('2d');
      this.foodBasketRegionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              // PP (blue) - FIRST in array = renders at BOTTOM of stack
              label: chartData.labels.pp,
              data: ppData,
              backgroundColor: 'rgba(79, 129, 189, 0.9)',
              borderColor: 'rgba(79, 129, 189, 1)',
              borderWidth: 1,
              stack: 'stack1',
              yAxisID: 'y'
            },
            {
              // HH additional (red) - SECOND in array = renders on TOP of stack
              label: chartData.labels.hh,
              data: hhAdditionalData,
              backgroundColor: 'rgba(192, 80, 77, 0.85)',
              borderColor: 'rgba(192, 80, 77, 1)',
              borderWidth: 1,
              stack: 'stack1',
              yAxisID: 'y'
            },
            {
              label: chartData.labels.yoy,
              data: yoyData,
              type: 'line',
              borderColor: 'rgba(0, 128, 0, 1)',
              backgroundColor: 'rgba(0, 128, 0, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(0, 128, 0, 1)',
              pointBorderColor: '#fff',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: false,
              yAxisID: 'y1'
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
          plugins: {
            title: {
              display: true,
              text: chartData.chart_title,
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#2E75B6',
              padding: {
                top: 5,
                bottom: 15
              },
              align: 'center'
            },
            legend: {
              position: 'top',
              align: 'center',
              labels: {
                font: {
                  size: 11
                },
                usePointStyle: false,
                padding: 20,
                boxWidth: 20,
                boxHeight: 12,
                generateLabels: function(chart) {
                  return [
                    {
                      text: chart.data.datasets[1].label, // HH (red) - show first in legend
                      fillStyle: 'rgba(192, 80, 77, 0.85)',
                      strokeStyle: 'rgba(192, 80, 77, 1)',
                      lineWidth: 1,
                      hidden: false,
                      index: 1
                    },
                    {
                      text: chart.data.datasets[0].label, // PP (blue)
                      fillStyle: 'rgba(79, 129, 189, 0.9)',
                      strokeStyle: 'rgba(79, 129, 189, 1)',
                      lineWidth: 1,
                      hidden: false,
                      index: 0
                    },
                    {
                      text: chart.data.datasets[2].label, // Change line
                      fillStyle: 'rgba(0, 128, 0, 0.1)',
                      strokeStyle: 'rgba(0, 128, 0, 1)',
                      lineWidth: 2,
                      hidden: false,
                      index: 2,
                      lineDash: []
                    }
                  ];
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  if (context.datasetIndex === 2) {
                    return `${label}: ${value !== null ? value.toFixed(1) : '-'}%`;
                  }
                  if (context.datasetIndex === 1) {
                    // Show full HH value, not just the additional (dataset 1 = HH)
                    const fullHH = hhData[context.dataIndex];
                    return `${label}: ${fullHH !== null ? Math.round(fullHH).toLocaleString() : '-'} TJS`;
                  }
                  // dataset 0 = PP
                  return `${label}: ${value !== null ? Math.round(value) : '-'} TJS`;
                }
              }
            },
            datalabels: {
              display: false
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              beginAtZero: true,
              max: regionYAxisMax,
              stacked: true,
              title: {
                display: true,
                text: chartData.y_axis_left,
                font: {
                  size: 11
                }
              },
              ticks: {
                font: {
                  size: 10
                },
                stepSize: 500,
                callback: function(value) {
                  return value.toLocaleString();
                }
              },
              grid: {
                color: '#e0e0e0'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              min: yoyAxisMin,
              max: yoyAxisMax,
              title: {
                display: true,
                text: chartData.y_axis_right,
                font: {
                  size: 11
                }
              },
              ticks: {
                font: {
                  size: 10
                },
                callback: function(value) {
                  return value.toFixed(1) + '%';
                },
                stepSize: 10
              },
              grid: {
                drawOnChartArea: false
              }
            },
            x: {
              stacked: true,
              ticks: {
                font: {
                  size: 9
                },
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                display: false
              }
            }
          }
        },
        plugins: [{
          // Custom plugin to display values on bars and line points
          id: 'regionLabels',
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;

            // Dataset 0 = PP (blue, at bottom)
            // Dataset 1 = HH (red, on top)
            // Dataset 2 = YoY line

            // Draw PP values on blue bars (inside bottom portion, white text)
            const ppMeta = chart.getDatasetMeta(0);
            ppMeta.data.forEach((bar, index) => {
              const value = ppData[index];
              if (value !== null && value !== undefined) {
                ctx.save();
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Position in the middle of the blue bar
                const barHeight = bar.height;
                const yPos = bar.y + (barHeight / 2);
                ctx.fillText(Math.round(value), bar.x, yPos);
                ctx.restore();
              }
            });

            // Draw HH values above red bars (top, red text)
            const hhMeta = chart.getDatasetMeta(1);
            hhMeta.data.forEach((bar, index) => {
              const value = hhData[index];
              if (value !== null && value !== undefined) {
                ctx.save();
                ctx.fillStyle = '#C00000';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(Math.round(value).toLocaleString(), bar.x, bar.y - 3);
                ctx.restore();
              }
            });

            // Draw YoY change values near line points
            const lineMeta = chart.getDatasetMeta(2);
            lineMeta.data.forEach((point, index) => {
              const value = yoyData[index];
              if (value !== null && value !== undefined) {
                ctx.save();
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yOffset = value >= 0 ? -8 : 14;
                const text = value.toFixed(1) + '%';
                const xPos = point.x;
                const yPos = point.y + yOffset;
                // White text shadow for readability
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(text, xPos - 1, yPos - 1);
                ctx.fillText(text, xPos + 1, yPos - 1);
                ctx.fillText(text, xPos - 1, yPos + 1);
                ctx.fillText(text, xPos + 1, yPos + 1);
                // Red text on top
                ctx.fillStyle = '#C00000';
                ctx.fillText(text, xPos, yPos);
                ctx.restore();
              }
            });
          }
        }]
      });
    },

    async renderFBCostTrendsChart() {
      if (!process.client || !this.$refs.fbCostTrendsChart) return;

      const chartData = this.foodBasketTrendsData;
      if (!chartData || !chartData.trends || chartData.trends.length === 0) return;

      // Destroy existing chart if any
      if (this.fbCostTrendsChart) {
        this.fbCostTrendsChart.destroy();
      }

      // Extract data from trends
      const labels = chartData.trends.map(t => t.month_label);
      const costData = chartData.trends.map(t => t.cost);
      const momData = chartData.trends.map(t => t.mom_change);

      // Calculate dynamic Y-axis max (round up to nearest 500)
      const maxCost = Math.max(...costData.filter(v => v !== null));
      const yAxisMax = Math.ceil(maxCost / 500) * 500 + 100; // Add 100 for label space

      // Calculate dynamic Y-axis range for MoM change (right axis)
      const momFiltered = momData.filter(v => v !== null);
      const maxMoM = momFiltered.length > 0 ? Math.max(...momFiltered) : 10;
      const minMoM = momFiltered.length > 0 ? Math.min(...momFiltered) : -10;
      const momAxisMax = Math.ceil(Math.max(Math.abs(maxMoM), Math.abs(minMoM)) / 5) * 5 + 2;
      const momAxisMin = -momAxisMax;

      const ctx = this.$refs.fbCostTrendsChart.getContext('2d');
      this.fbCostTrendsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              // Blue bars for FB cost
              label: chartData.y_axis_left,
              data: costData,
              backgroundColor: 'rgba(79, 129, 189, 0.9)',
              borderColor: 'rgba(79, 129, 189, 1)',
              borderWidth: 1,
              yAxisID: 'y',
              order: 2
            },
            {
              // Orange line for MoM change
              label: chartData.y_axis_right,
              data: momData,
              type: 'line',
              borderColor: 'rgba(255, 165, 0, 1)',
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(255, 165, 0, 1)',
              pointBorderColor: '#fff',
              pointRadius: 3,
              pointHoverRadius: 5,
              fill: false,
              yAxisID: 'y1',
              order: 1
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
          plugins: {
            title: {
              display: true,
              text: chartData.chart_title,
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#2E75B6',
              padding: {
                top: 5,
                bottom: 15
              },
              align: 'center'
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  if (context.datasetIndex === 1) {
                    return `${label}: ${value !== null ? value.toFixed(1) : '-'}%`;
                  }
                  return `${label}: ${value !== null ? Math.round(value).toLocaleString() : '-'} TJS`;
                }
              }
            },
            datalabels: {
              display: false
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              beginAtZero: true,
              min: 0,
              max: yAxisMax,
              title: {
                display: true,
                text: chartData.y_axis_left,
                font: {
                  size: 10,
                  weight: 'bold'
                },
                color: '#C00000'
              },
              ticks: {
                font: {
                  size: 10
                },
                stepSize: 500,
                callback: function(value) {
                  return value.toLocaleString();
                }
              },
              grid: {
                color: '#e0e0e0'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              min: momAxisMin,
              max: momAxisMax,
              title: {
                display: true,
                text: chartData.y_axis_right,
                font: {
                  size: 10,
                  weight: 'bold'
                },
                color: '#00B050'
              },
              ticks: {
                font: {
                  size: 10
                },
                callback: function(value) {
                  return value.toFixed(1) + '%';
                },
                stepSize: 5
              },
              grid: {
                drawOnChartArea: false
              }
            },
            x: {
              ticks: {
                font: {
                  size: 9
                },
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                display: false
              }
            }
          }
        },
        plugins: [{
          // Custom plugin to display values on bars and line points
          id: 'fbTrendsLabels',
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;

            // Draw cost values on top of blue bars
            const barMeta = chart.getDatasetMeta(0);
            barMeta.data.forEach((bar, index) => {
              const value = costData[index];
              if (value !== null && value !== undefined) {
                ctx.save();
                ctx.fillStyle = '#000000';
                ctx.font = '9px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(Math.round(value).toLocaleString(), bar.x, bar.y - 3);
                ctx.restore();
              }
            });

            // Draw MoM change values near line points with color coding
            const lineMeta = chart.getDatasetMeta(1);
            lineMeta.data.forEach((point, index) => {
              const value = momData[index];
              if (value !== null && value !== undefined) {
                ctx.save();
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yOffset = value >= 0 ? -6 : 12;
                const text = value.toFixed(1) + '%';
                const xPos = point.x;
                const yPos = point.y + yOffset;
                // White shadow for readability
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(text, xPos - 1, yPos - 1);
                ctx.fillText(text, xPos + 1, yPos - 1);
                ctx.fillText(text, xPos - 1, yPos + 1);
                ctx.fillText(text, xPos + 1, yPos + 1);
                // Orange/yellow text on top
                ctx.fillStyle = '#DAA520';
                ctx.fillText(text, xPos, yPos);
                ctx.restore();
              }
            });
          }
        }]
      });
    },

    async renderWageRegionalChart() {
      if (!process.client || !this.$refs.wageRegionalChart) return;

      const data = this.wageData;
      if (!data || !data.regional_data || data.regional_data.length === 0) return;

      // Destroy existing chart if any
      if (this.wageRegionalChart) {
        this.wageRegionalChart.destroy();
      }

      // Filter out markets with no data
      const validData = data.regional_data.filter(d => d.food_basket_cost > 0);

      // Identify problematic markets (FB cost > unskilled wage)
      const problematicIndices = validData.map((d, index) => {
        const basketCost = d.food_basket_cost;
        const wage = d.unskilled_labour_wage;
        if (wage === null || wage === undefined || wage === 0) return false;
        if (basketCost > wage || basketCost > (wage * 0.75)) {
          return index;
        }
        return false;
      }).filter(idx => idx !== false);

      // Extract data
      const labels = validData.map(d => d.market_name);
      const fbCostData = validData.map(d => d.food_basket_cost);
      const skilledData = validData.map(d => d.skilled_labour_wage);
      const unskilledData = validData.map(d => d.unskilled_labour_wage);

      // Calculate min/max for Y axis
      const allValues = [
        ...fbCostData.filter(v => v),
        ...skilledData.filter(v => v),
        ...unskilledData.filter(v => v)
      ];
      const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
      const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
      const range = maxValue - minValue;
      const suggestedMin = Math.max(0, minValue - (range * 0.1));
      const suggestedMax = maxValue + (range * 0.1);

      const ctx = this.$refs.wageRegionalChart.getContext('2d');
      this.wageRegionalChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: this.$t('food_basket_cost'),
              data: fbCostData,
              borderColor: '#4285F4',
              backgroundColor: 'rgba(66, 133, 244, 0.3)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: validData.map((_, i) => problematicIndices.includes(i) ? '#F44336' : '#4285F4'),
              pointBorderColor: validData.map((_, i) => problematicIndices.includes(i) ? '#FFFFFF' : '#4285F4'),
              pointBorderWidth: validData.map((_, i) => problematicIndices.includes(i) ? 3 : 1),
              pointStyle: validData.map((_, i) => problematicIndices.includes(i) ? 'rectRot' : 'circle'),
              tension: 0.4,
              fill: true
            },
            {
              label: this.$t('casual_labour_wage'),
              data: unskilledData,
              borderColor: '#EA4335',
              backgroundColor: 'rgba(234, 67, 53, 0.3)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: validData.map((_, i) => problematicIndices.includes(i) ? '#F44336' : '#EA4335'),
              pointBorderColor: validData.map((_, i) => problematicIndices.includes(i) ? '#FFFFFF' : '#EA4335'),
              pointBorderWidth: validData.map((_, i) => problematicIndices.includes(i) ? 3 : 1),
              pointStyle: validData.map((_, i) => problematicIndices.includes(i) ? 'rectRot' : 'circle'),
              tension: 0.4,
              fill: true
            },
            {
              label: this.$t('skilled_labour_wage'),
              data: skilledData,
              borderColor: '#00B050',
              backgroundColor: 'rgba(0, 176, 80, 0.3)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.4,
              fill: true
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
            padding: { top: 30 }
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
                font: { size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += Math.round(context.parsed.y).toLocaleString('en-US') + ' TJS';
                  }
                  return label;
                }
              }
            },
            datalabels: {
              display: true,
              align: 'top',
              anchor: 'end',
              offset: 4,
              formatter: (value) => {
                if (value === null || value === undefined) return '';
                return Math.round(value).toLocaleString('en-US');
              },
              font: { size: 9, weight: 'bold' },
              color: (context) => {
                const colors = ['#4285F4', '#EA4335', '#00B050'];
                return colors[context.datasetIndex] || '#000';
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: this.$t('markets'),
                font: { size: 12 }
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: { size: 10 }
              },
              grid: { display: false }
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
                text: 'TJS',
                font: { size: 12 }
              },
              ticks: {
                callback: (value) => Math.round(value).toLocaleString('en-US'),
                font: { size: 10 }
              },
              grid: { color: 'rgba(0, 0, 0, 0.1)' }
            }
          }
        }
      });
    },

    /**
     * Render both monthly and annual inflation charts
     */
    async renderInflationCharts() {
      if (!process.client) return;

      await this.$nextTick();

      // Render monthly inflation chart
      this.renderMonthlyInflationChart();

      // Render annual inflation chart
      this.renderAnnualInflationChart();
    },

    /**
     * Render Monthly Inflation Trends Chart (2-year comparison)
     */
    renderMonthlyInflationChart() {
      if (!this.$refs.monthlyInflationChart) return;

      const data = this.nationalEconomicData;
      if (!data || !data.subsections || !data.subsections[0] || !data.subsections[0].charts || !data.subsections[0].charts[0]) return;

      const chartInfo = data.subsections[0].charts[0];
      const chartData = chartInfo.data;
      if (!chartData || !chartData.data || chartData.data.length === 0) return;

      // Destroy existing chart
      if (this.monthlyInflationChart) {
        this.monthlyInflationChart.destroy();
      }

      const years = chartData.years;
      const labels = chartData.data.map(d => d.month);

      // Build datasets for each year
      const datasets = years.map((year, index) => {
        const isCurrentYear = index === years.length - 1;
        return {
          label: String(year),
          data: chartData.data.map(d => d[year]),
          borderColor: isCurrentYear ? '#4472C4' : '#4472C4',
          backgroundColor: isCurrentYear ? '#4472C4' : 'transparent',
          borderWidth: 2,
          borderDash: isCurrentYear ? [] : [5, 5],
          pointRadius: isCurrentYear ? 5 : 3,
          pointBackgroundColor: isCurrentYear ? '#4472C4' : '#4472C4',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          tension: 0.3,
          fill: false
        };
      });

      const ctx = this.$refs.monthlyInflationChart.getContext('2d');
      this.monthlyInflationChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: { size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toFixed(2) + '%';
                  }
                  return label;
                }
              }
            },
            datalabels: {
              display: (context) => {
                // Only show labels for current year (last dataset) and valid data
                if (!context.parsed || context.parsed.y === null || context.parsed.y === undefined) {
                  return false;
                }
                return context.datasetIndex === datasets.length - 1;
              },
              align: 'top',
              anchor: 'end',
              offset: 4,
              formatter: (value) => {
                if (value === null || value === undefined) return '';
                return value.toFixed(1) + '%';
              },
              font: { size: 9 },
              color: '#4472C4'
            }
          },
          scales: {
            x: {
              title: { display: false },
              ticks: { font: { size: 10 } },
              grid: { display: false }
            },
            y: {
              title: {
                display: true,
                text: chartInfo.y_axis_label || 'Monthly inflation, %',
                font: { size: 11 }
              },
              ticks: {
                callback: (value) => value.toFixed(2) + '%',
                font: { size: 10 }
              },
              grid: { color: 'rgba(0, 0, 0, 0.1)' }
            }
          }
        }
      });
    },

    /**
     * Render Annual Inflation Trends Chart (7-year comparison - bar chart)
     * Shows annual inflation rate per month, grouped by year
     */
    renderAnnualInflationChart() {
      if (!this.$refs.annualInflationChart) return;

      const data = this.nationalEconomicData;
      if (!data || !data.subsections || !data.subsections[0] || !data.subsections[0].charts || !data.subsections[0].charts[1]) return;

      const chartInfo = data.subsections[0].charts[1];
      const chartData = chartInfo.data;
      if (!chartData || !chartData.data || chartData.data.length === 0) return;

      // Destroy existing chart
      if (this.annualInflationChart) {
        this.annualInflationChart.destroy();
      }

      const years = chartData.years;

      // Build data grouped by year - each year has up to 12 bars (months)
      const allData = [];
      const allLabels = [];

      years.forEach(year => {
        chartData.data.forEach(monthData => {
          const value = monthData[year];
          if (value !== null && value !== undefined) {
            allData.push(value);
            allLabels.push(`${monthData.month} ${year}`);
          }
        });
      });

      // Calculate min/max from data dynamically
      const validValues = allData.filter(v => v !== null && v !== undefined);
      if (validValues.length === 0) return;

      const dataMin = Math.min(...validValues);
      const dataMax = Math.max(...validValues);
      // Round to nice values with some padding
      // For negative values, floor will go more negative (e.g., -1.2 -> -2)
      const yMin = Math.floor(dataMin - 0.5);
      const yMax = Math.ceil(dataMax + 0.5);

      console.log('Annual chart - dataMin:', dataMin, 'dataMax:', dataMax, 'yMin:', yMin, 'yMax:', yMax);

      // Calculate year positions for x-axis labels
      const yearPositions = [];
      let currentPos = 0;
      years.forEach(year => {
        const monthCount = chartData.data.filter(m => m[year] !== null && m[year] !== undefined).length;
        if (monthCount > 0) {
          yearPositions.push({
            year: year,
            start: currentPos,
            end: currentPos + monthCount - 1,
            mid: currentPos + Math.floor(monthCount / 2)
          });
          currentPos += monthCount;
        }
      });

      const ctx = this.$refs.annualInflationChart.getContext('2d');
      this.annualInflationChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: allLabels,
          datasets: [{
            label: 'Annual inflation, %',
            data: allData,
            backgroundColor: '#4472C4',
            borderColor: '#4472C4',
            borderWidth: 0,
            barPercentage: 0.85,
            categoryPercentage: 0.9
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: (items) => {
                  if (items.length > 0) {
                    return items[0].label;
                  }
                  return '';
                },
                label: (context) => {
                  if (context.parsed.y !== null) {
                    return 'Annual inflation: ' + context.parsed.y.toFixed(2) + '%';
                  }
                  return '';
                }
              }
            },
            datalabels: {
              display: false
            }
          },
          scales: {
            x: {
              title: { display: false },
              ticks: {
                callback: function(value, index) {
                  // Show year label at the middle of each year's bars
                  const label = this.getLabelForValue(value);
                  const yearMatch = label.match(/\d{4}/);
                  if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    const pos = yearPositions.find(p => p.year === year);
                    if (pos && index === pos.mid) {
                      return year;
                    }
                  }
                  return '';
                },
                font: { size: 10 },
                maxRotation: 0
              },
              grid: { display: false }
            },
            y: {
              title: {
                display: true,
                text: 'Monthly inflation, %',
                font: { size: 11 }
              },
              min: yMin,
              max: yMax,
              ticks: {
                callback: (value) => value.toFixed(1) + '%',
                font: { size: 10 },
                stepSize: 1
              },
              grid: { color: 'rgba(0, 0, 0, 0.1)' }
            }
          }
        }
      });
    },

    // Import/Export helper methods
    formatImportExportValue(indicator, value) {
      if (value === null || value === undefined) return '-';
      if (indicator === 'terms_of_trade') {
        return value + '%';
      }
      return value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    },

    formatImportExportChange(change) {
      if (change === null || change === undefined) return '-';
      return change + '%';
    },

    getImportExportChangeClass(change) {
      if (change === null || change === undefined) return '';
      if (change > 0) return 'positive-change';
      if (change < 0) return 'negative-change';
      return '';
    },

    // Import Changes Table Methods
    formatNumber(value) {
      if (value === null || value === undefined) return '-';
      return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    },

    formatImportChangePercent(change) {
      if (change === null || change === undefined) return '-';
      return change + '%';
    },

    getImportChangeClass(change) {
      if (change === null || change === undefined) return '';
      if (change > 0) return 'import-positive';
      if (change < 0) return 'import-negative';
      return '';
    }
  },

  beforeDestroy() {
    if (this.volatileChart) {
      this.volatileChart.destroy();
    }
    if (this.energyChart) {
      this.energyChart.destroy();
    }
    if (this.foodBasketChart) {
      this.foodBasketChart.destroy();
    }
    if (this.foodBasketRegionChart) {
      this.foodBasketRegionChart.destroy();
    }
    if (this.fbCostTrendsChart) {
      this.fbCostTrendsChart.destroy();
    }
    if (this.wageRegionalChart) {
      this.wageRegionalChart.destroy();
    }
    if (this.monthlyInflationChart) {
      this.monthlyInflationChart.destroy();
    }
    if (this.annualInflationChart) {
      this.annualInflationChart.destroy();
    }
  }
};
</script>

<style scoped>
/* ============================================================================
   WFP QUARTERLY REPORT STYLES
   Based on weekly-report.vue with quarterly-specific adjustments
   ============================================================================ */

.quarterly-report-page {
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
   PRINT HEADER (Hidden on screen)
   ============================================================================ */
.print-header {
  display: none;
}

/* ============================================================================
   FILTERS SECTION
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

/* ============================================================================
   LOADING BAR
   ============================================================================ */
.loading-bar {
  margin-bottom: 16px;
}

/* ============================================================================
   WFP REPORT HEADER
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
.quarter-period,
.quarter-year {
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

/* ============================================================================
   WFP REPORT CONTENT LAYOUT
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

/* Full Width Content - Sections after volatile products */
.full-width-content {
  width: 100%;
  background-color: white;
  padding: 0;
}

.full-width-content section {
  padding: 16px;
  margin-bottom: 16px;
}

/* ============================================================================
   SECTIONS
   ============================================================================ */
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #009688;
  margin: 0 0 12px;
}

.highlights-section,
.market-monitoring-section,
.wage-section,
.economic-indicators-section,
.import-export-section,
.annex1-section,
.annex2-section {
  background: white;
  padding: 16px;
  margin-bottom: 16px;
}

/* Import/Export Section Styles */
.import-export-highlight-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
  text-align: justify;
}

.import-export-table-wrapper {
  overflow-x: auto;
}

.import-export-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: white;
}

.import-export-table th,
.import-export-table td {
  border: 1px solid #dee2e6;
  padding: 10px 12px;
  text-align: center;
  vertical-align: middle;
}

.import-export-table thead th {
  background-color: #007dbc;
  color: white;
  font-weight: bold;
  white-space: nowrap;
}

.import-export-table tbody td:first-child {
  text-align: left;
  font-weight: 500;
}

.import-export-table tbody tr:hover {
  background-color: #f8f9fa;
}

.import-export-table .positive-change {
  color: #28a745;
  font-weight: 600;
}

.import-export-table .negative-change {
  color: #dc3545;
  font-weight: 600;
}

/* Import Changes Section Styles */
.import-changes-section {
  margin-top: 30px;
}

.import-changes-section .section-title {
  color: #333;
  border-bottom: 2px solid #007dbc;
  padding-bottom: 8px;
  margin-bottom: 20px;
}

.import-changes-section .period-highlight {
  color: #007dbc;
  font-weight: 700;
}

.import-changes-table-wrapper {
  overflow-x: auto;
}

.import-changes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: white;
}

.import-changes-table th,
.import-changes-table td {
  border: 1px solid #dee2e6;
  padding: 8px 10px;
  text-align: center;
  vertical-align: middle;
}

.import-changes-table thead th {
  background-color: #007dbc;
  color: white;
  font-weight: bold;
}

.import-changes-table thead th.col-group {
  background-color: #005a8a;
}

.import-changes-table thead th.col-subgroup {
  background-color: #007dbc;
}

.import-changes-table .col-no {
  width: 40px;
}

.import-changes-table .col-item,
.import-changes-table .col-item-name {
  text-align: left;
  min-width: 150px;
}

.import-changes-table .col-qty,
.import-changes-table .col-amt,
.import-changes-table .col-unit {
  min-width: 60px;
}

.import-changes-table .col-percent {
  min-width: 50px;
}

.import-changes-table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.import-changes-table tbody tr:hover {
  background-color: #e8f4fc;
}

.import-changes-table .import-positive {
  color: #28a745;
  font-weight: 600;
}

.import-changes-table .import-negative {
  color: #dc3545;
  font-weight: 600;
}

.import-changes-table .text-right {
  text-align: right;
}

.import-changes-table .text-center {
  text-align: center;
}

.import-changes-chart-section {
  margin-top: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.tmt-abbreviation {
  font-size: 12px;
  color: #666;
  margin: 25px 0 0 0;
  font-style: italic;
}

.tmt-abbreviation + .import-changes-chart-section,
.tmt-abbreviation + .export-changes-chart-section {
  margin-top: 10px;
}

/* Export Changes Section Styles */
.export-changes-section {
  margin-top: 30px;
}

.export-changes-section .section-title {
  color: #333;
  border-bottom: 2px solid #2E75B6;
  padding-bottom: 8px;
  margin-bottom: 20px;
}

.export-changes-section .period-highlight {
  color: #2E75B6;
  font-weight: 700;
}

.export-changes-table-wrapper {
  overflow-x: auto;
}

.export-changes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: white;
}

.export-changes-table th,
.export-changes-table td {
  border: 1px solid #dee2e6;
  padding: 8px 10px;
  text-align: center;
  vertical-align: middle;
}

.export-changes-table thead th {
  background-color: #2E75B6;
  color: white;
  font-weight: bold;
}

.export-changes-table thead th.col-group {
  background-color: #1F5C8E;
}

.export-changes-table thead th.col-subgroup {
  background-color: #2E75B6;
}

.export-changes-table .col-no {
  width: 40px;
}

.export-changes-table .col-item,
.export-changes-table .col-item-name {
  text-align: left;
  min-width: 150px;
}

.export-changes-table .col-qty,
.export-changes-table .col-amt,
.export-changes-table .col-unit {
  min-width: 60px;
}

.export-changes-table .col-percent {
  min-width: 50px;
}

.export-changes-table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.export-changes-table tbody tr:hover {
  background-color: #e8f4fc;
}

.export-changes-table .import-positive {
  color: #28a745;
  font-weight: 600;
}

.export-changes-table .import-negative {
  color: #dc3545;
  font-weight: 600;
}

.export-changes-table .text-right {
  text-align: right;
}

.export-changes-table .text-center {
  text-align: center;
}

.export-changes-chart-section {
  margin-top: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

/* Annex 2 Styles */
.annex2-legend-wrapper {
  margin-top: 20px;
}

.annex2-legend-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.annex2-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 12px;
}

.annex2-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.annex2-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  background: white;
}

.annex2-table th,
.annex2-table td {
  border: 1px solid #dee2e6;
  padding: 6px 8px;
  vertical-align: middle;
}

.annex2-table thead th {
  background-color: #007dbc;
  color: white;
  font-weight: bold;
  white-space: nowrap;
}

.annex2-table tbody tr:hover {
  background-color: #f8f9fa;
}

.annex2-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.trend-icon {
  font-size: 10px;
  margin: 0 2px;
}

.trend-icon.increase {
  color: #00B050;
}

.trend-icon.decrease {
  color: #C00000;
}

.trend-icon.stable {
  color: #FFC000;
}

.change-percent {
  font-size: 10px;
  display: block;
  margin-top: 2px;
}

.change-increase {
  color: #00B050;
}

.change-decrease {
  color: #C00000;
}

.change-stable {
  color: #666;
}

@media (max-width: 575px) {
  .annex2-table {
    font-size: 9px;
  }

  .annex2-table th,
  .annex2-table td {
    padding: 4px 4px;
  }

  .annex2-legend {
    font-size: 10px;
    gap: 10px;
  }

  .change-percent {
    font-size: 8px;
  }
}

@media (min-width: 1024px) {
  .annex2-table {
    font-size: 12px;
  }

  .change-percent {
    font-size: 11px;
  }
}

@media (min-width: 1280px) {
  .annex2-table {
    font-size: 13px;
  }

  .change-percent {
    font-size: 12px;
  }
}

@media (min-width: 1440px) {
  .annex2-table {
    font-size: 14px;
  }

  .change-percent {
    font-size: 13px;
  }
}

.annex1-chart-container {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.highlights-section .section-title {
  color: #ca5216;
}

.section-title-primary {
  color: #ca5216 !important;
  font-size: 20px;
  font-weight: 700;
  border-bottom: 2px solid #ca5216;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: #007dbc;
  margin: 16px 0 12px;
}

.analysis-text {
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
  text-align: justify;
}

/* Wage Analysis Section */
.wage-analysis-text {
  padding: 12px;
  background-color: #f8f9fa;
  border-left: 3px solid #2E75B6;
  margin-bottom: 20px;
}

.wage-chart-section {
  margin-top: 20px;
}

.chart-subtitle {
  font-size: 15px;
  font-weight: 600;
  color: #2E75B6;
  margin-bottom: 12px;
}

.chart-subtitle .chart-period {
  font-weight: normal;
  color: #666;
}

.wage-chart-container {
  position: relative;
  height: 350px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .wage-chart-container {
    height: 400px;
  }
}

@media (min-width: 1024px) {
  .wage-chart-container {
    height: 450px;
  }
}

.chart-legend-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 12px;
  font-size: 12px;
  font-style: italic;
  color: #666;
}

.legend-note {
  white-space: nowrap;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 12px;
}

.volatile-products-section {
  margin-top: 20px;
}

/* ============================================================================
   NATIONAL ECONOMIC INDICATORS SECTION
   ============================================================================ */
.economic-indicators-section .subsection {
  margin-top: 20px;
}

.economic-indicators-section .subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: #2E75B6;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #2E75B6;
}

.inflation-chart-block {
  margin-bottom: 16px;
}

.chart-description-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-description-container .chart-description {
  width: 100%;
}

.chart-description-container .chart-container {
  width: 100%;
}

.economic-indicators-section .chart-description {
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  padding: 12px;
  background-color: #f8f9fa;
  border-left: 3px solid #4472C4;
  margin: 0;
}

.economic-indicators-section .chart-container {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  height: fit-content;
  margin-top: 0;
}

.economic-indicators-section .chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #2E75B6;
  text-align: center;
  margin: 0 0 4px 0;
}

.economic-indicators-section .chart-subtitle-text {
  display: block;
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-bottom: 12px;
}

.inflation-chart-wrapper {
  position: relative;
  height: 250px;
}

.annual-chart-wrapper {
  height: 250px;
}

@media (min-width: 768px) {
  .inflation-chart-wrapper {
    height: 280px;
  }

  .annual-chart-wrapper {
    height: 280px;
  }
}

@media (min-width: 1024px) {
  .inflation-chart-wrapper {
    height: 300px;
  }

  .annual-chart-wrapper {
    height: 300px;
  }
}

/* ============================================================================
   ENERGY PRICES SECTION
   ============================================================================ */
.energy-prices-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.energy-chart-wrapper {
  margin-top: 16px;
}

.energy-chart-container {
  position: relative;
  height: 350px;
  margin-top: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .energy-chart-container {
    height: 400px;
  }
}

@media (min-width: 1024px) {
  .energy-chart-container {
    height: 450px;
  }
}

/* ============================================================================
   FOOD BASKET CHART STYLES
   ============================================================================ */
.food-basket-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.food-basket-analysis {
  width: 100%;
}

.food-basket-chart-wrapper {
  width: 100%;
}

.food-basket-chart-container {
  position: relative;
  height: 400px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .food-basket-chart-container {
    height: 450px;
  }
}

@media (min-width: 1024px) {
  .food-basket-chart-container {
    height: 500px;
  }
}

/* ============================================================================
   FOOD BASKET REGION CHART SECTION
   ============================================================================ */
.food-basket-region-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.food-basket-region-chart-container {
  position: relative;
  height: 400px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .food-basket-region-chart-container {
    height: 450px;
  }
}

@media (min-width: 1024px) {
  .food-basket-region-chart-container {
    height: 500px;
  }
}

.chart-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  font-style: italic;
  color: #2E75B6;
}

.note-item {
  white-space: nowrap;
}

/* FB Cost Trends Chart */
.fb-cost-trends-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.fb-cost-trends-chart-container {
  position: relative;
  height: 350px;
  padding: 12px;
  background: white;
  border: 1px solid #2E75B6;
  border-radius: 4px;
  overflow: hidden;
}

.fb-cost-trends-chart-container canvas {
  max-width: 100% !important;
  max-height: 100% !important;
}

@media (min-width: 768px) {
  .fb-cost-trends-chart-container {
    height: 400px;
  }
}

@media (min-width: 1024px) {
  .fb-cost-trends-chart-container {
    height: 450px;
  }
}

.chart-description {
  margin-top: 12px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  background-color: #f9f9f9;
  border-left: 3px solid #2E75B6;
}

.chart-container {
  position: relative;
  height: 400px;
  margin-top: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .chart-container {
    height: 450px;
  }
}

@media (min-width: 1024px) {
  .chart-container {
    height: 500px;
  }
}

.highlights-list {
  list-style: disc;
  padding-left: 20px;
  margin: 0;
}

.highlights-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.highlights-sublist {
  list-style: circle;
  padding-left: 20px;
  margin-top: 8px;
  margin-bottom: 0;
}

.highlights-sublist li {
  margin-bottom: 4px;
  line-height: 1.4;
}

/* ============================================================================
   TABLES
   ============================================================================ */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0;
  width: 100%;
}

.prices-table {
  width: 100%;
  border-collapse: collapse;
  border: none;
  font-size: 12px;
}

.prices-table th {
  font-weight: 700;
  padding: 8px;
  background-color: #007dbc;
  color: white;
  border: none;
  vertical-align: middle;
  text-align: left;
}

.prices-table tbody td {
  padding: 8px;
  border: 1px solid #e0e0e0;
  vertical-align: middle;
  text-align: left;
}

.prices-table tbody tr:nth-child(even) {
  background-color: #f5f5f5;
}

/* ============================================================================
   RESPONSIVE DESIGN
   ============================================================================ */
@media (min-width: 768px) {
  .filters-grid {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .filter-item {
    flex: 1;
    min-width: 200px;
  }

  .wfp-report-content {
    flex-direction: row;
  }

  .wfp-banner-column {
    width: 200px;
    flex-shrink: 0;
    align-self: stretch;
  }

  .report-data-column {
    flex: 1;
  }

  .full-width-content {
    padding: 0 8px;
  }
}

@media (min-width: 1024px) {
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
    font-size: 36px;
    padding: 30px 20px;
  }

  .country-name {
    font-size: 16px;
  }

  .issue-number,
  .quarter-period,
  .quarter-year {
    font-size: 14px;
  }

  /* WFP Content - Two Column Layout */
  .wfp-report-content {
    display: grid;
    grid-template-columns: 20% 80%;
    align-items: start;
    gap: 0;
  }

  .wfp-banner-column {
    padding-top: 80px;
    width: 100%;
  }

  .wfp-banner {
    width: 80%;
  }

  .wfp-tagline {
    font-size: 40px;
  }

  /* Full Width Content */
  .full-width-content {
    padding: 0 16px;
  }
}

/* ============================================================================
   PDF DOWNLOAD BUTTON
   ============================================================================ */
.pdf-download-btn {
  z-index: 100;
  margin-bottom: 20px;
  margin-right: 20px;
}

@media (max-width: 768px) {
  .pdf-download-btn {
    margin-bottom: 16px;
    margin-right: 16px;
  }
}

@media print {
  .pdf-download-btn {
    display: none !important;
  }
}
</style>
