import { BehaviorSubject } from 'rxjs'
import { scan } from 'rxjs/operators'

export const render = (ctx: CanvasRenderingContext2D, score: number) => {
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText(`Score: ${score}`, 20, 43)
}

export const scoreSubject = new BehaviorSubject(0)

export const score$ = scoreSubject.pipe(
    scan((prev, current) => prev + current),
)
