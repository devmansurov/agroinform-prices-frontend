<template>
    <div class="example">
        <apexcharts
            height="500"
            type="line"
            :options="chartOptions"
            :series="chartSeries"
        ></apexcharts>
    </div>
</template>

<script>
import VueApexCharts from "vue-apexcharts";

export default {
    name: "Chart",
    props: {
        chartOptions: {
            required: true,
        },
        chartSeries: {
            required: true,
        }
    },
    components: {
        apexcharts: VueApexCharts,
    }
};
</script>
