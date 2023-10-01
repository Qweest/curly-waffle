import { Component } from '@ecs/index'

class Health extends Component {
  constructor(
    private _current: number,
    private _maximum: number,
  ) {
    super()
  }

  set current(value: number) {
    this._current = value
    this.dirty()
  }
  get current() {
    return this._current
  }

  set maximum(value: number) {
    this._maximum = value
    this.dirty()
  }
  get maximum() {
    return this._maximum
  }
}

export default Health
