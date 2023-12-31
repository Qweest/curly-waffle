import FPSManager from '@scripts/FPSManager'
import InputManager from '@scripts/InputManager'
import { MAX_FPS } from '@shared/constants'
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'

class MainScene {
  private static instance: MainScene

  private readonly renderer = new WebGLRenderer()
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera()
  private readonly player = new Mesh()

  private constructor() {
    this.animate = this.animate.bind(this)
  }

  static getInstance() {
    if (!MainScene.instance) {
      MainScene.instance = new MainScene()
    }

    return MainScene.instance
  }

  start() {
    this.camera.fov = 75
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.near = 0.1
    this.camera.far = 1000

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0x00ff00 })
    this.player.geometry = geometry
    this.player.material = material
    this.scene.add(this.player)

    this.camera.position.z = 5

    const fpsManager = new FPSManager(MAX_FPS, this.animate)
    fpsManager.start()

    const inputManager = InputManager.getInstance()
    inputManager.start()
  }

  private animate() {
    this.player.rotation.x += 0.01
    this.player.rotation.y += 0.01

    this.renderer.render(this.scene, this.camera)
  }
}

export default MainScene
