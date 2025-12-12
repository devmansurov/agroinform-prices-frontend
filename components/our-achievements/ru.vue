<template>
    <v-row>
        <v-col>
            <h1 class="center">Наши достижения</h1>
            <p>Платформа AgroSpace предлагает пользователям:</p>
                <p>18 различных <a class="underlined" href="https://apps.agroinform.asia" target="_blank">мобильных приложений</a> для производства и продажи сельскохозяйственной продукции, и для проведения дистанционного консультирования на двух – четырех языках (английский, кыргызский, русский и таджикский). Более 170 000 загрузок, около 15% активные пользователи.</p>
                <p>Более 600 электронных материалов в <a class="underlined" href="https://kitob.agroinform.asia" target="_blank">электронной библиотеке</a>, имеющих отношение к развитию сельского хозяйства, экономики и местности в Центральной Азии, с возможностями добавления бес/платных материалов, поиска и загрузки. Более 360 000 скачиваний материалов.</p>
                <p>Электронная <a class="underlined" href="https://trade.agroinform.asia" target="_blank">доска объявлений</a> для продажи и покупки 14 видов сельскохозяйственных продуктов с возможностью размещения объявления с фотографиями продукции с смартфона. Более 3 000 пользователей в месяц.</p>
                <p><a class="underlined" href="https://maps.agroinform.asia" target="_blank">Электронные карты</a> с информацией о производстве 35 видов сельскохозяйственной продукции на уровне районов с 2012 года, месте нахождения перерабатывающих компаний, хранилищ, теплиц, агро-магазинов и др. для принятия правильных решения для инвестирования, планирования производства и переработки продукции, организации эффективного сбора урожая. Более 500 специалистов из разных стран ежемесячно пользуются инструментом для решения своих задач.</p>
                <p><a href="https://apps.agroinform.asia/dc/index.html" target="_blank">Система дистанционного консультирования</a> позволяет специалистам по обучению, консультантам и бизнесу находить друг друга посредством мобильного приложения в ОС Android, в котором предусмотрена возможность простой регистрации пользователя, создание профайла, проведение оценки консультанта и специалиста по обучению. Ведутся работы по интеграции в инструмент модулей видеоконференции и оплаты.</p>
                <p><a class="underlined" href="https://www.youtube.com/c/agroinformtj" target="_blank">Видео канал в YouTube</a> c учебными и информационными видеоматериалами для увеличения урожайности, предотвращения болезней и борьбы с вредителями. Более 125 000 просмотров и более 1 500 подписчиков.</p>
                <p>Другие инструменты – <a class="underlined" href="https://prices.agroinform.asia" target="_blank">розничные рыночные цены</a> на сельскохозяйственную продукцию в городах Таджикистана (еженедельно) и Кыргызстана (ежемесячно); <a class="underlined" href="https://calculators.agroinform.asia" target="_blank">калькуляторы</a> для расчета количества семян, воды для полива и удобрений. Более 3 000 пользователей этих инструментов в год.</p>
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
                '../certificates/hilfswerl_gramota.jpg'
            ]
        }
    },
    created() {},
    name: "ourAchievementsRu",
};
</script>