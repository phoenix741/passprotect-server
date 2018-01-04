<template lang="pug">
	v-app
		v-navigation-drawer(fixed,clipped,app,v-model="drawer")
			v-list(dense)
				v-list-tile.connect-link(router=true,to="/login",v-if="! SESSION.authenticated")
					v-list-tile-action
						v-icon face
					v-list-tile-content
						v-list-tile-title {{ trans('app.menu.connect') }}
				v-list-tile.items-link(router=true,to="/items",v-if="!! SESSION.authenticated")
					v-list-tile-action
						v-icon list
					v-list-tile-content
						v-list-tile-title {{ trans('app.menu.items') }}
				v-list-tile.export-link(v-if="!! SESSION.authenticated",v-on:click.native="handleExport()")
					v-list-tile-action
						v-icon import_export
					v-list-tile-content
						v-list-tile-title {{ trans('app.menu.export') }}
				v-divider
				v-list-tile.logout-link(v-if="!! SESSION.authenticated",v-on:click.native="handleLogout()")
					v-list-tile-action
						v-icon power_settings_new
					v-list-tile-content
						v-list-tile-title {{ trans('app.menu.logout') }}
				v-list-tile.about-link(router=true,to="/about")
					v-list-tile-action
						v-icon chat_bubble
					v-list-tile-content
						v-list-tile-title {{ trans('app.menu.about') }}

		v-toolbar(color="indigo darken-4",dark,app,clipped-left,fixed)
			v-toolbar-title.ml-0.pl-3(:style="$vuetify.breakpoint.smAndUp ? 'width: 300px; min-width: 250px' : 'min-width: 72px'")
				v-toolbar-side-icon(@click.stop="drawer = !drawer")
				span.hidden-xs-only {{ trans('app.title') }}
			v-text-field.search-input(v-if="this.$route.name=='items'",light,solo,prepend-icon="search",:placeholder="trans('items:list.search')",v-on:input="search",style="max-width: 500px; min-width: 128px")

		v-content
			router-view
</template>

<script type="text/babel">
import {SESSION, logout} from './components/user/UserService'
import {exportLinesAsCsv} from './components/items/ItemService'
import {debounce} from 'lodash'

export default {
  name: 'app',
  data () {
    return {
      SESSION,
      drawer: true
    }
  },
  methods: {
    handleLogout () {
      logout(this)
    },
    handleExport () {
      exportLinesAsCsv(this)
    },
    search (value) {
      debounce(value => this.$router.push(`/items?q=${value}`), 500)(value)
    }
  }
}
</script>

<style lang="stylus">
   //$color-pack = false
	@import '../node_modules/vuetify/src/stylus/main'
</style>
