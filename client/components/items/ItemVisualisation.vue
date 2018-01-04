<template lang="pug">
//		v-btn#edit-button.white--text(icon,router=true,:to="'/items/' + line._id + '/edit'")
//			v-icon mode_edit
div
	v-list(two-line)
		v-list-tile
			v-list-tile-action
				v-icon.indigo--text label
			v-list-tile-content
				v-list-tile-title#label-text {{ line.label }}
				v-list-tile-sub-title {{ trans('items:item.form.label.field') }}

	v-divider(inset)
	v-list(three-line,v-if="line.type == 'text' && clearInformation.text")
		v-list-tile
			v-list-tile-action
				v-icon.indigo--text text_fields
			v-list-tile-content
				v-list-tile-title {{ trans('items:item.form.text.field') }}
				v-list-tile-sub-title#text-text {{ clearInformation.text }}
			v-list-tile-action
				v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.text)") content_copy

	template(v-if="line.type == 'card'")
		v-list(two-line)
			v-list-tile(v-if="clearInformation.type")
				v-list-tile-action
					v-icon.indigo--text credit_card
				v-list-tile-content
					v-list-tile-title#type-of-card-text {{ clearInformation.type }}
					v-list-tile-sub-title {{ trans('items:item.form.type.field') }}
			v-list-tile(v-if="clearInformation.nameOnCard")
				v-list-tile-action
					v-icon.indigo--text
				v-list-tile-content
					v-list-tile-title#name-on-card-text {{ clearInformation.nameOnCard }}
					v-list-tile-sub-title {{ trans('items:item.form.nameOnCard.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.nameOnCard)") content_copy
			v-list-tile(v-if="clearInformation.cardNumber")
				v-list-tile-action
					v-icon.indigo--text
				v-list-tile-content
					v-list-tile-title#card-number-text {{ clearInformation.cardNumber }}
					v-list-tile-sub-title {{ trans('items:item.form.cardNumber.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.cardNumber)") content_copy
			v-list-tile(v-if="clearInformation.cvv")
				v-list-tile-action
					v-icon.indigo--text
				v-list-tile-content
					v-list-tile-title#cvv-text {{ clearInformation.cvv }}
					v-list-tile-sub-title {{ trans('items:item.form.cvv.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.cvv)") content_copy
			v-list-tile(v-if="clearInformation.code")
				v-list-tile-action
					v-icon.indigo--text
				v-list-tile-content
					v-list-tile-title#code-text {{ clearInformation.code }}
					v-list-tile-sub-title {{ trans('items:item.form.code.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.code)") content_copy
			v-list-tile(v-if="clearInformation.expiry")
				v-list-tile-action
					v-icon.indigo--text
				v-list-tile-content
					v-list-tile-title#expiry-text {{ clearInformation.expiry }}
					v-list-tile-sub-title {{ trans('items:item.form.expiry.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.expiry)") content_copy

		v-divider(inset)
		v-list(two-line)
			v-list-tile(v-if="clearInformation.code")
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
					v-list-tile-title#username-text {{ clearInformation.username }}
					v-list-tile-sub-title {{ trans('items:item.form.username.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.username)") content_copy

			v-list-tile(v-if="clearInformation.password")
				v-list-tile-action
					v-icon.indigo--text
				v-list-tile-content
					v-list-tile-title#password-text {{ clearInformation.password }}
					v-list-tile-sub-title {{ trans('items:item.form.password.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.password)") content_copy

		v-divider(inset)
		v-list(two-line)
			v-list-tile(v-if="clearInformation.siteUrl")
				v-list-tile-action
					v-icon.indigo--text web
				v-list-tile-content
					v-list-tile-title#siteurl-text {{ clearInformation.siteUrl }}
					v-list-tile-sub-title {{ trans('items:item.form.siteUrl.field') }}
				v-list-tile-action
					v-icon.copy-button(dark,v-on:click="copyToClipboard(clearInformation.siteUrl)") content_copy

	v-divider(inset)
	v-list(three-line,v-if="clearInformation.notes")
		v-list-tile
			v-list-tile-action
				v-icon.indigo--text note
			v-list-tile-content
				v-list-tile-title {{ trans('items:item.form.notes.field') }}
				v-list-tile-sub-title#notes-text {{ clearInformation.notes }}
</template>

<script type="text/babel">
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
      title: this.trans('items:item.title_visualisation'),
      line: {},
      clearInformation: {}
    }
  },
  methods: {
    copyToClipboard (label) {
      copy(label)
    },
    async decryptClearInformation (val) {
      this.clearInformation = await decryptLine(val)
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
      this.decryptClearInformation(val)
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
