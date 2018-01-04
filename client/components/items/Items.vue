<template lang="pug">
div
  v-list(two-line)
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
import {SESSION} from '../user/UserService'
import {cardTypeMapping, removeLine} from './ItemService'
import getLines from './getLines.gql'
import {filter, groupBy, size} from 'lodash'
import AnalyticsMixin from '../../utils/piwik'

export default {
  name: 'items',
  mixins: [AnalyticsMixin],
  props: ['q'],
  data () {
    return {
      title: this.trans('items:list.title'),
      showOptions: false,
      dialog: {},
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
