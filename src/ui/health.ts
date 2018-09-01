import { BehaviorSubject } from 'rxjs'
import { scan } from 'rxjs/operators'

export const MAX_HEALTH = 3

export const render = (ctx: CanvasRenderingContext2D, health: number) => {
    ctx.fillStyle = '#fff'
    ctx.font = '5vmin'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${'♥'.repeat(health)}${'♡'.repeat(MAX_HEALTH - health)}`, 20, 65)
}

export const healthSubject = new BehaviorSubject(3)

export const health$ = healthSubject.pipe(
    scan((prev, current) => prev + current),
)
