import { combineLatest } from 'rxjs'
import { map, sampleTime, share, startWith, takeWhile } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromEnemieShots from './enemies/shots'
import * as fromPlayer from './player'
import * as fromPlayerShots from './player/shots'
import * as fromScore from './score'
import { Position } from './shared/position'
import { collision } from './shared/utils'

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
    // share the stream so that createEnemyShots() uses the same enemies
    share(),
)
const enemieShots$ = fromEnemieShots.createEnemyShots(canvas, enemies$)
const score$ = fromScore.score$

const gameOver = (player: Position, enemies: Position[], enemyShots: Position[]) => {
    return enemies.some(enemy => collision(player, enemy)) ||
        enemyShots.some(shot => collision(player, shot))
}

combineLatest(
    stars$,
    player$,
    enemies$,
    playerShots$.pipe(
        // start with a fake shot or else combineLatest won't emit
        startWith([{} as Position]),
    ),
    enemieShots$,
    score$,
).pipe(
    sampleTime(GAME_SPEED),
    // map to object for more readable "picking" of actors
    map(([stars, player, enemies, playerShots, enemyShots, score]) => ({
        stars,
        player,
        enemies,
        playerShots,
        enemyShots,
        score,
    })),
    takeWhile(({ player, enemies, enemyShots }) => !gameOver(player, enemies, enemyShots)),
).subscribe(({ stars, player, enemies, playerShots, enemyShots, score }) => {
    fromBackground.render(ctx, canvas, stars)
    fromPlayer.render(ctx, player)
    fromEnemies.render(ctx, enemies)
    fromPlayerShots.render(ctx, playerShots, enemies)
    fromEnemieShots.render(ctx, enemyShots)
    fromScore.render(ctx, score)
})
