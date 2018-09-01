import { interval, Observable } from 'rxjs'
import { scan, switchMap } from 'rxjs/operators'

import { SCORE_ENEMY_ESCAPES } from '..'
import { Position } from '../shared/position'
import { createIsVisible, drawTriangle } from '../shared/utils'
import { Score, scoreSubject } from '../ui/score'

export const START_Y = -30
export const SPEED = 5

export const createEnemies = (canvas: HTMLCanvasElement, score$: Observable<Score>): Observable<Position[]> => {
    const isVisible = createIsVisible(canvas)

    return score$.pipe(
        // the higher the max score, the lower the spawn interval
        switchMap(({ max }) => interval(1500000 / (max + 1000))),
        scan<number, Position[]>(enemies => enemies
            .concat({
                x: Math.floor(Math.random() * canvas.width),
                y: START_Y,
            })
            .map(enemy => {
                if (enemy.y >= canvas.height) {
                    scoreSubject.next(SCORE_ENEMY_ESCAPES)
                }

                return enemy
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
