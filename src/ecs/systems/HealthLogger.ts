import Components from '@ecs/components'
import { Entity, System } from '@ecs/index'

class HealthLogger extends System {
  componentsRequired = new Set([Components.Health, Components.Name])
  dirtyComponents = new Set([Components.Health])

  update(entities: Set<Entity>, dirty: Set<Entity>) {
    for (const entity of dirty) {
      const health = this.ecs.getComponents(entity).get(Components.Health)
      const name = this.ecs.getComponents(entity).get(Components.Name)
      console.log(`${name} health: ${health.current}/${health.maximum}`)
    }
  }
}

export default HealthLogger
