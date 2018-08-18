import { fromEvent } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { Position } from '../shared/position'
import { drawTriangle } from '../shared/utils'

export const PLAYER_Y_FROM_BOTTOM = 30

export const createPlayer = (canvas: HTMLCanvasElement) => {
    return fromEvent<MouseEvent>(canvas, 'mousemove').pipe(
        map<MouseEvent, Position>(event => ({
            x: event.clientX,
            y: canvas.height - PLAYER_Y_FROM_BOTTOM,
        })),
        startWith<Position>({
            x: canvas.width / 2,
            y: canvas.height - PLAYER_Y_FROM_BOTTOM,
        }),
    )
}

export const render = (ctx: CanvasRenderingContext2D, { x, y }: Position) => {
    drawTriangle(ctx, x, y, 20, '#0066ff', 'up')
}
