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
