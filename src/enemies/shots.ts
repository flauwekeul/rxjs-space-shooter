import { interval, Observable } from 'rxjs'
import { concatMap, scan, take, withLatestFrom } from 'rxjs/operators'

import { Position } from '../shared/position'
import { createIsVisible, drawTriangle, randomNumber } from '../shared/utils'
import * as fromEnemies from './'

export const SPEED = fromEnemies.SPEED * 2

export const createEnemyShots = (canvas: HTMLCanvasElement, enemies$: Observable<Position[]>) => {
    const isVisible = createIsVisible(canvas)

    return enemies$.pipe(
        /**
         * the more enemies, the faster they'll shoot
         * the interval is:
         * - 3000ms for 1 enemy
         * - 2000ms for 3 enemies
         * - 1500ms for 7 enemies
         * - approaching 1000ms
         */
        concatMap(enemies => interval(1 / (enemies.length + 1) * 4000 + 1000).pipe(take(1))),
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
