import { SESSION } from '@/components/user/UserService'
import AnalyticsMixin from '@/utils/piwik'
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import { useFakeTimers } from 'sinon'
import Router from 'vue-router'

let MyVue = {
  mixins: [AnalyticsMixin],
  template: '<div></div>',
  data () {
    return {
      title: 'title'
    }
  }
}

describe('piwik.js', () => {
  describe('Piwik not enabled', () => {
    it('Test a vue without piwik activated', () => {
      shallow(MyVue)

      expect(document.title).to.equal('title')
      expect(window._paq).to.be.an('undefined')
    })
  })

  describe('Piwik enabled', () => {
    let clock

    beforeEach(() => {
      window.__PIWIK_ENABLED__ = true
      clock = useFakeTimers(new Date(2011, 9, 1).getTime())
    })

    afterEach(() => {
      clock.restore()
      window.__PIWIK_ENABLED__ = false
      delete window._paq
      delete SESSION.username
    })

    it('Test a vue without piwik activated', () => {
      const mockRouter = new Router({ routes: [] })
      mockRouter.push('/')

      SESSION.username && delete SESSION.username
      shallow(MyVue, { router: mockRouter })
      expect(document.title).to.equal('title')
      expect(window._paq).to.deep.equal([
        ['setCustomUrl', '/'],
        ['setDocumentTitle', 'title'],
        ['setGenerationTimeMs', 0],
        ['enableLinkTracking'],
        ['trackPageView']
      ])
    })

    it('Test with a username', () => {
      const mockRouter = new Router({ routes: [] })
      mockRouter.push('/')

      SESSION.username = 'myusername'
      shallow(MyVue, { router: mockRouter })
      expect(document.title).to.equal('title')
      expect(window._paq).to.deep.equal([
        ['setCustomUrl', '/'],
        ['setDocumentTitle', 'title'],
        ['setGenerationTimeMs', 0],
        ['setUserId', 'myusername'],
        ['enableLinkTracking'],
        ['trackPageView']
      ])
    })
  })
})
