import './styles/styles.css';
import { createApp } from 'vue'
import App from './App.vue'
import VoyageVue from './views/VoyageVue.vue'


/* import the fontawesome core */
import { library, config } from '@fortawesome/fontawesome-svg-core'
/* Font Awesome's CSS is imported in styles.css instead of being injected at runtime */
config.autoAddCss = false
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faStar as solidStar, faCircleXmark as solidXmark, faLanguage, faPlane, faMoneyCheckDollar, faPassport, faPeopleRobbery,
    faHospital, faBowlFood, faUserPlus, faEarthAfrica, faMoon, faSun, faStreetView, faPencil, faBus, faMap,
    faCircleCheck as solidCircle, faShareNodes } from '@fortawesome/free-solid-svg-icons'
import { faStar as emptyStar, faCircleXmark as emptyXmark, faCircleCheck as emptyCircle, faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faSquareXTwitter, faSquareFacebook, faLinkedin, faSquareReddit, faQuora, faWordpress } from '@fortawesome/free-brands-svg-icons'
/* add icons to the library */
library.add( solidStar, emptyStar, faLanguage, faPlane, faMoneyCheckDollar, faPassport, faPeopleRobbery, faHospital, faBowlFood,
    faUserPlus, emptyXmark, solidXmark, faEarthAfrica, faMoon, faSun, faStreetView, faPencil, faBus, faMap, solidCircle, emptyCircle,
    faShareNodes, faSquareXTwitter, faEnvelope, faSquareFacebook, faLinkedin, faSquareReddit, faQuora, faWordpress )

import { createRouter, createWebHistory } from 'vue-router';

import destinations from '@/assets/destinations.json';
import { destinationPath } from '@/utils/slug.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...destinations.map(destination => ({
      path: destinationPath(destination),
      component: VoyageVue,
      props: { landingCountry: destination.country, landingLocation: destination.location },
    })),
    {
      path: '/:pathMatch(.*)*',
      component: VoyageVue,
      props: false,
    },
  ],
});

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router);
app.mount('#app');
