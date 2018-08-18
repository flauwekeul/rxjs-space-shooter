import { combineLatest } from 'rxjs'
import { sampleTime, startWith } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromPlayer from './player'
import * as fromPlayerShots from './player/shots'
import { Position } from './shared/position'

const GAME_SPEED = 40

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const stars$ = fromBackground.createStars(canvas)
const player$ = fromPlayer.createPlayer(canvas)
const playerShots$ = fromPlayerShots.createPlayerShots(canvas, player$)
const enemies$ = fromEnemies.createEnemies(canvas)

combineLatest(
    stars$,
    player$,
    enemies$,
    playerShots$.pipe(
        // start with a fake shot
        startWith([{} as Position]),
    ),
).pipe(
    sampleTime(GAME_SPEED),
).subscribe(([stars, player, enemies, playerShots]) => {
    fromBackground.render(ctx, canvas, stars)
    fromPlayer.render(ctx, player)
    fromEnemies.render(ctx, enemies)
    fromPlayerShots.render(ctx, playerShots)
})
