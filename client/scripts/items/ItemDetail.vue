<template lang="pug">
v-card
	v-card-row.darken-1(v-bind:class="cardType.color")
		v-card-title
			span.white--text {{ trans(cardType.label) }}
			v-spacer
	v-card-text
		v-layout(row,wrap)
			v-flex(xs12)
				v-text-field(
					:label="trans('items:item.form.label.field')"
					:data-vv-as="trans('items:item.form.label.field')",
					v-validate="'required'",
					name="label",
					prepend-icon="content_copy",
					:prepend-icon-cb="() => copyToClipboard(line.label)"
					v-model="line.label",
					v-bind:rules="labelValidation")

			template(v-if="line.type == 'text'")
				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.text.field')",
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.text)"
						v-model="clearInformation.text",
						multi-line,
						auto-grow)

			template(v-if="line.type == 'card'")
				v-flex(xs12)
					v-select(
						:label="trans('items:item.form.type.field')",
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.type)"
						v-bind:items="typeOfCard",
						v-model="clearInformation.type")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.nameOnCard.field')",
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.nameOnCard)"
						v-model="clearInformation.nameOnCard")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.cardNumber.field')",
						:append-icon="cardNumberVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (cardNumberVisibility = !cardNumberVisibility)"
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.cardNumber)"
						:type="cardNumberVisibility ? 'text' : 'password'"
						v-model="clearInformation.cardNumber")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.cvv.field')",
						:append-icon="cvvVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (cvvVisibility = !cvvVisibility)"
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.cvv)"
						:type="cvvVisibility ? 'text' : 'password'"
						v-model="clearInformation.cvv")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.expiry.field')",
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.expiry)"
						v-model="clearInformation.expiry")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.code.field')",
						:append-icon="codeVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (codeVisibility = !codeVisibility)"
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.code)"
						:type="codeVisibility ? 'text' : 'password'"
						v-model="clearInformation.code")

			template(v-if="line.type == 'password'")
				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.username.field')",
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.username)"
						v-model="clearInformation.username")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.password.field')",
						:append-icon="passwordVisibility ? 'visibility' : 'visibility_off'"
						:append-icon-cb="() => (passwordVisibility = !passwordVisibility)"
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.password)"
						:type="passwordVisibility ? 'text' : 'password'"
						v-model="clearInformation.password")

				v-flex(xs12)
					v-text-field(
						:label="trans('items:item.form.siteUrl.field')",
						prepend-icon="content_copy",
						:prepend-icon-cb="() => copyToClipboard(clearInformation.siteUrl)"
						v-model="clearInformation.siteUrl")

			v-flex(xs12)
				v-text-field(
					:label="trans('items:item.form.notes.field')",
					prepend-icon="content_copy",
					:prepend-icon-cb="() => copyToClipboard(clearInformation.notes)"
					v-model="clearInformation.notes",
					multi-line,
					auto-grow)

			v-flex(xs12)
				.text-xs-center
					v-btn(primary,light,v-on:click.native="submitForm()") {{ trans('items:item.form.button.field') }}
</template>

<script type="text/babel">
import copy from 'clipboard-copy';
import {pick} from 'lodash';
import {cardTypeMapping, updateLine, decryptLine, encryptLine} from './ItemService';

export default {
	props: ['line'],
	name: 'item-detail',
	data() {
		return {
			cardNumberVisibility: false,
			cvvVisibility: false,
			codeVisibility: false,
			passwordVisibility: false,
			clearInformation: {},
			typeOfCard: this.trans('items:item.form.type.options').split('+'),
			error: {}
		};
	},
	methods: {
		submitForm() {
			if (this.veeErrors.any()) {
				return;
			}

			const line = pick(this.line, ['_id', 'type', 'label', '_rev']);

			encryptLine(this.clearInformation)
				.then(encryptedInformation => (line.encryption = encryptedInformation))
				.then(() => updateLine(this, line))
				.then(() => this.$router.push('/items'));
		},
		copyToClipboard(label) {
			copy(label);
		}
	},
	computed: {
		labelValidation() {
			const errors = this.veeErrors.collect('label').map(error => () => error);
			if (this.error.fieldName === 'label' || this.error.fieldName === 'global') {
				errors.push(() => this.error.message);
			}
			return errors;
		},
		cardType() {
			return cardTypeMapping[this.line.type || 'text'];
		}
	},
	watch: {
		line: function(val) {
			decryptLine(val).then(newValue => this.clearInformation = newValue);
		}
	}
}
</script>
