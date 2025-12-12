<template>
    <v-row>
        <v-col>
            <h1 class="center">Дастовардҳои мо</h1>
            <p>Платформаи AgroSpace ба истифодабарандагон пешниҳод мекунад:</p>
            <p>18 <a class="underlined" href="https://apps.agroinform.asia" target="_blank">барномаҳои мобилии</a> гуногун барои истеҳсол ва фурӯши маҳсулоти кишоварзӣ ва барои гузаронидани машваратҳои фосилавӣ ба ду-чор забон (англисӣ, қирғизӣ, русӣ ва тоҷикӣ). Беш аз  170 000 боргирӣ, қариб 15% истифодабарандаи фаъол.</p>
            <p>Беш аз 600 маводи электронӣ дар <a class="underlined" href="https://kitob.agroinform.asia" target="_blank">китобхонаи электронӣ</a>, ки ба рушди кишоварзӣ, иқтисод ва маҳалҳои Осиёи Марказӣ марбут мебошанд, бо имкони ворид кардани маводи бепул/пулакӣ, ҷустуҷӯ ва боргирӣ. Беш аз 360 000 маводи боргиришуда.</p>
            <p><a class="underlined" href="https://trade.agroinform.asia" target="_blank">Майдончаи электронии эълонҳо</a> барои хариду фурӯши 14 намуди маҳсулоти кишоварзӣ бо имкони ҷойгир кардани сурати маҳсулот аз тариқи сматрфон. Беш аз 3 000 истифодабаранда дар як моҳ.</p>
            <p><a class="underlined" href="https://maps.agroinform.asia" target="_blank">Харитаи электронӣ</a> бо маълумот оид ба истеҳсоли 35 намуди маҳсулоти кишоварзӣ дар сатҳи ноҳияҳо аз соли 2012, суроғаҳои ширкатҳои коркард, анборҳо, гармхонаҳо, агромағозаҳо ва ғайра барои интихоби дурусти маблағгузорӣ, банақшагирии истеҳсолот ва коркарди маҳсулот, ташкили самарабахши ҷамъоварии ҳосил. Беш аз 500 мутахассис аз кишварҳои гуногун ҳар моҳ аз ин барнома барои ҳалли вазифаҳои худ истифода мебаранд.</p>
            <p><a href="https://apps.agroinform.asia/dc/index.html" target="_blank">Системаи машваратдиҳии фосилавӣ</a> ба мутахассисони таълим, мушовирон ва бизнес имкон медиҳад, ки ба воситаи барномаи мобилӣ дар ОС Android якдигарро пайдо кунанд, ки дар он имконияти бақайдгирии соддаи истифодабаранда, сохтани профайл, баҳогузории мушовир ва мутахассиси таълим ба назар гирифта шудааст. Корҳо оид ба пайваст кардани модулҳои конфронсҳои видеоӣ ва пардохти маблағ ба барнома идома доранд.</p>
            <p><a class="underlined" href="https://www.youtube.com/c/agroinformtj" target="_blank">Шабакаи видеоӣ дар YouTube</a> бо маводи таълимӣ ва иттилоотии видеоӣ барои баланд бардоштани ҳосилнокӣ, пешгирии касалиҳо ва мубориза бар зидди зараррасонҳо таъмин аст. Он  125 000 боздид ва зиёда аз 1 500 муштарӣ дорад.</p>
            <p>Барномаҳои дигар – <a class="underlined" href="https://prices.agroinform.asia" target="_blank">нархҳои чаканаи бозории</a> маҳсулоти кишоварзӣ дар шаҳрҳои Тоҷикистон (ҳар ҳафта) ва Қирғизистон (ҳар моҳ); <a class="underlined" href="https://calculators.agroinform.asia" target="_blank">ҳисобкунак</a> барои баҳисобгирии миқдори тухмӣ, об ва нуриҳо. Соле ин барномаҳо беш аз 3 000 истифодабаранда доранд.</p>
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
            '../certificates/hilfswerl_gramota.jpg',
            
        ]
    }
  },
    name: "ourServicesTj",
    
};
</script>