<template>
    <v-row>
        <v-col cols="12">
            <h1>{{ $t("market_prices") }}</h1>
            <choose-country v-on:change-country="changeCountry" v-if="showChooseCountry"></choose-country>

            <p>Language: {{ this.$i18n.locale }}</p>
            <p>Country: {{ this.$store.state.countryId }}</p>
            <p>Market ID: {{ marketId }}</p>
            <p>Product ID: {{ productId }}</p>
        </v-col>
    </v-row>
</template>
<router>
{
  path: "/prices/:countryId?/:marketId?/:productId?",
}
</router>
<script>
import ChooseCountry from '../../components/ChooseCountry'
export default {
    components: {
      ChooseCountry
    },
    mounted() {
      let countryId='';
      if (!this.$route.params.countryId){
        countryId = this.$cookies.get('country_id');
        if (!countryId) 
          this.showChooseCountry = true;
        else
          this.$store.commit('setCountryID', countryId);
      }else{
        countryId = this.$route.params.countryId;
        this.changeCountry(countryId);
        this.$store.commit('setCountryID', countryId);
      }
      
      this.marketId = this.$route.params.marketId;
      this.productId = this.$route.params.productId;
    }, 
    data() {
        return {
            marketId: '',
            productId: '',
            showChooseCountry: false,
        };
    },
    methods: {
      changeCountry(countryId){
        this.$cookies.set("country_id",countryId,{maxAge: 12*60*60*24*30}); // 12 month after, expire
        this.$store.commit('setCountryID', countryId);
        this.showChooseCountry = false;
      }
    },
    name: "prices",
};
</script>