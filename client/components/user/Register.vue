<template lang="pug">
	v-layout(row,wrap)
		v-flex(xs12)
			h4.main-title {{ trans('user:register.form.title') }}

			v-layout(row,wrap)
				v-flex(xs12)
					v-text-field.mt-5(
						:label="trans('user:register.form.identity_username.field')",
						:data-vv-as="trans('user:register.form.identity_username.field')",
						v-validate="'required'",
						name="username",
						v-model="username",
						v-bind:rules="usernameValidation")

				v-flex(xs12,md6)
					v-text-field.mt-5(
						:label="trans('user:register.form.identity_password1.field')",
						:data-vv-as="trans('user:register.form.identity_password1.field')",
						type="password",
						v-validate="'required|min:8'"
						name="password"
						v-model="password"
						v-bind:rules="passwordValidation")

				v-flex(xs12,md6)
					v-text-field.mt-5(
						:label="trans('user:register.form.identity_password2.field')",
						:data-vv-as="trans('user:register.form.identity_password2.field')",
						type="password",
						v-validate="'required|min:8|confirmed:password'"
						name="passwordRepeat"
						v-model="passwordRepeat"
						v-bind:rules="passwordRepeatValidation")

			.text-xs-center
				v-btn(primary,light,v-on:click.native="submitForm()") {{ trans('user:register.form.validation.field') }}
</template>

<script type="text/babel">
import {signup} from './UserService'
import AnalyticsMixin from '../../utils/piwik'

export default {
  name: 'register',
  mixins: [AnalyticsMixin],
  data () {
    return {
      title: this.trans('user:register.form.title'),
      username: '',
      password: '',
      passwordRepeat: '',
      error: {}
    }
  },
  computed: {
    usernameValidation () {
      const errors = this.veeErrors.collect('username').map(error => () => error)
      if (this.error.fieldName === '_id' || this.error.fieldName === 'global') {
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
    },
    passwordRepeatValidation () {
      return this.veeErrors.collect('passwordRepeat').map(error => () => error)
    }
  },
  methods: {
    submitForm () {
      if (this.veeErrors.any()) {
        return
      }

      signup(this, {username: this.username, password: this.password})
    }
  }
}
</script>
