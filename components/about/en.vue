<template>
  <v-row>
    <v-col>
      <h1 class="center">How prices are collected in AgroInfrom.Tj?</h1>
      <p>AgroInform.tj collects 2 type of price information:</p>
      <ol>
        <li>Market prices on agricultural products</li>
        <li>Prices on agricultural input supplies</li>
      </ol>
      <p class="mt-2">
        <b>Retail prices in markets</b> are collected weekly from 8 cities of
        Tajikistan through our agents.
      </p>
      <p>
        Weekly on Wednesday every agent provides information about prices in
        markets by phone or by e-mail.
      </p>
      <p>
        Prices are collected on products of traditional medium quality, that in
        many occasions are sold in huge amounts. The prices gather for
        production of traditional average quality which in most cases, is on
        sale in much considerable quantities. The prices for begun to rot
        production with considerable physical damages, with traces of illnesses,
        or other considerable lacks do not get to results of gathering. The
        information provided by Agents are processed and published.
      </p>
      <p>
        Website visitors can get information as in digital format, or as a
        graphic.
      </p>
      <p><b>Prices on agricultural input supplies</b></p>
      <p>
        For gathering prices on agri-input supplies we have signed 12 agreements
        with suppliers (agro-shops.) Monthly (in season by price change)
        information on prices is gathered according price-list and a minimum
        price, maximum price, and medium price are publishing, also there is a
        list of companies, where you can get these input supplies. Prices are
        gathered for the following categories of input supplies:
      </p>
      <ol>
        <li>Seeds</li>
        <li>Fertilizers</li>
        <li>Plant protection products</li>
      </ol>
      <p class="mt-2">
        The full information regarding to current prices and history of prices
        is placed in the website
        <a href="http://www.agroinform.tj">www.agroinform.tj</a>.
      </p>
      <p>
        Beside, that price information is accessible in other packages of our
        services as well:
      </p>
      <ol>
        <li>Monthly publication in newspaper AgroInfrom.Tj</li>
        <li>Through SMS-packages during the season</li>
      </ol>
      <p class="mt-2">
        AgroInform.tj is doing its best in providing trustfulness and efficiency
        of information. But, the situation in the market can change quickly,
        that’s why we suggest you to check information through our informational
        packages and also directly from buyers or/and sellers before deciding on
        supplying or buying a product.
      </p>
      <p>
        Beside that you need to remember that prices can substantially change
        from provided average level depending on quality of product, etc. That’s
        why provided information cannot be straight instruction to act, and can
        serve only for keeping up with market trends.
      </p>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: "aboutEn",
  head() {
    return(
        {title: this.$i18n.t('how_prices_collected')}
    );
  },
};
</script>
