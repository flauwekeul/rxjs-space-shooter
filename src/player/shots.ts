import { combineLatest, fromEvent, merge, Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, scan, throttleTime, timestamp } from 'rxjs/operators'

import { PLAYER_Y_FROM_BOTTOM } from '.'
import { Position } from '../shared/position'
import { collision, drawTriangle } from '../shared/utils'

export const SHOOTING_SPEED = 15

const createShotEvents = (canvas: HTMLCanvasElement) => merge(
    fromEvent(canvas, 'click'),
    fromEvent<KeyboardEvent>(document, 'keydown').pipe(
        filter(({ keyCode }) => keyCode === 32 /* space */),
    ),
).pipe(
    throttleTime(200),
    timestamp(),
)

export const createPlayerShots = (canvas: HTMLCanvasElement, player$: Observable<Position>) => combineLatest(
    createShotEvents(canvas),
    player$,
).pipe(
    map(([shot, { x }]) => ({ x, timestamp: shot.timestamp })),
    distinctUntilChanged((a, b) => a.timestamp === b.timestamp),
    scan<{ x: number, timestamp: number }, Position[]>((shots, shot) => shots.concat({
        x: shot.x,
        y: canvas.height - PLAYER_Y_FROM_BOTTOM,
    }), [] as Position[]),
)

export const render = (ctx: CanvasRenderingContext2D, shots: Position[], enemies: Position[]) => {
    shots.forEach(shot => {
        for (const enemy of enemies) {
            if (collision(shot, enemy)) {
                // put outside canvas, will be removed next tick
                enemy.x = enemy.y = -100
                shot.x = shot.y = -100
                return
            }
        }

        shot.y -= SHOOTING_SPEED
        drawTriangle(ctx, shot.x, shot.y, 5, '#ffffcc', 'up')
    })
}