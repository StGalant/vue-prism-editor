import { mount } from '@vue/test-utils'
import Component from '@/components/Component.vue'

describe('Logo', () => {
  it('is a Vue instance', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
