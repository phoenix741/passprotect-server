/* global __PIWIK_ENABLED__, _paq */

'use strict'

import {SESSION} from '../components/user/UserService'

export default {
  created () {
    this.startTracking()
  },
  mounted () {
    this.trackPage()
  },
  methods: {
    startTracking () {
      if (__PIWIK_ENABLED__) {
        this.startGenerationTimeMs = (new Date()).getTime()
      }
    },

    trackPage () {
      document.title = this.title

      if (__PIWIK_ENABLED__) {
        const timeMs = (new Date()).getTime() - this.startGenerationTimeMs
        trackPageView(this.$route.path, document.title, SESSION.username, timeMs)
      }
    }
  }
}

function trackPageView (url, title, user, generationTimeMs) {
  window._paq = window._paq || []

  _paq.push(['setCustomUrl', url])
  title && _paq.push(['setDocumentTitle', title])
  _paq.push(['setGenerationTimeMs', generationTimeMs])
  user && _paq.push(['setUserId', user])

  _paq.push(['enableLinkTracking'])
  _paq.push(['trackPageView'])
}
