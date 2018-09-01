import { interval, Observable } from 'rxjs'
import { scan, switchMap } from 'rxjs/operators'

import { Position } from '../shared/position'
import { createIsVisible, drawTriangle } from '../shared/utils'
import { scoreSubject } from '../ui/score'

export const START_Y = -30
export const ENEMY_ESCAPE_PENALTY = -30

export const createEnemies = (canvas: HTMLCanvasElement, score$: Observable<number>): Observable<Position[]> => {
    const isVisible = createIsVisible(canvas)

    return score$.pipe(
        // the higher the score, the lower the spawn interval
        switchMap(score => interval(2400000 / (score + 1600))),
        scan(enemies => enemies
            .concat({
                x: Math.floor(Math.random() * canvas.width),
                y: START_Y,
            })
            .map(enemy => {
                if (enemy.y >= canvas.height) {
                    scoreSubject.next(ENEMY_ESCAPE_PENALTY)
                }

                return enemy
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
