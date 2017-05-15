<template lang="pug">
	v-app
		v-navigation-drawer.pb-0(persistent,light,:mini-variant.sync="mini",v-model="drawer")
			v-list.pa-0
				v-list-item
					v-list-tile(avatar,tag="div")
						v-list-tile-content
							v-list-tile-title(v-if="SESSION.username") {{ SESSION.username }}
							v-list-tile-title(v-else-if="!SESSION.username") {{ trans("user:toolbar.notlogged") }}
						v-list-tile-action
							v-btn(icon,@click.native.stop="mini = !mini")
								v-icon chevron_left
			v-list(dense)
				v-divider
				v-list-item
					v-list-tile(router=true,to="/about")
						v-list-tile-action
							v-icon info
						v-list-tile-content
							v-list-tile-title {{ trans('app.menu.about') }}
				v-list-item
					v-list-tile(router=true,to="/items",v-if="!! SESSION.authenticated")
						v-list-tile-action
							v-icon list
						v-list-tile-content
							v-list-tile-title {{ trans('app.menu.items') }}
				v-list-item
					v-list-tile(v-if="!! SESSION.authenticated",v-on:click.native="handleDownloadPassword()")
						v-list-tile-action
							v-icon import_export
						v-list-tile-content
							v-list-tile-title {{ trans('app.menu.export') }}
				v-list-item
					v-list-tile(v-if="!! SESSION.authenticated")
						v-list-tile-action
							v-icon print
						v-list-tile-content
							v-list-tile-title {{ trans('app.menu.print') }}

		v-toolbar.indigo.darken-4(fixed)
			v-toolbar-side-icon(light,@click.native.stop="drawer = !drawer")
			v-toolbar-title {{ trans('app.title') }}
			v-toolbar-items
				v-toolbar-item(v-if="!! SESSION.authenticated",v-on:click.native="handleLogout()") {{ trans('app.menu.logout') }}
				v-toolbar-item(router=true,to="/login",v-if="! SESSION.authenticated") {{ trans('app.menu.connect') }}
		main
			v-container
				router-view
</template>

<script type="text/babel">
	import {SESSION, logout} from './user/UserService';
	import {generatePasswordFile} from './items/ItemService';

	export default {
		name: 'app',
		data() {
	    return {
	      SESSION,
				drawer: true,
				mini: false
	    }
	  },
		methods: {
			handleLogout() {
				logout(this);
			},
			handleDownloadPassword() {
				generatePasswordFile(this);
			}
		}
	}
</script>

<style lang="stylus">
 	//$color-pack = false
	@import '../../node_modules/vuetify/src/stylus/main';
</style>
