<template lang="pug">
item-detail(v-bind:line="line")
</template>

<script type="text/babel">
import ItemDetail from './ItemDetail.vue';
import {SESSION} from '../user/UserService';
import getLine from './getLine.gql';
import AnalyticsMixin from '../utils/piwik';

export default {
	props: ['type'],
	mixins: [AnalyticsMixin],
	components: {
		'item-detail': ItemDetail
	},
	name: 'item-creation',
	data() {
		return {
			title: trans('items:item.title_creation'),
			line: {
				label: '',
				type: this.type
			}
		};
	},
	beforeRouteEnter(to, from, next) {
		if (!SESSION.authenticated) {
			return next('/login');
		};
		return next();
	}
}
</script>
