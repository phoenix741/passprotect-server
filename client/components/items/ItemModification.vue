<template lang="pug">
item-detail(v-bind:line="line")
</template>

<script type="text/babel">
import ItemDetail from './ItemDetail.vue'
import {SESSION} from '../user/UserService'
import getLine from './getLine.gql'
import AnalyticsMixin from '../../utils/piwik'

export default {
  props: ['id'],
  mixins: [AnalyticsMixin],
  components: {
    'item-detail': ItemDetail
  },
  name: 'item-modification',
  data () {
    return {
      title: this.trans('items:item.title_modification'),
      line: {}
    }
  },
  beforeRouteEnter (to, from, next) {
    if (!SESSION.authenticated) {
      return next('/login')
    }
    return next()
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
