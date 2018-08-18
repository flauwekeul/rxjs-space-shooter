import { interval, Observable } from 'rxjs'
import { scan, withLatestFrom } from 'rxjs/operators'
import { Position } from '../shared/position'
import { createIsVisible, drawTriangle } from '../shared/utils'

export const SHOOTING_FREQUENCY = 1200
export const SHOOTING_SPEED = 10

export const createEnemyShots = (canvas: HTMLCanvasElement, enemies$: Observable<Position[]>) => {
    const isVisible = createIsVisible(canvas)

    return interval(SHOOTING_FREQUENCY).pipe(
        withLatestFrom(enemies$),
        scan<[number, Position[]], Position[]>((shots, [, enemies]) => shots
            .concat(enemies.map(({ x, y }) => ({
                x,
                y: y + 12, // spawn shot at the nose of the enemy
            })))
            .filter(isVisible),
        [] as Position[]),
    )
}

export const render = (ctx: CanvasRenderingContext2D, shots: Position[]) => {
    shots.forEach(shot => {
        shot.y += SHOOTING_SPEED
        drawTriangle(ctx, shot.x, shot.y, 5, '#ffffcc', 'down')
    })
}
