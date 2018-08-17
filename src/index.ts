import { interval, range } from 'rxjs'
import { map, mapTo, mergeMap, toArray } from 'rxjs/operators'
import { SPEED, START_COUNT } from './settings'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const paintStars = (stars: Star[]) => {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#ffffff'
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size)
    })
}

const starStream = range(1, START_COUNT).pipe(
    map<number, Star>(() => ({
        x: Math.floor(Math.random() * canvas.width),
        y: Math.floor(Math.random() * canvas.height),
        size: Math.random() * 3 + 1,
    })),
    toArray(),
    mergeMap(stars => interval(SPEED).pipe(
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
).subscribe(paintStars)

interface Star {
    x: number
    y: number
    size: number
}
