<!-- SharingOptions.vue -->

<template>
    <transition name="lateral-fade">
      <div :class="shareIcons" v-if="showSharingOptions">
        <div class="absolute h-screen w-screen top-0 left-0" @click="toggleShareWindow"></div>
        <div class="relative m-auto bg-slate-50 p-10 text-6xl grid grid-cols-4 gap-4 w-fit">
          <font-awesome-icon
            class="cursor-pointer"
            v-for="(network, index) in socialNetworks"
            :key="'social_' + index"
            :icon="[network.faStyle, network.faIcon]"
            :title="'Share ' + currentDestination.location + ' with the world using ' + network.name"
            :style="{ color: network.color }"
            @click="shareOnNetwork(network)"
          />
        </div>
        <div :class="bottomURLShare" @click="copyToClipboard">
          <label class="p-2 cursor-pointer" for="copyUrl">Copy:</label>
          <input class="p-2 cursor-pointer bg-slate-300 w-full" type="text" id="copyUrl" :value="shareURL" readonly>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  import socialNetworks from '@/assets/social-networks.json';

  export default {
    props: {
      showSharingOptions: Boolean,
      currentDestination: Object,
      shareURL: String,
    },
    data: () => ({
        socialNetworks: socialNetworks,
    }),
    computed: {
      shareIcons() {
        let shareIconsClass = 'bg-slate-50 bg-opacity-50 absolute text-slate-900 h-full w-full top-0 left-0 z-40';
        if ( !this.mobileDisplay ) {
          shareIconsClass += ' p-[5%]';
        } else {
          shareIconsClass += ' pt-[10%]';
        }
        return shareIconsClass;
      },
      bottomURLShare() {
        let bottomURLClass = 'absolute bg-slate-50 p-2 flex mb-2';
        if ( this.mobileDisplay ) {
          bottomURLClass += ' w-full bottom-0 text-sm';
        } else {
          bottomURLClass += ' w-[90%] bottom-10 text-lg';
        }
        return bottomURLClass;
      }
    },
    methods: {
      shareOnNetwork(network) {
        const url = network.url
          .replace(/@u/g, encodeURIComponent(this.shareURL))
          .replace(/@t/g, encodeURIComponent("Visit " + this.currentDestination.location + " on Voyage Vue !"))
          .replace(/@d/g, encodeURIComponent(this.currentDestination.description))
          .replace(/@h/g, this.createHashtags(this.currentDestination));

        // Open the share link in a new window or perform the desired action
        window.open(url, '_blank');
      },
      copyToClipboard() {
        navigator.clipboard.writeText(this.shareURL)
          .then(() => {
            console.log('URL copied to clipboard');
          })
          .catch((error) => {
            console.error('Unable to copy to clipboard', error);
          });
      },
      toggleShareWindow() {
        // Emit a custom event to notify the parent component
        this.$emit('close-sharing-options');
      },
      createHashtags( destination ) {
        let hashtags = destination.location.replace(/\s+/g, '') + ','
        + destination.country.replace(/\s+/g, '') + ',';
        destination.images.forEach((image) => {
          hashtags += image.title.replace(/[^a-zA-Z0-9_]/g, '') + ',';
        });
        hashtags += 'VoyageVue';
        return hashtags;
      },
    },
  };
  </script>
  
  <style>
  /* Add any styles specific to this component */
  </style>
  