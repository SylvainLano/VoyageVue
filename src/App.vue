<template>
<div class="h-screen w-screen" ref="parentContainer">
  <div class="absolute left-0 top-0 h-[756px] w-80 origin-top-left z-20" :style="{ transform: `scale(${scaleFactor})` }" v-if="!mobileDisplay">
    <transition name="slide-fade">
    <div class="relative left-0 top-0 h-[756px] w-80 bg-slate-50 p-4" v-if="showElement">
      <div class="font-mono text-4xl text-slate-900 text-left flex justify-between">
        <div class="mx-3 cursor-pointer" @click="toggleReservationMenu">
          {{ currentDestination.location }}
        </div>
        <div class="text-slate-900 cursor-pointer" v-if="!isStarred(currentDestination.id) && !isBanned(currentDestination.id)" @click="starToggle" title="Add this destination to your favorites!">
          <font-awesome-icon :icon="['far', 'star']" :bounce="isBeating" :transform="'shrink-'+starShrink" />
        </div>
        <div class="text-emerald-400 cursor-pointer" v-else-if="!isBanned(currentDestination.id)" @click="starToggle" title="Remove this destination from your favorites.">
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
      <div class="font-mono text-sm text-slate-700 text-center">
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
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <div class="font-mono text-center mt-9">
          <button class="py-2 px-3 bg-indigo-300 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="previousDestination" v-if="breadCrumbs.length !== 0">Previous</button>
          <button class="py-2 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="nextDestination">Next Destination</button>
        </div>    
        <div class="text-slate-500 cursor-pointer text-xl" v-if="!isStarred(currentDestination.id) && !isBanned(currentDestination.id)" @click="banToggle" title="Never show this destination anymore.">
          <font-awesome-icon :icon="['far', 'circle-xmark']" :transform="'shrink-'+banShrink" />
        </div>
        <div class="text-red-600 cursor-pointer text-xl" v-else-if="!isStarred(currentDestination.id)" @click="banToggle" title="Bring this destination back on tracks!">
          <font-awesome-icon :icon="['fas', 'circle-xmark']" :bounce="isBeating" :transform="'shrink-'+banShrink" />
        </div>
      </div>
    </div>
    </transition>
  </div>
  <div class="absolute w-80 origin-top-left z-30" :style="{ top: `${topValue}px`, transform: `scale(${scaleFactor})` }" v-if="!mobileDisplay"></div>
  <transition name="slide-fade">
    <div class="absolute left-0 h-[666px] w-80 bg-slate-50 p-4 z-30" :style="{ top: `${topValue}px` }" v-if="goThere">
      <div :class="visaColorClass">
          <font-awesome-icon :icon="['fas', 'passport']" size="lg" />
          {{ currentDestination.visa }}
      </div>
      <div :class="safetyColorClass">
          <font-awesome-icon :icon="['fas', 'people-robbery']" size="lg" />
          {{ currentDestination.safety }} Place
      </div>
      <div :class="healthcareColorClass">
          <font-awesome-icon :icon="['fas', 'hospital']" size="lg" />
          {{ currentDestination.healthcare }} Healthcare
      </div>
      <div class="font-mono text-xs text-slate-700 text-justify my-5">
          <font-awesome-icon :icon="['fas', 'bowl-food']" size="lg" /> You need to try :<br />
          <span class="italic text-amber-700">{{ currentDestination.foodToTry }}</span>
      </div>
      <div class="font-mono text-xs text-slate-700 text-justify my-5">
          <font-awesome-icon :icon="['fas', 'user-plus']" size="lg" /> Before you go :<br />
          <span class="italic text-amber-700">{{ currentDestination.advice }}</span>
      </div>
      <div class="font-mono text-center mt-6">
        <button class="py-2 px-3 bg-green-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="visitExpediaLink">
          <font-awesome-icon :icon="['fas', 'plane']" size="lg" />
          Show me on Expedia
        </button>
      </div>
      <div class="font-mono text-center mt-6">
        <button class="py-2 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none" @click="toggleReservationMenu">Go Back</button>
      </div>
    </div>
  </transition>
  <div class="absolute left-0 h-screen bg-slate-50 z-10" :style="{ width:`${leftValue}px` }" v-if="!mobileDisplay"></div>
  <transition name="slide-fade">
  <div class="absolute bg-slate-50" :style="{ left: `${leftValueSlides}px`, top: `${topValueSlides}px`, height: `${heightSlidesSize}px`, width: `${widthSlidesSize}px` }" v-if="showElement">
    <vueper-slides
      ref="myVueperSlides"
      :autoplay="true"
      duration = 7500
      :arrows="false"
      :bullets="false"
      :slideRatio="0.6"
      :pause-on-hover="pauseOnHover"
      @autoplay-pause="internalAutoPlaying = false"
      @autoplay-resume="internalAutoPlaying = true">
      <vueper-slide
          v-for="(slide, i) in currentDestination.images"
          :key="i"
          :image="require(`@/assets/images/${slide.image}`)"
      >
        <template #content>
          <div class="absolute z-10 text-left" :style="{ top: `${topValueTitle}px`, left: `${leftValueTitle}px`, transform: `scale(${scaleFactor})` }">
            <div class="h-12 font-mono text-4xl backdrop-brightness-50 text-slate-50 p-2">
              {{ slide.title }}
            </div>
            <div class="h-8 font-mono text-xl backdrop-brightness-50 text-slate-50 px-2">
              by <a target="_blank" class="text-pink-400" :href="slide.link">{{ slide.author }}</a>
            </div>
          </div>
        </template>
      </vueper-slide> 
      <template #pause>
        <i class="icon pause_circle_outline"></i>
      </template>
    </vueper-slides> 
  </div> 
  </transition>
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
    starredDestinationData: [],
    bannedDestinationData: [],
    currentDestination: [],
    currencyData: {
      code: '',
      name: '',
      equivalentInCurrency: 0,
    },
    isBeating: false,
    starShrink: 1,
    banShrink: 1,
    showElement: true,
    goThere: false,
    starredDestinationsStorage: [],
    bannedDestinationsStorage: [],
    breadCrumbs: [],
    noMoreUnseenDestination: false,
    scaleFactor: 1,
    heightSlidesSize: 756,
    widthSlidesSize: 1512,
    leftValueSlides: 320,
    topValueSlides: 0,
    leftValueTitle: 320,
    topValueTitle: 90,
    ratioSlides: 0.6,
    screenRatio: 0.5,
    mobileDisplay: false,
    topValue: 90,
    leftValue: 320,
  }),
  mounted() {
    setInterval(() => {
      this.isBeating = true; // Start animation
      setTimeout(() => {
        this.isBeating = false; // Stop animation after 2 seconds
      }, 2000);
    }, 10000); // Repeat every 10 seconds
    this.updateScaleFactor(); // Initial calculation
    window.addEventListener('resize', this.updateScaleFactor);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateScaleFactor); // Remove event listener
  },
  computed: {
    budgetColorClass() {
      // Determine the class based on the budget value
      if (this.currentDestination.budget.toLowerCase() === "low") {
        return 'text-green-700 text-base font-mono mt-5 text-center';
      } else if (this.currentDestination.budget.toLowerCase() === "high") {
        return 'text-red-700 text-base font-mono mt-5 text-center';
      } else if (this.currentDestination.budget.toLowerCase() === "very high") {
        return 'text-rose-700 text-base font-mono mt-5 text-center';
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
    visaColorClass() {
      // Determine the class based on the language spoken
      if (this.currentDestination.visa.toLowerCase().includes("free")) {
        return 'font-mono text-sm text-green-700 text-base text-center my-5';
      } else {
        return 'font-mono text-sm text-red-700 text-base text-center my-5';
      }
    },
    healthcareColorClass() {
      // Determine the class based on the language spoken
      if (this.currentDestination.healthcare.toLowerCase().includes("good")) {
        return 'font-mono text-sm text-green-700 text-base text-center my-5';
      } else {
        return 'font-mono text-sm text-red-700 text-base text-center my-5';
      }
    },
    safetyColorClass() {
      // Determine the class based on the language spoken
      if (this.currentDestination.safety.toLowerCase().includes("safe")) {
        return 'font-mono text-sm text-green-700 text-base text-center my-5';
      } else {
        return 'font-mono text-sm text-red-700 text-base text-center my-5';
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
      if ( this.currentDestination.id != null ) {
        this.breadCrumbs.push(this.currentDestination.id);
      }
      this.showElement = !this.showElement;
      this.goThere = false;
      // Wait for 0.5 seconds (500 milliseconds) before continuing
      setTimeout(() => {
        // Toggle showElement again
        this.showElement = !this.showElement;

        // Filter destinationData to remove visited destinations
        const newDestinations = this.destinationData.filter(destination => !this.breadCrumbs.includes(destination.id));
        if (newDestinations.length > 0) {
          const index = Math.floor(Math.random() * newDestinations.length);
          this.currentDestination = newDestinations[index];
        } else if ( this.starredDestinationData.length > 0) {
          const index = Math.floor(Math.random() * this.starredDestinationData.length);
          this.currentDestination = this.starredDestinationData[index];
          this.noMoreUnseenDestination = true;       
        } else if ( this.bannedDestinationData.length > 0) {
          const index = Math.floor(Math.random() * this.bannedDestinationData.length);
          this.currentDestination = this.bannedDestinationData[index];
          this.noMoreUnseenDestination = true;                  
        } else {
          const index = Math.floor(Math.random() * this.destinationData.length);
          this.currentDestination = this.destinationData[index];
          this.noMoreUnseenDestination = true;
        }
        this.updateCurrencyData(this.currentDestination.currency);
      }, 500); // 500 milliseconds delay
    },
    previousDestination() {
      if (this.breadCrumbs.length > 0) {
        this.showElement = !this.showElement;
        this.goThere = false;
        // Wait for 0.5 seconds (500 milliseconds) before continuing
        setTimeout(() => {
          // Toggle showElement again
          this.showElement = !this.showElement;
          // Get the ID of the previous destination
          const previousDestinationId = this.breadCrumbs.pop();

          // Check if it's starred
          const isStarred = this.starredDestinationsStorage.includes(previousDestinationId);

          // Check if it's banned
          const isBanned = this.bannedDestinationsStorage.includes(previousDestinationId);

          let previousDestination = null;

          if (isStarred) {
            previousDestination = this.starredDestinationData.find(destination => destination.id === previousDestinationId);
          } else if (isBanned) {
            previousDestination = this.bannedDestinationData.find(destination => destination.id === previousDestinationId);
          } else {
            previousDestination = this.destinationData.find(destination => destination.id === previousDestinationId);
          }

          if (previousDestination) {
            // Set the previous destination as the current destination
            this.currentDestination = previousDestination;
          }
          this.updateCurrencyData(this.currentDestination.currency);
        }, 500); // 500 milliseconds delay
      }
    },
    toggleReservationMenu() {
      this.goThere = !this.goThere;
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
      let sizeIncreaseInterval = setInterval(() => {
        this.starShrink += 4;
        if (this.starShrink >= 16) {
          if (this.isStarred(this.currentDestination.id)) {
            // Unstar the destination
            this.starredDestinationsStorage = this.starredDestinationsStorage.filter(id => id !== this.currentDestination.id);
            this.moveItem(this.currentDestination, this.starredDestinationData, this.destinationData);
            this.goThere = false;
          } else {
            // Star the destination
            this.starredDestinationsStorage.push(this.currentDestination.id);
            this.moveItem(this.currentDestination, this.destinationData, this.starredDestinationData);
            this.goThere = true;
          }          
          // Update the local storage with the updated starred destinations
          localStorage.setItem('starredDestinations', JSON.stringify(this.starredDestinationsStorage));
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
    isStarred(destinationId) {
      return this.starredDestinationsStorage.includes(destinationId);
    },      
    banToggle() {
      // Increase banShrink from 1 to 16
      let sizeIncreaseInterval = setInterval(() => {
        this.banShrink += 4;
        if (this.banShrink >= 16) {
          if (this.isBanned(this.currentDestination.id)) {
            // Unban the destination
            this.bannedDestinationsStorage = this.bannedDestinationsStorage.filter(id => id !== this.currentDestination.id);
            this.moveItem(this.currentDestination, this.bannedDestinationData, this.destinationData);
          } else {
            // Ban the destination
            this.bannedDestinationsStorage.push(this.currentDestination.id);
            this.moveItem(this.currentDestination, this.destinationData, this.bannedDestinationData);
          }          
          // Update the local storage with the updated starred destinations
          localStorage.setItem('bannedDestinations', JSON.stringify(this.bannedDestinationsStorage));
          // Decrease starSize from 30 back to 1
          let sizeDecreaseInterval = setInterval(() => {
            this.banShrink -= 4;
            if (this.banShrink <= 1) {
              clearInterval(sizeDecreaseInterval);
            }
          }, 50); // Decrease size every 50 milliseconds
          clearInterval(sizeIncreaseInterval);
        }
      }, 50); // Increase size every 50 milliseconds   
    },    
    isBanned(destinationId) {
      return this.bannedDestinationsStorage.includes(destinationId);
    },    
    // Move an item from one list to another
    moveItem(item, sourceList, destinationList) {
      // Find the index of the item in the source list
      const index = sourceList.indexOf(item);

      // If the item is found in the source list, move it
      if (index !== -1) {
        // Remove the item from the source list
        sourceList.splice(index, 1);

        // Add the item to the destination list
        destinationList.push(item);
      }
    },
    updateScaleFactor() {
      // Calculate the scale factor based on the parent's height
      const parentContainer = this.$refs.parentContainer;
      const heightSize = parentContainer.getBoundingClientRect().height;
      const widthSize = parentContainer.getBoundingClientRect().width;
      this.screenRatio = heightSize / widthSize;
      if ( this.screenRatio > 1.2 ) {
        this.mobileDisplay = true;
        this.topValue = 90 * this.scaleFactor;
        this.leftValue = 0;
      } else {
        this.mobileDisplay = false;
        this.scaleFactor = heightSize / 756;
        // Calculate the new top value based on scaleFactor
        this.topValue = 90 * this.scaleFactor;
        this.leftValue = 320 * this.scaleFactor;
      }
      if ( heightSize / (widthSize - this.leftValue) > this.ratioSlides ) {
        this.heightSlidesSize = heightSize;
        this.widthSlidesSize = heightSize / this.ratioSlides;
        this.topValueSlides = 0;
        this.leftValueSlides = ( this.leftValue - this.widthSlidesSize + widthSize ) / 2;
      } else {
        this.widthSlidesSize = (widthSize - this.leftValue);
        this.heightSlidesSize = this.widthSlidesSize * this.ratioSlides;
        this.topValueSlides = ( heightSize - this.heightSlidesSize ) / 2;
        this.leftValueSlides = this.leftValue;
      }
      this.leftValueTitle = this.leftValue - this.leftValueSlides;
      this.topValueTitle = this.topValue - this.topValueSlides;
    },
  },
  created() {
    // Load starred destinations from local storage
    const storedStarredDestinations = localStorage.getItem('starredDestinations');
    if (storedStarredDestinations) {
      this.starredDestinationsStorage = JSON.parse(storedStarredDestinations);
    }
    // Move starred destinations from destinationData to starredDestinationData
    this.starredDestinationsStorage.forEach(starredId => {
      const destination = this.destinationData.find(dest => dest.id === starredId);
      if (destination) {
        // Move the destination from destinationData to starredDestinationData
        this.moveItem(destination, this.destinationData, this.starredDestinationData);
      }
    });
    // Load banned destinations from local storage
    const storedBannedDestinations = localStorage.getItem('bannedDestinations');
    if (storedBannedDestinations) {
      this.bannedDestinationsStorage = JSON.parse(storedBannedDestinations);
    }
    // Move starred destinations from destinationData to bannedDestinationData
    this.bannedDestinationsStorage.forEach(starredId => {
      const destination = this.destinationData.find(dest => dest.id === starredId);
      if (destination) {
        // Move the destination from destinationData to bannedDestinationData
        this.moveItem(destination, this.destinationData, this.bannedDestinationData);
      }
    });
    this.nextDestination();
  }, 
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
