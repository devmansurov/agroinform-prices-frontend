<template>
  <v-row v-if="visible">
    <v-col class="text-center">
      <h2 v-text="$t('choose_country')"></h2>
      <v-row>
        <v-col class="text-right">
          <img
            :title="$t('tajikistan')"
            style="cursor: pointer"
            @click="setCountry(1)"
            width="50%"
            src="/tajikistan.svg"
          />
        </v-col>
        <v-col class="text-left">
          <img
            :title="$t('kyrgyzstan')"
            style="cursor: pointer"
            @click="setCountry(2)"
            width="50%"
            src="/kyrgyzstan.svg"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
export default {
  data () {
    return {
      visible: false
    }
  },
  methods: {
    setCountry(country) {
      this.$emit('change-country', country);
    }
  },
  mounted(){
    setTimeout(()=>{ 
      this.visible = true; 
    }, 1500);
  },
  name: "ChooseCountry"
};
</script>
