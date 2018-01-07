<template lang="pug">
div
  v-navigation-drawer(fixed,clipped,app,v-model="drawer")
    v-list(dense)
      v-list-tile.about-link(router=true,to="/about")
        v-list-tile-action
          v-icon chat_bubble
        v-list-tile-content
          v-list-tile-title {{ trans('app.menu.about') }}
      v-list-tile.export-link(v-on:click.native="handleExport()")
        v-list-tile-action
          v-icon import_export
        v-list-tile-content
          v-list-tile-title {{ trans('app.menu.export') }}
      v-divider
      v-list-tile.logout-link(v-on:click.native="handleLogout()")
        v-list-tile-action
          v-icon power_settings_new
        v-list-tile-content
          v-list-tile-title {{ trans('app.menu.logout') }}

  v-toolbar(color="primary",dark,app,clipped-left,fixed)
    v-toolbar-title.ml-0.pl-3(:style="$vuetify.breakpoint.smAndUp ? 'width: 300px; min-width: 250px' : 'min-width: 72px'")
      v-toolbar-side-icon(@click.stop="drawer = !drawer")
      span.hidden-xs-only {{ trans('app.title') }}
    v-text-field.search-input(light,solo,prepend-icon="search",:placeholder="trans('items:list.search')",v-on:input="search",style="max-width: 500px; min-width: 128px")

  v-content
    v-list#items-list(two-line)
      template(v-for="(lines, title, indexGroup) in linesByGroup")
        v-subheader.group-title(v-text="title")
        template(v-for="(line, index) in lines")
          v-list-tile(:key="line._id",v-on:click="showDetail(line, $event)",avatar)
            v-list-tile-avatar
              v-icon.white--text(:class="cardType(line).color") {{ cardType(line).icon }}
            v-list-tile-content
              v-list-tile-title.line-title {{ line.label }}
              v-list-tile-sub-title.line-type {{ trans(cardType(line).label) }}
            v-list-tile-action
              v-dialog(v-model="dialog['remove' + index]" max-width="500px")
                v-btn.item-delete-btn(icon,ripple,slot="activator")
                  v-icon.grey--text.text--lighten-1 delete
                v-card
                  v-card-title
                    .headline {{ trans('items:alert.confirm_remove.title') }}
                  v-card-text {{ trans('items:alert.confirm_remove.message', {title: line.label}) }}
                  v-card-actions
                    v-spacer
                    v-btn.cancel-btn.green--text.darken-1(flat="flat",ripple,v-on:click="dialog['remove' + index] = false") {{ trans('items:alert.confirm_remove.disagree') }}
                    v-btn.delete-btn.green--text.darken-1(flat="flat",ripple,v-on:click="remove(line, index)") {{ trans('items:alert.confirm_remove.agree') }}
          v-divider(:inset="index < lines.length - 1",v-if="index < lines.length - 1 || indexGroup != groupCount - 1")
      v-list-tile(v-if="lines.length == 0")
        v-list-tile-content
          v-list-tile-title.text-xs-center {{ trans('items:list.empty') }}

      v-speed-dial(:bottom="true",:right="true",:fixed="true")
        v-btn#items-add-button.red.darken-2(slot="activator",dark,fab,hover)
          v-icon add
          v-icon close
        v-btn#items-add-card-button.red(fab,dark,small,@click="dialog.card = true")
          v-icon credit_card
        v-btn#items-add-password-button.blue(fab,dark,small,@click="dialog.password = true")
          v-icon fingerprint
        v-btn#items-add-text-button.green(fab,dark,small,@click="dialog.text = true")
          v-icon text_fields

      v-dialog(v-model="dialog.card",fullscreen,transition="dialog-bottom-transition",:overlay="false")
        item-creation(v-if="dialog.card",type="card",@close="dialog.card = false")
      v-dialog(v-model="dialog.password",fullscreen,transition="dialog-bottom-transition",:overlay="false")
        item-creation(v-if="dialog.password",type="password",@close="dialog.password = false")
      v-dialog(v-model="dialog.text",fullscreen,transition="dialog-bottom-transition",:overlay="false")
        item-creation(v-if="dialog.text",type="text",@close="dialog.text = false")
</template>

<script type="text/babel">
import {SESSION, logout} from '../user/UserService'
import {cardTypeMapping, removeLine, exportLinesAsCsv} from './ItemService'
import getLines from './getLines.gql'
import {filter, groupBy, size, debounce} from 'lodash'
import AnalyticsMixin from '../../utils/piwik'
import ItemCreation from './ItemCreation'

export default {
  name: 'items',
  mixins: [AnalyticsMixin],
  props: ['q'],
  components: {
    'item-creation': ItemCreation
  },
  data () {
    return {
      title: this.trans('items:list.title'),
      showOptions: false,
      drawer: true,
      dialog: {
        card: false,
        password: false,
        text: false
      },
      lines: []
    }
  },
  computed: {
    linesByGroup () {
      const searchFilter = !!this.q && new RegExp('^' + this.q)
      const filteredLines = filter(this.lines, line => {
        if (searchFilter) {
          return searchFilter.test(line.label) || searchFilter.test(line.group)
        }
        return true
      })
      return groupBy(filteredLines, line => line.group)
    },
    groupCount () {
      return size(this.linesByGroup)
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
    },
    remove (line, index) {
      this.dialog['remove' + index] = false
      removeLine(this, line._id)
    },
    showDetail (line, $event) {
      var target = $event.target || $event.srcElement

      while (target) {
        if (target instanceof HTMLButtonElement) {
          break
        }

        target = target.parentNode
      }

      if (!target || !target.className.match(/\bdelete-btn\b/)) {
        this.$router.push('/items/' + line._id)
      }
    },
    cardType (line) {
      line = line || {}
      return cardTypeMapping[line.type || 'text']
    }
  },
  beforeRouteEnter (to, from, next) {
    if (!SESSION.authenticated) {
      return next('/login')
    }
    return next()
  },
  apollo: {
    lines: {
      query: getLines,
      result ({data}) {
        // Create the dialog element used for reactivity. If not the dialog will not work
        data.lines.forEach((line, index) => {
          this.$set(this.dialog, 'remove' + index, false)
        })
      }
    }
  }
}
</script>
