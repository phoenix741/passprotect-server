<template lang="pug">
div
  v-toolbar(color="primary",dark,app)
    v-btn(icon,exact,router=true,to="/items")
      v-icon arrow_back
    v-toolbar-title.ml-0.pl-3(:style="$vuetify.breakpoint.smAndUp ? 'width: 300px; min-width: 250px' : 'min-width: 72px'")
      span {{ trans('app.title') }}

  v-content
    v-container(fluid)
      h2.header {{ trans('about.title') }}

      p.caption {{ trans('about.copyright') }}

      h3 {{ trans('about.licence') }}

      p MIT License
      p Copyright (c) 2017 Ulrich Van Den Hekke

      p
      | Permission is hereby granted, free of charge, to any person obtaining a copy
      | of this software and associated documentation files (the "Software"), to deal
      | in the Software without restriction, including without limitation the rights
      | to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      | copies of the Software, and to permit persons to whom the Software is
      | furnished to do so, subject to the following conditions:

      p
      | The above copyright notice and this permission notice shall be included in all
      | copies or substantial portions of the Software.

      p
      | THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      | IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      | FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      | AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      | LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      | OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
      | SOFTWARE.
</template>

<script type="text/babel">
import AnalyticsMixin from '../../utils/piwik'

export default {
  name: 'page-about',
  mixins: [AnalyticsMixin],
  data () {
    return {
      title: this.trans('about.title')
    }
  }
}
</script>
