import { Observable } from 'rxjs'
import { scan } from 'rxjs/operators'

import { Position } from '../shared/position'
import { createIsVisible, drawTriangle, randomInterval$ } from '../shared/utils'

export const MIN_SPAWN_FREQUENCY = 1000
export const MAX_SPAWN_FREQUENCY = 2000
export const START_Y = -30

export const createEnemies = (canvas: HTMLCanvasElement): Observable<Position[]> => {
    const isVisible = createIsVisible(canvas)

    return randomInterval$(MIN_SPAWN_FREQUENCY, MAX_SPAWN_FREQUENCY).pipe(
        scan(enemies => enemies
            .concat({
                x: Math.floor(Math.random() * canvas.width),
                y: START_Y,
            })
            .filter(isVisible),
        [] as Position[]),
    )
}

export const render = (ctx: CanvasRenderingContext2D, enemies: Position[]) => {
    enemies.forEach(enemy => {
        enemy.y += 5
        drawTriangle(ctx, enemy.x, enemy.y, 20, '#ff3333', 'down')
    })
}
