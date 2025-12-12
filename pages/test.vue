<template>
    <div>
        <v-row>
            <v-col cols="12">
                <h1>Apex Charts</h1>
                <my-chart :chartOptions="chartOptions" :chartSeries="chartSeries"></my-chart>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import MyChart from "~/components/MyChart.vue";
export default {
    data() {
        return {
            chartSeries: [
                {
                    name: "High - 2013",
                    data: [28, 29, 33, 36, 32, 32, 33],
                },
                {
                    name: "Low - 2013",
                    data: [12, 11, 14, 18, 17, 13, 13],
                },
            ],
            chartOptions: {
                chart: {
                    dropShadow: {
                        enabled: true,
                        color: "#000",
                        top: 18,
                        left: 7,
                        blur: 10,
                        opacity: 0.2,
                    },
                },
                colors: ["#77B6EA", "#545454"],
                dataLabels: {
                    enabled: true,
                },
                stroke: {
                    curve: "smooth",
                },
                title: {
                    text: "Average High & Low Temperature",
                    align: "left",
                },
                grid: {
                    borderColor: "#e7e7e7",
                    row: {
                        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                        opacity: 0.5,
                    },
                },
                markers: {
                    size: 1,
                },
                xaxis: {
                    categories: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                    ],
                    title: {
                        text: "Month",
                    },
                },
                yaxis: {
                    title: {
                        text: "Temperature",
                    },
                    min: 5,
                    max: 40,
                },
                legend: {
                    position: "top",
                    horizontalAlign: "right",
                    floating: true,
                    offsetY: -25,
                    offsetX: -5,
                },
            },
        };
    },
    name: "test",
    components: { MyChart },
};
</script>