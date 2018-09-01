import { animationFrameScheduler, combineLatest } from 'rxjs'
import { last, sampleTime, share, startWith, takeWhile, tap } from 'rxjs/operators'

import * as fromBackground from './background'
import * as fromEnemies from './enemies'
import * as fromEnemyShots from './enemies/shots'
import * as fromPlayer from './player'
import * as fromPlayerShots from './player/shots'
import { Position } from './shared/position'
import { collision, moveOutsideView } from './shared/utils'
import * as fromMessage from './ui/message'
import * as fromScore from './ui/score'

export const GAME_SPEED = 40 // ms per tick
export const SCORE_INITIAL = 10
export const SCORE_DESTROY_ENEMY = 10
export const SCORE_ENEMY_ESCAPES = -25
export const SCORE_SHOOT = -1
export const SCORE_PLAYER_HIT_BY_SHOT = -20
export const SCORE_PLAYER_HIT_BY_ENEMY = -50

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const score$ = fromScore.createScore(SCORE_INITIAL)
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

const gameOver = (currentScore: number) => {
    return currentScore <= 0
}

const onPlayerHit = (actors: Position[], player: Position, scoreDiff: number) => actors.forEach(actor => {
    if (collision(actor, player)) {
        fromScore.scoreSubject.next(scoreDiff)
        moveOutsideView(actor)
    }
})

const onEnemyHit = (enemies: Position[], playerShots: Position[], scoreDiff: number) => {
    for (const enemy of enemies) {
        for (const shot of playerShots) {
            if (collision(shot, enemy)) {
                fromScore.scoreSubject.next(scoreDiff)
                moveOutsideView(enemy)
                moveOutsideView(shot)
                break
            }
        }
    }
}

canvas.classList.add('playing')

combineLatest<[
    fromScore.Score,
    fromBackground.Star[],
    Position,
    Position[],
    Position[],
    Position[]
]>(
    score$,
    stars$,
    player$,
    playerShots$,
    enemies$,
    enemyShots$,
).pipe(
    sampleTime(GAME_SPEED, animationFrameScheduler),
    takeWhile(([{ current }]) => !gameOver(current)),
    tap(([score, stars, player, playerShots, enemies, enemyShots]) => {
        // this executes on each game tick
        onPlayerHit(enemies, player, SCORE_PLAYER_HIT_BY_ENEMY)
        onPlayerHit(enemyShots, player, SCORE_PLAYER_HIT_BY_SHOT)
        onEnemyHit(enemies, playerShots, SCORE_DESTROY_ENEMY)

        fromBackground.render(ctx, stars)
        fromPlayer.render(ctx, player)
        fromPlayerShots.render(ctx, playerShots, enemies)
        fromEnemies.render(ctx, enemies)
        fromEnemyShots.render(ctx, enemyShots)
        fromScore.render(ctx, score)
    }),
    last(),
).subscribe(([score, stars]) => {
    // this executes only once before completion
    canvas.classList.remove('playing')

    fromBackground.render(ctx, stars)
    fromScore.render(ctx, { current: 0, max: score.max })
    fromMessage.render(
        ctx,
        { content: 'GAME OVER' },
        { content: `Highest score: ${score.max}`, fontSize: Math.min(canvas.width, canvas.height) * 0.05 },
    )
})
