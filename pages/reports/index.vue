<template>
  <v-expansion-panels v-model="filterPanel">
    <v-expansion-panel>
      <v-expansion-panel-header color="teal lighten-1" class="white--text">{{ $t("filter") }}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-row>
          <v-col cols="8" :md="12" :sm="12" :lg="4">
            <v-select
              :label="$t('reports_type')"
              v-model="typesFilter"
              :items="typesList"
              clearable
              deletable-chips
              item-text="name"
              item-value="id"
              @change="get_dates()">

            </v-select>
          </v-col>
          <v-col cols="8" :md="12" :sm="12" :lg="4">
            <v-autocomplete
              :label="$t('reports_date')"
              v-model="datesFilter"
              :items="datesList"
              item-text="name"
              item-value="id"
              clearable
              deletable-chips
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="8" :md="12" :sm="12" :lg="4">
            <v-btn @click="fetchReport" class="mt-5" small color="primary">{{
                $t("Ok")
              }}
            </v-btn>
            <v-btn @click="resetFilter" class="mt-5" small color="primary">{{
                $t("reset_filter")
              }}
            </v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-dialog
      v-model="dialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          {{ $t("Please_stand_by") }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div class="row">
      <div class="col-sm-10">
        <v-card class="mt-5">

          <h3 class="teal--text mb-3 mt-5 ml-5">
            {{
              $t("market_reports")
            }}
          </h3>

          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              :label="$t('search')"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="reportsItems"
            :search="search"
          >

            <template v-slot:item.type="{ item }">
              {{ get_text(item.type) }}
            </template>
            <template v-slot:item.publication_date="{ item }">
              <span>{{ formatDate(item.publication_date) }}</span>
            </template>
            <template v-slot:item.file_name="{ item }">
              <v-btn
                color="#fff"
                rounded
                solo
                small
                class="ma-1"
                style="text-transform: none;"
                download="download"
                @click="download_file(item.file_name,item.publication_date)"
              >
                {{ $t('view_report') }}
                <v-icon right dark>
                  mdi-eye-arrow-right
                </v-icon>

              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </div>
      <div class="col-sm-2">
        <img src="/wfp.jpeg" alt="WFP" class="wfp-logo mt-5" />
      </div>
    </div>
  </v-expansion-panels>


</template>
<script>
export default {
  data() {
    return {
      search: '',
      dialog: false,
      datesList: [],
      typesFilter: '',
      datesFilter: '',
      reportsItems: [],
      typesList: [
        {
          id: 1,
          name: this.$i18n.t('Weekly'),
        },
        {
          id: 2,
          name: this.$i18n.t('Monthly'),
        },
        {
          id: 3,
          name: this.$i18n.t('Quarterly'),
        },
      ],
      headers: [
        {
          text: this.$i18n.t('reports_type'),
          align: 'start',
          value: 'type',
        },
        {text: this.$i18n.t('reports_title'), value: 'title'},
        {text: this.$i18n.t('reports_date'), value: 'publication_date'},
        {text: this.$i18n.t(''), value: 'file_name', sortable: false},

      ],
    }
  },
  created() {
    this.fetchReport()
  },
  methods: {
    formatDate(dateString) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', options).replace(/\//g, '.');
    },
    async get_dates() {
      this.datesFilter = '';
      try {
        let response = await this.$axios.get(`/v1/reports/list/dates/` + this.typesFilter + '/' + this.$i18n.locale);
        if (response.status == 200) {
          let dates = []
          Object.values(response.data.data).forEach((entry) => {
            dates.push({
              name: new Date(entry.name).toLocaleDateString(),
              id: entry.id,
            });
          });
          this.datesList = dates
          console.log(this.datesList)
        }
      } catch (err) {
        console.log(err)
      }
    },
    async fetchReport() {
      this.reportsItems = [];
      try {
        let params = {
          type: this.typesFilter,
          date: this.datesFilter
        }
        let response = await this.$axios.get(`/v1/reports/1/` + this.$i18n.locale,
          {
            params: params
          }
        );
        if (response.status == 200) {
          this.reportsItems = response.data.data
        }
      } catch (err) {
        console.log(err)
      }
    },
    get_text(id) {
      let name = ""
      this.typesList.forEach(element => {
        if (element.id == id) name = element.name;
      });
      return name;
    },
    resetFilter() {
      this.typesFilter = ''
      this.datesFilter = ''
      this.fetchReport()
    },
    async download_file(name, publicDate) {
      this.dialog = true
      try {
        let response = await this.$axios.get(`v1/download/reports/` + name, {
          responseType: 'blob'
        });
        if (response.status == 200) {

          const url = window.URL.createObjectURL(new Blob([response.data],
            {
              type: response.headers['content-type']
            }
          ));
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          // link.setAttribute('download', publicDate+'.pdf');
          document.body.appendChild(link);

          link.click();
        }
      } catch (err) {
        this.snackbar = true;
        this.snackbarText = err;
        this.snackbarColor = "red";
        this.dialog = false;
        console.log(err)
      }
      this.dialog = false
    },
  }
}
</script>
