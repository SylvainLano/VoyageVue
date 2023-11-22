<!-- VoyageVue.vue -->

<template>
  <div class="h-screen w-screen"
    ref="parentContainer"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd">
    <div class="h-full w-full" v-if="currentDestination && Object.keys(currentDestination).length > 0">
  
    <div
      class="absolute flex top-5 right-5 z-40 origin-top-right"
      :style="{ transform: `scale(${scaleFactor})` }"
      v-if="!fullScreen && !showFullMap && (!showMenu || !mobileDisplay)"
      >
      <transition name="lateral-fade">
        <div class="text-4xl bg-lime-500 cursor-pointer rounded-full" @click="toggleWorldMap(false)">
          <span class="text-cyan-700"><font-awesome-icon :icon="['fas', 'earth-africa']" :shake="isBeating" size="xl" /></span>
        </div>
      </transition>
    </div>
    
    <SharingOptions
      :show-sharing-options="showSharingOptions"
      :shareURL="shareURL()"
      :current-destination="currentDestination"
      @close-sharing-options="toggleShareWindow"
    />

    <WorldMap
      ref="worldmapRef"
      :mobileDisplay="mobileDisplay"
      :showFullMap="showFullMap"
      :scaleFactor="scaleFactor"
      :centerOnCurrent="centerOnCurrent"
      :currentDestination="currentDestination"
      :starredDestinationData="starredDestinationData"
      :bannedDestinationData="bannedDestinationData"
      :destinationData="destinationData"
      :visitedDestinationsStorage="visitedDestinationsStorage"
      @closeWorldMap="toggleWorldMap"
      @nextDestination="nextDestination"
    />

    <div class="absolute origin-top-left z-20 top-0" :style="{ width: `${widthMenuSize}px`, transform: `scale(${scaleFactor})` }">
      <transition name="slide-fade">
        <div class="relative bg-slate-50 p-4" :style="{ height: `${heightMenuSize}px`}" v-if="(showMenu && !fullScreen)">
          <div class="font-mono text-4xl text-slate-900 text-left flex justify-between">
            <div class="mx-3 cursor-pointer" @click="toggleReservationMenu">
              {{ currentDestination.location }}
            </div>
            <div class="text-slate-900 cursor-pointer" v-if="!isStarred(currentDestination.id) && !isBanned(currentDestination.id)" @click="toggleStarFromMenu" title="Add this destination to your favorites!">
              <font-awesome-icon :icon="['far', 'star']" :bounce="isBeating" :transform="'shrink-'+starShrink" />
            </div>
            <div class="text-emerald-400 cursor-pointer" v-else-if="!isBanned(currentDestination.id)" @click="toggleStarFromMenu" title="Remove this destination from your favorites.">
              <font-awesome-icon :icon="['fas', 'star']" :spin="isBeating" :transform="'shrink-'+starShrink" />
            </div>
          </div>
          <div class="font-mono text-2xl text-slate-700 text-right align-center flex justify-between pl-2">
            <div class="flex">
              <div class="text-slate-500 destination-actions" v-if="!isStarred(currentDestination.id) && !isBanned(currentDestination.id)" @click="banToggle" title="Never show this destination anymore.">
                <font-awesome-icon :icon="['far', 'circle-xmark']" :transform="'shrink-'+banShrink" />
              </div>
              <div class="text-red-600 destination-actions" v-else-if="!isStarred(currentDestination.id)" @click="banToggle" title="Bring this destination back on tracks!">
                <font-awesome-icon :icon="['fas', 'circle-xmark']" :transform="'shrink-'+banShrink" />
              </div>
              <div class="text-slate-500 destination-actions" v-if="!isVisited(currentDestination.id)" @click="visitedToggle" title="You have visited this destination.">
                <font-awesome-icon :icon="['far', 'circle-check']" :transform="'shrink-'+visitedShrink" />
              </div>
              <div class="text-emerald-600 destination-actions" v-else-if="isVisited(currentDestination.id)" @click="visitedToggle" title="You never visited this destination.">
                <font-awesome-icon :icon="['fas', 'circle-check']" :transform="'shrink-'+visitedShrink" />
              </div>
              <div class="text-slate-500 destination-actions"  title="Share">
                <font-awesome-icon :icon="['fas', 'share-nodes']" @click="toggleShareWindow" />
              </div>
            </div>
            <div @click="toggleWorldMap(true)" class="cursor-pointer">
              <span :class="flagClass"></span>{{ currentDestination.country }}
            </div>
          </div>
          <div class="destination-description">
            {{ currentDestination.description }}
          </div>
          <div class="h-32 bg-slate-600">
            <l-map 
              ref="map"
              :zoom="currentDestination.zoom"
              :max-bounds="[currentDestination.center,currentDestination.center]"
              :worldCopyJump=true
              :center="currentDestination.center"
              :options="{ zoomControl: false, attributionControl: false }"
            >
              <l-tile-layer :url="getTileLayerUrl()"></l-tile-layer>
              <l-geo-json :geojson="getCurrentGeoJsonData()" :options-style="currentGeoJsonCountries"></l-geo-json>
              <l-marker :lat-lng="currentDestination.center" @click="toggleWorldMap(true)">
                <l-icon
                  :icon-url="require('@/assets/images/markers/marker-icon-pink.png')"
                  :icon-anchor="[25/2,41]"
                />
              </l-marker>
            </l-map>
          </div> 
          <div :class="budgetColorClass">
            <font-awesome-icon :icon="['fas', 'money-check-dollar']" size="lg" />
            {{ currentDestination.budget }} Cost - {{ currencyData.code }}
          </div>
          <div class="destination-details text-slate-700" v-if="currencyData.code != currencyData.name">
            $10 is worth {{ currencyData.equivalentInCurrency }} {{ currencyData.name }}<br />
          </div>
          <div class="destination-details text-amber-700 mb-5">
            Eat for ${{ currentDestination.eat }}
            -
            Sleep for ${{ currentDestination.bed }}
          </div>
          <div class="font-mono text-sm text-slate-700 text-center">
            <span  :class="languageColorClass">
              <font-awesome-icon :icon="['fas', 'language']" size="lg" />
              {{ currentDestination.language }}
            </span>
          </div>
          <div class="destination-details text-amber-700 mb-5" v-if="currentDestination.language.toLowerCase() !== 'english'">
            English is spoken {{ currentDestination.englishFriendly }}
          </div>
          <div :class="transportationColorClass">
              <font-awesome-icon :icon="['fas', 'plane']" size="lg" />
              {{ currentDestination.reach }}
          </div>
          <div class="destination-details text-amber-700 mb-5">
            {{ currentDestination.local }}
          </div>
          <div class="font-mono text-sm text-green-700 text-center mt-5">
            Visit in {{ currentDestination.bestTime }} {{ currentDestination.bestTimeReason }}
          </div>
          <div class="destination-details text-amber-700 mb-5">
            {{ currentDestination.temperatureMin }} to {{ currentDestination.temperatureMax }}
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-4 text-right">   
            <div class="font-mono text-center mt-5">
              <button class="custom-button bg-indigo-300"
              @click="previousDestination"
              title="Go back to the previous destination!"
              v-if="breadCrumbs.length !== 0">
                Previous
              </button>
              <button class="custom-button bg-indigo-500"
              @click="nextDestination"
              title="Discover a new destination!"
              v-if="!noMoreUnseenDestination">
                New Destination
              </button>
              <button class="custom-button bg-slate-600"
              @click="nextDestination"
              title="You've seen all destination, display a random one!"
              v-if="noMoreUnseenDestination">
                Random Destination
              </button>
            </div> 
          </div>
        </div>
      </transition>
    </div>
    
    <div class="absolute origin-top-left z-30" :style="{ width: `${widthMenuSize}px`, top: `${topValue}px`, transform: `scale(${scaleFactor})` }">
    <transition name="slide-fade">
      <div class="absolute left-0 h-[666px] bg-slate-50 p-4 z-30" v-if="(goThere && !fullScreen)">
        <div class="destination-profile" :class="visaColorClass">
            <font-awesome-icon :icon="['fas', 'passport']" size="lg" />
            {{ currentDestination.visa }}
        </div>
        <div class="destination-profile" :class="safetyColorClass">
            <font-awesome-icon :icon="['fas', 'people-robbery']" size="lg" />
            {{ currentDestination.safety }} Place
        </div>
        <div class="destination-profile" :class="healthcareColorClass">
            <font-awesome-icon :icon="['fas', 'hospital']" size="lg" />
            {{ currentDestination.healthcare }} Healthcare
        </div>
        <div class="destination-description">
            <font-awesome-icon :icon="['fas', 'bowl-food']" size="lg" /> You need to try :<br />
            <span class="italic text-amber-700">{{ currentDestination.foodToTry }}</span>
        </div>
        <div class="destination-description">
            <font-awesome-icon :icon="['fas', 'user-plus']" size="lg" /> Before you go :<br />
            <span class="italic text-amber-700">{{ currentDestination.advice }}</span>
        </div>
        <div class="font-mono text-center mt-6">
          <button class="custom-button bg-green-500" @click="visitExpediaLink">
            <font-awesome-icon :icon="['fas', 'plane']" size="lg" />
            Show me on Expedia
          </button>
        </div>
        <div class="font-mono text-center mt-6">
          <button class="custom-button bg-indigo-500" @click="toggleReservationMenu">Go Back</button>
        </div>
      </div>
    </transition>
    </div>

    <div class="absolute left-0 h-screen bg-slate-50 z-10" :style="{ width:`${leftValue}px` }" v-if="(!mobileDisplay && !fullScreen)"></div>

    <transition name="slide-fade">
      <div class="absolute left-0 bg-slate-50 z-20 bottom-0 p-2 origin-bottom-left" :style="{ width:`${widthMenuSize}px`, transform: `scale(${scaleFactor})` }" v-if="showCard">
        <div class="font-mono text-2xl text-slate-900 text-left flex justify-between">
          <div class="ml-2 cursor-pointer" @click="upSwipe">
            {{ currentDestination.location }}
            <span class="ml-2 font-mono text-lg text-slate-500 text-right">
              {{ currentDestination.country }}
            </span>
          </div>
          <div class="text-slate-900 cursor-pointer" v-if="!isStarred(currentDestination.id) && !isBanned(currentDestination.id)" @click="starToggle" title="Add this destination to your favorites!">
            <font-awesome-icon :icon="['far', 'star']" :bounce="isBeating" :transform="'shrink-'+starShrink" />
          </div>
          <div class="text-emerald-400 cursor-pointer" v-else-if="!isBanned(currentDestination.id)" @click="starToggle" title="Remove this destination from your favorites.">
            <font-awesome-icon :icon="['fas', 'star']" :spin="isBeating" :transform="'shrink-'+starShrink" />
          </div>
        </div>
      </div>
    </transition>

    <SlideShow
      ref="slideshowRef"
      :showSlides="showSlides"
      :scaleFactor="scaleFactor"
      :mobileDisplay="mobileDisplay"
      :heightSize="heightSize"
      :widthSize="widthSize"
      :leftValue="leftValue"
      :widthMenuSize="widthMenuSize"
      :startDrag="startDrag"
      :dragging="dragging"
      :endDrag="endDrag"
      :currentDestination="currentDestination"
      :fullScreenTitle="fullScreenTitle"
      :fullScreen="fullScreen"
    />

  </div>
  </div>
  </template>
  
  <script>
  import '@/assets/css/tailwind.css';
  import destinationData from '@/assets/destinations.json';
  import axios from 'axios';
  import "leaflet/dist/leaflet.css";
  import { LMap, LTileLayer, LMarker, LIcon, LGeoJson } from "@vue-leaflet/vue-leaflet";
  import "/node_modules/flag-icons/css/flag-icons.min.css";
  import SharingOptions from '@/components/SharingOptions.vue';
  import SlideShow from '@/components/SlideShow.vue';
  import WorldMap from '@/components/WorldMap.vue';
  
  export default {
    name: 'VoyageVue',
    components: {
      LMap,
      LTileLayer,
      LMarker,
      LIcon,
      LGeoJson,
      SharingOptions,
      SlideShow,
      WorldMap
    },
    props: ['landingCountry', 'landingLocation'],
    data: () => ({
      pauseOnHover: true,
      autoPlaying: true,
      internalAutoPlaying: true,
      allDestinationsData: destinationData,
      destinationData: [],
      starredDestinationData: [],
      bannedDestinationData: [],
      currentDestination: [],
      totalDestinations: 0,
      currencyData: {
        code: '',
        name: '',
        equivalentInCurrency: 0,
      },
      isBeating: false,
      starShrink: 1,
      banShrink: 1,
      visitedShrink: 1,
      showMenu: true,
      showCard: false,
      showSlides: true,
      showVisited: false,
      showVisitedMenu: false,
      goThere: false,
      starredDestinationsStorage: [],
      bannedDestinationsStorage: [],
      visitedDestinationsStorage: [],
      breadCrumbs: [],
      noMoreUnseenDestination: false,
      scaleFactor: 1,
      widthMenuSize: 320,
      heightMenuSize: 756,
      screenRatio: 0.5,
      mobileDisplay: false,
      topValue: 90,
      leftValue: 320,
      startX: 0,
      startY: 0,
      isDragging: false,
      minSwipeDistance: 100,
      swipeReady: true,
      swipeCooldown: 500,
      showFullMap: false,
      fullScreen: false,
      fullScreenNextCounter: 0,
      fullScreenTitle: true,
      currencyDataCache: null,
      baseURL: 'https://sylvainlano.github.io/VoyageVue/',
      showSharingOptions: false,
      centerOnCurrent: false,
      heightSize: 0,
      widthSize: 0,
    }),
    mounted() {
      setInterval(() => {
        this.isBeating = true; // Start animation
        setTimeout(() => {
          this.isBeating = false; // Stop animation after 2 seconds
        }, 2000);
        if ( this.fullScreen ) {
          this.fullScreenNextCounter += 1 ;
          if ( this.fullScreenNextCounter > this.currentDestination.images.length ) {
            this.nextDestination("fullScreen");
            this.fullScreenNextCounter = 0;
          }
        }
      }, 10000); // Repeat every 10 seconds
      this.updateScaleFactor(); // Initial calculation
      window.addEventListener('resize', this.updateScaleFactor);
      this.$el.addEventListener('wheel', this.onMouseWheel);
      document.addEventListener('keydown', this.handleKeyPress);
      document.title = "Voyage Vue : You're almost there!";
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.updateScaleFactor);
      this.$el.removeEventListener('wheel', this.onMouseWheel);
      document.removeEventListener('keydown', this.handleKeyPress);
    },
    computed: {
      budgetColorClass() {
        // Determine the class based on the budget value
        if ( this.currentDestination && this.currentDestination.budget ) {
          if (this.currentDestination.budget.toLowerCase() === "low" || this.currentDestination.budget.toLowerCase() === "cheap") {
            return 'text-green-700 text-base font-mono mt-5 text-center';
          } else if (this.currentDestination.budget.toLowerCase() === "high") {
            return 'text-red-700 text-base font-mono mt-5 text-center';
          } else if (this.currentDestination.budget.toLowerCase() === "very high") {
            return 'text-rose-700 text-base font-mono mt-5 text-center';
          }
        }
        return 'text-cyan-700 text-base font-mono mt-5 text-center';      
      },
      languageColorClass() {
        // Determine the class based on the language spoken      
        if ( this.currentDestination && this.currentDestination.language ) {
          if (this.currentDestination.language.toLowerCase() !== "english") {
            return 'text-red-700 text-base';
          }
        }
        return 'text-green-700 text-base';
      },
      visaColorClass() {
        // Determine the class based on the language spoken
        if ( this.currentDestination && this.currentDestination.visa ) {
          if (this.currentDestination.visa.toLowerCase().includes("free")) {
            return 'text-green-700';
          }
        }
        return 'text-red-700';
      },
      healthcareColorClass() {
        // Determine the class based on the language spoken
        if ( this.currentDestination && this.currentDestination.healthcare ) {
          if (this.currentDestination.healthcare.toLowerCase().includes("good") || this.currentDestination.healthcare.toLowerCase().includes("high")) {
            return 'text-green-700';
          }
        }
        return 'text-red-700';
      },
      safetyColorClass() {
        // Determine the class based on the language spoken
        if ( this.currentDestination && this.currentDestination.safety ) {
          if (this.currentDestination.safety.toLowerCase().includes("safe")) {
            return 'text-green-700';
          } else if (this.currentDestination.safety.toLowerCase().includes("average")) {
            return 'text-amber-700';
          }
        }
        return 'text-red-700';
      },
      transportationColorClass() {
        // Determine the class based on the language spoken
        if ( this.currentDestination && this.currentDestination.transportation ) {
          if (this.currentDestination.transportation.toLowerCase() === "hard") {
            return 'text-red-700 text-base font-mono text-center mt-5';
          } else if (this.currentDestination.transportation.toLowerCase() === "easy") {
            return 'text-green-700 text-base font-mono text-center mt-5';
          }
        }
        return 'text-cyan-700 text-base font-mono text-center mt-5';
      },
      flagClass() {
        // Determine the class based on the language spoken
        if ( this.currentDestination && this.currentDestination.id ) {
          // Split the string by hyphen and take the first part
          const parts = this.currentDestination.id.split('-');
          const countryCode = parts.slice(0, -1).join('-'); // Join all parts except the last one with a hyphen
          return 'fi fi-' + countryCode + ' text-xl mx-3';
        }
        return 'fi text-xl mx-3';
      },
    },
    methods: {
      nextDestination(index = null) {
        if ( this.currentDestination.id != null && this.currentDestination.id != index && index !== "previous" ) {
          this.breadCrumbs.push(this.currentDestination.id);
        }
        if (index === "previous") {
          index = this.breadCrumbs.pop();
        }
  
        this.showMenu = this.showSlides = this.showCard = this.showFullMap = this.goThere = false;
        this.fullScreenNextCounter = 0;
        // Wait for 0.3 seconds (300 milliseconds) before continuing
        setTimeout(() => {
          // Toggle elements again
          this.showSlides = true;
          if (!this.mobileDisplay) {
            this.showMenu = true;
          } else {
            this.showCard = true;
          }
  
          if ( index === "fullScreen" ) {
  
            const lastBreadCrumbId = this.breadCrumbs.length > 0 ? this.breadCrumbs[this.breadCrumbs.length - 1].id : null;
            const destinationsIdsToRemove = [this.currentDestination.id, lastBreadCrumbId];
            const starredWeight = 4;
  
            // Generate an array with multiples occurences of starred destinations
            const notBannedDestinations = [
              ...Array(starredWeight).fill(this.starredDestinationData).flat(),
              ...this.destinationData,
            ];
  
            const filteredDestinations = notBannedDestinations.filter(
              destination => !destinationsIdsToRemove.includes(destination.id)
            );
  
            // Check if there are any destinations
            if ( filteredDestinations.length === 0 ) {
              index = null; // No other destinations available
            } else {
              const randomIndex = Math.floor(Math.random() * filteredDestinations.length);
              index = filteredDestinations[randomIndex].id;
            }
  
          }
  
          if ( index !== null ) {
  
            // Check if it's starred
            const isStarred = this.starredDestinationsStorage.includes(index);
  
            // Check if it's banned
            const isBanned = this.bannedDestinationsStorage.includes(index);
  
            let targetDestination = null;
  
            if (isStarred) {
              targetDestination = this.starredDestinationData.find(destination => destination.id === index);
            } else if (isBanned) {
              targetDestination = this.bannedDestinationData.find(destination => destination.id === index);
            } else {
              targetDestination = this.destinationData.find(destination => destination.id === index);
            }
            if (targetDestination) {
              // Set the target destination as the current destination
              this.currentDestination = targetDestination;
            } else {
              index = null;
            }
  
          }
          
          if ( index == null ) {
            // Filter destinationData to remove visited destinations
            const newDestinations = this.destinationData.filter(destination => {
              // Filter out destinations with the same id as currentDestination.id
              // and exclude the currentDestination.id itself
              return destination.id !== this.currentDestination.id && !this.breadCrumbs.includes(destination.id);
            });
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
          }
          this.updateCurrencyData(this.currentDestination.currency);
          let baseURL = '/' + this.currentDestination.country.toLowerCase().replace(/\s+/g, '-') + '/' + this.currentDestination.location.toLowerCase().replace(/\s+/g, '-');
          this.$router.push(baseURL);
        }, 300); // 300 milliseconds delay
      },
      previousDestination() {
        if (this.breadCrumbs.length > 0) {        
          this.nextDestination("previous");
        }
      },
      toggleStarFromMenu() {
        this.toggleReservationMenu();
        this.starToggle();
      },
      toggleReservationMenu() {
        if ( this.mobileDisplay ){
          if ( this.goThere ) {
            this.goThere = false;
          } else {
            this.showMenu = !this.showMenu;
            if ( !this.showMenu ) {
              this.showCard = true;
            }
          }
        } else {
          this.goThere = !this.goThere;
        }
      },  
      visitExpediaLink() {
        // Redirect to the external website when the button is clicked
        window.open(this.currentDestination.expediaLink, "_blank");
      },  
      async updateCurrencyData(currencyCode) {
        if ( currencyCode === "USD" ) {
          this.currencyData.code = "USD";
          this.currencyData.name = "US Dollar";
          this.currencyData.equivalentInCurrency = 1;
        } else {
          // Wait for currencyDataCache to be populated
          await this.fetchCurrencyData();
  
          // Fetch and update currency data using the selected currency code        
          const currencyData = this.currencyDataCache[currencyCode.toLowerCase()];
          if (currencyData) {
            this.currencyData.code = currencyData.code;
            this.currencyData.name = currencyData.name; // Update the currency name
            const amountInUSD = 10; // The base amount in USD
            const equivalentInCurrency = amountInUSD * currencyData.rate;
            this.currencyData.equivalentInCurrency = equivalentInCurrency.toFixed(2);
          } else {
            this.currencyData.code = currencyCode;
            this.currencyData.name = currencyCode;
            this.currencyData.equivalentInCurrency = 1;
          }
        }
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
              this.upSwipe();
            }
            // Update the local storage with the updated starred destinations
            localStorage.setItem('starredDestinations', JSON.stringify(this.starredDestinationsStorage));
            // Decrease starSize from 30 back to 1
            let sizeDecreaseInterval = setInterval(() => {
              this.starShrink -= 4;
              if (this.starShrink <= 1) {
                clearInterval(sizeDecreaseInterval);
              }
            }, 50);
            clearInterval(sizeIncreaseInterval);
          }
        }, 50);
      },    
      isStarred(destinationId) {
        return this.starredDestinationsStorage.includes(destinationId);
      },        
      visitedToggle() {
        // Increase visitedShrink from 1 to 16
        let sizeIncreaseInterval = setInterval(() => {
          this.visitedShrink += 4;
          if (this.visitedShrink >= 16) {
            if (this.isVisited(this.currentDestination.id)) {
              // Unvisited the destination
              this.visitedDestinationsStorage = this.visitedDestinationsStorage.filter(id => id !== this.currentDestination.id);
              if ( this.visitedDestinationsStorage.length === 0 ) {
                this.showVisited = false;
              }
            } else {
              // Visited the destination
              this.visitedDestinationsStorage.push(this.currentDestination.id);
              this.showVisited = true;
            }
            // Update the local storage with the updated starred destinations
            localStorage.setItem('visitedDestinations', JSON.stringify(this.visitedDestinationsStorage));
            // Decrease starSize from 30 back to 1
            let sizeDecreaseInterval = setInterval(() => {
              this.visitedShrink -= 4;
              if (this.visitedShrink <= 1) {
                clearInterval(sizeDecreaseInterval);
              }
            }, 50);
            clearInterval(sizeIncreaseInterval);
          }
        }, 50);
      },    
      isVisited(destinationId) {
        return this.visitedDestinationsStorage.includes(destinationId);
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
              this.nextDestination();
            }          
            // Update the local storage with the updated starred destinations
            localStorage.setItem('bannedDestinations', JSON.stringify(this.bannedDestinationsStorage));
            // Decrease starSize from 30 back to 1
            let sizeDecreaseInterval = setInterval(() => {
              this.banShrink -= 4;
              if (this.banShrink <= 1) {
                clearInterval(sizeDecreaseInterval);
              }
            }, 50);
            clearInterval(sizeIncreaseInterval);
          }
        }, 50);
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
        this.heightSize = parentContainer.getBoundingClientRect().height;
        this.widthSize = parentContainer.getBoundingClientRect().width;
  
        this.screenRatio = this.heightSize / this.widthSize;
        if ( this.screenRatio > 1.2 ) {
          this.mobileDisplay = true;
          this.showCard = true;
          if ( !this.goThere ) {
            this.showMenu = false;
          }
          this.scaleFactor = this.heightSize / 756;
          this.heightMenuSize = this.heightSize / this.scaleFactor;
          this.widthMenuSize = this.widthSize / this.scaleFactor;
          this.leftValue = 0;
        } else {
          this.mobileDisplay = false;
          this.showMenu = true;
          this.showCard = false;
          this.scaleFactor = this.heightSize / 756;
          this.widthMenuSize = 320;
          this.heightMenuSize = 756;
          this.leftValue = this.widthMenuSize * this.scaleFactor;
        }
  
        if ( window.matchMedia('(display-mode: fullscreen)').matches ) {
            // Full screen logic
            this.fullScreen = true;
            this.leftValue = 0;
        } else {
            // Other logic
            this.fullScreen = false;
            this.fullScreenTitle = true;
            this.fullScreenNextCounter = 0;
        }
  
        // Calculate the new top value based on scaleFactor
        this.topValue = 90 * this.scaleFactor;
        
        if (this.$refs.slideshowRef) {
          this.$refs.slideshowRef.updateSlidesScale();
        }
      },
      onTouchStart(event) {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
      },
      startDrag(event) {
        if ( !this.fullScreen ) {
          if (!this.showFullMap) {
            this.isDragging = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
          }
        } else {
          this.fullScreenTitle = !this.fullScreenTitle;
        }
      },
      onTouchMove(event) {
        this.onMoving( event.touches[0].clientX, event.touches[0].clientY );
      },
      dragging(event) {
        if (this.isDragging) {
          this.onMoving( event.clientX, event.clientY );
        }
      },
      onTouchEnd(event) {
        if (event.touches && event.touches.length > 0) {
          this.onMoving( event.touches[0].clientX, event.touches[0].clientY );
        }
      },
      endDrag(event) {
        if (this.isDragging) {
          this.onMoving( event.clientX, event.clientY );
          this.isDragging = false;
        }
      },
      onMoving ( currentX, currentY ){
        const deltaX = currentX - this.startX;
        const deltaY = currentY - this.startY;
  
        if (Math.abs(deltaX) > this.minSwipeDistance && this.swipeReady) {
          if (deltaX > 0) {
            this.rightSwipe();
          } else {
            this.leftSwipe();
          }
          this.startX = currentX;
          this.startY = currentY;
        } else if (Math.abs(deltaY) > this.minSwipeDistance && this.swipeReady) {
          if (deltaY > 0) {
            this.downSwipe();
          } else {
            this.upSwipe();
          }
          this.startX = currentX;
          this.startY = currentY;
        }
      },
      leftSwipe() {
        if ( !this.showFullMap ) {
          this.$refs.slideshowRef.nextSlide();
          this.triggerSwipeCooldown();
        }
      },
      rightSwipe() {
        if ( !this.showFullMap ) {
          this.$refs.slideshowRef.previousSlide();
          this.triggerSwipeCooldown();
        }
      },
      downSwipe() {
        if ( !this.showFullMap ) {
          if ( this.goThere == true ) {
            this.goThere = false;
          } else if ( this.showMenu && this.mobileDisplay ) {
            this.showMenu = false;
            this.showCard = true;
          } else {
            const destinationArgument = this.fullScreen ? 'fullScreen' : undefined;
            this.nextDestination(destinationArgument);
          } 
          this.triggerSwipeCooldown(); 
        }
      },
      upSwipe() {
        if ( this.showMenu == false ) {
          this.showMenu = true;
          this.showCard = false;
        } else {
          this.goThere = true;
        }
        this.triggerSwipeCooldown();
      },
      triggerSwipeCooldown() {      
        this.swipeReady = false;
        setTimeout(() => {
          this.swipeReady = true;
        }, this.swipeCooldown);
      },
      onMouseWheel(event) {
        if ( this.swipeReady ) {
          const deltaY = event.deltaY;
          if (deltaY > 0) {
            this.downSwipe();
          } else {
            this.upSwipe();
          }
        }
      },
      toggleWorldMap ( centerTheMap ) {
        if ( centerTheMap ) {
          this.centerOnCurrent = true;
        } else {
          this.centerOnCurrent = false;
        }
        this.showFullMap = !this.showFullMap;
      },
      handleKeyPress(event) {
        switch (event.key) {
          case 'ArrowLeft':
            this.rightSwipe();
            break;
          case 'ArrowRight':
            this.leftSwipe();
            break;
          case 'ArrowUp':
            this.upSwipe();
            break;
          case 'ArrowDown':
            this.downSwipe();
            break;
          case '*', 's':
            this.starToggle();
            break;
          case 'Delete', 'b':
            this.banToggle();
            break;
          case 'Enter':
            this.visitedToggle();
            break;
          case ' ':
            this.nextDestination();
            break;
          case 'Backspace':
            this.previousDestination();
            break;
          case 'm':
            this.toggleWorldMap(false);
            break;
          case 'c':
            this.toggleWorldMap(true);
            break;
        }
      },
      async fetchCurrencyData() {
        if (!this.currencyDataCache) {
          // Fetch and update currency data using the selected currency code
          try {
            const response = await axios.get('https://www.floatrates.com/daily/usd.json');
            this.currencyDataCache = { ...response.data };
          } catch (error) {
            console.error('Error fetching currency data: ', error);
          }
        }
      },
      toggleShareWindow () {
        this.showSharingOptions = !this.showSharingOptions;
      },
      shareURL() {   
        if (this.currentDestination && this.currentDestination.country && this.currentDestination.location) {
          // Construct the URL with lowercase and spaces replaced by dashes
          return `${this.baseURL}${this.currentDestination.country.toLowerCase().replace(/\s+/g, '-')}/${this.currentDestination.location.toLowerCase().replace(/\s+/g, '-')}`;
        }
        // Default URL or handle the case when destination data is not available
        return this.baseURL;
      },
      getTileLayerUrl() {
        if ( this.$refs.worldmapRef ) {
          return this.$refs.worldmapRef.getTileLayerUrl();
        } else {
          return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
      },
      getCurrentGeoJsonData() {
        if ( this.$refs.worldmapRef ) {
          return this.$refs.worldmapRef.getCurrentGeoJsonData();
        } else {
          return null;
        }
      },
      currentGeoJsonCountries() {
        if ( this.$refs.worldmapRef ) {
          return this.$refs.worldmapRef.currentGeoJsonCountries();
        } else {
          return null;
        }
      },
    },
    created() {

      this.fetchCurrencyData();
  
      this.totalDestinations = this.allDestinationsData.length;
  
      this.destinationData = [...this.allDestinationsData];
  
      // Load visited destinations from local storage
      const storedVisitedDestinations = localStorage.getItem('visitedDestinations');
      if (storedVisitedDestinations) {
        this.visitedDestinationsStorage = JSON.parse(storedVisitedDestinations);
      }
  
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
  
      let landingId = null;
  
      if ( this.landingCountry && this.landingLocation ) {
        // Find the destination that matches the specified criteria
        const foundDestination = this.allDestinationsData.find((destination) => {
          return destination.country.toLowerCase().replace(/\s/g, '-') === this.landingCountry.toLowerCase().replace(/\s/g, '-')
           && destination.location.toLowerCase().replace(/\s/g, '-') === this.landingLocation.toLowerCase().replace(/\s/g, '-');
        });
        landingId = foundDestination.id;
      }

      this.nextDestination(landingId);
  
    }, 
  }
  </script>
  