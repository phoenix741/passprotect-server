<template lang="pug">
v-card
	v-card-row.darken-1(v-bind:class="cardType.color")
		v-card-title
			span.white--text {{ trans(cardType.label) }}
			v-spacer
			v-btn.white--text(icon="icon",slot="activator",router=true,:to="'/items/' + line._id + '/edit'")
				v-icon mode_edit

	v-list(two-line)
		v-list-item
			v-list-tile
				v-list-tile-action
					v-icon.indigo--text label
				v-list-tile-content
					v-list-tile-title {{ line.label }}
					v-list-tile-sub-title {{ trans('items:item.form.label.field') }}

	v-divider(inset)
	v-list(three-line,v-if="line.type == 'text' && clearInformation.text")
		v-list-item
			v-list-tile
				v-list-tile-action
					v-icon.indigo--text text_fields
				v-list-tile-content
					v-list-tile-title {{ trans('items:item.form.text.field') }}
					v-list-tile-sub-title {{ clearInformation.text }}
				v-list-tile-action
					v-icon(dark,v-on:click="copyToClipboard(clearInformation.text)") content_copy

	template(v-if="line.type == 'card'")
		v-list(two-line)
			v-list-item(v-if="clearInformation.type")
				v-list-tile
					v-list-tile-action
						v-icon.indigo--text credit_card
					v-list-tile-content
						v-list-tile-title {{ clearInformation.type }}
						v-list-tile-sub-title {{ trans('items:item.form.type.field') }}
			v-list-item(v-if="clearInformation.nameOnCard")
				v-list-tile
					v-list-tile-action
						v-icon.indigo--text
					v-list-tile-content
						v-list-tile-title {{ clearInformation.nameOnCard }}
						v-list-tile-sub-title {{ trans('items:item.form.nameOnCard.field') }}
					v-list-tile-action
						v-icon(dark,v-on:click="copyToClipboard(clearInformation.nameOnCard)") content_copy
			v-list-item(v-if="clearInformation.cardNumber")
				v-list-tile
					v-list-tile-action
						v-icon.indigo--text
					v-list-tile-content
						v-list-tile-title {{ clearInformation.cardNumber }}
						v-list-tile-sub-title {{ trans('items:item.form.cardNumber.field') }}
					v-list-tile-action
						v-icon(dark,v-on:click="copyToClipboard(clearInformation.cardNumber)") content_copy
			v-list-item(v-if="clearInformation.cvv")
				v-list-tile
					v-list-tile-action
						v-icon.indigo--text
					v-list-tile-content
						v-list-tile-title {{ clearInformation.cvv }}
						v-list-tile-sub-title {{ trans('items:item.form.cvv.field') }}
					v-list-tile-action
						v-icon(dark,v-on:click="copyToClipboard(clearInformation.cvv)") content_copy
			v-list-item(v-if="clearInformation.expiry")
				v-list-tile
					v-list-tile-action
						v-icon.indigo--text
					v-list-tile-content
						v-list-tile-title {{ clearInformation.expiry }}
						v-list-tile-sub-title {{ trans('items:item.form.expiry.field') }}
					v-list-tile-action
						v-icon(dark,v-on:click="copyToClipboard(clearInformation.expiry)") content_copy

		v-divider(inset)
		v-list(two-line)
			v-list-item(v-if="clearInformation.code")
				v-list-tile
					v-list-tile-action
						v-icon.indigo--text vpn_key
					v-list-tile-content
						v-list-tile-title {{ clearInformation.code }}
						v-list-tile-sub-title {{ trans('items:item.form.code.field') }}

	template(v-if="line.type == 'password'")
		v-list(two-line)
			v-list-tile(v-if="clearInformation.username")
				v-list-tile-action
					v-icon.indigo--text lock
				v-list-tile-content
					v-list-tile-title {{ clearInformation.username }}
					v-list-tile-sub-title {{ trans('items:item.form.username.field') }}
				v-list-tile-action
					v-icon(dark,v-on:click="copyToClipboard(clearInformation.username)") content_copy

			v-list-tile(v-if="clearInformation.password")
				v-list-tile-action
					v-icon.indigo--text
				v-list-tile-content
					v-list-tile-title {{ clearInformation.password }}
					v-list-tile-sub-title {{ trans('items:item.form.password.field') }}
				v-list-tile-action
					v-icon(dark,v-on:click="copyToClipboard(clearInformation.password)") content_copy

		v-divider(inset)
		v-list(two-line)
			v-list-tile(v-if="clearInformation.siteUrl")
				v-list-tile-action
					v-icon.indigo--text web
				v-list-tile-content
					v-list-tile-title {{ clearInformation.siteUrl }}
					v-list-tile-sub-title {{ trans('items:item.form.siteUrl.field') }}
				v-list-tile-action
					v-icon(dark,v-on:click="copyToClipboard(clearInformation.siteUrl)") content_copy

	v-divider(inset)
	v-list(three-line,v-if="clearInformation.notes")
		v-list-tile
			v-list-tile-action
				v-icon.indigo--text note
			v-list-tile-content
				v-list-tile-title {{ trans('items:item.form.notes.field') }}
				v-list-tile-sub-title {{ clearInformation.notes }}
</template>

<script type="text/babel">
/* global trans */

import copy from 'clipboard-copy'
import {SESSION} from '../user/UserService'
import getLine from './getLine.gql'
import AnalyticsMixin from '../../utils/piwik'
import {cardTypeMapping, decryptLine} from './ItemService'

export default {
  props: ['id'],
  mixins: [AnalyticsMixin],
  name: 'item-visualisation',
  data () {
    return {
      title: trans('items:item.title_visualisation'),
      line: {},
      clearInformation: {}
    }
  },
  methods: {
    copyToClipboard (label) {
      copy(label)
    }
  },
  beforeRouteEnter (to, from, next) {
    if (!SESSION.authenticated) {
      return next('/login')
    }
    return next()
  },
  computed: {
    cardType () {
      return cardTypeMapping[this.line.type || 'text']
    }
  },
  watch: {
    line (val) {
      decryptLine(val).then(newValue => (this.clearInformation = newValue))
    }
  },
  apollo: {
    line: {
      query: getLine,
      variables () {
        return {
          id: this.id
        }
      }
    }
  }
}
</script>
