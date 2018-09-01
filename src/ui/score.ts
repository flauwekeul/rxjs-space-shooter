import { BehaviorSubject } from 'rxjs'
import { scan } from 'rxjs/operators'

export const render = (ctx: CanvasRenderingContext2D, { current }: Score) => {
    ctx.fillStyle = '#fff'
    ctx.font = '4vmin sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Score: ${current}`, 20, 30)
}

export const scoreSubject = new BehaviorSubject(0)

export const createScore = (initialScore: number) => scoreSubject.pipe(
    scan<number, Score>(({ current, max }, scoreDiff) => {
        const score = current + scoreDiff

        return {
            current: score,
            max: Math.max(score, max),
        }
    }, { current: initialScore, max: initialScore }),
)

export interface Score {
    current: number
    max: number
}
