import Health from '@ecs/components/Health'
import { Entity, System } from '@ecs/index'

class HealthLogger extends System {
  componentsRequired = new Set([Health])
  dirtyComponents = new Set([Health])

  update(entities: Set<Entity>, dirty: Set<Entity>) {
    for (const entity of dirty) {
      const health = this.ecs.getComponents(entity).get(Health)
      console.log(`${health.current}/${health.maximum}`)
    }
  }
}

export default HealthLogger
