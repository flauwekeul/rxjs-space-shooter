# RxJS Space Shooter

### 🚀 [abbekeultjes.nl/rxjs-space-shooter](http://abbekeultjes.nl/rxjs-space-shooter)

## Credits

In the excellent book [Reactive Programming with RxJS 5](https://pragprog.com/book/smreactjs5/reactive-programming-with-rxjs-5) the author Sergi Mansilla explains how to make a spaceship game where the player shoots enemies flying in from the top of the screen.

This project continues where he left off and is solely for learning purposes.

## Development

```
npm i
npm start
```

Open [localhost:1234](http://localhost:1234)

## Backlog

1. make player follow mouse anywhere, not just the x position (use drag)
2. occasionally drop bonus points
3. special weapons:
  * bomb to clear all enemies
  * homing missile
  * temporary faster shooting that doesn't cost points
4. better UI:
  * start screen with play button
  * pause on escape key
  * restart button after game over

## Ideas for framework
Name: Warp Pipe?

Things needed:

* set tick interval
* add entities, each:
    * define source observable (can be `Subject`), gets called with view (?)
    * `startWith()` (optional) method that's called once to trigger first emit
    * `onTick()` gets called on each tick, passing all entities for that tick (is observer?)
    * renderer that gets called with view (?) and all entities
* set game over (used to stop the stream)
* `onStart()` gets called once before start (and/or after start?)
* `onComplete()` gets called once on completion, passing all entities
