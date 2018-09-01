import { combineLatest, fromEvent, merge, Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, scan, throttleTime, timestamp } from 'rxjs/operators'

import { Position } from '../shared/position'
import { drawTriangle } from '../shared/utils'
import * as fromPlayer from './'

export const SPEED = 15

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
        y: canvas.height - fromPlayer.Y_FROM_BOTTOM,
    }), [] as Position[]),
)

export const render = (ctx: CanvasRenderingContext2D, shots: Position[], enemies: Position[]) => {
    for (const shot of shots) {
        shot.y -= SPEED
        drawTriangle(ctx, shot.x, shot.y, 5, '#ffffcc', 'up')
    }
}
