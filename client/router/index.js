import Vue from 'vue'
import Router from 'vue-router'

import Login from '../components/user/Login.vue'
import Register from '../components/user/Register.vue'
import Items from '../components/items/Items.vue'
import ItemModification from '../components/items/ItemModification.vue'
import ItemVisualisation from '../components/items/ItemVisualisation.vue'
import About from '../components/page/About.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {name: 'about', path: '/about', component: About},
    {name: 'items', path: '/items', component: Items, props: route => ({ q: route.query.q })},
    {name: 'edit', path: '/items/:id/edit', component: ItemModification, props: true},
    {name: 'view', path: '/items/:id', component: ItemVisualisation, props: true},
    {name: 'login', path: '/login', component: Login},
    {name: 'register', path: '/register', component: Register},
    {path: '*', redirect: '/items'}
  ]
})
