import { animationFrameScheduler, combineLatest } from 'rxjs'
import { finalize, sampleTime, share, startWith, takeWhile, tap } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromEnemyShots from './enemies/shots'
import * as fromPlayer from './player'
import * as fromPlayerShots from './player/shots'
import { Position } from './shared/position'
import { collision, moveOutsideView } from './shared/utils'
import * as fromUi from './ui'

export const GAME_SPEED = 40

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const health$ = fromUi.health$
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

const gameOver = (score: number, health: number) => {
    return score < 0 || health <= 0
}

const updateOnCollision = (actors: Position[], player: Position) => actors.forEach(actor => {
    if (collision(actor, player)) {
        moveOutsideView(actor)
        fromUi.healthSubject.next(-1)
    }
})

combineLatest<[
    number,
    number,
    fromBackground.Star[],
    Position,
    Position[],
    Position[],
    Position[]
]>(
    score$,
    health$,
    stars$,
    player$,
    playerShots$,
    enemies$,
    enemyShots$,
).pipe(
    sampleTime(GAME_SPEED, animationFrameScheduler),
    tap(([, , , player, , enemies, enemyShots]) => {
        updateOnCollision(enemies, player)
        updateOnCollision(enemyShots, player)
    }),
    takeWhile(([score, health]) => !gameOver(score, health)),
    finalize(() => {
        canvas.classList.remove('playing')

        // takeWhile() stops the stream before the view can be updated, so that's done 1 more time:
        fromBackground.render(ctx, [])
        fromUi.renderHealth(ctx, 0)
        fromUi.renderScore(ctx, 0)
        fromUi.renderMessage(ctx, 'GAME OVER')
    }),
).subscribe(([score, health, stars, player, playerShots, enemies, enemyShots]) => {
    canvas.classList.add('playing')

    fromBackground.render(ctx, stars)
    fromPlayer.render(ctx, player)
    fromEnemies.render(ctx, enemies)
    fromPlayerShots.render(ctx, playerShots, enemies)
    fromEnemyShots.render(ctx, enemyShots)
    fromUi.renderScore(ctx, score)
    fromUi.renderHealth(ctx, health)
})
