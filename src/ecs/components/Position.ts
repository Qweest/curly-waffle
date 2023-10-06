import { Component } from '@ecs/index'

class Position extends Component {
  constructor(
    public x: number,
    public y: number,
  ) {
    super()
  }
}

export default Position
