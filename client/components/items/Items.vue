<template lang="pug">
div.cardList
  h4 {{ trans('items:list.title') }}

  v-card
    v-toolbar.indigo.darken-4
      v-text-field.search-input(solo,v-on:input="search",prepend-icon="search")

    v-container
      v-list#items-list(two-line)
        template(v-for="(lines, title, index) in linesByGroup")
          v-subheader.group-title(v-text="title")
          v-list-tile(v-for="(line, index) in lines",:key="line._id",v-on:click="showDetail(line, $event)",avatar)
            v-list-tile-avatar
              v-icon.white--text(:class="cardType(line).color") {{ cardType(line).icon }}
            v-list-tile-content
              v-list-tile-title.line-title {{ line.label }}
              v-list-tile-sub-title.line-type {{ trans(cardType(line).label) }}
            v-list-tile-action
              v-dialog(v-model="dialog['remove' + index]")
                v-btn(icon,ripple,slot="activator")
                  v-icon.grey--text.text--lighten-1 delete
                v-card
                  v-card-title
                    .headline {{ trans('items:alert.confirm_remove.title') }}
                  v-card-text {{ trans('items:alert.confirm_remove.message', {title: line.label}) }}
                  v-card-actions
                    v-spacer
                    v-btn.delete-btn.green--text.darken-1(flat="flat",v-on:click.native="dialog['remove' + index] = false") {{ trans('items:alert.confirm_remove.disagree') }}
                    v-btn.delete-btn.green--text.darken-1(flat="flat",v-on:click.native="remove(line, index)") {{ trans('items:alert.confirm_remove.agree') }}
          v-divider(inset,v-if="index != groupCount - 1")

    v-speed-dial(:bottom="true",:right="true",:hover="true",:fixed="true")
      v-btn#items-add-button.red.darken-2(slot="activator",dark,fab,hover)
        v-icon add
        v-icon close
      v-btn#items-add-card-button.red(fab,dark,small,v-on:click.native="createCreditCard()")
        v-icon credit_card
      v-btn#items-add-password-button.blue(fab,dark,small,v-on:click.native="createFingerPrint()")
        v-icon fingerprint
      v-btn#items-add-text-button.green(fab,dark,small,v-on:click.native="createTextFields()")
        v-icon text_fields
</template>

<script type="text/babel">
/* global trans */

import {SESSION} from '../user/UserService'
import {cardTypeMapping, removeLine} from './ItemService'
import {bus} from './ItemsBus'
import getLines from './getLines.gql'
import {filter, groupBy, size, debounce} from 'lodash'
import AnalyticsMixin from '../../utils/piwik'

export default {
  name: 'items',
  mixins: [AnalyticsMixin],
  created () {
    bus.$on('search-items', value => (this.filter = value))
  },
  data () {
    return {
      title: trans('items:list.title'),
      showOptions: false,
      dialog: {},
      filter: ''
    }
  },
  computed: {
    linesByGroup () {
      const searchFilter = !!this.filter && new RegExp('^' + this.filter)
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
    createCreditCard () {
      this.$router.push('/items/type/card')
    },
    createFingerPrint () {
      this.$router.push('/items/type/password')
    },
    createTextFields () {
      this.$router.push('/items/type/text')
    },
    remove (line, index) {
      this.dialog['remove' + index] = false
      removeLine(this, line._id)
    },
    showDetail (line, $event) {
      if (!$event.target.className.match(/\bdelete-btn\b/)) {
        this.$router.push('/items/' + line._id)
      }
    },
    cardType (line) {
      line = line || {}
      return cardTypeMapping[line.type || 'text']
    },
    search: debounce(value => bus.$emit('search-items', value), 500)
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
