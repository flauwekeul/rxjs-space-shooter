import { combineLatest } from 'rxjs'
import { sampleTime } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromPlayer from './player'

const GAME_SPEED = 40

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

combineLatest(
    fromBackground.createStars(canvas),
    fromPlayer.createPlayer(canvas),
    fromEnemies.createEnemies(canvas),
).pipe(
    sampleTime(GAME_SPEED),
).subscribe(([stars, playerPosition, enemies]) => {
    fromBackground.render(ctx, canvas, stars)
    fromPlayer.render(ctx, playerPosition)
    fromEnemies.render(ctx, enemies)
})
