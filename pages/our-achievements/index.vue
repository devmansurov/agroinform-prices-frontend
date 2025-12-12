<template>
  <our-achievements-ru v-if="this.$i18n.locale=='ru'"></our-achievements-ru>
  <our-achievements-tj v-else-if="this.$i18n.locale=='tj'"></our-achievements-tj>
  <our-achievements-en v-else-if="this.$i18n.locale=='en'"></our-achievements-en>
  <our-achievements-kg v-else-if="this.$i18n.locale=='kg'"></our-achievements-kg>
</template>
<router>
{
  path: "/our-achievements"
}
</router>
<script>
import ourAchievementsRu from "../../components/our-achievements/ru.vue"
import ourAchievementsTj from "../../components/our-achievements/tj.vue"
import ourAchievementsEn from "../../components/our-achievements/en.vue"
import ourAchievementsKg from "../../components/our-achievements/kg.vue"
export default {
  components: {
    ourAchievementsRu,
    ourAchievementsTj,
    ourAchievementsEn,
    ourAchievementsKg,
  }
}