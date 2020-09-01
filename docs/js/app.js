class FrameCaption {
  constructor (props) {
    this.name = props.name
    this.fullName = props.parentName + '.' + props.name
    this.crop = (typeof props.crop !== 'undefined' ? props.crop : true)
    this.element = this.createElement(props)
    this.contentElement = this.createContentElement(props, this.element)
  }

  createElement (props) {
    const el = document.createElement('div')
    el.className = 'caption ' + props.name
    return el
  }

  createContentElement (props, parent) {
    const el = document.createElement('div')
    el.className = 'caption-content'
    el.innerHTML = props.html
    el.dataset.objectName = this.fullName
    el.style.transform = 'translate3d(' + props.x + 'px, ' + props.y + 'px, 0)'
    parent.appendChild(el)
    return el
  }

  toJSON () {
    const style = window.getComputedStyle(this.contentElement)
    const transform = style.transform
    const pair = transform.split(',').slice(4)
    const obj = {
      name: this.name,
      x: parseInt(pair[0], 10),
      y: parseInt(pair[1], 10),
      html: this.contentElement.innerHTML
    }
    if (!this.crop) {
      obj.crop = false
    }
    return obj
  }
}

class FrameImage {
  constructor (props) {
    this.name = props.name
    this.src = props.src
    this.fullName = props.parentName + '.' + props.name
    this.crop = (typeof props.crop !== 'undefined' ? props.crop : true)
    this.element = this.createElement(props)
    this.contentElement = this.createContentElement(props, this.element)
  }

  createElement (props) {
    const el = document.createElement('div')
    el.className = 'image ' + props.name
    return el
  }

  createContentElement (props, parent) {
    const el = new Image()
    el.className = 'image-content'
    el.dataset.objectName = this.fullName
    el.style.transform = 'translate3d(' + props.x + 'px, ' + props.y + 'px, 0)'
    if ('width' in props) {
      el.style.width = props.width + 'px'
    }
    if ('height' in props) {
      el.style.height = props.height + 'px'
    }
    parent.appendChild(el)
    return el
  }

  async load () {
    return new Promise((resolve, reject) => {
      this.contentElement.onload = () => resolve()
      this.contentElement.onerror = error => reject(error)
      this.contentElement.src = this.src
    })
  }

  toJSON () {
    const style = window.getComputedStyle(this.contentElement)
    const transform = style.transform
    const pair = transform.split(',').slice(4)
    const obj = {
      name: this.name,
      x: parseInt(pair[0], 10),
      y: parseInt(pair[1], 10),
      width: parseInt(style.width, 10),
      src: this.src
    }
    if (!this.crop) {
      obj.crop = false
    }
    return obj
  }
}

class Frame {
  constructor (props) {
    this.name = props.name
    this.fullName = props.parentName + '.' + props.name
    this.captions = (props.captions || []).map(props => new FrameCaption(Object.assign({ parentName: this.fullName }, props)))
    this.images = (props.images || []).map(props => new FrameImage(Object.assign({ parentName: this.fullName }, props)))
    this.element = this.createElement(props)
    this.cropElement = this.createContentElement('frame-crop', this.element)
    this.cropContentElement = this.createContentElement('frame-content', this.cropElement)
    this.contentElement = this.createContentElement('frame-content', this.element)
  }

  createElement (props) {
    const el = document.createElement('div')
    el.className = 'frame ' + props.name + ' hide'
    el.dataset.objectName = this.fullName
    el.style.transform = 'translate3d(' + props.x + 'px, ' + props.y + 'px, 0)'
    if ('width' in props) {
      el.style.width = props.width + 'px'
    }
    if ('height' in props) {
      el.style.height = props.height + 'px'
    }
    return el
  }

  createContentElement (className, parent) {
    const el = document.createElement('div')
    el.className = className
    parent.appendChild(el)
    return el
  }

  async load () {
    await Promise.all([
      this.loadCaptions(),
      this.loadImages(),
      new Promise(resolve => setTimeout(resolve, 100))
    ])
    this.element.classList.remove('hide')
  }

  async loadCaptions () {
    for (const caption of this.captions) {
      const contentElement = caption.crop ? this.cropContentElement : this.contentElement
      contentElement.appendChild(caption.element)
    }
  }

  async loadImages () {
    for (const image of this.images) {
      const contentElement = image.crop ? this.cropContentElement : this.contentElement
      contentElement.appendChild(image.element)
      await image.load()
    }
  }

  toJSON () {
    const style = window.getComputedStyle(this.element)
    const transform = style.transform
    const pair = transform.split(',').slice(4)
    const obj = {
      name: this.name,
      x: parseInt(pair[0], 10),
      y: parseInt(pair[1], 10),
      width: parseInt(style.width, 10),
      height: parseInt(style.height, 10)
    }
    if (this.captions.length > 0) {
      obj.captions = this.captions
    }
    if (this.images.length > 0) {
      obj.images = this.images
    }
    return obj
  }
}

export class Section {
  constructor (props) {
    this.name = props.name
    this.height = props.height
    this.frames = (props.frames || []).map(props => new Frame(Object.assign({ parentName: this.name }, props)))
    this.element = this.createElement(props)
  }

  createElement (props) {
    const el = document.createElement('div')
    el.className = 'section ' + this.name
    el.style.height = props.height + 'px'
    return el
  }

  async load () {
    for (const frame of this.frames) {
      this.element.appendChild(frame.element)
      await frame.load()
    }
  }

  async fadeOut () {
    return new Promise(resolve => {
      this.element.addEventListener('transitionend', () => resolve())
      this.element.classList.add('hide')
    })
  }

  toJSON () {
    return {
      name: this.name,
      height: this.height,
      frames: this.frames
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
    await section.fadeOut()
    document.body.removeChild(section.element)
  }

  async editable () {
    const { Editable } = await new Function("return import('./editable.js')")() // eslint-disable-line no-new-func
    new Editable({ app: this }).enable()
  }
}
