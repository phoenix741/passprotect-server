<template lang="pug">
v-card
	v-toolbar.white--text.darken-1(v-bind:class="cardType.color")
		v-toolbar-title {{ trans(cardType.label) }}

	v-card-text
		v-layout(row,wrap)
			v-flex(xs12)
				v-text-field(
					:label="trans('items:item.form.label.field')"
					:data-vv-as="trans('items:item.form.label.field')",
					v-validate="'required'",
					name="label",
					v-model="line.label",
					v-bind:rules="labelValidation")

			v-flex(xs12)
				v-select(
					:label="trans('items:item.form.group.field')",
          v-bind:items="selectGroups",
	        v-model="line.group",
					item-text="name"
					item-value="value")
					template(slot="item",scope="data")
						template(v-if="data.item.value") {{ data.item.name }}
						div.groupSelect(v-if="!data.item.value")
							span {{ data.item.name }}

			v-flex(xs12,v-if="line.group === ''")
				v-text-field(
	        :label="trans('items:item.form.group.new')"
					v-model="newGroup")

			template(v-if="line.type == 'text'")
				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.text.field')",
						v-model="clearInformation.text",
						multi-line,
						auto-grow)

			template(v-if="line.type == 'card'")
				v-flex(xs12)
					v-select(
						:label="trans('items:item.form.type.field')",
						v-bind:items="typeOfCard",
						v-model="clearInformation.type")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.nameOnCard.field')",
						v-model="clearInformation.nameOnCard")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.cardNumber.field')",
						:append-icon="cardNumberVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (cardNumberVisibility = !cardNumberVisibility)"
						:type="cardNumberVisibility ? 'text' : 'password'"
						v-model="clearInformation.cardNumber")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.cvv.field')",
						:append-icon="cvvVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (cvvVisibility = !cvvVisibility)"
						:type="cvvVisibility ? 'text' : 'password'"
						v-model="clearInformation.cvv")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.expiry.field')",
						v-model="clearInformation.expiry")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.code.field')",
						:append-icon="codeVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (codeVisibility = !codeVisibility)"
						:type="codeVisibility ? 'text' : 'password'"
						v-model="clearInformation.code")

			template(v-if="line.type == 'password'")
				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.username.field')",
						v-model="clearInformation.username")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.password.field')",
						:append-icon="passwordVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (passwordVisibility = !passwordVisibility)"
						:type="passwordVisibility ? 'text' : 'password'"
						v-model="clearInformation.password")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.siteUrl.field')",
						v-model="clearInformation.siteUrl")

			v-flex(xs12)
				v-text-field(
					:label="trans('items:item.form.notes.field')",
					v-model="clearInformation.notes",
					multi-line,
					auto-grow)

			v-flex(xs12)
				.text-xs-center
					v-btn(primary,dark,v-on:click.native="submitForm()") {{ trans('items:item.form.button.field') }}
					template(v-if="line.type == 'password'")
						v-spacer
						v-btn(primary,dark,v-on:click.native="generatePassword()") {{ trans('items:item.form.button.generate') }}
</template>

<script type="text/babel">
import {pick, map} from 'lodash'
import {cardTypeMapping, updateLine, decryptLine, encryptLine, generate} from './ItemService'
import getGroups from './getGroups.gql'

export default {
  props: ['line'],
  name: 'item-detail',
  data () {
    return {
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
    submitForm () {
      if (this.veeErrors.any()) {
        return
      }

      const line = pick(this.line, ['_id', 'type', 'label', 'group', '_rev'])

      if (this.newGroup) {
        line.group = this.newGroup
      }

      encryptLine(this.clearInformation)
        .then(encryptedInformation => (line.encryption = encryptedInformation))
        .then(() => updateLine(this, line))
        .then(() => this.$router.push('/items'))
    },
    generatePassword () {
      generate().then(password => (this.clearInformation.password = password))
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
      return cardTypeMapping[this.line.type || 'text']
    }
  },
  watch: {
    line: {
      immediate: true,
      handler: function (val) {
        if (!val.type) {
          val = {type: 'text'}
        }
        decryptLine(val).then(newValue => (this.clearInformation = newValue))
      }
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
