import Health from '@ecs/components/Health'
import Name from '@ecs/components/Name'
import { Entity, System } from '@ecs/index'

class HealthLogger extends System {
  componentsRequired = new Set([Health, Name])
  dirtyComponents = new Set([Health])

  update(entities: Set<Entity>, dirty: Set<Entity>) {
    for (const entity of dirty) {
      const health = this.ecs.getComponents(entity).get(Health)
      const name = this.ecs.getComponents(entity).get(Name)
      console.log(`${name} health: ${health.current}/${health.maximum}`)
    }
  }
}

export default HealthLogger
