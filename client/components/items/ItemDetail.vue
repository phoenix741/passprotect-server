<template lang="pug">
v-card.detail-card
	v-toolbar.white--text.darken-1(v-bind:class="cardType.color")
		v-toolbar-title#title-label {{ trans(cardType.label) }}

	v-card-text
		v-layout(row,wrap)
			v-flex(xs12)
				v-text-field#label-input(
					:label="trans('items:item.form.label.field')"
					:data-vv-as="trans('items:item.form.label.field')",
					v-validate="'required'",
					name="label",
					v-model="lineToModify.label",
					v-bind:rules="labelValidation")

			v-flex(xs12)
				v-select#group-select(
					:label="trans('items:item.form.group.field')",
					v-bind:items="selectGroups",
					v-model="lineToModify.group",
					item-text="name"
					item-value="value")
					template(slot="item",scope="data")
						template(v-if="data.item.value") {{ data.item.name }}
						div.groupSelect(v-if="!data.item.value")
							span#empty-item {{ data.item.name }}

			v-flex(xs12,v-if="lineToModify.group === ''")
				v-text-field#group-input(
					:label="trans('items:item.form.group.new')"
					v-model="newGroup")

			template(v-if="lineToModify.type == 'text'")
				v-flex(xs12)
					v-text-field#text-input(
						:label="trans('items:item.form.text.field')",
						v-model="clearInformation.text",
						multi-line,
						auto-grow)

			template(v-if="lineToModify.type == 'card'")
				v-flex(xs12)
					v-select#type-of-card-select(
						:label="trans('items:item.form.type.field')",
						v-bind:items="typeOfCard",
						v-model="clearInformation.type")

				v-flex(xs12)
					v-text-field#name-on-card-input(
						:label="trans('items:item.form.nameOnCard.field')",
						v-model="clearInformation.nameOnCard")

				v-flex(xs12)
					v-text-field#card-number-input(
						:label="trans('items:item.form.cardNumber.field')",
						:append-icon="cardNumberVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (cardNumberVisibility = !cardNumberVisibility)"
						:type="cardNumberVisibility ? 'text' : 'password'"
						v-model="clearInformation.cardNumber")

				v-flex(xs12)
					v-text-field#cvv-input(
						:label="trans('items:item.form.cvv.field')",
						:append-icon="cvvVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (cvvVisibility = !cvvVisibility)"
						:type="cvvVisibility ? 'text' : 'password'"
						v-model="clearInformation.cvv")

				v-flex(xs12)
					v-text-field#expiry-input(
						:label="trans('items:item.form.expiry.field')",
						v-model="clearInformation.expiry")

				v-flex(xs12)
					v-text-field#code-input(
						:label="trans('items:item.form.code.field')",
						:append-icon="codeVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (codeVisibility = !codeVisibility)"
						:type="codeVisibility ? 'text' : 'password'"
						v-model="clearInformation.code")

			template(v-if="lineToModify.type == 'password'")
				v-flex(xs12)
					v-text-field#username-input(
						:label="trans('items:item.form.username.field')",
						v-model="clearInformation.username")

				v-flex(xs12)
					v-text-field#password-input(
						:label="trans('items:item.form.password.field')",
						:append-icon="passwordVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (passwordVisibility = !passwordVisibility)"
						:type="passwordVisibility ? 'text' : 'password'"
						v-model="clearInformation.password")

				v-flex(xs12)
					v-text-field#siteurl-input(
						:label="trans('items:item.form.siteUrl.field')",
						v-model="clearInformation.siteUrl")

			v-flex(xs12)
				v-text-field#notes-input(
					:label="trans('items:item.form.notes.field')",
					v-model="clearInformation.notes",
					multi-line,
					auto-grow)

			v-flex(xs12)
				.text-xs-center
					v-btn#detail-button(primary,dark,v-on:click.native="submitForm()") {{ trans('items:item.form.button.field') }}
					template(v-if="lineToModify.type == 'password'")
						v-spacer
						v-btn(primary,dark,v-on:click.native="generatePassword()") {{ trans('items:item.form.button.generate') }}
</template>

<script type="text/babel">
import {pick, map, cloneDeep} from 'lodash'
import {cardTypeMapping, updateLine, decryptLine, encryptLine, generate} from './ItemService'
import getGroups from './getGroups.gql'

export default {
  props: ['line'],
  name: 'item-detail',
  data () {
    return {
      lineToModify: cloneDeep(this.line),
      cardNumberVisibility: false,
      cvvVisibility: false,
      codeVisibility: false,
      passwordVisibility: false,
      clearInformation: {},
      typeOfCard: this.trans('items:item.form.type.options').split('+'),
      error: {},
      groups: [],
      newGroup: ''
    }
  },
  apollo: {
    groups: getGroups
  },
  methods: {
    async submitForm () {
      if (this.veeErrors.any()) {
        return
      }

      const line = pick(this.lineToModify, ['_id', 'type', 'label', 'group', '_rev'])

      if (this.newGroup) {
        line.group = this.newGroup
      }

      line.encryption = await encryptLine(this.clearInformation)

      await updateLine(this, line)
      this.$router.push('/items')
    },
    async generatePassword () {
      this.clearInformation.password = await generate()
    },
    async decryptClearInformation (val) {
      if (!val.type) {
        val = {type: 'text'}
      }
      this.clearInformation = await decryptLine(val)
    }
  },
  computed: {
    labelValidation () {
      const errors = this.veeErrors.collect('label').map(error => () => error)
      if (this.error.fieldName === 'label' || this.error.fieldName === 'global') {
        errors.push(() => this.error.message)
      }
      return errors
    },
    selectGroups () {
      const result = map(this.groups, g => ({name: g, value: g}))
      result.push({value: '', name: this.trans('items:item.form.group.newItem')})
      return result
    },
    cardType () {
      return cardTypeMapping[this.lineToModify.type || 'text']
    }
  },
  watch: {
    lineToModify: {
      immediate: true,
      handler: async val => this.decryptClearInformation(val)
    }
  }
}
</script>

<style>
.groupSelect {
	width:100%;
	text-align:center;
	border-bottom: 1px solid #000;
	line-height:0.1em;
	margin:10px 0 20px;
}

.groupSelect span {
	background:#fff;
	padding:0 10px;
}
</style>
