import Vue from 'vue'
import Hello from '@/components/page/About'

describe('About.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Hello)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.header').textContent).to.equal('about.title')
  })
})
