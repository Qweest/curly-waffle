import Components from '@ecs/components'
import { ECS } from '@ecs/index'
import Systems from '@ecs/systems'

const ecs = new ECS()
ecs.addSystem(new Systems.HealthLogger())
ecs.addSystem(new Systems.DeathLogger())
ecs.addSystem(new Systems.InputMovement())

const player = ecs.addEntity()

const playerHealth = new Components.Health(10, 10)
ecs.addComponent(player, playerHealth)
const playerName = new Components.Name('Johny')
ecs.addComponent(player, playerName)

ecs.update() // Nothing printed
playerHealth.current -= 2
ecs.update() // Should print health
ecs.update() // Nothing printed
ecs.update() // Nothing printed
ecs.update() // Nothing printed
playerHealth.current = 0
ecs.update() // Should print health
ecs.update() // Nothing printed
ecs.update() // Nothing printed
