import { combineLatest, fromEvent, interval, range } from 'rxjs'
import { map, mapTo, mergeMap, startWith, toArray } from 'rxjs/operators'
import { PLAYER_Y_FROM_BOTTOM, SPEED, START_COUNT } from './settings'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const drawTriangle = (x: number, y: number, width: number, color: string, direction: 'up' | 'down') => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - width, y)
    ctx.lineTo(x, direction === 'up' ? y - width : y + width)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x - width, y)
    ctx.fill()
}

const renderBackground = (stars: Star[]) => {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#ffffff'
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size)
    })
}

const renderPlayer = ({ x, y }: Position) => {
    drawTriangle(x, y, 20, '#0066ff', 'up')
}

const renderAll = ({ stars, playerPosition }: { stars: Star[], playerPosition: Position }) => {
    renderBackground(stars)
    renderPlayer(playerPosition)
}

const background = range(1, START_COUNT).pipe(
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
)

const mouseMove = fromEvent<MouseEvent>(canvas, 'mousemove')

const playerMove = mouseMove.pipe(
    map<MouseEvent, Position>(event => ({
        x: event.clientX,
        y: canvas.height - PLAYER_Y_FROM_BOTTOM,
    })),
    startWith<Position>({
        x: canvas.width / 2,
        y: canvas.height - PLAYER_Y_FROM_BOTTOM,
    }),
)

const game = combineLatest(
    background,
    playerMove,
).pipe(
    map(([stars, playerPosition]) => ({ stars, playerPosition })),
).subscribe(renderAll)

interface Position {
    x: number
    y: number
}

interface Star extends Position {
    size: number
}
