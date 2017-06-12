<template lang="pug">
div
	h4 {{ trans('items:list.title') }}

	v-card
		v-list(two-line)
			template(v-for="(lines, title, index) in linesByGroup")
				v-subheader(v-text="title")
				v-list-item(v-for="(line, index) in lines",:key="line._id",v-on:click="showDetail(line, $event)")
					v-list-tile(avatar)
						v-list-tile-avatar
							v-icon.white--text(:class="cardType(line).color") {{ cardType(line).icon }}
						v-list-tile-content
							v-list-tile-title {{ line.label }}
							v-list-tile-sub-title {{ trans(cardType(line).label) }}
						v-list-tile-action
							v-dialog(v-model="dialog['remove' + index]")
								v-btn(icon,ripple,slot="activator")
									v-icon.grey--text.text--lighten-1 delete
								v-card
									v-card-row
										v-card-title {{ trans('items:alert.confirm_remove.title') }}
									v-card-row
										v-card-text {{ trans('items:alert.confirm_remove.message', {title: line.label}) }}
									v-card-row(actions)
										v-btn.delete-btn.green--text.darken-1(flat="flat",v-on:click.native="dialog['remove' + index] = false") {{ trans('items:alert.confirm_remove.disagree') }}
										v-btn.delete-btn.green--text.darken-1(flat="flat",v-on:click.native="remove(line, index)") {{ trans('items:alert.confirm_remove.agree') }}
				v-divider(inset,v-if="index != groupCount - 1")

	v-btn.red(floating="floating",style="position:fixed;bottom: 45px; right: 24px;",v-on:click.native="toggleShowOptions()")
		v-icon.white--text add

	transition(name="fade")
		div(v-if="showOptions")
			v-btn.red(floating="floating",small,style="position:fixed;bottom: 233px; right: 32px;",v-on:click.native="createCreditCard()")
				v-icon.white--text.white--text credit_card
			v-btn.blue(floating="floating",small,style="position:fixed;bottom: 177px; right: 32px;",v-on:click.native="createFingerPrint()")
				v-icon.white--text fingerprint
			v-btn.green(floating="floating",small,style="position:fixed;bottom: 121px; right: 32px;",v-on:click.native="createTextFields()")
				v-icon.white--text text_fields
</template>

<script type="text/babel">
import {SESSION} from '../user/UserService';
import {cardTypeMapping, removeLine} from './ItemService';
import {bus} from './ItemsBus';
import getLines from './getLines.gql';
import getGroups from './getGroups.gql';
import {filter, map, groupBy, size} from 'lodash';
import AnalyticsMixin from '../utils/piwik';

export default {
	name: 'items',
	mixins: [AnalyticsMixin],
	created() {
		bus.$on('search-items', value => (this.filter = value));
	},
	data() {
		return {
			title: trans('items:list.title'),
			showOptions: false,
			dialog: {},
			filter: ''
		};
	},
	computed: {
		linesByGroup: function() {
			const searchFilter = !!this.filter && new RegExp('^' + this.filter);
			const filteredLines = filter(this.lines, line => {
				if (searchFilter) {
					return searchFilter.test(line.label) || searchFilter.test(line.group);
				}
				return true;
			});
			return groupBy(filteredLines, line => line.group);
		},
		groupCount: function() {
			return size(this.linesByGroup);
		}
	},
	methods: {
		toggleShowOptions() {
			this.showOptions = !this.showOptions;
		},
		createCreditCard() {
			this.showOptions = false;
			this.$router.push('/items/type/card');
		},
		createFingerPrint() {
			this.showOptions = false;
			this.$router.push('/items/type/password');
		},
		createTextFields() {
			this.showOptions = false;
			this.$router.push('/items/type/text');
		},
		remove(line, index) {
			this.dialog['remove' + index] = false
			removeLine(this, line._id);
		},
		showDetail(line, $event) {
			if (! $event.target.className.match(/\bdelete-btn\b/)) {
				this.$router.push('/items/' + line._id);
			}
		},
		cardType(line) {
			line = line || {};
			return cardTypeMapping[line.type || 'text'];
		}
	},
	beforeRouteEnter(to, from, next) {
		if (!SESSION.authenticated) {
			return next('/login');
		};
		return next();
	},
	apollo: {
		lines: {
			query: getLines,
			result({data}) {
				// Create the dialog element used for reactivity. If not the dialog will not work
				data.lines.forEach((line, index) => {
					this.$set(this.dialog, 'remove' + index, false);
				});
			}
		}
	}
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0
}
</style>
