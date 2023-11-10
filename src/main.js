import { createApp } from 'vue'
import App from './App.vue'
import './styles/styles.css';


/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faStar as solidStar, faCircleXmark as solidXmark, faLanguage, faPlane, faMoneyCheckDollar, faPassport, faPeopleRobbery,
    faHospital, faBowlFood, faUserPlus, faEarthAfrica, faMoon, faSun, faStreetView, faPencil, faBus, faMap } from '@fortawesome/free-solid-svg-icons'
import { faStar as emptyStar, faCircleXmark as emptyXmark } from '@fortawesome/free-regular-svg-icons'

/* add icons to the library */
library.add( solidStar, emptyStar, faLanguage, faPlane, faMoneyCheckDollar, faPassport, faPeopleRobbery, faHospital, faBowlFood,
    faUserPlus, emptyXmark, solidXmark, faEarthAfrica, faMoon, faSun, faStreetView, faPencil, faBus, faMap )

createApp(App)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app')
