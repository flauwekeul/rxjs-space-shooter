import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromPlayer from './player'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

combineLatest(
    fromBackground.createStars(canvas),
    fromPlayer.createPlayer(canvas),
).pipe(
    map(([stars, playerPosition]) => ({ stars, playerPosition })),
).subscribe(({ stars, playerPosition }) => {
    fromBackground.render(ctx, canvas, stars)
    fromPlayer.render(ctx, playerPosition)
})
