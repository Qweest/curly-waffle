class FPSManager {
  private readonly callback: () => void
  private readonly interval: number
  private then: DOMHighResTimeStamp = 0

  constructor(fps: number, callback: () => void) {
    this.interval = 1000 / fps
    this.callback = callback

    this.animate = this.animate.bind(this)
  }

  start() {
    this.animate(0)
  }

  private animate(timestamp: DOMHighResTimeStamp) {
    requestAnimationFrame(this.animate)

    if (!this.then) {
      this.then = timestamp
    }

    const delta = timestamp - this.then

    if (delta > this.interval) {
      this.then = timestamp - (delta % this.interval)
      this.callback()
    }
  }
}

export default FPSManager
