import { Component } from '@ecs/index'

class Name extends Component {
  constructor(private _value: string) {
    super()
  }

  set(value: string) {
    this._value = value
    this.dirty()
  }

  toString() {
    return this._value
  }
}

export default Name
