import { combineLatest } from 'rxjs'
import { finalize, map, sampleTime, share, startWith, takeWhile } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromEnemyShots from './enemies/shots'
import * as fromPlayer from './player'
import * as fromPlayerShots from './player/shots'
import { Position } from './shared/position'
import { collision } from './shared/utils'
import * as fromUi from './ui'

const GAME_SPEED = 40

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const score$ = fromUi.score$
const stars$ = fromBackground.createStars(canvas)
const player$ = fromPlayer.createPlayer(canvas)
const playerShots$ = fromPlayerShots.createPlayerShots(canvas, player$).pipe(
    // start with a fake shot or else combineLatest won't emit until the player shoots
    startWith([{} as Position]),
)
const enemies$ = fromEnemies.createEnemies(canvas, score$).pipe(
    // start with a fake enemy so that the stream starts immediately
    startWith([{} as Position]),
    // share the stream so that createEnemyShots() uses the same enemies
    share(),
)
const enemyShots$ = fromEnemyShots.createEnemyShots(canvas, enemies$).pipe(
    // start with a fake shot so that the stream starts immediately
    startWith([{} as Position]),
)

const gameOver = (player: Position, enemies: Position[], enemyShots: Position[], score: number) => {
    return score < 0 ||
        enemies.some(enemy => collision(player, enemy)) ||
        enemyShots.some(shot => collision(player, shot))
}

combineLatest(
    stars$,
    player$,
    enemies$,
    playerShots$,
    enemyShots$,
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
    takeWhile(({ player, enemies, enemyShots, score }) => !gameOver(player, enemies, enemyShots, score)),
    finalize(() => {
        canvas.classList.remove('playing')
        fromUi.renderMessage(ctx, 'GAME OVER')
    }),
).subscribe(({ stars, player, enemies, playerShots, enemyShots, score }) => {
    canvas.classList.add('playing')

    fromBackground.render(ctx, stars)
    fromPlayer.render(ctx, player)
    fromEnemies.render(ctx, enemies)
    fromPlayerShots.render(ctx, playerShots, enemies)
    fromEnemyShots.render(ctx, enemyShots)
    fromUi.renderScore(ctx, score)
})
