/**
 * An entity is just an ID. This is used to look up its associated
 * Components.
 */
type Entity = number

/**
 * A Component is a bundle of state. Each instance of a Component is
 * associated with a single Entity.
 *
 * If a Component wants to support dirty Component optimization, it
 * manages its own bookkeeping of whether its state has changed,
 * and calls `dirty()` on itself when it has.
 */
abstract class Component {
  /**
   * Overridden by ECS once it tracks this Component.
   */
  dirty = () => {}
}

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

  add(component: Component): void {
    this.map.set(component.constructor, component)
  }

  get<T extends Component>(componentClass: ComponentClass<T>): T {
    return this.map.get(componentClass) as T
  }

  has(componentClass: Function): boolean {
    return this.map.has(componentClass)
  }

  hasAll(componentClasses: Iterable<Function>): boolean {
    for (const cls of componentClasses) {
      if (!this.map.has(cls)) {
        return false
      }
    }

    return true
  }

  delete(componentClass: Function): void {
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
  abstract componentsRequired: Set<Function>

  /**
   * Set of Component classes. If *ANY* of them become dirty, the
   * System will be given that Entity during its update(). Components
   * here need *not* be tracked by `componentsRequired`. To make this
   * opt-in, we default this to the empty set.
   */
  public dirtyComponents: Set<Function> = new Set()

  /**
   * update() is called on the System every frame.
   */
  abstract update(entities: Set<Entity>, dirty: Set<Entity>): void

  /**
   * The ECS is given to all Systems. Systems contain most of the game
   * code, so they need to be able to create, mutate, and destroy
   * Entities and Components.
   */
  ecs: ECS = new ECS()
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

  // Data structures for dirty Component optimization
  private dirtySystemsCare = new Map<Function, Set<System>>()
  private dirtyEntities = new Map<System, Set<Entity>>()

  // Bookkeeping for entities
  private nextEntityId = 0
  private entitiesToDestroy = new Array<Entity>()

  // API: Entities

  addEntity(): Entity {
    const entity = this.nextEntityId
    this.nextEntityId++
    this.entities.set(entity, new ComponentContainer())
    return entity
  }

  removeEntity(entity: Entity): void {
    this.entitiesToDestroy.push(entity)
  }

  // API: Components

  addComponent(entity: Entity, component: Component): void {
    this.entities.get(entity)?.add(component)
    this.checkE(entity)

    component.dirty = () => this.componentDirty(entity, component)
    component.dirty()
  }

  private componentDirty(entity: Entity, component: Component): void {
    if (!this.dirtySystemsCare.has(component.constructor)) {
      return
    }

    for (const system of this.dirtySystemsCare.get(component.constructor)!) {
      if (this.systems.get(system)?.has(entity)) {
        this.dirtyEntities.get(system)?.add(entity)
      }
    }
  }

  getComponents(entity: Entity): ComponentContainer {
    return this.entities.get(entity)!
  }

  removeComponent(entity: Entity, componentClass: Function): void {
    this.entities.get(entity)?.delete(componentClass)
    this.checkE(entity)
  }

  // API: Systems

  addSystem(system: System): void {
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
    for (const entity of this.entities.keys()) {
      this.checkES(entity, system)
    }

    // Bookkeeping for dirty Component optimization.
    for (const c of system.dirtyComponents) {
      if (!this.dirtySystemsCare.has(c)) {
        this.dirtySystemsCare.set(c, new Set())
      }

      this.dirtySystemsCare.get(c)?.add(system)
    }
    this.dirtyEntities.set(system, new Set())
  }

  /**
   * This is ordinarily called once per tick (e.g., every frame). It
   * updates all Systems, then destroys any Entities that were marked
   * for removal.
   */
  update(): void {
    // Update all systems
    for (const [system, entities] of this.systems) {
      system.update(entities, this.dirtyEntities.get(system)!)
      this.dirtyEntities.get(system)?.clear()
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
    for (const [system, entities] of this.systems) {
      entities.delete(entity)
      if (this.dirtyEntities.has(system)) {
        this.dirtyEntities.get(system)?.delete(entity)
      }
    }
  }

  private checkE(entity: Entity): void {
    for (const system of this.systems.keys()) {
      this.checkES(entity, system)
    }
  }

  private checkES(entity: Entity, system: System): void {
    const have = this.entities.get(entity)
    const need = system.componentsRequired
    if (have?.hasAll(need)) {
      // Should be in system
      this.systems.get(system)?.add(entity)
    } else {
      // Should not be in system
      this.systems.get(system)?.delete(entity)
    }
  }
}

export { ECS, Entity, Component, System }
