import { of, timer } from 'rxjs'
import { concatMap, repeat } from 'rxjs/operators'
import { Position } from './position'

export const drawTriangle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    color: string,
    direction: 'up' | 'down',
) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - width, y)
    ctx.lineTo(x, direction === 'up' ? y - width : y + width)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x - width, y)
    ctx.fill()
}

export const randomNumber = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1)) + min

export const randomInterval$ = (min: number, max: number) => of(0).pipe(
    concatMap(() => timer(randomNumber(min, max))),
    repeat(),
)

export const createIsVisible = (canvas: HTMLCanvasElement) => (position: Position) => {
    return position.x > -40 &&
        position.x < canvas.width + 40 &&
        position.y > -40 &&
        position.y < canvas.height + 40
}

export const collision = (target1: Position, target2: Position) => {
    ​return (
        target1.x > target2.x - 20 &&
        target1.x < target2.x + 20 &&
        (target1.y > target2.y - 20 && target1.y < target2.y + 20)
    )
}

export const moveOutsideView = (actor: Position) => {
    actor.x = actor.y = -100
}
