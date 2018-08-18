import { Observable, timer } from 'rxjs'
import { scan } from 'rxjs/operators'

import { Position } from '../shared/position'
import { createIsVisible, drawTriangle } from '../shared/utils'

export const SPAWN_FREQUENCY = 1500
export const START_Y = -30

export const createEnemies = (canvas: HTMLCanvasElement): Observable<Position[]> => {
    const isVisible = createIsVisible(canvas)

    // emit immediately, then every SPAWN_FREQUENCY
    return timer(0, SPAWN_FREQUENCY).pipe(
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
