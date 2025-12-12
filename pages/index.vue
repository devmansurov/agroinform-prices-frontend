<template>
    <v-row>
        <v-col cols="12">
            <!-- <h1>{{ $t("market_prices") }}</h1> -->
            <div v-if="showChooseCountry">
                <choose-country
                    v-on:change-country="changeCountry"
                ></choose-country>
            </div>
            <div v-else>
                <v-snackbar v-model="axiosError" top centered>
                    {{ axiosErrorMsg }}
                    <template v-slot:action="{ attrs }">
                        <v-btn
                            color="teal lighten-1"
                            text
                            v-bind="attrs"
                            @click="axiosError = false"
                        >
                            {{ $t("close") }}
                        </v-btn>
                    </template>
                </v-snackbar>
                <!-- <p class="text-button teal--text">{{ $t("market_prices_for_country_date", {country: countryName(), date: date})}}</p> -->
                <v-expansion-panels v-model="filterPanel">
                    <v-expansion-panel>
                        <v-expansion-panel-header
                            color="teal lighten-1"
                            class="white--text"
                            >{{ $t("filter") }}</v-expansion-panel-header
                        >
                        <v-expansion-panel-content>
                            <v-row>
                              <v-col cols="12" :md="12" :sm="12" :lg="4">
                                    <v-autocomplete
                                        :label="$t('markets')"
                                        v-model="marketsFilter"
                                        :items="marketsList"
                                        clearable
                                        deletable-chips
                                        multiple
                                        small-chips
                                        @change="limitCategory(marketsFilter)"
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="12" :md="12" :sm="12" :lg="4">
                                    <v-autocomplete
                                        :label="$t('category')"
                                        v-model="categoriesFilter"
                                        :items="categoriesList"
                                        clearable
                                        deletable-chips
                                        multiple
                                        @change="categoriesProducts(categoriesFilter)"
                                        small-chips
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="12" :md="12" :sm="12" :lg="4">
                                    <v-autocomplete
                                        :label="$t('product_name')"
                                        v-model="productsFilter"
                                        :items="listOfProducts"
                                        clearable
                                        deletable-chips
                                        multiple
                                        @change="limitCategory(productsFilter)"
                                        small-chips
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="12" :md="12" :sm="12" :lg="8">
                                    <v-row>
                                        <v-col
                                            cols="12"
                                            :md="12"
                                            :sm="12"
                                            :lg="3"
                                        >
                                            <v-checkbox
                                                @change="showDateRange"
                                                v-model="dateRange"
                                                :label="$t('date_range')"
                                            ></v-checkbox>
                                        </v-col>
                                        <v-col
                                            cols="12"
                                            :md="6"
                                            :sm="6"
                                            :lg="3"
                                        >
                                            <v-menu
                                                ref="menu"
                                                v-model="menu"
                                                :close-on-content-click="false"
                                                :return-value.sync="dateFilter"
                                                transition="scale-transition"
                                                offset-y
                                                min-width="auto"
                                            >
                                                <template
                                                    v-slot:activator="{
                                                        on,
                                                        attrs,
                                                    }"
                                                >
                                                    <v-text-field
                                                        v-model="
                                                            dateFilterFormated
                                                        "
                                                        :label="dateLabel"
                                                        prepend-icon="mdi-calendar"
                                                        append-icon="mdi-close"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        @click:append="
                                                            clearDate
                                                        "
                                                        @blur="
                                                            dateFilter =
                                                                parseDate(
                                                                    dateFilterFormated
                                                                )
                                                        "
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    clea
                                                    @input="
                                                        $refs.menu.save(
                                                            dateFilter
                                                        )
                                                    "
                                                    v-model="dateFilter"
                                                    no-title
                                                    scrollable
                                                    locale="ru-ru"
                                                >
                                                </v-date-picker>
                                            </v-menu>
                                        </v-col>
                                        <v-col
                                            cols="12"
                                            :md="6"
                                            :sm="6"
                                            :lg="3"
                                            v-if="dateRange"
                                        >
                                            <v-menu
                                                ref="menu2"
                                                v-model="menu2"
                                                :close-on-content-click="false"
                                                :return-value.sync="dateFilter2"
                                                transition="scale-transition"
                                                offset-y
                                                min-width="auto"
                                            >
                                                <template
                                                    v-slot:activator="{
                                                        on,
                                                        attrs,
                                                    }"
                                                >
                                                    <v-text-field
                                                        v-model="
                                                            dateFilterFormated2
                                                        "
                                                        :label="dateLabel2"
                                                        prepend-icon="mdi-calendar"
                                                        append-icon="mdi-close"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        @click:append="
                                                            clearDate2
                                                        "
                                                        @blur="
                                                            dateFilter2 =
                                                                parseDate(
                                                                    dateFilterFormated2
                                                                )
                                                        "
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    clea
                                                    @input="
                                                        $refs.menu2.save(
                                                            dateFilter2
                                                        )
                                                    "
                                                    v-model="dateFilter2"
                                                    no-title
                                                    scrollable
                                                    locale="ru-ru"
                                                >
                                                </v-date-picker>
                                            </v-menu>
                                        </v-col>
                                        <v-col
                                            cols="12"
                                            :md="12"
                                            :sm="12"
                                            :lg="3"
                                        >
                                            <div class="text-xs-right">
                                                <v-btn
                                                    @click="getPrices"
                                                    class="mt-5"
                                                    small
                                                    color="primary"
                                                    >{{
                                                        $t("get_price")
                                                    }}</v-btn
                                                >
                                                <v-btn
                                                    @click="resetFilter"
                                                    class="mt-5"
                                                    small
                                                    color="primary"
                                                    >{{
                                                        $t("reset_filter")
                                                    }}</v-btn
                                                >
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>

                <h3 class="teal--text mb-3 mt-5">
                    {{
                        $t("market_prices_for_country_date", {
                            country: countryName(),
                            date: date,
                        })
                    }}
                </h3>
                <h3 class="red--text mb-3 mt-5">
                    {{
                        $t("emergency_messages")
                    }}
                </h3>
                <div>
                    <v-progress-linear
                        class="mt-3"
                        v-if="this.$store.state.loading"
                        indeterminate
                        color="yellow darken-2"
                    ></v-progress-linear>

                    <div
                        v-if="
                            dateRange &&
                            datesForTable &&
                            datesForTable.length > 0
                        "
                    >
                        <v-simple-table class="table-striped">
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th
                                            v-for="header in headers"
                                            :key="header.value"
                                            class="text-left"
                                        >
                                            <template
                                                v-if="
                                                    header.value &&
                                                    header.value.indexOf(
                                                        'sana_'
                                                    ) != -1
                                                "
                                            >
                                                {{
                                                    formatDateForTable(
                                                        header.text
                                                    )
                                                }}
                                            </template>
                                            <template v-else>
                                                {{ header.text }}
                                            </template>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td>
                                            <v-img
                                                :src="setProductPhoto(item.img)"
                                                width="75px"
                                                height="75px"
                                            ></v-img>
                                        </td>
                                        <td>
                                            {{
                                                getProductName(item.product_id)
                                            }}
                                        </td>
                                        <td>
                                            {{
                                                getProductUnitName(
                                                    item.product_id
                                                )
                                            }}
                                        </td>
                                        <td>
                                            {{
                                                getProductCategoryName(
                                                    item.product_id
                                                )
                                            }}
                                        </td>
                                        <td>
                                            {{ getMarketName(item.market_id) }}
                                        </td>
                                        <template v-for="date in datesForTable">
                                            <td :key="date">
                                                {{
                                                    getPriceForMarketDate(
                                                        item.product_id,
                                                        item.market_id,
                                                        date
                                                    )
                                                }}
                                            </td>
                                        </template>
                                        <td>
                                            {{
                                                Math.min(
                                                    ...getPricesFromSeries(
                                                        item.market_id,
                                                        item.product_id
                                                    )
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })
                                            }}
                                        </td>
                                        <td>
                                            {{
                                                average(
                                                    getPricesFromSeries(
                                                        item.market_id,
                                                        item.product_id
                                                    )
                                                )
                                            }}
                                        </td>
                                        <td>
                                            {{
                                                Math.max(
                                                    ...getPricesFromSeries(
                                                        item.market_id,
                                                        item.product_id
                                                    )
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>

                        <my-chart
                            class="mt-5"
                            :chartOptions="chartOptions"
                            :chartSeries="chartSeries"
                        ></my-chart>
                    </div>
                    <div v-else-if="items && items.length > 0">
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('search')"
                            single-line
                            hide-details
                        ></v-text-field>
                        <v-data-table
                            :search="search"
                            height="100vh"
                            :headers="headers"
                            :items="items"
                            :disable-pagination=true
                            class="elevation-1"
                            :hide-default-footer=true
                            :fixed-header=true
                        >
                            <template v-slot:item.img="{ item }">
                                <v-img
                                    :src="setProductPhoto(item.img)"
                                    width="75px"
                                    height="75px"
                                ></v-img>
                            </template>
                        </v-data-table>
                    </div>
                    <p class="text-caption">
                        {{ $t("prices_in_currency", { currency: currency }) }}
                    </p>
                </div>
            </div>
        </v-col>
    </v-row>
</template>
<router>
{
  path: "/"
}
</router>
<script>
import ChooseCountry from "../components/ChooseCountry";
import ToolbarProgressBar from "../components/ToolbarProgressBar";
export default {
    head() {
        return { title: this.$i18n.t("market_prices") };
    },
    components: {
        ChooseCountry,
        ToolbarProgressBar,
    },
    computed: {
        loading() {
            return this.$store.state.loading;
        },
    },
    mounted() {
        let countryId = "";
        countryId = this.$cookies.get("country_id");
        if (!countryId) this.showChooseCountry = true;
        else this.$store.commit("setCountryID", countryId);

        if (countryId>0) this.fetchLatestPrices(countryId, this.$i18n.locale);
        console.log("What are you looking for? 🥸");
    },
    data() {
        return {
            dateRange: false,
            currency: "",
            search: "",
            showChooseCountry: false,
            prices: [],
            markets: [],
            units: [],
            categories: [],
            products: [],
            axiosError: false,
            axiosErrorMsg: "",
            headers: [],
            items: [],
            productsFilter: [],
            categoriesFilter: [],
            marketsFilter: [],
            listOfProducts: [],
            date: "",
            dateLabel: this.$i18n.t("date"),
            dateFilter: null,
            menu: false,
            dateFilterFormated: null,
            date2: "",
            dateLabel2: this.$i18n.t("date_to"),
            dateFilter2: null,
            menu2: false,
            dateFilterFormated2: null,
            loading: false,
            filterPanel: [],
            datesForTable: [],
            product_price: [],
            chartSeries: [],
        };
    },
    methods: {
        resetFilter() {
            this.productsFilter = [];
            this.categoriesFilter = [];
            this.marketsFilter = [];
            this.dateFilter = null;
            this.dateFilter2 = null;
            this.dateRange = false;
            this.filterPanel = [];
            this.fetchLatestPrices(
                this.$store.state.countryId,
                this.$i18n.locale
            );
        },
        categoriesProducts(categories) {
             let products = [];
             if (categories ==''){
                this.productsList()
            }else{
              // if (categories.length > 3){
              //   categories.pop();
              // }
                 Object.values(this.products).forEach((entry) => {
                     if(categories.find(e => e == entry.category_id)){
                          products.push({
                            text: entry.name,
                            value: entry.id,
                          });
                      }

                  });
                    this.listOfProducts = products
            }


        },
         productsList() {
            let products = [];
            Object.values(this.products).forEach((entry) => {
                products.push({
                    text: entry.name,
                    value: entry.id,
                });
            });
            this.listOfProducts = products
        },
        setProductPhoto(photo) {
            if (!photo || photo.length == 0) photo = "default.jpeg";
            return `${this.$config.baseURL}/upload/product_photo/${photo}`;
        },
        limitCategory(elem) {
            // if (elem.length > 3) elem.pop();
        },
        countryName() {
            if (this.$store.state.countryId == 1) return this.$t("tajikistan");
            else if (this.$store.state.countryId == 2)
                return this.$t("kyrgyzstan");
            else return "";
        },
        showDateRange() {
            this.datesForTable = [];
            this.items = [];
            if (this.dateRange) this.dateLabel = this.$i18n.t("date_from");
            else this.dateLabel = this.$i18n.t("date");
        },
        clearDate() {
            this.dateFilter = null;
        },
        clearDate2() {
            this.dateFilter2 = null;
        },
        changeCountry(countryId) {
            this.$cookies.set("country_id", countryId, {
                maxAge: 12 * 60 * 60 * 24 * 30,
            }); // 12 month after, expire
            this.$store.commit("setCountryID", countryId);
            this.showChooseCountry = false;
            if (countryId>0) this.fetchLatestPrices(countryId, this.$i18n.locale);
        },
        syncDataTable() {
            this.items = [];

            let n = 1;
            let marketsWithPrices = [];
            Object.values(this.products).forEach((product) => {
                let _prices = [];
                let _item = {
                    id: n,
                    product_name: this.getProductName(product.id),
                    unit_name: this.getUnitName(product.unit_id),
                    category_name: this.getCategoryName(product.category_id),
                    img: product.img,
                };
                Object.values(this.markets).forEach((market) => {
                    let key = "market_" + market.id;
                    _item[key] = this.getPriceForMarket(product.id, market.id);
                    if (_item[key] > 0) {
                        _prices.push(parseFloat(_item[key]));
                        if (marketsWithPrices.indexOf(market.id) == -1)
                            marketsWithPrices.push(market.id);
                    }
                });
                _item["min_price"] = Math.min(..._prices).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                );
                _item["avg_price"] = (
                    _prices.reduce((a, b) => a + b, 0) / _prices.length
                ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                _item["max_price"] = Math.max(..._prices).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                );
                if (_prices.length > 0) {
                    n++;
                    this.items.push(_item);
                }
            });

            if (marketsWithPrices && marketsWithPrices.length > 0) {
                this.headers = [
                    { text: "Фото", value: "img", sortable: false },
                    {
                        text: this.$i18n.t("product_name"),
                        value: "product_name",
                    },
                    {
                        text: this.$i18n.t("unit"),
                        value: "unit_name",
                    },
                    {
                        text: this.$i18n.t("category"),
                        value: "category_name",
                    },
                ];
                Object.values(this.markets).forEach((entry) => {
                    if (marketsWithPrices.indexOf(entry.id) != -1) {
                        this.headers.push({
                            text: entry.name,
                            value: "market_" + entry.id,
                        });
                    }
                });
                this.headers.push({
                    text: this.$i18n.t("min_price"),
                    value: "min_price",
                });
                this.headers.push({
                    text: this.$i18n.t("avg_price"),
                    value: "avg_price",
                });
                this.headers.push({
                    text: this.$i18n.t("max_price"),
                    value: "max_price",
                });
            }
        },
        async syncDataTableAdvanced() {
            this.items = [];
            this.chartSeries = [];
            let n = 1;
            let _priceDatesMarkets = this.getListOfDatesMarketsWithPrices(
                this.prices
            );
            this.datesForTable = _priceDatesMarkets.dates;
            let _priceMarkets = _priceDatesMarkets.markets;

            Object.values(_priceMarkets).forEach((market_id) => {
                Object.values(this.productsFilter).forEach((product_id) => {
                    let _item = {
                        img: this.getProductImg(product_id),
                        product_id: product_id,
                        market_id: market_id,
                    };
                    n++;
                    this.items.push(_item);
                });
                if (this.items.length > 0) {
                    this.headers = [];
                    this.headers = [
                        { text: "Фото", value: "img", sortable: false },
                        {
                            text: this.$i18n.t("product_name"),
                            value: "product_name",
                        },
                        {
                            text: this.$i18n.t("unit"),
                            value: "unit_name",
                        },
                        {
                            text: this.$i18n.t("category"),
                            value: "category_name",
                        },
                        {
                            text: this.$i18n.t("markets"),
                            value: "market_name",
                        },
                    ];

                    Object.values(this.datesForTable).forEach((entry) => {
                        this.headers.push({
                            text: entry,
                            value: "sana_" + entry,
                        });
                    });
                    this.headers.push({
                        text: this.$i18n.t("min_price"),
                        value: "min_price",
                    });
                    this.headers.push({
                        text: this.$i18n.t("avg_price"),
                        value: "avg_price",
                    });
                    this.headers.push({
                        text: this.$i18n.t("max_price"),
                        value: "max_price",
                    });
                }
            });

            Object.values(this.items).forEach((item) => {
                let _series = {};
                _series["name"] =
                    this.getProductName(item.product_id) +
                    ", " +
                    this.getMarketName(item.market_id);
                _series["market_id"] = item.market_id;
                _series["product_id"] = item.product_id;
                let _prices = [];
                Object.values(this.datesForTable).forEach((date) => {
                    let _price = this.getPriceForMarketDate(
                        item.product_id,
                        item.market_id,
                        date
                    );
                    _prices.push(_price);
                });
                _series["data"] = _prices;
                this.chartSeries.push(_series);
            });
        },
        getPricesFromSeries(marketId, productId) {
            let arr = [];
            let flag = false;
            for (let i = 0; i < this.chartSeries.length; i++) {
                if (
                    this.chartSeries[i].market_id == marketId &&
                    this.chartSeries[i].product_id == productId
                ) {
                    Object.values(this.chartSeries[i].data).forEach((price) => {
                        if (!isNaN(parseFloat(price)))
                            arr.push(parseFloat(price));
                    });
                    break;
                }
            }
            return arr;
        },
        getListOfDatesMarketsWithPrices(prices) {
            let dateArray = [];
            let marketArray = [];

            Object.values(prices).forEach((entry) => {
                dateArray[entry.date] = 1;
                marketArray[entry.market_id] = 1;
            });
            let _date = [];
            Object.keys(dateArray).forEach((date) => {
                _date.push(date);
            });
            let _market = [];
            Object.keys(marketArray).forEach((market) => {
                _market.push(market);
            });
            return { dates: _date, markets: _market };
        },
        getProductImg(id) {
            let product = this.products.filter((product) => product.id == id);
            if (product && product[0]) return product[0].img;
            else return "";
        },
        getProductName(id) {
            let product = this.products.filter((product) => product.id == id);
            if (product && product[0]) return product[0].name;
            else return "";
        },
        getCategoryName(id) {
            let category = this.categories.filter(
                (category) => category.id == id
            );
            if (category && category[0]) return category[0].name;
            else return "";
        },
        getUnitName(id) {
            let unit = this.units.filter((unit) => unit.id == id);
            if (unit && unit[0]) return unit[0].name;
            else return "";
        },
        getProductCategoryName(productId) {
            let product = this.products.filter(
                (product) => product.id == productId
            );
            if (product && product[0]) {
                return this.getCategoryName(product[0].category_id);
            } else {
                return "";
            }
        },
        getProductUnitName(productId) {
            let product = this.products.filter(
                (product) => product.id == productId
            );
            if (product && product[0]) {
                return this.getUnitName(product[0].unit_id);
            } else {
                return "";
            }
        },
        getMarketName(id) {
            let market = this.markets.filter((market) => market.id == id);
            if (market && market[0]) return market[0].name;
            else return "";
        },
        getPriceForMarket(productId, marketId) {
            let price = this.prices.filter(
                (price) =>
                    price.product_id == productId && price.market_id == marketId
            );
            if (price && price[0]) return price[0].price;
            else return "";
        },
        getPriceForMarketDate(productId, marketId, date) {
            let price = this.prices.filter(
                (price) =>
                    price.product_id == productId &&
                    price.market_id == marketId &&
                    price.date == date
            );
            if (price && price[0]) return price[0].price;
            else return null;
        },
        async fetchLatestPrices(
            country,
            language,
            markets = null,
            categories = null,
            products = null,
            date = null,
            date2 = null
        ) {
            this.$store.commit("setLoading", true);
            try {
                let params = {
                    markets: markets,
                    products: products,
                    categories: categories,
                    date: date,
                    date2: date2,
                };
                // console.log(categories)
                let response = await this.$axios.get(
                    `/v1/latest-prices/${country}/${language}`,
                    { params: params }
                );
                if (response.status == 200) {
                    this.date = response.data.date;
                    this.prices = response.data.prices;
                    this.markets = response.data.markets;
                    this.units = response.data.units;
                    this.categories = response.data.categories;
                    this.products = response.data.products;
                    this.currency = response.data.currency;
                    if(this.categoriesFilter.length == 0){
                        this.productsList()
                    }else{
                        this.categoriesProducts(this.categoriesFilter)
                    }

                    if (this.dateRange) await this.syncDataTableAdvanced();
                    else this.syncDataTable();
                } else if (response.status == 404) {
                    this.axiosError = true;
                    this.axiosErrorMsg = this.$i18n.t("no_data_available");
                } else {
                    this.axiosError = true;
                    this.axiosErrorMsg = response.data.message;
                }
            } catch (err) {
                this.axiosError = true;
                if (err.response && err.response.data.message)
                    this.axiosErrorMsg = this.$i18n.t("no_data_available");
                else this.axiosErrorMsg = err;
            } finally {
                this.$store.commit("setLoading", false);
            }
        },
        parseDate(date) {
            if (!date) return null;

            const [day, month, year] = date.split(".");
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        },
        formatDate(date) {
            if (!date) return null;

            const [year, month, day] = date.split("-");
            return `${day}.${month}.${year}`;
        },
        formatDateForTable(date) {
            if (!date) return null;
            if (date.split("-").length == 2) {
                const [month, year] = date.split("-");
                return `${this.getMonthName(month)},${year}`;
            } else {
                const [year, month, day] = date.split("-");
                return `${day}.${month}.${year}`;
            }
        },
        getMonthName(month) {
            let monthNames = [
                this.$i18n.t("Jan"),
                this.$i18n.t("Feb"),
                this.$i18n.t("March"),
                this.$i18n.t("April"),
                this.$i18n.t("May"),
                this.$i18n.t("June"),
                this.$i18n.t("July"),
                this.$i18n.t("Aug"),
                this.$i18n.t("Sep"),
                this.$i18n.t("Oct"),
                this.$i18n.t("Nov"),
                this.$i18n.t("Dec"),
            ];
            if (monthNames[month - 1]) return monthNames[month - 1];
            else return "";
        },
        getPrices() {
            this.filterPanel = [];
            if (this.dateRange) {
                if (this.productsFilter.length == 0) {
                    this.axiosError = true;
                    this.axiosErrorMsg = this.$i18n.t("select_prouct_err_msg");
                    return false;
                }
                if (this.marketsFilter.length == 0) {
                    this.axiosError = true;
                    this.axiosErrorMsg = this.$i18n.t("select_market_err_msg");
                    return false;
                }
                if (
                    !this.dateFilter ||
                    this.dateFilter.length == 0 ||
                    !this.dateFilter2 ||
                    this.dateFilter2.length == 0
                ) {
                    this.axiosError = true;
                    this.axiosErrorMsg = this.$i18n.t("select_date_err_msg");
                    return false;
                }
                if (this.dateFilter && this.dateFilterFormated2) {
                    const [year, month, day] = this.dateFilter.split("-");
                    const [year2, month2, day2] = this.dateFilter2.split("-");
                    let date1 = new Date(year, month, day);
                    let date2 = new Date(year2, month2, day2);
                    if (date2 < date1) {
                        this.axiosError = true;
                        this.axiosErrorMsg = this.$i18n.t(
                            "invalid_date_err_msg"
                        );
                        return false;
                    }
                }
            }
            this.fetchLatestPrices(
                this.$store.state.countryId,
                this.$i18n.locale,
                this.marketsFilter,
                this.categoriesFilter,
                this.productsFilter,
                this.dateFilter,
                this.dateFilter2
            );
        },

        average(arr) {
            return (
                arr.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) /
                arr.length
            ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        },

        /**
         * Convert date string to year and ISO week number
         * @param {string} dateString - Date in DD.MM.YYYY format
         * @return {object} {year: number, week: number}
         */
        getYearWeekFromDate(dateString) {
            if (!dateString) return null;

            // Parse DD.MM.YYYY format
            const [day, month, year] = dateString.split('.');
            const date = new Date(year, month - 1, day);

            // Get ISO week number
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
            const weekNumber = Math.ceil(dayOfYear / 7);

            return {
                year: parseInt(year),
                week: weekNumber
            };
        },
    },
    computed: {
        marketsList() {
            let markets = [];
            Object.values(this.markets).forEach((entry) => {
                markets.push({
                    text: entry.name,
                    value: entry.id,
                });
            });
            return markets;
        },
        categoriesList() {
            let categories = [];
            Object.values(this.categories).forEach((entry) => {
                categories.push({
                    text: entry.name,
                    value: entry.id,
                });
            });
            return categories;
        },
        computedDateFilterFormated() {
            return this.formatDate(this.date);
        },
        computedDateFilterFormated2() {
            return this.formatDate(this.date2);
        },
        chartOptions() {
            let _chartOptions = {
                animations: { enabled: false },
                dataLabels: {
                    enabled: true,
                },
                stroke: {
                    curve: "smooth",
                },
                title: {
                    text: this.$i18n.t("market_prices"),
                    align: "left",
                },

                markers: {
                    size: 1,
                },
                xaxis: {
                    categories: this.datesForTable.map((date) =>
                        this.formatDateForTable(date)
                    ),
                    title: {
                        text: this.$i18n.t("date"),
                    },
                },
                yaxis: {
                    title: {
                        text: this.$i18n.t("price"),
                    },
                },
                legend: {
                    position: "top",
                    horizontalAlign: "center",
                    floating: true,
                    offsetY: -25,
                    offsetX: -5,
                },
            };
            return _chartOptions;
        },
    },
    watch: {
        dateFilter(val) {
            this.dateFilterFormated = this.formatDate(this.dateFilter);
        },
        dateFilter2(val) {
            this.dateFilterFormated2 = this.formatDate(this.dateFilter2);
        },
    },
    name: "main",
};
</script>
<style>
.v-data-table__wrapper tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.05);
}
</style>
