import { Section } from './section.js'

export class RestartSection extends Section {
  constructor (props) {
    super(Object.assign({ name: 's-restart', height: 264 }, props))
    this.element.classList.add('hide')
    this.element.innerHTML = this.createInnerHTML()
  }

  createInnerHTML () {
    return '<a href="index.html" class="s-restart-button">Restart</a>'
  }

  async load () {
    await new Promise(resolve => setTimeout(resolve, 100))
    this.element.classList.remove('hide')
  }
}
