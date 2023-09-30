class Damager extends System {
  componentsRequired = new Set<Function>([Health])

  public entitiesSeenLastUpdate: number = -1

  update(entities: Set<Entity>) {
    this.entitiesSeenLastUpdate = entities.size
  }
}
