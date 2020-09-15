import { Section } from '../app.js'

export class RestartSection extends Section {
  constructor (props) {
    super(Object.assign({ height: 264 }, props))
  }

  render () {
    const el = super.render()
    el.classList.add('s-restart')
    el.classList.add('hide')
    el.innerHTML = '<a href="index.html" class="s-restart-button">Restart</a>'
    return el
  }

  async load () {
    await new Promise(resolve => setTimeout(resolve, 100))
    this.element.classList.remove('hide')
  }
}
