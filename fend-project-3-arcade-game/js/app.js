'use strict';
/*
/
/ Game sounds
/
*/

// Mario's Way by
// gianni caratelli / gianni73@hotmail.com
// https://freesound.org/people/xsgianni/sounds/388079/
var bgSound = new Howl({
    src: ['sounds/xsgianni-mario-s-way.mp3'],
    loop: true,
    volume: 0.05
});

// Movement sound
// source: https://freesound.org/people/myfox14/sounds/382310/
// no attribution required
var bgMove = new Howl({
    src: ['sounds/carton-move-2.wav'],
    volume: 0.2
});

// Collision with bug sound
// source: https://freesound.org/people/andresix/sounds/245631/
// no attribution required
var bgBugged = new Howl({
    src: ['sounds/game-over-arcade.wav'],
    volume: 0.1
});

// Gem collect(collision) sound
// source: https://freesound.org/people/Kodack/sounds/258020/
// no attribution required
var bgGem = new Howl({
    src: ['sounds/arcade-bleep-sound.wav'],
    volume: 0.1
});

// Jingle_Win_Synth_06 by
// LittleRobotSoundFactory
// source: https://freesound.org/people/LittleRobotSoundFactory/sounds/274181/
var bgCleared = new Howl({
    src: ['sounds/littlerobotsoundfactory__jingle-win-synth-06.wav'],
    volume: 0.1
});

/*
/
/ Classes and methods
/
*/

// Create Parent Class
class gameEntity {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    // Draw entity on canvas
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// Enemy (bug) class
class Enemy extends gameEntity {
    constructor(x, y, speed) {
        super(x, y, speed);
        this.sprite = 'images/enemy-bug.png';
    }

    // Update enemy location on canvas
    update(dt) {
        // Update Enemy position (horizontal x) based off the speed
        // it is traveling and dt parameter as required
        this.x += this.speed * dt;
        // If Enemy goes off canvas it returns the enemy to
        // starting x position but on a random track (y) and
        // assigns a random speed up to variable maxSpeed
        if (this.x > 707) {
            this.x = -101;
            this.y = randomEnemyPos();
            // change speed of enemy once it place back to beginning of track
            this.speed = randomSpeed();
        }
    }

    // Collision checking
    // X axis collision is more forgiving to give players a
    // better experience for those crunch time movements.
    checkCollisions() {
        if (
            this.x < player.x + 65.5 &&
            this.x + 65.5 > player.x &&
            this.y < player.y + 70 &&
            this.y + 70 > player.y
        ) {
            bgBugged.play();
            player.x = 303;
            player.y = 664;
            player.speed = 0;
            playerSpeedY = 0;
            player.x = 303;
            player.y = 664;
            buggedOut();
        }
    }
}

// Player character class
let playerSpeedY = 83;
class myChar extends gameEntity {
    constructor(x, y, speed) {
        super(x, y, speed);
        this.sprite = 'images/char-boy.png';
    }

    update() {
        // Update player position
        // Keep the player sprite within the game area
        // Restricted moving off screen by finding edge coordinates and subtracting row or column to find opposite point
        if (player.y > 570) {
            player.y = 570;
        } else if (player.y < 0) {
            // Player reaches the water
            player.y = -11;
            player.speed = 0;
            playerSpeedY = 0;
            // Player sent back to starting position
            player.x = 303;
            player.y = 664;
            // Score is updated, announcement displayed, sound played
            reachedWater();
            bgCleared.play();
            // Pauses 3 seconds before next level
            setTimeout(function() {
                nextRound();
            }, 3000);
        }
        // Keep player from going too far right
        // 202 is starting location, plus (2 x 101 column width) = 404, so 202+404=606
        if (player.x > 606) {
            player.x = 606;
        } else if (player.x < 0) {
            // Keep player from going too far left
            // 202 starting location minus (2 x 101 column width) = 0
            player.x = 0;
        }
        if (curLives == 0) {
            gameOver();
        }
    }

    // Required handleInput() method to manage keypress
    // player.speed is the same as the column width (101) to create uniform movement to each tile
    // playerSpeedY is same as row height (83). used player.speed as base minus 18 to get 83
    handleInput(keyDirection) {
        switch (keyDirection) {
            case 'up':
                bgMove.play();
                player.y -= playerSpeedY;
                updateScore();
                break;
            case 'down':
                bgMove.play();
                player.y += playerSpeedY;
                updateScore();
                break;
            case 'left':
                bgMove.play();
                player.x -= player.speed;
                updateScore();
                break;
            case 'right':
                bgMove.play();
                player.x += player.speed;
                updateScore();
        }
    }
}

// Gem class:
// boxNum corresponds to the grid number from the grid overlay placed above canvas
class itemGem extends gameEntity {
    constructor(x, y, boxNum) {
        super(x, y);
        this.boxNum = boxNum;
        this.sprite = randomGemSprite();
    }

    // Check if gem was collected (collided):
    checkCollisions() {
        // Get current gem location
        let boxID = document.getElementById(this.boxNum);
        let addPoints = `<span>+100</span>`;
        if (
            this.x < player.x + 65.5 &&
            this.x + 65.5 > player.x &&
            this.y < player.y + 70 &&
            this.y + 70 > player.y
        ) {
            // score is updated, and animation of points
            // for collecting gem is displayed on the grid
            curScore = curScore + 100;
            bgGem.play();
            updateScore();
            highScore();
            boxID.innerHTML = addPoints;
            boxID.classList.add('animated', 'fadeOutUp');
            // gem moved off screen once collected until
            // gems are reinstantiated
            this.x = -300;
            this.y = -300;
            // remove the animation classes placed on the grid
            setTimeout(function() {
                boxID.classList.remove('animated', 'fadeOutUp');
                boxID.innerHTML = ``;
            }, 3000);
        }
    }
}

/*
/
/ Functions used to generate random values use to position enemy,
/ calculate speed of enemy, random gem position, random gem sprite
/
*/

// Generate random gem locations: x, y, boxNum (for CSSgrid interaction)
let gridGemsPos = function() {
    // Grid positions stored as objects / gems place in enemy tracks
    let randomGemPosArray = [
        // row 1 of enemy track y = 62
        { x: 0, y: 62, boxNum: 'b15' },
        { x: 101, y: 62, boxNum: 'b16' },
        { x: 202, y: 62, boxNum: 'b17' },
        { x: 303, y: 62, boxNum: 'b18' },
        { x: 404, y: 62, boxNum: 'b19' },
        { x: 505, y: 62, boxNum: 'b20' },
        { x: 606, y: 62, boxNum: 'b21' },
        // row 2 of enemy track y = 145
        { x: 0, y: 145, boxNum: 'b22' },
        { x: 101, y: 145, boxNum: 'b23' },
        { x: 202, y: 145, boxNum: 'b24' },
        { x: 303, y: 145, boxNum: 'b25' },
        { x: 404, y: 145, boxNum: 'b26' },
        { x: 505, y: 145, boxNum: 'b27' },
        { x: 606, y: 145, boxNum: 'b28' },
        // row 3 of enemy track y = 228
        { x: 0, y: 228, boxNum: 'b29' },
        { x: 101, y: 228, boxNum: 'b30' },
        { x: 202, y: 228, boxNum: 'b31' },
        { x: 303, y: 228, boxNum: 'b32' },
        { x: 404, y: 228, boxNum: 'b33' },
        { x: 505, y: 228, boxNum: 'b34' },
        { x: 606, y: 228, boxNum: 'b35' },
        // row 4 of enemy track y = 311
        { x: 0, y: 311, boxNum: 'b36' },
        { x: 101, y: 311, boxNum: 'b37' },
        { x: 202, y: 311, boxNum: 'b38' },
        { x: 303, y: 311, boxNum: 'b39' },
        { x: 404, y: 311, boxNum: 'b40' },
        { x: 505, y: 311, boxNum: 'b41' },
        { x: 606, y: 311, boxNum: 'b42' },
        // row 5 of enemy track y = 394
        { x: 0, y: 394, boxNum: 'b43' },
        { x: 101, y: 394, boxNum: 'b44' },
        { x: 202, y: 394, boxNum: 'b45' },
        { x: 303, y: 394, boxNum: 'b46' },
        { x: 404, y: 394, boxNum: 'b47' },
        { x: 505, y: 394, boxNum: 'b48' },
        { x: 606, y: 394, boxNum: 'b49' }
    ];
    // Randomize selection of gem location (randomGemPosArray object)
    // Get random object index and store in gemObject
    let randomGemObjectIndex = Math.floor(
        Math.random() * randomGemPosArray.length
    );
    let gemObject = randomGemPosArray[randomGemObjectIndex];
    return gemObject;
};

// Gem Sprite Array
let randomGemSpriteArray = [
    'images/Gem-Blue.png',
    'images/Gem-Green.png',
    'images/Gem-Orange.png'
];
//Get random sprite from gem sprite array
let randomGemSprite = () =>
    randomGemSpriteArray[
        Math.floor(Math.random() * randomGemSpriteArray.length)
    ];

// Set base maxSpeed. If speed is less than 50, increase speed by 100
// to keep bug movement at a fair difficulty.
let maxSpeed = 200;
// Use maxSpeed to generate random speed of enemy
let randomSpeed = () => {
    let howFast = Math.floor(Math.random() * Math.floor(maxSpeed));
    if (howFast < 50) {
        howFast += 100;
    }
    return howFast;
};

// Array for possible enemy (y) start locations
// Top track starts: 62, 2nd track from top: 145, 3rd track: 228, 4th track: 311, 5th track: 394;
let randomEnemyPosArray = [62, 145, 228, 311, 394];
// Create Random Position for enemy based off the three rows(randomEnemyPosArray) the enemy will appear in.
let randomEnemyPos = () =>
    randomEnemyPosArray[Math.floor(Math.random() * randomEnemyPosArray.length)];

/*
/
/ Instantiate Entities
/
*/

// Place all enemy objects in an array called allEnemies
let allEnemies = [
    new Enemy(-101, randomEnemyPos(), randomSpeed()),
    new Enemy(-101, randomEnemyPos(), randomSpeed()),
    new Enemy(-101, randomEnemyPos(), randomSpeed()),
    new Enemy(-101, randomEnemyPos(), randomSpeed()),
    new Enemy(-101, randomEnemyPos(), randomSpeed()),
    new Enemy(-101, randomEnemyPos(), randomSpeed()),
    new Enemy(-101, randomEnemyPos(), randomSpeed())
];

// Place the player object in a variable called player
// 101 is the speed of player obectp
let player = new myChar(303, 664, 101);

// Generate 3 Gems and place them in array(allGems) to render
// let gem equal to the gem position object then
// grab x,y,boxNum. Had to create three separate gems or
// the instantiated gems will use the same gridGemPos object.
let gemOne = gridGemsPos();
let gemTwo = gridGemsPos();
let gemThree = gridGemsPos();
let firstGem = new itemGem(gemOne.x, gemOne.y, gemOne.boxNum);
let secondGem = new itemGem(gemTwo.x, gemTwo.y, gemTwo.boxNum);
let thirdGem = new itemGem(gemThree.x, gemThree.y, gemThree.boxNum);
let allGems = [firstGem, secondGem, thirdGem];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        80: 'pause'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

/*
/
/ Game Management Functions
/
*/
// Variables to manage game functions
const theBanner = document.getElementById('first-banner');
const theSecondBanner = document.getElementById('second-banner');
const theThirdBanner = document.getElementById('third-banner');
let curLevel = 1;
let curScore = 0;
let curLives = 5;

// Manage player bug collision event. Subtract life start next life.
function buggedOut() {
    curLives--;
    updateLives();
    let bugMessage = `<span>You bugged out! ${curLives} lives left!</span>`;
    if (curLives === 1) {
        bugMessage = `<span>You bugged out! ${curLives} life left!</span>`;
    }
    theSecondBanner.innerHTML = bugMessage;
    theSecondBanner.classList.add('animated', 'tada');
    setTimeout(function() {
        nextLife();
        clearAnnounce();
    }, 2000);
}

// Splash screen starting game
function startScreen() {
    let endMessage = `<span>BUGGED OUT!</span>`;
    let endMessage2 = `<span>Press Enter To Play</span>`;
    theBanner.innerHTML = endMessage;
    theThirdBanner.innerHTML = endMessage2;
    theBanner.classList.add('animated', 'rubberBand', 'infinite');
    theThirdBanner.classList.add('animated', 'flash', 'infinite');
}

// score and level tracking variables
// level increase each time player reaches water
// score will increase when: movement above grass safe is 50 points, gem give 100 points, clearing level 500 points
function reachedWater() {
    levelAnnounce();
    // increase level number and add score for clearing level
    curLevel++;
    maxSpeed = maxSpeed + 10;
    curScore = curScore + 500;
    updateScore();
    highScore();
}

// Display Level
function levelAnnounce() {
    // Insert level cleared message and animate level clear message using AnimateCSS
    let atWaterMessage = `<span>Level ${curLevel} Cleared!</span>`;
    theBanner.innerHTML = atWaterMessage;
    theBanner.classList.add('animated', 'bounceIn');
}

// Clear all banner announcements
function clearAnnounce() {
    theBanner.classList.remove('animated', 'bounceIn');
    theSecondBanner.classList.remove('animated', 'tada');
    theThirdBanner.classList.remove('animated', 'tada');
    theBanner.innerHTML = ``;
    theSecondBanner.innerHTML = ``;
    theThirdBanner.innerHTML = ``;
}

// Resets player speed after reaching water
// Clear all banners announcements
// Place gems in random location
function nextRound() {
    player.speed = 101;
    playerSpeedY = 83;
    clearAnnounce();
    // instantiate gems for next round
    reInstantiateGems();
}

// Reset players speed after death
function nextLife() {
    player.speed = 101;
    playerSpeedY = 83;
}

// Game over banner
function gameEndBanner() {
    let endMessage = `<span>Game Over</span>`;
    let endMessage2 = `<span>Press ESC To Restart</span>`;
    theBanner.innerHTML = endMessage;
    theThirdBanner.innerHTML = endMessage2;
    theBanner.classList.add('animated', 'rubberBand', 'infinite');
    theThirdBanner.classList.add('animated', 'flash', 'infinite');
}

// Stop player and bug movement
// Display game over
function gameOver() {
    player.speed = 0;
    playerSpeedY = 0;
    gameEndBanner();
    allEnemies.forEach(function(enemy) {
        enemy.speed = 0;
    });
}

// Reset player speed, replace gems in random locations, reset random enemy speed
function restartEntities() {
    player.speed = 101;
    playerSpeedY = 83;
    reInstantiateGems();
    allEnemies.forEach(function(enemy) {
        enemy.speed = randomSpeed();
    });
}

// Display current lives
function updateLives() {
    let livesSpan = document.getElementById('box1-info3');
    livesSpan.innerHTML = `<span>Lives: ${curLives}</span>`;
}

// Display current score
function updateScore() {
    let scoreSpan = document.getElementById('box1-info1');
    scoreSpan.innerHTML = `<span>Score: ${curScore}</span>`;
    if (player.y < 477) {
        curScore = curScore + 50;
        scoreSpan.innerHTML = `<span>Score: ${curScore}</span>`;
        highScore();
    }
}

// Update High Score
// If current score is higher than highscore, high score and current score
// is displayed the same High score saved in local storage.
function highScore() {
    let highScoreSpan = document.getElementById('box1-info2');
    let curHighScore = Number(localStorage.HighScore);
    highScoreSpan.innerHTML = `<span>High Score: ${curHighScore}</span>`;
    if (localStorage.HighScore) {
        if (curScore >= curHighScore) {
            localStorage.HighScore = curScore;
            highScoreSpan.innerHTML = `<span>High Score: ${curScore}</span>`;
        }
    } else {
        localStorage.HighScore = 0;
    }
}

// Resets gem sprite and location
function reInstantiateGems() {
    let gemOne = gridGemsPos();
    let gemTwo = gridGemsPos();
    let gemThree = gridGemsPos();
    firstGem.x = gemOne.x;
    firstGem.y = gemOne.y;
    firstGem.boxNum = gemOne.boxNum;
    firstGem.sprite = randomGemSprite();
    secondGem.x = gemTwo.x;
    secondGem.y = gemTwo.y;
    secondGem.boxNum = gemTwo.boxNum;
    secondGem.sprite = randomGemSprite();
    thirdGem.x = gemThree.x;
    thirdGem.y = gemThree.y;
    thirdGem.boxNum = gemThree.boxNum;
    thirdGem.sprite = randomGemSprite();
    allGems = [firstGem, secondGem, thirdGem];
}
