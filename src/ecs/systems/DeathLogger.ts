import Health from '@ecs/components/Health'
import Name from '@ecs/components/Name'
import { Entity, System } from '@ecs/index'

class DeathLogger extends System {
  componentsRequired = new Set([Health, Name])
  dirtyComponents = new Set([Health])

  update(entities: Set<Entity>, dirty: Set<Entity>): void {
    for (const entity of dirty) {
      const health = this.ecs.getComponents(entity).get(Health)
      if (health.current <= 0) {
        const name = this.ecs.getComponents(entity).get(Name)
        console.log(`Entity ${name} is dead`)
      }
    }
  }
}

export default DeathLogger
