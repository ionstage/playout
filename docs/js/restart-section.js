import { Section } from './app.js'

export class RestartSection extends Section {
  constructor () {
    super({ name: 's-restart', height: 264 })
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
