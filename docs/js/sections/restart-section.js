import { Section } from '../app.js'

export class RestartSection extends Section {
  constructor (props) {
    super(Object.assign({ height: 264 }, props))
    this.element.classList.add('s-restart')
    this.element.classList.add('hide')
    this.element.innerHTML = '<a href="index.html" class="s-restart-button">Restart</a>'
  }

  async load () {
    await new Promise(resolve => setTimeout(resolve, 100))
    this.element.classList.remove('hide')
  }
}
