<!-- WorldMap.vue -->
<template>    
    <transition name="lateral-fade">
        <div :class="fullMapClass"
        v-if="showFullMap">
          <div class="absolute h-screen w-screen top-0 left-0" @click="closeWorldMap()" v-if="!mobileDisplay">
          </div>
          <div :class="worldMapClass">
              <div class="basis-1/6 text-cyan-700 p-1 text-left flex-wrap space-x-2" @mouseover="showMapModeMenu" @mouseleave="hideMapModeMenu">
                <font-awesome-icon class="cursor-pointer" :icon="getMapModeIcon()" size="lg" />
                <font-awesome-icon class="cursor-pointer text-slate-700" :icon="['fas', 'street-view']" size="lg" @click="setMapMode('streets')" v-if="(isMapModeMenuVisible || mobileDisplay) && mapMode !== 'streets'" />
                <font-awesome-icon class="cursor-pointer text-slate-700" :icon="['fas', 'bus']" size="lg" @click="setMapMode('bus')" v-if="(isMapModeMenuVisible || mobileDisplay) && mapMode !== 'bus'" />
                <font-awesome-icon class="cursor-pointer text-slate-700" :icon="['fas', 'moon']" size="lg" @click="setMapMode('night')" v-if="isMapModeMenuVisible && !mobileDisplay && mapMode !== 'night'" />
                <font-awesome-icon class="cursor-pointer text-slate-700" :icon="['fas', 'sun']" size="lg" @click="setMapMode('day')" v-if="(isMapModeMenuVisible || mobileDisplay) && mapMode !== 'day'" />
                <font-awesome-icon class="cursor-pointer text-slate-700" :icon="['fas', 'map']" size="lg" @click="setMapMode('map')" v-if="(isMapModeMenuVisible || mobileDisplay) && mapMode !== 'map'" />
                <font-awesome-icon class="cursor-pointer text-slate-700" :icon="['fas', 'pencil']" size="lg" @click="setMapMode('watercolor')" v-if="isMapModeMenuVisible && !mobileDisplay && mapMode !== 'watercolor'" />
              </div>
              <div class="basis-1/6 text-green-700 text-right pr-2">
                <input class="mx-1" type="checkbox" id="starredBox" v-model="hideStarred" :disabled="starredDestinationData.length === 0" />
                <label for="starredBox" :style="{ color: starredDestinationData.length === 0 ? 'grey' : 'inherit' }">Hide {{ starredDestinationData.length }} Starred</label>
              </div>
              <div class="basis-1/6 text-red-700 text-center">
                <input class="mx-1" type="checkbox" id="bannedBox" v-model="hideBanned" :disabled="bannedDestinationData.length === 0" />
                <label for="bannedBox" :style="{ color: bannedDestinationData.length === 0 ? 'grey' : 'inherit' }">Hide {{ bannedDestinationData.length }} Banned</label>
              </div>
              <div class="basis-1/6 text-cyan-700 text-left pl-2">
                <input class="mx-1" type="checkbox" id="unmarkedBox" v-model="hideUnmarked" :disabled="destinationData.length === 0" />
                <label for="unmarkedBox"  :style="{ color: destinationData.length === 0 ? 'grey' : 'inherit' }">Hide {{ destinationData.length }} Unmarked</label>
              </div>
              <div class="basis-1/6 text-emerald-700 text-left pl-2">
                <input class="mx-1" type="checkbox" id="visitedBox" v-model="hideVisited" :disabled="visitedDestinationsStorage.length === 0" />
                <label for="visitedBox"  :style="{ color: visitedDestinationsStorage.length === 0 ? 'grey' : 'inherit' }">Hide {{ visitedDestinationsStorage.length }} Visited</label>
              </div>
              <div class="basis-1/6 text-right text-slate-800 text-xl pr-2">
                <font-awesome-icon :icon="['far', 'circle-xmark']" @click="closeWorldMap()" />
              </div>
          </div>
          <div class="h-[92%] w-full m-auto">
            <l-map 
              ref="worldMap"
              :zoom="centerOnCurrent ? 6 : 2"
              :bounds="centerOnCurrent ? calculateBounds() : maxBounds"
              :max-bounds="maxBounds"
              :minZoom="2"
              :worldCopyJump=true
              :center="centerOnCurrent ? currentDestination.center : [21.116772, -11.405182]"
              :options="{ zoomControl: false, attributionControl: false }"
            >
              <l-tile-layer :url="getTileLayerUrl()"></l-tile-layer>
    
              <l-geo-json :geojson="getVisitedGeoJsonData()" :options-style="visitedGeoJsonCountries" :visible="!hideVisited"></l-geo-json>
              <l-geo-json :geojson="getCurrentGeoJsonData()" :options-style="currentGeoJsonCountries" v-if="centerOnCurrent"></l-geo-json>
  
              <l-layer-group :visible="!hideBanned">
              <l-marker
                v-for="(destination, index) in filteredBannedDestinations"
                :key="'banned_' + index"
                :lat-lng="destination.center"
                @click="nextDestination(destination.id)"
              >
                <l-icon
                  :icon-url="require('@/assets/images/markers/marker-icon-red.png')"
                  :icon-anchor="[25/2,41]"
                />
                <l-tooltip>{{ destination.location + ' - ' + destination.country }}</l-tooltip>
              </l-marker>
              </l-layer-group>
    
              <l-layer-group :visible="!hideStarred">
                <l-marker
                  v-for="(destination, index) in filteredStarredDestinations"
                  :key="'starred_' + index"
                  :lat-lng="destination.center"
                  @click="nextDestination(destination.id)"
                >
                  <l-icon
                    :icon-url="require('@/assets/images/markers/marker-icon-green.png')"
                    :icon-anchor="[25/2,41]"
                  />
                  <l-tooltip>{{ destination.location + ' - ' + destination.country }}</l-tooltip>
                </l-marker>
              </l-layer-group>
    
              <l-layer-group :visible="!hideUnmarked">
                <l-marker
                  v-for="(destination, index) in filterUnmarkedDestinations"
                  :key="'unmarked_' + index"
                  :lat-lng="destination.center"
                  @click="nextDestination(destination.id)"
                >
                <l-tooltip>{{ destination.location + ' - ' + destination.country }}</l-tooltip>
                </l-marker>
              </l-layer-group>
    
              <l-layer-group :visible="centerOnCurrent">
                <l-marker 
                  :key="'current_' + currentDestination.id"
                  :lat-lng="currentDestination.center"
                >
                  <l-icon
                    :icon-url="require('@/assets/images/markers/marker-icon-pink.png')"
                    :icon-anchor="[25/2,41]"
                  />
                  <l-tooltip>{{ currentDestination.location + ' - ' + currentDestination.country }}</l-tooltip>
                </l-marker>
              </l-layer-group>
  
            </l-map>
          </div>
        </div>
    </transition>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { latLngBounds } from "leaflet";
import { LMap, LTileLayer, LMarker, LIcon, LLayerGroup, LTooltip, LGeoJson } from "@vue-leaflet/vue-leaflet";
import isoMapping from '@/assets/iso-mapping.json';
import countriesGeoJsonData from '@/assets/countries.json';

export default {
  props: {
    mobileDisplay: Boolean,
    showFullMap: Boolean,
    scaleFactor: Number,
    starredDestinationData: Object,
    bannedDestinationData: Object,
    destinationData: Object,
    visitedDestinationsStorage: Object,
    centerOnCurrent: Boolean,
    currentDestination: Object,
  },
    components: {
      LMap,
      LTileLayer,
      LMarker,
      LIcon,
      LLayerGroup,
      LTooltip,
      LGeoJson,
    },
  data: () => ({    
      mapMode: "streets",
      isMapModeMenuVisible: false,
      maxBounds: latLngBounds([
        [-90, -360], // Southwest corner of the world
        [90, 360],   // Northeast corner of the world
      ]),
      hideStarred: false,
      hideBanned: true,
      hideUnmarked: false,
      hideVisited: false,
      isoMapping: isoMapping,
      countriesGeoJsonData: countriesGeoJsonData,
  }),
  computed: {
      fullMapClass() {
        let fullClass = 'bg-slate-50 flex-col bg-opacity-50 absolute text-slate-900 h-full w-full top-0 left-0 z-40 overflow-hidden';
        if ( !this.mobileDisplay ) {
          fullClass += ' p-[5%]';
        }
        return fullClass;
      },
      worldMapClass() {
        // Define a class object with class names as keys and conditions as values
        let classes = {
          'm-auto bg-slate-50 text-center flex flex-row mb-1': true, // Other classes
        };
  
        if (!this.mobileDisplay) {
          classes = {
            ...classes,
            'relative text-lg': this.scaleFactor >= 0.7,
            'relative text-sm': this.scaleFactor < 0.7 && this.scaleFactor >= 0.4,
            'relative text-xs': this.scaleFactor < 0.4,
          };
        } else {
          classes = {
            ...classes,
            'relative text-sm': true,
          };
        }
  
        // Convert the class object to a space-separated string
        return Object.keys(classes)
          .filter((className) => classes[className])
          .join(' ');
      },
      filteredStarredDestinations() {
        return this.starredDestinationData.filter((destination) => {
          return (!this.isVisited(destination.id) || !this.hideVisited) && (this.currentDestination.id != destination.id || !this.centerOnCurrent);
        });
      },
      filteredBannedDestinations() {
        return this.bannedDestinationData.filter((destination) => {
          return (!this.isVisited(destination.id) || !this.hideVisited) && (this.currentDestination.id != destination.id || !this.centerOnCurrent);
        });
      },
      filterUnmarkedDestinations() {
        return this.destinationData.filter((destination) => {
          return (!this.isVisited(destination.id) || !this.hideVisited) && (this.currentDestination.id != destination.id || !this.centerOnCurrent);
        });
      },
  },
  methods: {
      closeWorldMap() {
        this.$emit('closeWorldMap', false);
      },
      nextDestination(destinationId) {
        this.$emit('nextDestination', destinationId);
      },
      getTileLayerUrl() {
        // Your conditions to determine the tile-layer URL
        if ( this.mapMode === "night" ) {
          return 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg';
        } else if ( this.mapMode === "map" ) {
          return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}';
        } else if ( this.mapMode === "watercolor" ) {
          return 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg';
        } else if ( this.mapMode === "day" ) {
          return 'http://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
        } else if ( this.mapMode === "bus" ) {
          return 'https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png';
        } else {
          return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
      },
      setMapMode( mode ) {
        this.mapMode = mode;
      },
      showMapModeMenu() {
        this.isMapModeMenuVisible = true;
      },
      hideMapModeMenu() {
        this.isMapModeMenuVisible = false;
      },
      getMapModeIcon() {
        // Return the appropriate icon based on the selected mode
        switch (this.mapMode) {
          case 'night':
            return ['fas', 'moon'];
          case 'day':
            return ['fas', 'sun'];
          case 'map':
            return ['fas', 'map'];
          case 'watercolor':
            return ['fas', 'pencil'];
          case 'bus':
            return ['fas', 'bus'];
          case 'satellite':
            return ['fas', 'satellite'];
          default:
            return ['fas', 'street-view'];
        }
      },
      getVisitedGeoJsonData() {
        // Extract the names of visited countries from visitedDestinationsStorage
        const visitedIsoCodes = this.visitedDestinationsStorage.map((destinationId) => {
          // Convert destination id (e.g., "fr-001") to country code (e.g., "fr")
          const countryCode = destinationId.split('-')[0].toUpperCase();
          
          // Find the ISO code in isoMapping
          return this.isoMapping[countryCode];
        });
  
  
        // Filter GeoJSON data to keep only features with ISO codes present in favoredIsoCodes
        const filteredData = this.countriesGeoJsonData.features.filter(
          (feature) => visitedIsoCodes.includes(feature.properties.ADM0_A3)
        );
  
        // Create a new GeoJSON object with the filtered features
        const filteredGeoJson = {
          type: 'VisitedCollection',
          features: filteredData,
        };
  
        return filteredGeoJson;
      },
      getCurrentGeoJsonData() {
        // Extract the names of visited countries from visitedDestinationsStorage
        const currentIsoCode = this.isoMapping[this.currentDestination.id.split('-')[0].toUpperCase()]; 
  
        // Filter GeoJSON data to keep only features with ISO codes present in favoredIsoCodes
        const filteredData = this.countriesGeoJsonData.features.filter(
          (feature) => currentIsoCode.includes(feature.properties.ADM0_A3)
        );
  
        // Create a new GeoJSON object with the filtered features
        const filteredGeoJson = {
          type: 'CurrentCollection',
          features: filteredData,
        };
  
        return filteredGeoJson;
      },
      visitedGeoJsonCountries() {
        return {
          weight: 2,
          color: "#34d399",
          opacity: 1,
          fillColor: "#34d399",
          fillOpacity: 0.1
        };
      },
      currentGeoJsonCountries() {
        return {
          weight: 2,
          color: "#d39934",
          opacity: 1,
          fillColor: "#d39934",
          fillOpacity: 0.1
        };
      },   
      isVisited(destinationId) {
        return this.visitedDestinationsStorage.includes(destinationId);
      },  
      calculateBounds () {
        return latLngBounds( this.currentDestination.center );
      }
  }
};
</script>    