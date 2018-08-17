import { combineLatest, fromEvent } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import * as fromBackground from './background/index'
import { Star } from './background/star'
import { PLAYER_Y_FROM_BOTTOM } from './settings'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const drawTriangle = (x: number, y: number, width: number, color: string, direction: 'up' | 'down') => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - width, y)
    ctx.lineTo(x, direction === 'up' ? y - width : y + width)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x - width, y)
    ctx.fill()
}

const renderPlayer = ({ x, y }: Position) => {
    drawTriangle(x, y, 20, '#0066ff', 'up')
}

const renderAll = ({ stars, playerPosition }: { stars: Star[], playerPosition: Position }) => {
    fromBackground.renderer(ctx, canvas)(stars)
    renderPlayer(playerPosition)
}

const mouseMove = fromEvent<MouseEvent>(canvas, 'mousemove')

const playerMove = mouseMove.pipe(
    map<MouseEvent, Position>(event => ({
        x: event.clientX,
        y: canvas.height - PLAYER_Y_FROM_BOTTOM,
    })),
    startWith<Position>({
        x: canvas.width / 2,
        y: canvas.height - PLAYER_Y_FROM_BOTTOM,
    }),
)

const game = combineLatest(
    fromBackground.createStars(canvas),
    playerMove,
).pipe(
    map(([stars, playerPosition]) => ({ stars, playerPosition })),
).subscribe(renderAll)

export interface Position {
    x: number
    y: number
}
