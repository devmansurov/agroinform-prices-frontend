export const state = () => ({
  countryId: '',
  loading: false,

  // Weekly Report cached state
  weeklyReport: {
    // Filter state
    selectedYear: null,
    selectedMonth: null,
    weekNumber: null,
    selectedProductsObjects: [],

    // Available options
    availableYears: [],
    availableMonths: [],
    availableWeeks: [],
    allProducts: [],
    allMarkets: [],

    // Week dates
    weekStartDate: null,
    weekEndDate: null,

    // API data
    marketPricesData: [],
    nationalSummaryData: [],
    trendsData: [],
    regionalWageData: [],
    nationalPriceTrendsData: [],
    energyPricesData: [],
    exchangeRatesData: null,
    historicalTrendsData: null,

    // Timestamp to track when data was cached
    cachedAt: null
  }
});

export const mutations = {
  setCountryID(state, value) {
    state.countryId = value;
  },
  setLoading(state, value){
    state.loading = value
  },

  // Weekly Report mutations
  setWeeklyReportState(state, payload) {
    state.weeklyReport = {
      ...state.weeklyReport,
      ...payload,
      cachedAt: Date.now()
    };
  },

  clearWeeklyReportState(state) {
    state.weeklyReport = {
      selectedYear: null,
      selectedMonth: null,
      weekNumber: null,
      selectedProductsObjects: [],
      availableYears: [],
      availableMonths: [],
      availableWeeks: [],
      allProducts: [],
      allMarkets: [],
      weekStartDate: null,
      weekEndDate: null,
      marketPricesData: [],
      nationalSummaryData: [],
      trendsData: [],
      regionalWageData: [],
      nationalPriceTrendsData: [],
      energyPricesData: [],
      exchangeRatesData: null,
      historicalTrendsData: null,
      cachedAt: null
    };
  }
};
