<template>
    <v-row>
        <v-col>
            <h1 class="center">Our achievements</h1>
            <p>The AgroSpace Platform offers to the users:</p>
            <p>18 different <a href="https://apps.agroinform.asia/" target="_blank">mobile applications</a>
                for the production and sale of agricultural products, and distant consulting in up to four
                languages (English, Kyrgyz, Russian and Tajik). More than 170,000 downloads, around 15% are
                active users</p>
            <p>More than 600 electronic materials in the <a href="https://kitob.agroinform.asia/"
                                                            target="_blank">electronic library</a>, related
                to the development of agricultural, rural area and economy in Central Asia, with the ability
                to add free / paid materials, search and download. More than 360,000 downloads of the
                materials by the users</p>
            <p><a href="https://trade.agroinform.asia/" target="_blank"> Electronic trade platform</a> for
                the sale and purchase of 14 types of agricultural products with the ability to place ads
                with photos of products from a smartphone. More than 3,000 users per month</p>
            <p><a href="https://maps.agroinform.asia/" target="_blank"> Electronic maps</a> with
                information about the production of 35 types of agricultural products at the district level
                since 2012, the location of processing companies, storage facilities, greenhouses,
                agrostores, etc. for making the right decisions for investment, planning production and
                processing of products, organizing effective harvest. More than 500 specialists from
                different countries use the tool to solve their tasks monthly</p>
            <p><a href="https://apps.agroinform.asia/dc/index.html" target="_blank">The distant consulting
                    system</a> allows training specialists, consultants and businesses to find each other
                through a mobile application in the Android OS, which provides the ability to easily
                register a user, create a profile, and conduct an assessment of the consultant and training
                specialist. Work is underway to integrate vid-eoconferencing and payment modules into the
                tool</p>
            <p><a href="https://youtube.com/agroinformtj" target="_blank"> A YouTube video channel</a> with
                educational and informational videos to increase yields, prevent diseases and control pests.
                More than 125,000 views and more than 1,500 subscribers</p>
            <p>Other tools are retail <a href="https://marketprices.agroinform.asia/" target="_blank">
                    market prices</a> for agricultural products in the cities of Tajikistan (weekly) and
                Kyrgyzstan (monthly); <a href="https://calculators.agroinform.asia/" target="_blank">
                    calculators</a> for calculating the quantity of seeds, water for irrigation and
                fertilizers. More than 3,000 users of these tools per year</p>
            <v-row>
                <v-col cols="4" v-for="certificate in certificates" :key="certificate">
                    <v-img :src="certificate"></v-img>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>
<script>
export default {
    head() {
      return(
          {title: this.$i18n.t('our_achievements')}
      );
    },
    name: "ourAchievementsEn",
    data () {
        return {
            certificates: [
                '../certificates/best_rural_advisory_service.jpg',
                '../certificates/certificate_mMarketplace.jpg',
                '../certificates/diploma_khomai_sozanda.jpg',
                '../certificates/iTalk4.jpg',
                '../certificates/neksigol_mushovir_innovator.jpg',
                '../certificates/e-agro.jpg',
                '../certificates/eurasian.jpg',
                '../certificates/hilfswerl_gramota.jpg'
            ]
        }
    },
};
</script>
