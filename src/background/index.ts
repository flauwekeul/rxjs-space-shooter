import { range, timer } from 'rxjs'
import { map, mergeMap, toArray } from 'rxjs/operators'

import { Star } from './star'

export const STAR_COUNT = 250
export const SPEED = 40

export const createStars = (canvas: HTMLCanvasElement) => range(1, STAR_COUNT).pipe(
    map<number, Star>(() => ({
        x: Math.floor(Math.random() * canvas.width),
        y: Math.floor(Math.random() * canvas.height),
        size: Math.random() * 3 + 1,
    })),
    toArray(),
    mergeMap(stars => timer(0, SPEED).pipe(
        map(() => stars.map(star => {
            if (star.y >= canvas.height) {
                // reset star to top of screen
                star.y = 0
            }

            // move star with a speed relative to its size
            star.y += star.size

            return star
        })),
    )),
)

export const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, stars: Star[]) => {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#ffffff'
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size)
    })
}
