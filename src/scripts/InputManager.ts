class InputManager {
  private static instance: InputManager

  private domElement: HTMLElement = document.body
  private activeKeys = new Set<string>()
  private activeMouse = new Set<number>()

  private constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
  }

  static getInstance() {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager()
    }

    return InputManager.instance
  }

  start() {
    this.domElement.addEventListener('keydown', this.handleKeyDown)
    this.domElement.addEventListener('keyup', this.handleKeyUp)
    this.domElement.addEventListener('mousedown', this.handleMouseDown)
    this.domElement.addEventListener('mouseup', this.handleMouseUp)
  }

  end() {
    this.domElement.removeEventListener('keydown', this.handleKeyDown)
    this.domElement.removeEventListener('keyup', this.handleKeyUp)
    this.domElement.removeEventListener('mousedown', this.handleMouseDown)
    this.domElement.removeEventListener('mouseup', this.handleMouseUp)
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.activeKeys.add(e.code)
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.activeKeys.delete(e.code)
  }

  private handleMouseDown(e: MouseEvent) {
    this.activeMouse.add(e.button)
  }

  private handleMouseUp(e: MouseEvent) {
    this.activeMouse.delete(e.button)
  }
}

export default InputManager
