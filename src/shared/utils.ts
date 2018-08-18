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

export const createIsVisible = (canvas: HTMLCanvasElement) => (position: Position) => {
    return position.x > -40 &&
        position.x < canvas.width + 40 &&
        position.y > -40 &&
        position.y < canvas.height + 40
}
