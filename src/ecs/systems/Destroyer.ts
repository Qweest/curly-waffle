class Destroyer extends System {
  componentsRequired = new Set<Function>([Health])

  update(entities: Set<Entity>) {
    for (let entity of entities) {
      this.ecs.removeEntity(entity)
    }
  }
}
