import { interval, Observable } from 'rxjs'
import { concatMap, scan, take } from 'rxjs/operators'

import { Position } from '../shared/position'
import { createIsVisible, drawTriangle } from '../shared/utils'
import { Score } from '../ui/score'

export const START_Y = -30
export const SPEED = 5

export const createEnemies = (canvas: HTMLCanvasElement, score$: Observable<Score>): Observable<Position[]> => {
    const isVisible = createIsVisible(canvas)

    return score$.pipe(
        // the higher the max score, the lower the spawn interval
        // this is a bit brittle: the interval is only created when score$ emits
        concatMap(({ max }) => interval(750000 / (max + 500)).pipe(
            take(1),
        )),
        scan<number, Position[]>(enemies => enemies
            .concat({
                x: Math.floor(Math.random() * canvas.width),
                y: START_Y,
            })
            .filter(isVisible),
        []),
    )
}

export const render = (ctx: CanvasRenderingContext2D, enemies: Position[]) => {
    enemies.forEach(enemy => {
        enemy.y += SPEED
        drawTriangle(ctx, enemy.x, enemy.y, 20, '#ff3333', 'down')
    })
}
