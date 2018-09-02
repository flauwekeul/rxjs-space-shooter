import { animationFrameScheduler, combineLatest } from 'rxjs'
import { last, map, sampleTime, share, startWith, takeWhile, tap } from 'rxjs/operators'

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

// actor creation
const score$ = fromScore.createScore(SCORE_INITIAL)
const stars$ = fromBackground.createStars(canvas)
const player$ = fromPlayer.createPlayer(canvas)
const playerShots$ = fromPlayerShots.createPlayerShots(canvas, player$).pipe(
    tap(() => {
        fromScore.scoreSubject.next(SCORE_SHOOT)
    }),
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

const gameOver = ({ score }: Actors) => {
    return score.current <= 0
}

const onTick = ({ score, stars, player, playerShots, enemies, enemyShots }: Actors) => {
    enemies.forEach(enemy => {
        if (enemy.y >= canvas.height) {
            fromScore.scoreSubject.next(SCORE_ENEMY_ESCAPES)
            moveOutsideView(enemy)
        }

        if (collision(enemy, player)) {
            fromScore.scoreSubject.next(SCORE_PLAYER_HIT_BY_ENEMY)
            moveOutsideView(enemy)
        }

        playerShots.forEach(shot => {
            if (collision(shot, enemy)) {
                fromScore.scoreSubject.next(SCORE_DESTROY_ENEMY)
                moveOutsideView(enemy)
                moveOutsideView(shot)
            }
        })
    })

    enemyShots.forEach(shot => {
        if (collision(shot, player)) {
            fromScore.scoreSubject.next(SCORE_PLAYER_HIT_BY_SHOT)
            moveOutsideView(shot)
        }
    })

    fromBackground.render(ctx, stars)
    fromPlayer.render(ctx, player)
    fromPlayerShots.render(ctx, playerShots, enemies)
    fromEnemies.render(ctx, enemies)
    fromEnemyShots.render(ctx, enemyShots)
    fromScore.render(ctx, score)
}

const onStop = ({ score, stars }: Actors) => {
    // this executes only once before completion
    canvas.classList.remove('playing')

    fromBackground.render(ctx, stars)
    fromScore.render(ctx, { current: 0, max: score.max })
    fromMessage.render(
        ctx,
        { content: 'GAME OVER' },
        { content: `Highest score: ${score.max}`, fontSize: Math.min(canvas.width, canvas.height) * 0.05 },
    )
}

canvas.classList.add('playing')

combineLatest<actorsList>(
    score$,
    stars$,
    player$,
    playerShots$,
    enemies$,
    enemyShots$,
).pipe(
    sampleTime(GAME_SPEED, animationFrameScheduler),
    // map array to object to access actors by key name instead of by index
    map<actorsList, Actors>(([score, stars, player, playerShots, enemies, enemyShots]) => ({
        score, stars, player, playerShots, enemies, enemyShots,
    })),
    takeWhile(actors => !gameOver(actors)),
    // this executes on each game tick
    tap(onTick),
    last(),
).subscribe(onStop)

type actorsList = [
    fromScore.Score,
    fromBackground.Star[],
    Position,
    Position[],
    Position[],
    Position[]
]

interface Actors {
    score: fromScore.Score,
    stars: fromBackground.Star[],
    player: Position,
    playerShots: Position[],
    enemies: Position[],
    enemyShots: Position[]
}
