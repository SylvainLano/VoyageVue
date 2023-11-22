<!-- Slideshow.vue -->
<template>
    <transition name="slide-fade">
      <div class="absolute bg-slate-50"
        :style="{ left: `${leftValueSlides}px`, top: `${topValueSlides}px`, height: `${heightSlidesSize}px`, width: `${widthSlidesSize}px` }"
        v-if="showSlides"
        @mousedown="startDrag"
        @mousemove="dragging"
        @mouseup="endDrag"
        @mouseleave="endDrag"
      >
        <vueper-slides
          ref="myVueperSlides"
          :autoplay="true"
          :duration="10000"
          :arrows="false"
          :bullets="false"
          :slideRatio="0.6"
          :touchable="false"
          :pause-on-hover="false"
          @autoplay-pause="internalAutoPlaying = false"
          @autoplay-resume="internalAutoPlaying = true"
        >
          <vueper-slide
            v-for="(slide, i) in currentDestination.images"
            :key="i"
            :image="require(`@/assets/images/${slide.image}`)"
          >
            <template #content>
              <div class="absolute z-10 text-left block"
                :style="slideTitleStyle"
                v-if="fullScreenTitle"
              >
                <div class="slide-title text-4xl" v-if="!fullScreen">
                  {{ slide.title }}
                </div>
                <div class="slide-title text-xl" v-if="!fullScreen">
                  by <a target="_blank" class="text-pink-400" :href="slide.link">{{ slide.author }}</a>
                </div>
                <div class="slide-title text-lg" v-if="fullScreen">
                  {{ slide.title }} by {{ slide.author }}
                  in {{ currentDestination.location + ", " + currentDestination.country }}
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
  </template>
  
  <script>
  import { VueperSlides, VueperSlide } from 'vueperslides';
  import 'vueperslides/dist/vueperslides.css';

  export default {
    components: {
      VueperSlides,
      VueperSlide
    },
    props: {
      showSlides: Boolean,
      scaleFactor: Number,
      mobileDisplay: Boolean,
      heightSize: Number,
      widthSize: Number,
      leftValue: Number,
      widthMenuSize: Number,
      startDrag: Function,
      dragging: Function,
      endDrag: Function,
      currentDestination: Object,
      fullScreenTitle: Boolean,
      fullScreen: Boolean,
    },
    data: () => ({
      ratioSlides: 0.6,
      heightSlidesSize: 756,
      widthSlidesSize: 1512,
      topValueSlides: 0,
      topValueTitle: 90,
      leftValueSlides: 320,
      leftValueTitle: 320,
    }),
    mounted() {
        this.updateSlidesScale();
    },
    updated() {
        this.updateSlidesScale();
    },
    computed: {
      slideTitleStyle() {
        const style = {
          left: `${this.leftValueTitle}px`,
          transform: `scale(${this.scaleFactor})`,
        };
        if ( this.fullScreen ) {
          style['bottom'] = `${this.topValueTitle}px`;
          style['transform-origin'] = `bottom left`;
        } else {
          style['top'] = `${this.topValueTitle}px`;
          style['transform-origin'] = `top left`;
        }
        if (this.mobileDisplay) {
          style['max-width'] = `${this.widthMenuSize}px`;
        }
        return style;
      },
    },
    methods: {
        updateSlidesScale() {
            if ( this.heightSize / (this.widthSize - this.leftValue) > this.ratioSlides ) {
                this.heightSlidesSize = this.heightSize;
                this.widthSlidesSize = this.heightSize / this.ratioSlides;
                this.topValueSlides = 0;
                this.leftValueSlides = ( this.leftValue - this.widthSlidesSize + this.widthSize ) / 2;
            } else {
                this.widthSlidesSize = (this.widthSize - this.leftValue);
                this.heightSlidesSize = this.widthSlidesSize * this.ratioSlides;
                this.topValueSlides = ( this.heightSize - this.heightSlidesSize ) / 2;
                this.leftValueSlides = this.leftValue;
            }

            if ( this.mobileDisplay ) {
                this.leftValueTitle = 0 - this.leftValueSlides;
            } else {
                this.leftValueTitle = this.widthMenuSize * this.scaleFactor - this.leftValueSlides;
            }
            this.topValueTitle = ( 90 * this.scaleFactor ) - this.topValueSlides;

            if ( this.fullScreen ) {
                this.leftValueTitle = 0;
                this.topValueTitle = 0 - this.topValueSlides;
            }
        },
        nextSlide() {
            this.$refs.myVueperSlides.next();
        },
        previousSlide() {
            this.$refs.myVueperSlides.previous();
        },
    },
  };
  </script>
  