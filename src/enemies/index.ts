import { interval, Observable } from 'rxjs'
import { scan } from 'rxjs/operators'

import { Position } from '../shared/position'
import { drawTriangle } from '../shared/utils'

export const ENEMY_FREQUENCY = 1500
export const ENEMY_START_Y = -30

export const render = (ctx: CanvasRenderingContext2D, enemies: Position[]) => {
    enemies.forEach(enemy => {
        enemy.y += 5
        drawTriangle(ctx, enemy.x, enemy.y, 20, '#ff3333', 'down')
    })
}

export const createEnemies = (canvas: HTMLCanvasElement): Observable<Position[]> => interval(ENEMY_FREQUENCY).pipe(
    scan(enemies => enemies.concat({
        x: Math.floor(Math.random() * canvas.width),
        y: ENEMY_START_Y,
    }), [] as Position[]),
)
