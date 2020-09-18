import { Section } from '../app.js'

class CaptionObject {
  constructor (props) {
    this.name = props.name
    this.crop = (typeof props.crop !== 'undefined' ? props.crop : true)
    this.element = this.createElement(props.name)

    const objectName = props.parentName + '.' + props.name
    this.contentElement = this.createContentElement(props.x, props.y, props.html, objectName, this.element)
  }

  createElement (name) {
    const el = document.createElement('div')
    el.className = 's-frame-caption ' + name
    return el
  }

  createContentElement (x, y, html, objectName, parent) {
    const el = document.createElement('div')
    el.className = 's-frame-caption-content'
    el.innerHTML = html
    el.dataset.objectName = objectName
    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
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

class ImageObject {
  constructor (props) {
    this.name = props.name
    this.src = props.src
    this.crop = (typeof props.crop !== 'undefined' ? props.crop : true)
    this.element = this.createElement(props.name)

    const objectName = props.parentName + '.' + props.name
    this.contentElement = this.createContentElement(props.x, props.y, props.width, props.height, objectName, this.element)
  }

  createElement (name) {
    const el = document.createElement('div')
    el.className = 's-frame-image ' + name
    return el
  }

  createContentElement (x, y, width, height, objectName, parent) {
    const el = new Image()
    el.className = 's-frame-image-content'
    el.dataset.objectName = objectName
    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
    if (typeof width !== 'undefined') {
      el.style.width = width + 'px'
    }
    if (typeof height !== 'undefined') {
      el.style.height = height + 'px'
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

class FrameObject {
  constructor (props) {
    this.name = props.name

    const objectName = props.parentName + '.' + props.name

    this.captions = (props.captions || []).map(props => new CaptionObject(Object.assign({ parentName: objectName }, props)))
    this.images = (props.images || []).map(props => new ImageObject(Object.assign({ parentName: objectName }, props)))

    this.element = this.createElement(props.name, props.x, props.y, props.width, props.height, objectName)
    this.cropElement = this.createContentElement('s-frame-frame-crop', this.element)
    this.cropContentElement = this.createContentElement('s-frame-frame-content', this.cropElement)
    this.contentElement = this.createContentElement('s-frame-frame-content', this.element)
  }

  createElement (name, x, y, width, height, objectName) {
    const el = document.createElement('div')
    el.className = 's-frame-frame ' + name + ' hide'
    el.dataset.objectName = objectName
    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
    if (typeof width !== 'undefined') {
      el.style.width = width + 'px'
    }
    if (typeof height !== 'undefined') {
      el.style.height = height + 'px'
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

export class FrameSection extends Section {
  constructor (props) {
    super(props)
    this.frames = (props.frames || []).map(frame => new FrameObject(Object.assign({ parentName: this.name }, frame)))
  }

  async load () {
    for (const frame of this.frames) {
      this.element.appendChild(frame.element)
      await frame.load()
    }
  }

  toJSON () {
    return Object.assign(super.toJSON(), { frames: this.frames })
  }
}
