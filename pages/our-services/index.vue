<template>
  <our-services-ru v-if="this.$i18n.locale=='ru'"></our-services-ru>
  <our-services-tj v-else-if="this.$i18n.locale=='tj'"></our-services-tj>
  <our-services-en v-else-if="this.$i18n.locale=='en'"></our-services-en>
  <our-services-kg v-else-if="this.$i18n.locale=='kg'"></our-services-kg>
</template>
<router>
{
  path: "/our-services"
}
</router>
<script>
import ourServicesRu from "../../components/our-services/ru.vue"
import ourServicesTj from "../../components/our-services/tj.vue"
import ourServicesEn from "../../components/our-services/en.vue"
import ourServicesKg from "../../components/our-services/kg.vue"
export default {
  components: {
    ourServicesRu,
    ourServicesTj,
    ourServicesEn,
    ourServicesKg,
  }
}