export class Section {
  constructor (props) {
    this.name = props.name
    this.height = props.height
    this.className = (typeof props.className !== 'undefined' ? props.className : '')
    this.element = this.render()
  }

  render () {
    const el = document.createElement('div')
    el.className = 'section ' + this.name + ' ' + this.className
    el.style.height = this.height + 'px'
    return el
  }

  /* template */
  async load () {}

  async unload () {
    return new Promise(resolve => {
      this.element.addEventListener('transitionend', () => resolve())
      this.element.classList.add('hide')
    })
  }

  toJSON () {
    return {
      name: this.name,
      height: this.height
    }
  }
}

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
    await section.unload()
    document.body.removeChild(section.element)
  }

  async editable () {
    const { Editable } = await new Function("return import('./editable/editable.js')")() // eslint-disable-line no-new-func
    new Editable({ app: this }).enable()
  }
}
