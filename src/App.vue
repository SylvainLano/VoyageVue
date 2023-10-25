<template> 
  <transition name="slide-fade">
  <div class="absolute left-0 h-screen w-80 bg-slate-50 p-4 z-20" v-if="showElement">
    <div class="font-mono text-4xl text-slate-900 text-left">
      {{ currentDestination.location }}
      <div class="inline text-red-600" v-if="showEmptyStar" @click="starToggle">
        <font-awesome-icon :icon="['far', 'star']" :bounce="isBeating" :transform="'shrink-'+starShrink" />
      </div>
      <div class="inline text-emerald-400" v-else @click="starToggle">
        <font-awesome-icon :icon="['fas', 'star']" :spin="isBeating" :transform="'shrink-'+starShrink" />
      </div>
    </div>
    <div class="font-mono text-2xl text-slate-700 text-right">
      {{ currentDestination.country }}
    </div>
    <div class="font-mono text-xs text-slate-700 text-justify my-5">
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
    <div :class="budgetColorClass">
      <font-awesome-icon :icon="['fas', 'money-check-dollar']" size="lg" />
      {{ currentDestination.budget }} Cost - {{ currencyData.code }}
    </div>
    <div class="font-mono text-xs text-slate-700 text-center italic">
      $10 is worth {{ currencyData.equivalentInCurrency }} {{ currencyData.name }}<br />
    </div>
    <div class="font-mono text-xs text-slate-700 text-center mb-5 italic">
      <span class="text-amber-700">Eat for ${{ currentDestination.eat }}</span>
      -
      <span class="text-amber-700">Sleep for ${{ currentDestination.bed }}</span>
    </div>
    <div class="font-mono text-sm text-slate-700 text-center mt-5">
      <span  :class="languageColorClass">
        <font-awesome-icon :icon="['fas', 'language']" size="lg" />
        {{ currentDestination.language }}
      </span>
    </div>
    <div class="font-mono text-xs text-amber-700 text-center mb-5 italic" v-if="currentDestination.language.toLowerCase() !== 'english'">
      English is spoken {{ currentDestination.englishFriendly }}
    </div>
    <div :class="transportationColorClass">
        <font-awesome-icon :icon="['fas', 'plane']" size="lg" />
        {{ currentDestination.reach }}
    </div>
    <div class="font-mono text-xs text-slate-700 text-center mb-5 italic">
      <span class="text-amber-700">{{ currentDestination.local }}</span>
    </div>
    <div class="font-mono text-sm text-green-700 text-center mt-5">
      Visit in {{ currentDestination.bestTime }} {{ currentDestination.bestTimeReason }}
    </div>
    <div class="font-mono text-xs text-amber-700 text-center mb-5 italic">
      {{ currentDestination.temperatureMin }} to {{ currentDestination.temperatureMax }}
    </div>
    <div class="font-mono text-center mt-9">
      <button class="py-2 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="nextDestination">Next Destination</button>
    </div>
  </div>
  </transition>
  <transition name="slide-fade">
    <div class="absolute left-0 top-16 h-screen w-80 bg-slate-50 p-4 z-30" v-if="goThere">
      <div class="font-mono text-center mt-6">
        <button class="py-2 px-3 bg-green-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="visitExpediaLink">
          <font-awesome-icon :icon="['fas', 'plane']" size="lg" />
          Show me on Expedia
        </button>
      </div>
      <div class="font-mono text-center mt-6">
        <button class="py-2 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="closeReservation">Back</button>
      </div>
    </div>
  </transition>
  <div class="absolute left-0 h-screen w-80 bg-slate-50 z-10"></div>
  <transition name="slide-fade">
  <div class="absolute left-40 h-screen w-screen bg-slate-50" v-if="showElement">
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
  </transition>
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
    },
    isBeating: false,
    starShrink: 1,
    showEmptyStar: true,
    showElement: true,
    goThere: false,
  }),
  mounted() {
    setInterval(() => {
      this.isBeating = true; // Start animation
      setTimeout(() => {
        this.isBeating = false; // Stop animation after 2 seconds
      }, 2000);
    }, 10000); // Repeat every 10 seconds
  },
  computed: {
    currentDestination() {
      return this.destinationData[this.currentDestinationIndex];
    },
    budgetColorClass() {
      // Determine the class based on the budget value
      if (this.currentDestination.budget.toLowerCase() === "low") {
        return 'text-green-700 text-base font-mono mt-5 text-center';
      } else if (this.currentDestination.budget.toLowerCase() === "high") {
        return 'text-red-700 text-base font-mono mt-5 text-center';
      } else {
        return 'text-cyan-700 text-base font-mono mt-5 text-center';
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
        return 'text-red-700 text-base font-mono text-center mt-5';
      } else if (this.currentDestination.transportation.toLowerCase() === "easy") {
        return 'text-green-700 text-base font-mono text-center mt-5';
      } else {
        return 'text-cyan-700 text-base font-mono text-center mt-5';
      }
    },
  },
  methods: {
    nextDestination() {
      this.showElement = !this.showElement;
      this.goThere = false;
      // Wait for 0.5 seconds (500 milliseconds) before continuing
      setTimeout(() => {
        // Toggle showElement again
        this.showElement = !this.showElement;

        // Perform other actions
        this.currentDestinationIndex = (this.currentDestinationIndex + 1) % this.destinationData.length;
        this.updateCurrencyData(this.currentDestination.currency);
      }, 500); // 500 milliseconds delay
    },    
    closeReservation() {
      this.goThere = false;
    },  
    visitExpediaLink() {
      // Redirect to the external website when the button is clicked
      window.open(this.currentDestination.expediaLink, "_blank");
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
    starToggle() {
      // Increase starShrink from 1 to 16
      if (this.showEmptyStar === true){
        this.goThere = true;
      }
      let sizeIncreaseInterval = setInterval(() => {
        this.starShrink += 4;
        if (this.starShrink >= 16) {
          // Toggle showEmptyStar when size reaches the maximum
          this.showEmptyStar = !this.showEmptyStar;
          // Decrease starSize from 30 back to 1
          let sizeDecreaseInterval = setInterval(() => {
            this.starShrink -= 4;
            if (this.starShrink <= 1) {
              clearInterval(sizeDecreaseInterval);
            }
          }, 50); // Decrease size every 50 milliseconds
          clearInterval(sizeIncreaseInterval);
        }
      }, 50); // Increase size every 50 milliseconds   
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

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(400px);
  opacity: 0;
}
</style>
