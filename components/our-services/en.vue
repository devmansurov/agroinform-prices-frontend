<template>
    <v-row>
        <v-col>
            <h1 class="center">Our services</h1>
            <p>We offer following paid services:</p>
            <ul class="mb-2">
                <li>
                    Publishing information about Your company and seeds, plant
                    protection products, and fertilizers in mobile apps based on
                    an annual subscription fees:
                </li>
                <ul>
                    <li>in one mobile app 50 USD / year</li>
                    <li>in 2-4 mobile apps 150 USD / year</li>
                    <li>in 5-6 mobile apps 200 USD / year</li>
                </ul>
                <li>
                    Publishing Your own ads in the mobile app in the form of an
                    image that pops up when the user is working in the app, 10
                    USD / month.
                </li>
                <li>
                    The advertising in IT tools of the AgroSpace Platform, 10
                    USD / month.
                </li>
            </ul>
            <p>
                To sign a contract for paid services, you need to contact one of
                the partner offices specified in the
                <a target="_blank" href="https://agro-asia.com/ru/contacts">Contacts section</a
                >.
            </p>

            <p>We offer the following free services:</p>
            <ul>
                <li>
                    Agrarian online store
                    <a
                        href="https://hosil.tj"
                        target="_blank"
                        >Hosil.tj</a
                    >
                    for the purchase of agricultural products and services
                </li>
                <li>
                    Publishing ads in the
                    <a href="https://trade.agroinform.asia/" target="_blank"
                        >trade platform</a
                    >
                    for the purchase and sale of agricultural products and
                    services
                </li>
                <li>
                    Publishing free educational, informational, and reference
                    material in the
                    <a
                        href="https://kitob.agroinform.asia/ru/add-material"
                        target="_blank"
                    >
                        E Library</a
                    >
                </li>
                <li>
                    Downloading free educational, informational, and other
                    materials from the
                    <a href="https://kitob.agroinform.asia/" target="_blank">
                        E-Library</a
                    >
                </li>
                <li>
                    Downloading and using all
                    <a href="https://apps.agroinform.asia//" target="_blank"
                        >mobile apps</a
                    >
                </li>
                <li>
                    Using
                    <a href="https://maps.agroinform.asia/" target="_blank"
                        >electronic maps</a
                    >
                    for making rational and effective decisions
                </li>
                <li>
                    Watching training video materials for the production and
                    processing of agricultural products with the ability to
                    subscribe to the
                    <a
                        href="https://www.youtube.com/c/agroinformtj"
                        target="_blank"
                        >YouTube channel</a
                    >
                    to receive notifications about the distribution of new
                    materials
                </li>
                <li>
                    Monitoring the retail
                    <a href="https://prices.agroinform.asia/" target="_blank"
                        >market prices</a
                    >
                    changes for various agricultural products with the ability
                    to download information for a specific period of time and
                    for a specific market in Excel file format
                </li>
                <li>
                    Using
                    <a
                        href="https://calculators.agroinform.asia/"
                        target="_blank"
                        >calculators</a
                    >
                    to count the required amount of seeds, fertilizers, and
                    water to produce a specific crop on a specific field size
                </li>
            </ul>
        </v-col>
    </v-row>
</template>
<script>
export default {
    head() {
      return(
          {title: this.$i18n.t('our_services')}
      );
    },
    name: "ourServicesEn",
};
</script>
