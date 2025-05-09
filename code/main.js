import kaboom from "kaboom";

kaboom({
    background: [51,151,255],
    width: 640,
    height: 480,
    scale: 1,
    root: document.body,
});

loadSprite("background", "sprites/background.png");
loadSprite("fence-top", "sprites/fence-top.png");
loadSprite("fence-bottom", "sprites/fence-bottom.png");
loadSprite("fence-left", "sprites/fence-left.png");
loadSprite("fence-right", "sprites/fence-right.png");
loadSprite("post-top-left", "sprites/post-top-left.png");
loadSprite("post-top-right", "sprites/post-top-right.png");
loadSprite("post-bottom-left", "sprites/post-bottom-left.png");
loadSprite("post-bottom-right", "sprites/post-bottom-right.png");
loadSprite("snake-skin", "sprites/skin.png");
loadSprite("bubble", "sprites/bubble.png", {
    width: 20,
    height: 20,
});

layers([
    "background",
    "game"
], "game");

add([
    sprite("background"),
    layer("background")
]);

let score = 0;
const scoreLabel = add([
    text("Score: " + score, { size: 24 }),
    pos(width() - 200, 30),
    fixed()
]);

function showMessage(msg) {
    return add([
        text(msg, { size: 18 }),
        pos(width() - 350, height()/3),
        fixed(),
        "message"
    ]);
}

function resetGame() {
    score = 0;
    scoreLabel.text = "Score: " + score;
    move_delay = 0.2;  // Reset speed
    destroyAll("message");
    run_action = true;
    respawn_all();
}

const directions = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
};

let current_direction = directions.RIGHT;
let run_action = false;
let snake_length = 3;
let snake_body = [];

const block_size = 20;

const map = addLevel([
     "1tttttttttttt2",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "3bbbbbbbbbbbb4",
], {
     width: block_size,
     height: block_size,
     pos: vec2(0, 0),
     "t": ()=> [
          sprite("fence-top"),
          area(),
          "wall"
     ],
     "b": ()=> [
          sprite("fence-bottom"),
          area(),
          "wall"
     ],
     "l": ()=> [
          sprite("fence-left"),
          area(),
          "wall"
     ],
     "r": ()=> [
          sprite("fence-right"),
          area(),
          "wall"
     ],
     "1": ()=> [
          sprite("post-top-left"),
          area(),
          "wall"
     ],
     "2": ()=> [
          sprite("post-top-right"),
          area(),
          "wall"
     ],
     "3": ()=> [
          sprite("post-bottom-left"),
          area(),
          "wall"
     ],
     "4": ()=> [
          sprite("post-bottom-right"),
          area(),
          "wall"
     ],
});

function respawn_snake(){
  snake_body.forEach(segment => {
      destroy(segment);
    });
  snake_body = [];
  snake_length = 3;

  for (let i = 1; i <= snake_length; i++) {
      snake_body.push(add([
          sprite('snake-skin'),
          pos(block_size  ,block_size * i),
          area(),
          "snake"
      ]));
  }
  current_direction = directions.RIGHT;
}
add([
		text("\nUnder the Sea Snake Game!\n\nCollect bubbles to grow longer\nbut BE CAREFUL: don't crash into\nyour tail or the walls!\n\nEach bubble is 2 points!\nGain 30 points to win!", {size:20, font:"sinko"},),
    pos(24, 270),
		fixed(),
    ])

let food = null;

function respawn_food(){
    let new_pos = rand(vec2(1,1), vec2(13,13));
    new_pos.x = Math.floor(new_pos.x);
    new_pos.y = Math.floor(new_pos.y);
    new_pos = new_pos.scale(block_size);

    if (food){
        destroy(food);
    }
    food = add([
                sprite('bubble'),
                pos(new_pos),
                area(),
                "food"
            ]);
}

function respawn_all(){
  run_action = false;
    wait(0.5, function(){
        respawn_snake();
        respawn_food();
        run_action = true;
    });
}

respawn_all();

collides("snake", "food", (s, f) => {
    snake_length++;
    score += 2;
    scoreLabel.text = "Score: " + score;
    // Increase speed every 10 points (5 bubbles)
    if (score % 10 === 0) {
        move_delay = Math.max(0.05, move_delay - 0.03);
    }
    if (score >= 30) {
        run_action = false;
        showMessage("You Win!\nPress Space Bar to start again.");
    }
    respawn_food();
});

collides("snake", "wall", (s, w) => {
    run_action = false;
    shake(12);
    showMessage("Game Over.\nPress Space Bar to try again.");
});

collides("snake", "snake", (s, t) => {
    run_action = false;
    shake(12);
    showMessage("Game Over.\nPress Space Bar to try again.");
});

keyPress("space", () => {
    if (!run_action) {
        resetGame();
    }
});

keyPress("up", () => {
    if (current_direction != directions.DOWN){
        current_direction = directions.UP;
    }
});

keyPress("down", () => {
    if (current_direction != directions.UP){
        current_direction = directions.DOWN;
    }
});

keyPress("left", () => {
    if (current_direction != directions.RIGHT){
        current_direction = directions.LEFT;
    }
});

keyPress("right", () => {
    if (current_direction != directions.LEFT){
        current_direction = directions.RIGHT;
    }
});


let move_delay = 0.2;
let timer = 0;
action(()=> {
    if (!run_action) return;
    timer += dt();
    if (timer < move_delay) return;
    timer = 0;

    let move_x = 0;
    let move_y = 0;

    switch (current_direction) {
        case directions.DOWN:
            move_x = 0;
            move_y = block_size;
            break;
        case directions.UP:
            move_x = 0;
            move_y = -1*block_size;
            break;
        case directions.LEFT:
            move_x = -1*block_size;
            move_y = 0;
            break;
        case directions.RIGHT:
            move_x = block_size;
            move_y = 0;
            break;
    }

    // Get the last element (the snake head)
    let snake_head = snake_body[snake_body.length - 1];

    snake_body.push(add([
        sprite('snake-skin'),
        pos(snake_head.pos.x + move_x, snake_head.pos.y + move_y),
        area(),
        "snake"
    ]));

    if (snake_body.length > snake_length){
        let tail = snake_body.shift(); // Remove the last of the tail
        destroy(tail);
    }

});