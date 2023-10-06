import Components from '@ecs/components'
import { Entity, System } from '@ecs/index'

class InputMovement extends System {
  componentsRequired = new Set([Components.InputMovement, Components.Position])

  constructor() {
    super()

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)

    document.body.addEventListener('keydown', this.handleKeyDown)
    document.body.addEventListener('keyup', this.handleKeyUp)
  }

  update(entities: Set<Entity>, dirty: Set<Entity>): void {
    console.log(entities.size)
  }

  private handleKeyDown() {}

  private handleKeyUp() {}
}

export default InputMovement
