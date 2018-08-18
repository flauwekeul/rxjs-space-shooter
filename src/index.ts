import { combineLatest } from 'rxjs'
import { sampleTime, share, startWith } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromEnemieShots from './enemies/shots'
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
const enemies$ = fromEnemies.createEnemies(canvas).pipe(
    share(),
)
const enemieShots$ = fromEnemieShots.createEnemyShots(canvas, enemies$)

combineLatest(
    stars$,
    player$,
    enemies$,
    playerShots$.pipe(
        // start with a fake shot or else combineLatest won't emit
        startWith([{} as Position]),
    ),
    enemieShots$,
).pipe(
    sampleTime(GAME_SPEED),
).subscribe(([stars, player, enemies, playerShots, enemyShots]) => {
    fromBackground.render(ctx, canvas, stars)
    fromPlayer.render(ctx, player)
    fromEnemies.render(ctx, enemies)
    fromPlayerShots.render(ctx, playerShots)
    fromEnemieShots.render(ctx, enemyShots)
})
