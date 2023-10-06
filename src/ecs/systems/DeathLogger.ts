import Components from '@ecs/components'
import { Entity, System } from '@ecs/index'

class DeathLogger extends System {
  componentsRequired = new Set([Components.Health, Components.Name])
  dirtyComponents = new Set([Components.Health])

  update(entities: Set<Entity>, dirty: Set<Entity>): void {
    for (const entity of dirty) {
      const health = this.ecs.getComponents(entity).get(Components.Health)
      if (health.current <= 0) {
        const name = this.ecs.getComponents(entity).get(Components.Name)
        console.log(`Entity ${name} is dead`)
      }
    }
  }
}

export default DeathLogger
