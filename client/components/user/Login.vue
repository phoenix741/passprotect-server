<template lang="pug">
	v-layout(row,wrap)
		v-flex(xs12,md6,offset-md3)
			v-card
				v-card-text
					v-text-field.mt-5(
						:label="trans('user:login.form.username.field')",
						:data-vv-as="trans('user:login.form.username.field')",
						v-validate="'required'",
						name="username",
						v-model="username",
						v-bind:rules="usernameValidation")
					v-text-field.mt-5(
						:label="trans('user:login.form.password.field')",
						:data-vv-as="trans('user:login.form.password.field')",
						type="password",
						v-validate="'required|min:8'"
						name="password"
						v-model="password"
						v-bind:rules="passwordValidation")
					.text-xs-center
						v-btn#login-button(primary,dark,v-on:click.native="submitForm()") {{ trans('user:login.dialog.button.connect') }}
					div.mt-5
						| 	{{ trans('user:login.dialog.button.noaccount') }}
						router-link#register-link(to="/register") {{ trans('user:login.dialog.button.signup') }}
</template>

<script type="text/babel">
import {login} from './UserService'
import AnalyticsMixin from '../../utils/piwik'

export default {
  name: 'login',
  mixins: [AnalyticsMixin],
  data () {
    return {
      title: this.trans('user:login.dialog.title'),
      username: '',
      password: '',
      error: {}
    }
  },
  computed: {
    usernameValidation () {
      const errors = this.veeErrors.collect('username').map(error => () => error)
      if (this.error.fieldName === 'username' || this.error.fieldName === 'global') {
        errors.push(() => this.error.message)
      }
      return errors
    },
    passwordValidation () {
      const errors = this.veeErrors.collect('password').map(error => () => error)
      if (this.error.fieldName === 'password') {
        errors.push(() => this.error.message)
      }
      return errors
    }
  },
  methods: {
    submitForm () {
      if (this.veeErrors.any()) {
        return
      }

      login(this, {username: this.username, password: this.password})
    }
  }
}
</script>
