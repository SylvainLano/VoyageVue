import { createApp } from 'vue'
import App from './App.vue'
import './styles/styles.css';


/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faStar as solidStar, faLanguage, faPlane, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons'
import { faStar as emptyStar } from '@fortawesome/free-regular-svg-icons'

/* add icons to the library */
library.add(solidStar, emptyStar, faLanguage, faPlane, faMoneyCheckDollar)

createApp(App)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app')
