export const render = (ctx: CanvasRenderingContext2D, ...messages: Message[]) => {
    const { canvas } = ctx

    messages.forEach(({ content, fontSize = Math.min(canvas.width, canvas.height) * 0.08 }, i) => {
        const x = canvas.width / 2
        const y = (canvas.height / 2) - (messages.length * fontSize / 2) + (i * fontSize)

        ctx.fillStyle = '#fff'
        ctx.font = `${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        // ctx.textBaseline = 'middle'
        ctx.fillText(content, x, y)
    })
}

export interface Message {
    content: string
    fontSize?: number
    lineHeightRatio?: number
}
