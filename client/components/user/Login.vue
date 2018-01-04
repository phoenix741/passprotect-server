<template lang="pug">
div
  v-toolbar(color="indigo darken-4",dark,app)
    v-toolbar-title.ml-0.pl-3
      span {{ trans('app.title') }}

  form(@submit.prevent="submit()")
    v-layout(row,wrap)
      v-flex(xs12,md6,offset-md3)
        v-card
          v-card-text
            v-text-field.mt-5(
              :label="trans('user:login.form.username.field')",
              :data-vv-as="trans('user:login.form.username.field')",
              v-model="username",
              :error-messages="errors.collect('username')",
              v-validate="'required'",
              data-vv-name="username"
              name="username"
              required)
            v-text-field.mt-5(
              :label="trans('user:login.form.password.field')",
              :data-vv-as="trans('user:login.form.password.field')",
              v-model="password"
              type="password",
              :error-messages="errors.collect('password')",
              v-validate="'required|min:8'"
              data-vv-name="password"
              name="password"
              required)
            .text-xs-center
              v-btn#login-button(type="submit",dark,color="primary") {{ trans('user:login.dialog.button.connect') }}
            div.mt-5
              |   {{ trans('user:login.dialog.button.noaccount') }}
              router-link#register-link(to="/register") {{ trans('user:login.dialog.button.signup') }}
</template>

<script type="text/babel">
import {login} from './UserService'
import AnalyticsMixin from '../../utils/piwik'

export default {
  $validates: true,
  name: 'login',
  mixins: [AnalyticsMixin],
  data () {
    return {
      title: this.trans('user:login.dialog.title'),
      username: '',
      password: ''
    }
  },
  methods: {
    async submit () {
      const valid = await this.$validator.validateAll()
      if (!valid) {
        return
      }

      login(this, {username: this.username, password: this.password})
    }
  }
}
</script>
