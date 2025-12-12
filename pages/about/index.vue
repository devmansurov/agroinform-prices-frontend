<template>
  <about-ru v-if="this.$i18n.locale=='ru'"></about-ru>
  <about-tj v-else-if="this.$i18n.locale=='tj'"></about-tj>
  <about-en v-else-if="this.$i18n.locale=='en'"></about-en>
  <about-kg v-else-if="this.$i18n.locale=='kg'"></about-kg>
</template>
<router>
{
  path: "/about"
}
</router>
<script>
import aboutRu from "../../components/about/ru.vue"
import aboutTj from "../../components/about/tj.vue"
import aboutEn from "../../components/about/en.vue"
import aboutKg from "../../components/about/kg.vue"
export default {
  name:'about',
  components: {
    aboutRu,
    aboutTj,
    aboutEn,
    aboutKg,
  }
}