<template lang="pug">
div
  v-toolbar(color="primary",dark,app)
    v-btn(icon,exact,router=true,to="/login")
      v-icon arrow_back
    v-toolbar-title.ml-0.pl-3
      span {{ trans('app.title') }} - {{ trans('user:register.form.title') }}

  form(@submit.prevent="submit()")
    v-container(grid-list-md)
      v-layout(row,wrap)
        v-flex(xs12)
          v-layout(row,wrap)
            v-flex(xs12)
              v-text-field.mt-5(
                :label="trans('user:register.form.identity_username.field')",
                :data-vv-as="trans('user:register.form.identity_username.field')",
                v-model="username",
                :error-messages="errors.collect('username')",
                v-validate="'required'",
                data-vv-name="username",
                name="username",
                required)

            v-flex(xs12,md6)
              v-text-field.mt-5(
                :label="trans('user:register.form.identity_password1.field')",
                :data-vv-as="trans('user:register.form.identity_password1.field')",
                v-model="password",
                type="password",
                :error-messages="errors.collect('password')",
                v-validate="'required|min:8'",
                name="password",
                data-vv-name="password"
                required)

            v-flex(xs12,md6)
              v-text-field.mt-5(
                :label="trans('user:register.form.identity_password2.field')",
                :data-vv-as="trans('user:register.form.identity_password2.field')",
                v-model="passwordRepeat"
                type="password",
                :error-messages="errors.collect('passwordRepeat')",
                v-validate="'required|min:8|confirmed:password'"
                name="passwordRepeat"
                data-vv-name="passwordRepeat"
                required)

          .text-xs-center
            v-btn.register-button(type="primary",dark,color="primary") {{ trans('user:register.form.validation.field') }}
</template>

<script type="text/babel">
import {signup} from './UserService'
import AnalyticsMixin from '../../utils/piwik'

export default {
  $validates: true,
  name: 'register',
  mixins: [AnalyticsMixin],
  data () {
    return {
      title: this.trans('user:register.form.title'),
      username: '',
      password: '',
      passwordRepeat: ''
    }
  },
  methods: {
    async submit () {
      const valid = await this.$validator.validateAll()
      if (!valid) {
        return
      }

      signup(this, {username: this.username, password: this.password})
    }
  }
}
</script>
