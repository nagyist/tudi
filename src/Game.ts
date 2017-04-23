import * as PIXI from 'pixi.js'
import Scene from './Scene'
// import System from './Systems/System'
// import RenderSystem from './Systems/RenderSystem'

/**
 * The Game handles operation of the entire game (duh).
 * It runs the update loop and dispatches other lifetime
 * events.
 *
 * @export
 * @class Game
 */
export default class Game {
  // systems: System[]
  private renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer
  private scene: Scene
  private lastTimestamp: number = -1
  private isPlaying: boolean = false

  constructor (width: number, height: number, scene?: Scene) {
    this.renderer = PIXI.autoDetectRenderer(width, height)
    this.scene = scene ? scene : new Scene([], [])
    // this.systems = [
    //   new RenderSystem(this.scene, width, height),
    // ]
    // document.body.appendChild(this.renderer.view)

    this.update = this.update.bind(this)
  }

  async start (scene?: Scene): Promise<void> {
    this.scene = scene || this.scene
    this.isPlaying = true
    await this.setup()
  }

  private async setup (): Promise<void> {
    // for (const system of this.systems) {
    //   system.setup()
    // }
    await this.scene.setup()
    this.update()
  }

  private update (timestamp: number = 0): void {
    if (this.isPlaying) {
      requestAnimationFrame(this.update)
    }

    let dt: number = 0
    if (this.lastTimestamp < 0) {
      this.lastTimestamp = timestamp
    } else {
      dt = timestamp - this.lastTimestamp
    }

    this.scene.update(dt)
    // for (const system of this.systems) {
    //   system.update(dt)
    // }
    this.renderer.render(this.scene.stage)
  }

  stop (): void {
    this.isPlaying = false
  }
}
