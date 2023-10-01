import Health from '@ecs/components/Health'
import { ECS } from '@ecs/index'
import HealthLogger from '@ecs/systems/HealthLogger'

const ecs = new ECS()
ecs.addSystem(new HealthLogger())

const player = ecs.addEntity()
const playerHealth = new Health(10, 10)
ecs.addComponent(player, playerHealth)

ecs.update() // Nothing printed
playerHealth.current -= 2
ecs.update() // Should print health
ecs.update() // Nothing printed
ecs.update() // Nothing printed
ecs.update() // Nothing printed
playerHealth.current -= 2
ecs.update() // Should print health
ecs.update() // Nothing printed
ecs.update() // Nothing printed
