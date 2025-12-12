<template>
    <v-app>
        <v-app-bar overflow extension-height="0" fixed app color="teal">
            <v-icon color="white" class="mr-5">mdi-cash-multiple</v-icon>
            <v-toolbar-title
                class="white--text"
                v-text="$t('market_prices') + ': ' + countryName()"
            ></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn text color="white" :to="localePath('/')" exact>
                    <v-icon class="mr-1"> mdi-home </v-icon>
                    {{ $t("home") }}
                </v-btn>

                <v-btn v-if="$store.state.countryId==1" text color="white" :to="localePath('/reports/weekly-report')">
                  <v-icon class="mr-1"> mdi-calendar-week </v-icon>
                  {{ $t("weekly_market_report") }}
                </v-btn>

                <v-btn text color="white" href= "http://seedprices.agroinform.asia/">
                    <v-icon class="mr-1"> mdi-finance </v-icon>
                    {{ $t("production_prices") }}
                </v-btn>
                <v-btn v-if="$store.state.countryId==1" text color="white" :to="localePath('reports')" exact>
                  <v-icon class="mr-1"> mdi-chart-box-plus-outline </v-icon>
                  {{ $t("market_reports") }}
                </v-btn>
                <v-menu offset-y class="mr-5" open-on-hover>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn text color="white" v-bind="attrs" v-on="on">
                            <v-icon left class="mr-1"> mdi-information </v-icon>
                            {{ $t("about_us") }}
                            <v-icon right class="mr-1"> mdi-menu-down </v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item key="about_us" :to="localePath('about')">
                            <v-list-item-title>{{
                                $t("how_prices_collected")
                            }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item key="our_services" :to="localePath('our-services')">
                            <v-list-item-title>{{
                                $t("our_services")
                            }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item key="our_achievements" :to="localePath('our-achievements')">
                            <v-list-item-title>{{
                                $t("our_achievements")
                            }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-menu offset-y class="mr-5" open-on-hover>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn text color="white" v-bind="attrs" v-on="on">
                            <v-icon class="mr-1"> mdi-web </v-icon>
                            {{ $t("change_country") }}
                            <v-icon right class="mr-1"> mdi-menu-down </v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="(item, index) in countries"
                            :key="index"
                            @click="changeCountry(item.code)"
                        >
                            <v-list-item-title>{{
                                item.title
                            }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-menu offset-y class="mr-5" open-on-hover>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn text color="white" v-bind="attrs" v-on="on">
                            <v-icon
                                class="mr-1"
                                :title="$t('change_language')"
                                color="white"
                            >
                                mdi-translate
                            </v-icon>
                            {{ $t("change_language") }}
                            <v-icon right class="mr-1"> mdi-menu-down </v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="(item, index) in languages"
                            :key="index"
                            :to="switchLocalePath(item.code)"
                        >
                            <v-list-item-title>{{
                                item.title
                            }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-toolbar-items>
            <!-- <toolbar-progress-bar :loading="loading" color="yellow accent-4" slot="extension" /> -->
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
        </v-app-bar>
        <v-main>
            <v-container fluid class="pl-6 pr-6 pt-5">
                <Nuxt />
            </v-container>
        </v-main>
        <v-footer :absolute="!fixed" app>
            <span>&copy; {{ new Date().getFullYear() }}</span>
        </v-footer>
    </v-app>
</template>

<script>
export default {
    data() {
        return {
            fixed: false
        };
    },
    computed: {
        loading() {
            return this.$store.state.loading;
        },
        countries(){
            let _countries = [
                { code: 1, title: this.$t("tajikistan_menu") },
                { code: 2, title: this.$t("kyrgyzstan_menu") },
            ];
            return _countries;
        },
        languages(){
            let _languages = [
                { code: "ru", title: this.$t("russian") },
                { code: "tj", title: this.$t("tajik") },
                { code: "en", title: this.$t("english") },
                { code: "kg", title: this.$t("kyrgyz") },
            ];
            return _languages;
        }
    },
    methods: {
        changeCountry(countryId) {
            this.$cookies.set("country_id", countryId, 12 * 60 * 60 * 24 * 30); // 12 month after, expire
            this.$store.commit("setCountryID", countryId);
            this.countryId = countryId;
            location.reload();
        },
        countryName() {
            if (this.$store.state.countryId == 1) return this.$t("tajikistan_menu");
            else if (this.$store.state.countryId == 2)
                return this.$t("kyrgyzstan_menu");
            else return "";
        },
    },
};
</script>

<style>
.v-toolbar__extension {
    padding: 0px !important;
}
</style>
