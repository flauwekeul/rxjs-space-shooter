import { animationFrameScheduler, combineLatest } from 'rxjs'
import { last, sampleTime, share, startWith, takeWhile, tap } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromEnemyShots from './enemies/shots'
import * as fromPlayer from './player'
import * as fromPlayerShots from './player/shots'
import { Position } from './shared/position'
import { collision, moveOutsideView } from './shared/utils'
import * as fromUi from './ui'

export const GAME_SPEED = 40
export const SCORE_INCREMENT = 10

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

const gameOver = (currentScore: number, health: number) => {
    return currentScore < 0 || health <= 0
}

const onPlayerHit = (actors: Position[], player: Position) => actors.forEach(actor => {
    if (collision(actor, player)) {
        fromUi.healthSubject.next(-1)
        moveOutsideView(actor)
    }
})

const onEnemyHit = (enemies: Position[], playerShots: Position[]) => {
    for (const enemy of enemies) {
        for (const shot of playerShots) {
            if (collision(shot, enemy)) {
                fromUi.scoreSubject.next(SCORE_INCREMENT)
                moveOutsideView(enemy)
                moveOutsideView(shot)
                break
            }
        }
    }
}

canvas.classList.add('playing')

combineLatest<[
    fromUi.Score,
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
    takeWhile(([{ current }, health]) => !gameOver(current, health)),
    tap(([score, health, stars, player, playerShots, enemies, enemyShots]) => {
        // this executes on each game tick
        onPlayerHit(enemies, player)
        onPlayerHit(enemyShots, player)
        onEnemyHit(enemies, playerShots)

        fromBackground.render(ctx, stars)
        fromPlayer.render(ctx, player)
        fromPlayerShots.render(ctx, playerShots, enemies)
        fromEnemies.render(ctx, enemies)
        fromEnemyShots.render(ctx, enemyShots)
        fromUi.renderScore(ctx, score)
        fromUi.renderHealth(ctx, health)
    }),
    last(),
).subscribe(([score, , stars]) => {
    // this executes only once before completion
    canvas.classList.remove('playing')

    fromBackground.render(ctx, stars)
    fromUi.renderHealth(ctx, 0)
    fromUi.renderScore(ctx, score)
    fromUi.renderMessage(
        ctx,
        { content: 'GAME OVER' },
        { content: `Highest score: ${score.max}`, fontSize: Math.min(canvas.width, canvas.height) * 0.05 },
    )
})
