import { WebEdit } from './webedit.custom.js'

class Stylist {
  constructor () {
    this.element = document.createElement('style')
  }

  activate (rules) {
    document.head.appendChild(this.element)
    rules.forEach((rule, index) => this.element.sheet.insertRule(rule, index))
  }

  deactivate () {
    document.head.removeChild(this.element)
  }
}

class Component {
  render (s) {
    const el = document.createRange().createContextualFragment(s).firstChild
    el.parentNode.removeChild(el)
    return el
  }
}

class Frame extends Component {
  constructor () {
    super()
    this.element = this.render(Frame.HTML_TEXT)
  }

  enable () {
    document.body.appendChild(this.element)
  }

  show () {
    this.element.classList.remove('_editable_hide')
  }

  hide () {
    this.element.classList.add('_editable_hide')
  }

  static get HTML_TEXT () {
    return [
      '<div class="_editable_frame_container _editable_hide">',
      '<div class="_editable_frame"></div>',
      '<div class="_editable_frame _editable_frame_right"></div>',
      '</div>'
    ].join('')
  }
}

class PropControl {
  constructor (props) {
    this.element = props.element
    this.oninput = props.oninput
    this.isSelected = false
  }

  set value (value) {
    this.element.value = value
  }

  get value () {
    return this.element.value
  }

  enable () {
    this.element.addEventListener('input', this.oninput)
    this.element.addEventListener('blur', this.onblur.bind(this))
    this.element.addEventListener('click', this.onclick.bind(this))
  }

  onblur () {
    this.isSelected = false
  }

  onclick () {
    if (!this.isSelected && this.element.selectionStart === this.element.selectionEnd) {
      this.element.select()
      this.isSelected = true
    }
  }
}

class EditableObject {
  constructor (props) {
    this.stageObject = null
    this.onregister = props.onregister
    this.onunregister = props.onunregister
  }

  get isRegistered () {
    return !!this.stageObject
  }

  contains (element) {
    if (!this.stageObject) {
      return false
    }
    return element === this.stageObject.element
  }

  setPosition (x, y) {
    if (!this.stageObject) {
      return
    }
    this.stageObject.element.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
  }

  getPosition () {
    if (!this.stageObject) {
      return null
    }
    const transform = window.getComputedStyle(this.stageObject.element).transform
    const pair = transform.split(',').slice(4)
    return {
      x: parseInt(pair[0], 10),
      y: parseInt(pair[1], 10)
    }
  }

  setWidth (width) {
    if (!this.stageObject) {
      return
    }
    this.stageObject.element.style.width = width + 'px'
  }

  setHeight (height) {
    if (!this.stageObject) {
      return
    }
    this.stageObject.element.style.height = height + 'px'
  }

  getWidth () {
    if (!this.stageObject) {
      return null
    }
    return parseInt(window.getComputedStyle(this.stageObject.element).width, 10)
  }

  getHeight () {
    if (!this.stageObject) {
      return null
    }
    return parseInt(window.getComputedStyle(this.stageObject.element).height, 10)
  }

  register (stageObject) {
    if (!stageObject || this.stageObject) {
      return
    }
    this.stageObject = stageObject
    this.stageObject.element.classList.toggle('_webedit_target', true)
    this.onregister()
  }

  unregister () {
    if (!this.stageObject) {
      return
    }
    this.stageObject.element.classList.toggle('_webedit_target', false)
    this.onunregister()
    this.stageObject = null
  }
}

class Controls extends Component {
  constructor (props) {
    super()
    this.app = props.app
    this.frame = props.frame
    this.element = this.render(Controls.HTML_TEXT)
    this.frameCheckElement = this.element.querySelector('._editable_frame_check_input')
    this.gridCheckElement = this.element.querySelector('._editable_grid_check_input')
    this.snapToGridCheckElement = this.element.querySelector('._editable_snap_to_grid_check_input')
    this.selectElement = this.element.querySelector('._editable_object_select')
    this.onpositioninput = this.onpositioninput.bind(this)
    this.onwidthinput = this.onwidthinput.bind(this)
    this.propX = new PropControl({ element: this.element.querySelector('._editable_object_prop_x'), oninput: this.onpositioninput })
    this.propY = new PropControl({ element: this.element.querySelector('._editable_object_prop_y'), oninput: this.onpositioninput })
    this.propW = new PropControl({ element: this.element.querySelector('._editable_object_prop_w'), oninput: this.onwidthinput })
    this.propH = new PropControl({ element: this.element.querySelector('._editable_object_prop_h'), oninput: this.onheightinput })
    this.sectionSelectElement = this.element.querySelector('._editable_section_select')
    this.copyButton = this.element.querySelector('._editable_copy_button')
    this.copyInputElement = this.element.querySelector('._editable_copy_input')
    this.saveButton = this.element.querySelector('._editable_save_button')
    this.saveLink = this.element.querySelector('._editable_save_link')
    this.editableObject = new EditableObject({ onregister: this.onregister.bind(this), onunregister: this.onunregister.bind(this) })

    this.frameCheckElement.checked = (sessionStorage.getItem('_editable_frame') === 'true')
    this.updateFrame()
    this.gridCheckElement.checked = (sessionStorage.getItem('_editable_grid') === 'true')
    this.updateGrid()
    this.snapToGridCheckElement.checked = (sessionStorage.getItem('_editable_snapToGrid') === 'true')
    this.updateSnapToGrid()
  }

  get objects () {
    const elements = document.querySelectorAll('[data-object-name]')
    return Array.from(elements).reduce((ret, element) => {
      ret[element.dataset.objectName] = { element }
      return ret
    }, {})
  }

  get objectNames () {
    return Object.keys(this.objects).sort()
  }

  createOptionElement (name) {
    const el = document.createElement('option')
    el.setAttribute('value', name)
    el.textContent = name
    return el
  }

  enable () {
    document.body.appendChild(this.element)
    this.updateFrame()
    this.frameCheckElement.addEventListener('change', () => this.updateFrame())
    this.gridCheckElement.addEventListener('change', () => this.updateGrid())
    this.snapToGridCheckElement.addEventListener('change', () => this.updateSnapToGrid())
    this.selectElement.addEventListener('change', () => this.selectObject())
    this.selectElement.addEventListener('focus', () => this.updateSelect())
    this.sectionSelectElement.addEventListener('focus', () => this.updateSection())
    this.copyButton.addEventListener('click', () => this.copy())
    this.saveButton.addEventListener('click', () => this.save())
    this.propX.enable()
    this.propY.enable()
    this.propW.enable()
    this.propH.enable()
  }

  updateFrame () {
    if (this.frameCheckElement.checked) {
      this.frame.show()
    } else {
      this.frame.hide()
    }
    sessionStorage.setItem('_editable_frame', this.frameCheckElement.checked)
  }

  updateGrid () {
    document.body.classList.toggle('_editable_grid', this.gridCheckElement.checked)
    sessionStorage.setItem('_editable_grid', this.gridCheckElement.checked)
  }

  updateSnapToGrid () {
    if (this.snapToGridCheckElement.checked) {
      document.body.dataset._webedit_snap = 24
    } else {
      delete document.body.dataset._webedit_snap
    }
    sessionStorage.setItem('_editable_snapToGrid', this.snapToGridCheckElement.checked)
  }

  selectObject () {
    const name = this.selectElement.value
    const stageObject = name ? this.objects[name] : null
    this.editableObject.unregister()
    this.editableObject.register(stageObject)
    this.selectElement.blur()
  }

  updateSelect () {
    this.editableObject.unregister()
    this.selectElement.innerHTML = '<option></option>'
    this.objectNames.forEach(name => this.selectElement.appendChild(this.createOptionElement(name)))
  }

  updateSection () {
    this.sectionSelectElement.innerHTML = '<option></option>'
    this.app.sections.forEach((section) => this.sectionSelectElement.appendChild(this.createOptionElement(section.name)))
  }

  copy () {
    const name = this.sectionSelectElement.value
    const section = this.app.sections.find(section => section.name === name)
    if (!section) {
      return
    }
    this.copyInputElement.value = JSON.stringify(section, null, 2)
    this.copyInputElement.select()
    document.execCommand('copy')
  }

  save () {
    const name = this.sectionSelectElement.value
    const section = this.app.sections.find(section => section.name === name)
    if (!section) {
      return
    }
    const blob = new Blob([JSON.stringify(section, null, 2)], { type: 'octet/stream' })
    const url = URL.createObjectURL(blob)
    this.saveLink.href = url
    this.saveLink.download = name + '.json'
    this.saveLink.target = '_blank'
    this.saveLink.click()
    URL.revokeObjectURL(url)
  }

  updateProps () {
    const position = this.editableObject.getPosition()
    this.propX.value = position.x
    this.propY.value = position.y
    this.propW.value = this.editableObject.getWidth()
    this.propH.value = this.editableObject.getHeight()
  }

  updatePropsWithElement (element) {
    if (!this.editableObject.contains(element)) {
      return
    }
    this.updateProps()
  }

  resetProps () {
    this.propX.value = ''
    this.propY.value = ''
    this.propW.value = ''
    this.propH.value = ''
  }

  onpositioninput () {
    const x = this.propX.value
    const y = this.propY.value
    if (x !== '' && y !== '') {
      this.editableObject.setPosition(x, y)
    }
  }

  onwidthinput () {
    const width = this.propW.value
    if (width !== '') {
      this.editableObject.setWidth(width)
    }
  }

  onheightinput () {
    const height = this.propH.value
    if (height !== '') {
      this.editableObject.setHeight(height)
    }
  }

  onregister () {
    this.updateProps()
  }

  onunregister () {
    this.resetProps()
  }

  static get HTML_TEXT () {
    return [
      '<div class="_editable_controls">',
      '<label class="_editable_check_label">',
      '<input class="_editable_check_input _editable_frame_check_input" type="checkbox">',
      '<span class="_editable_check_text">Frame</span>',
      '</label>',
      '<label class="_editable_check_label">',
      '<input class="_editable_check_input _editable_grid_check_input" type="checkbox">',
      '<span class="_editable_check_text">Grid</span>',
      '</label>',
      '<label class="_editable_check_label">',
      '<input class="_editable_check_input _editable_snap_to_grid_check_input" type="checkbox">',
      '<span class="_editable_check_text">Snap to Grid</span>',
      '</label>',
      '<div class="_editable_object">',
      '<label class="_editable_object_label">',
      '<span class="_editable_object_text">Object:</span>',
      '<select class="_editable_object_select"><option value=""></option></select>',
      '</label>',
      '<div class="_editable_object_props">',
      'x=<input class="_editable_object_prop_x" type="number">',
      'y=<input class="_editable_object_prop_y" type="number">',
      'w=<input class="_editable_object_prop_w" type="number">',
      'h=<input class="_editable_object_prop_h" type="number">',
      '</div>',
      '</div>',
      '<label class="_editable_section_label">',
      '<span class="_editable_section_text">Section:</span>',
      '<select class="_editable_section_select"><option value=""></option></select>',
      '</label>',
      '<button class="_editable_copy_button">Copy</button>',
      '<textarea class="_editable_copy_input"></textarea>',
      '<button class="_editable_save_button">Save</button>',
      '<a class="_editable_save_link"></a>',
      '</div>'
    ].join('')
  }
}

export class Editable {
  constructor (props) {
    this.app = props.app
    this.stylist = new Stylist()
    this.frame = new Frame()
    this.controls = new Controls({ app: this.app, frame: this.frame })
    this.webedit = new WebEdit({ onchange: this.controls.updatePropsWithElement.bind(this.controls) })
  }

  static get GRID_SVG () {
    return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="smallGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#757575" stroke-width="0.5" />
        </pattern>
        <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill="url(#smallGrid)" />
          <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#757575" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>`.replace(/\r?\n/g, '')
  }

  static get CSS_RULES () {
    return [
      `body {
        pointer-events: none;
      }`,
      `._editable_hide {
        opacity: 0;
      }`,
      `._editable_frame_container {
        left: 0;
        position: fixed;
        top: 0;
        transition: opacity .1s ease-in-out;
        width: 100vw;
      }`,
      `._editable_frame {
        background-color: #212121;
        height: 100vh;
        position: absolute;
        width: calc(50vw - 300px);
      }`,
      `._editable_frame_right {
        right: 0;
      }`,
      `._editable_grid .section {
        background-image: url('data:image/svg+xml;base64,${window.btoa(Editable.GRID_SVG)}');
        background-position: right .5px bottom .5px;
      }`,
      `._editable_grid .frame {
        opacity: .6;
      }`,
      `._editable_controls {
        background-color: #9e9e9e;
        bottom: 0;
        font-family: Helvetica, Arial, sans-serif;
        height: 48px;
        left: 0;
        opacity: 0.6;
        overflow-x: auto;
        pointer-events: auto;
        position: fixed;
        white-space: nowrap;
        width: 100vw;
      }`,
      `._editable_check_label {
        display: inline-block;
        height: 100%;
        margin: 0 12px;
        vertical-align: middle;
      }`,
      `._editable_check_input {
        margin: 0 4px;
        vertical-align: middle;
      }`,
      `._editable_check_text {
        line-height: 48px;
        vertical-align: middle;
      }`,
      `._editable_object {
        display: inline-block;
        height: 100%;
        margin: 0 24px;
        vertical-align: middle;
      }`,
      `._editable_object_label, ._editable_section_label  {
        display: inline-block;
        height: 100%;
        vertical-align: middle;
      }`,
      `._editable_object_text, ._editable_section_text {
        line-height: 48px;
        vertical-align: middle;
      }`,
      `._editable_object_select, ._editable_section_select {
        margin: 0 12px;
        vertical-align: middle;
      }`,
      `._editable_object_props {
        display: inline-block;
        vertical-align: middle;
      }`,
      `._editable_object_props input {
        margin: 0 8px 0 4px;
        text-align: right;
        width: 60px;
      }`,
      `._editable_copy_input {
        height: 0;
        opacity: 0;
        width: 0;
      }`
    ]
  }

  enable () {
    this.stylist.activate(Editable.CSS_RULES)
    this.frame.enable()
    this.controls.enable()
    this.webedit.enable()
  }
}
