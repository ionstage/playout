export class App {
  constructor () {
    this.sections = []
  }

  async init () {
    // enable hover on touch device
    window.addEventListener('touchstart', () => {})

    // scroll to top
    await new Promise(resolve => setTimeout(resolve, 1000 / 30))
    window.scrollTo(0, 0)
  }

  async loadJSON (src) {
    return fetch(src).then(res => res.json())
  }

  async appendSection (section) {
    document.body.appendChild(section.element)
    await section.load()
    this.sections.push(section)
  }

  async removeSection (section) {
    this.sections.splice(this.sections.indexOf(section), 1)
    await section.fadeOut()
    document.body.removeChild(section.element)
  }

  async editable () {
    const { Editable } = await new Function("return import('./editable/editable.js')")() // eslint-disable-line no-new-func
    new Editable({ app: this }).enable()
  }
}
