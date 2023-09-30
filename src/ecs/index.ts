/**
 * An entity is just an ID. This is used to look up its associated
 * Components.
 */
type Entity = number

/**
 * A Component is a bundle of state. Each instance of a Component is
 * associated with a single Entity.
 *
 * Components have no API to fulfill.
 */
abstract class Component {}

/**
 * This type is so functions like the ComponentContainer's get(...) will
 * automatically tell TypeScript the type of the Component returned. In
 * other words, we can say get(Position) and TypeScript will know that an
 * instance of Position was returned. This is amazingly helpful.
 */
type ComponentClass<T extends Component> = new (...args: any[]) => T

/**
 * This custom container is so that calling code can provide the
 * Component *instance* when adding (e.g., add(new Position(...))), and
 * provide the Component *class* otherwise (e.g., get(Position),
 * has(Position), delete(Position)).
 *
 * Two different types used here to refer to the Component's class:
 * `Function` and `ComponentClass<T>`. We use `Function` in most cases
 * because it is simpler to write. We use `ComponentClass<T>` in the
 * `get()` method, when we want TypeScript to know the type of the
 * instance that is returned. Just think of these both as referring to
 * the same thing: the underlying class of the Component.
 */
class ComponentContainer {
  private map = new Map<Function, Component>()

  public add(component: Component): void {
    this.map.set(component.constructor, component)
  }

  public get<T extends Component>(componentClass: ComponentClass<T>): T {
    return this.map.get(componentClass) as T
  }

  public has(componentClass: Function): boolean {
    return this.map.has(componentClass)
  }

  public hasAll(componentClasses: Iterable<Function>): boolean {
    for (let cls of componentClasses) {
      if (!this.map.has(cls)) {
        return false
      }
    }

    return true
  }

  public delete(componentClass: Function): void {
    this.map.delete(componentClass)
  }
}

/**
 * A System cares about a set of Components. It will run on every Entity
 * that has that set of Components.
 *
 * A System must specify two things:
 *
 *  (1) The immutable set of Components it needs at compile time. We use the
 *      type `Function` to refer to a Component's class; i.e., `Position`
 *      (class) rather than `new Position()` (instance).
 *
 *  (2) An update() method for what to do every frame (if anything).
 */
abstract class System {
  /**
   * Set of Component classes, ALL of which are required before the
   * system is run on an entity.
   *
   * This should be defined at compile time and should never change.
   */
  public abstract componentsRequired: Set<Function>

  /**
   * update() is called on the System every frame.
   */
  public abstract update(entities: Set<Entity>): void

  /**
   * The ECS is given to all Systems. Systems contain most of the game
   * code, so they need to be able to create, mutate, and destroy
   * Entities and Components.
   */
  public ecs: ECS = new ECS()
}

/**
 * The ECS is the main driver; it's the backbone of the engine that
 * coordinates Entities, Components, and Systems. Can be one for
 * the game, or different for every level, or multiple
 * for different purposes.
 */
class ECS {
  // Main state
  private entities = new Map<Entity, ComponentContainer>()
  private systems = new Map<System, Set<Entity>>()

  // Bookkeeping for entities
  private nextEntityId = 0
  private entitiesToDestroy: Entity[] = []

  // API: Entities

  public addEntity(): Entity {
    const entity = this.nextEntityId
    this.nextEntityId++
    this.entities.set(entity, new ComponentContainer())
    return entity
  }

  /**
   * Marks `entity` for removal. The actual removal happens at the end
   * of the next `update()`. This way we avoid subtle bugs where an
   * Entity is removed mid-`update()`, with some Systems seeing it and
   * others not.
   */
  public removeEntity(entity: Entity): void {
    this.entitiesToDestroy.push(entity)
  }

  // API: Components

  public addComponent(entity: Entity, component: Component): void {
    this.entities.get(entity)?.add(component)
    this.checkE(entity)
  }

  public getComponents(entity: Entity): ComponentContainer {
    return this.entities.get(entity)!
  }

  public removeComponent(entity: Entity, componentClass: Function): void {
    this.entities.get(entity)?.delete(componentClass)
    this.checkE(entity)
  }

  // API: Systems

  public addSystem(system: System): void {
    // Checking invariant: systems should not have an empty
    // Components list, or they'll run on every entity.
    if (system.componentsRequired.size === 0) {
      console.warn('System not added: empty Components list.')
      console.warn(system)
      return
    }

    // Give system a reference to the ECS, so it can actually do
    // anything.
    system.ecs = this

    // Save system and set who it should track immediately.
    this.systems.set(system, new Set())
    for (let entity of this.entities.keys()) {
      this.checkES(entity, system)
    }
  }

  public removeSystem(system: System): void {
    this.systems.delete(system)
  }

  /**
   * This is ordinarily called once per tick (e.g., every frame). It
   * updates all Systems, then destroys any Entities that were marked
   * for removal.
   */
  public update(): void {
    // Update all systems
    for (let [system, entities] of this.systems.entries()) {
      system.update(entities)
    }

    // Remove any entities that were marked for deletion during the
    // update
    while (this.entitiesToDestroy.length > 0) {
      this.destroyEntity(this.entitiesToDestroy.pop()!)
    }
  }

  // Private methods for doing internal state checks and mutations.

  private destroyEntity(entity: Entity): void {
    this.entities.delete(entity)
    for (let entities of this.systems.values()) {
      entities.delete(entity)
    }
  }

  private checkE(entity: Entity): void {
    for (let system of this.systems.keys()) {
      this.checkES(entity, system)
    }
  }

  private checkES(entity: Entity, system: System): void {
    let have = this.entities.get(entity)
    let need = system.componentsRequired
    if (have?.hasAll(need)) {
      // Should be in system
      this.systems.get(system)?.add(entity)
    } else {
      // Should not be in system
      this.systems.get(system)?.delete(entity)
    }
  }
}
