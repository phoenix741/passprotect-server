import Vue from 'vue'
import Router from 'vue-router'

import Login from '../components/user/Login.vue'
import Register from '../components/user/Register.vue'
import Items from '../components/items/Items.vue'
import ItemModification from '../components/items/ItemModification.vue'
import ItemVisualisation from '../components/items/ItemVisualisation.vue'
import ItemCreation from '../components/items/ItemCreation.vue'
import About from '../components/page/About.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {path: '/about', component: About},
    {path: '/items', component: Items},
    {path: '/items/type/:type', component: ItemCreation, props: true},
    {path: '/items/:id/edit', component: ItemModification, props: true},
    {path: '/items/:id', component: ItemVisualisation, props: true},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '*', redirect: '/items'}
  ]
})
