import { Observable } from 'rxjs'
import { scan, withLatestFrom } from 'rxjs/operators'

import { Position } from '../shared/position'
import { createIsVisible, drawTriangle, randomInterval$, randomNumber } from '../shared/utils'
import * as fromEnemies from './'

export const MIN_SHOOTING_FREQUENCY = 1000
export const MAX_SHOOTING_FREQUENCY = 3000
export const SPEED = fromEnemies.SPEED * 2

export const createEnemyShots = (canvas: HTMLCanvasElement, enemies$: Observable<Position[]>) => {
    const isVisible = createIsVisible(canvas)

    return randomInterval$(MIN_SHOOTING_FREQUENCY, MAX_SHOOTING_FREQUENCY).pipe(
        withLatestFrom(enemies$),
        scan<[number, Position[]], Position[]>((shots, [, enemies]) => {
            const { x, y } = enemies[randomNumber(0, enemies.length - 1)]

            return shots
                .concat({ x, y: y + 12 }) // spawn shot at the nose of the enemy
                .filter(isVisible)
        },
        [] as Position[]),
    )
}

export const render = (ctx: CanvasRenderingContext2D, shots: Position[]) => {
    shots.forEach(shot => {
        shot.y += SPEED
        drawTriangle(ctx, shot.x, shot.y, 5, '#ffffcc', 'down')
    })
}
