export const render = (ctx: CanvasRenderingContext2D, message: string) => {
    const { canvas } = ctx

    ctx.fillStyle = '#fff'
    ctx.font = '10vmin sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(message, canvas.width / 2, canvas.height / 2)
}
