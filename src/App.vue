<template> 
  <div class="absolute left-0 h-screen w-80 bg-slate-50 p-4 z-10">
    <div class="font-mono text-4xl text-slate-900 text-left">
      {{ currentDestination.location }}
    </div>
    <div class="font-mono text-2xl text-slate-700 text-right">
      {{ currentDestination.country }}
    </div>
    <div class="font-mono text-xs text-slate-700 text-justify my-3">
      {{ currentDestination.description }}
    </div>
    <div class="h-32 bg-slate-600">
      <l-map 
        ref="map"
        :zoom="currentDestination.zoom"
        :center="currentDestination.center"
        :useGlobalLeaflet="false"
        :options="{ zoomControl: false, attributionControl: false }"
      >
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></l-tile-layer>
        <l-marker :lat-lng="currentDestination.center"></l-marker>
      </l-map>
    </div> 
    <div class="font-mono text-sm text-slate-700 mt-3">
      Budget : <span :class="budgetColorClass">{{ currentDestination.budget }}</span>
    </div>
    <div class="font-mono text-xs text-slate-700 text-left">
      $10 is worth {{ currencyData.equivalentInCurrency }} {{ currencyData.name }}<br />
    </div>
    <div class="font-mono text-sm text-slate-700 text-center mb-3 italic">
      <span class="text-amber-700">Eat for ${{ currentDestination.eat }}</span>
      -
      <span class="text-amber-700">Sleep for ${{ currentDestination.bed }}</span>
    </div>
    <div class="font-mono text-sm text-slate-700 text-left mt-3">
      Spoken : <span  :class="languageColorClass">{{ currentDestination.language }}</span>
    </div>
    <div class="font-mono text-sm text-amber-700 text-center mb-3 italic" v-if="currentDestination.language.toLowerCase() !== 'english'">
      English is spoken {{ currentDestination.englishFriendly }}
    </div>
    <div class="font-mono text-sm text-slate-700 text-left mt-3">
      Reach : <span  :class="transportationColorClass">{{ currentDestination.reach }}</span>
    </div>
    <div class="font-mono text-sm text-slate-700 text-left mb-3">
      Move by : <span class="text-amber-700">{{ currentDestination.local }}</span>
    </div>
    <div class="font-mono text-sm text-slate-700 text-left mt-3">
      Best time to visit :
    </div>
    <div class="font-mono text-sm text-green-700 text-center italic">
      {{ currentDestination.bestTime }} {{ currentDestination.bestTimeReason }}
    </div>
    <div class="font-mono text-sm text-amber-700 text-center mb-3 italic">
      {{ currentDestination.temperatureMin }} to {{ currentDestination.temperatureMax }}
    </div>
    <div class="font-mono text-center mt-6">
      <button class="py-2 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="nextDestination">Next Destination</button>
    </div>
  </div>
  <div class="absolute left-40 h-screen w-screen bg-slate-50">
    <vueper-slides
      ref="myVueperSlides"
      :autoplay="true"
      duration = 5000
      :arrows="false"
      :bullets="false"
      :slideRatio="0.52"
      :pause-on-hover="pauseOnHover"
      @autoplay-pause="internalAutoPlaying = false"
      @autoplay-resume="internalAutoPlaying = true">
      <vueper-slide
          v-for="(slide, i) in currentDestination.images"
          :key="i"
          :image="require(`@/assets/images/${slide.image}`)"
      >
        <template #content>
          <div class="absolute left-60 top-20 h-50 font-mono text-4xl backdrop-brightness-50 text-slate-50 p-4 z-10 text-center">
            <span>{{ slide.title }}</span>
          </div>
        </template>
      </vueper-slide> 
      <template #pause>
        <i class="icon pause_circle_outline"></i>
      </template>
    </vueper-slides> 
  </div> 
</template>

<script>
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'
import '@/assets/css/tailwind.css';
import destinationData from '@/assets/destinations.json';
import axios from 'axios';
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet"

export default {
  name: 'App',
  components: {
    VueperSlides,
    VueperSlide,
    LMap,
    LTileLayer,
    LMarker
  },
  data: () => ({
    pauseOnHover: true,
    autoPlaying: true,
    internalAutoPlaying: true,
    destinationData: destinationData,
    currentDestinationIndex: 0,
    currencyData: {
      code: '',
      name: '',
      equivalentInCurrency: 0,
    }
  }),
  computed: {
    currentDestination() {
      return this.destinationData[this.currentDestinationIndex];
    },
    budgetColorClass() {
      // Determine the class based on the budget value
      if (this.currentDestination.budget === "Low") {
        return 'text-green-700 text-base';
      } else if (this.currentDestination.budget === "High") {
        return 'text-red-700 text-base';
      } else {
        return 'text-cyan-700 text-base';
      }
    },
    languageColorClass() {
      // Determine the class based on the language spoken
      if (this.currentDestination.language.toLowerCase() !== "english") {
        return 'text-red-700 text-base';
      } else {
        return 'text-green-700 text-base';
      }
    },
    transportationColorClass() {
      // Determine the class based on the language spoken
      if (this.currentDestination.transportation.toLowerCase() === "hard") {
        return 'text-red-700 text-base';
      } else if (this.currentDestination.transportation.toLowerCase() === "easy") {
        return 'text-green-700 text-base';
      } else {
        return 'text-cyan-700 text-base';
      }
    },
  },
  methods: {
    nextDestination() {
      this.currentDestinationIndex = (this.currentDestinationIndex + 1) % this.destinationData.length;
      this.updateCurrencyData(this.currentDestination.currency);
    },    
    updateCurrencyData(currencyCode) {
      // Fetch and update currency data using the selected currency code
      axios
        .get('https://www.floatrates.com/daily/usd.json')
        .then((response) => {
          const currencyData = response.data[currencyCode.toLowerCase()];
          if (currencyData) {
            this.currencyData.code = currencyData.code;
            this.currencyData.name = currencyData.name; // Update the currency name
            const amountInUSD = 10; // The base amount in USD
            const equivalentInCurrency = amountInUSD * currencyData.rate;
            this.currencyData.equivalentInCurrency = equivalentInCurrency.toFixed(2);
          } else {
            console.error('Currency data not found for', currencyCode);
          }
        })
        .catch((error) => {
          console.error('Error fetching currency data: ', error);
        });
    },
  },
  created() {
    // Fetch and parse the JSON data from your API
    axios
      .get('https://www.floatrates.com/daily/usd.json')
      .then((response) => {
          const currencyData = response.data[this.currentDestination.currency.toLowerCase()];
          if (currencyData) {
            this.currencyData.code = currencyData.code;
            this.currencyData.name = currencyData.name; // Update the currency name
            const amountInUSD = 10; // The base amount in USD
            const equivalentInCurrency = amountInUSD * currencyData.rate;
            this.currencyData.equivalentInCurrency = equivalentInCurrency.toFixed(2);
          } else {
            console.error('Currency data not found for', this.currentDestination.currency);
          }
        })
        .catch((error) => {
          console.error('Error fetching currency data: ', error);
        });
  }
}
</script>
