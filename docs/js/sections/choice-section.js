import { Section } from '../app.js'

export class ChoiceSection extends Section {
  constructor (props) {
    const height = props.options.length * 72 + 384
    super(Object.assign({ name: 's-choice', height }, props))
    this.element.innerHTML = this.createInnerHTML(props.options)
    this.buttonElement = this.element.querySelector('.s-choice-button')
    this.selectedValue = -1
    this.onchange = props.onchange
    this.onnext = props.onnext
    this.element.classList.add('hide')
    this.element.addEventListener('change', this.change.bind(this))
    this.buttonElement.addEventListener('click', this.next.bind(this))
  }

  createInnerHTML (options) {
    const optionsHTML = options.map((option, index) => {
      return `<div><label><input type="radio" name="s-choice" class="s-choice-input" value="${index}">
        <div class="s-choice-option">${option}</div>
      </label></div>`
    }).join('')
    return `<div class="s-choice-content">
      <div class="s-choice-title">Choose from options</div>
      ${optionsHTML}
    </div>
    <a href="#" class="s-choice-button disabled">
      <svg class="s-choice-button-image" height="48" viewBox="0 0 144 48" width="144" xmlns="http://www.w3.org/2000/svg">
        <path d="m1 1h119l23 23-23 23h-119z" fill="#e0e0e0"/>
        <path d="m1 1h119l23 23-23 23h-119z" fill="none" stroke="#212121" stroke-linejoin="round"/>
      </svg>
      <div class="s-choice-button-text">Next</div>
    </a>`
  }

  async load () {
    await new Promise(resolve => setTimeout(resolve, 100))
    this.element.classList.remove('hide')
  }

  change (event) {
    this.buttonElement.classList.remove('disabled')
    this.selectedValue = parseInt(event.target.value, 10)
    if (this.onchange) {
      this.onchange(this.selectedValue)
    }
  }

  next (event) {
    event.preventDefault()
    if (this.onnext) {
      this.onnext(this.selectedValue)
    }
  }
}
