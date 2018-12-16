import * as PIXI from "pixi.js";
require("pixi-action");
require("pixi-sound");
import { preloadResources, resources } from "./loader";
import { backgrounds, createBackground } from "./background";
import { addCardSymbols, createCards, getCardsMatched, resetCards } from "./card";
import { fetchGame } from "./api";
import { defaultSymbols, defaultTime } from "./values";

/**
 * The previous application state
 *
 * @type {PIXI.Application}
 */
let app;
let started = false;
let gameover = false;
let time = defaultTime;
let timeInterval = null;
let symbols = defaultSymbols;
let sound = true;

/**
 * Text for the timer.
 *
 * @type {PIXI.Container}
 */
let cards = null;

/**
 * Text for the timer.
 *
 * @type {PIXI.Text}
 */
let textTimer = null;

/**
 * Loading Screen sprite.
 *
 * @type {PIXI.Sprite}
 */
let loadingScreenSprite = null;

/**
 * Loading Bar.
 *
 * @type {PIXI.Sprite}
 */
let loadingBarSprite = null;

/**
 * Loading Bar Background Sprite.
 *
 * @type {PIXI.Sprite}
 */
let loadingBarBackgroundSprite = null;

/**
 * Play button sprite.
 *
 * @type {PIXI.Sprite}
 */
let playButton = null;

/**
 * Faded overlay sprite.
 *
 * @type {PIXI.Sprite}
 */
let fadedSprite = null;

/**
 * Win Sprite.
 *
 * @type {PIXI.Sprite}
 */
let winSprite = null;

/**
 * Lose Sprite.
 *
 * @type {PIXI.Sprite}
 */
let loseSprite = null;

/**
 * Sound Button Sprite.
 *
 * @type {PIXI.Sprite}
 */
let soundButtonSprite = null;

/**
 * Sets the initial setup. The loading bar.
 */
const initialSetup = () => {
    // Setup the application
    app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });

    // Loading Screen Overlay
    loadingScreenSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    loadingScreenSprite.tint = 0x000000; //Change with the color wanted
    loadingScreenSprite.width = app.renderer.width;
    loadingScreenSprite.height = app.renderer.height;
    app.stage.addChild(loadingScreenSprite);

    // Loading Bar Background
    loadingBarBackgroundSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    loadingBarBackgroundSprite.tint = 0xffffff;
    loadingBarBackgroundSprite.width = app.renderer.width / 4;
    loadingBarBackgroundSprite.height = app.renderer.width / 14;
    loadingBarBackgroundSprite.x = (app.renderer.width / 2) - loadingBarBackgroundSprite.width / 2;
    loadingBarBackgroundSprite.y = (app.renderer.height / 2) - loadingBarBackgroundSprite.height / 2;
    app.stage.addChild(loadingBarBackgroundSprite);

    // Loading Bar
    loadingBarSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    loadingBarSprite.tint = 0xff0000;
    loadingBarSprite.width = 0;
    loadingBarSprite.height = app.renderer.width / 14;
    loadingBarSprite.x = loadingBarBackgroundSprite.x;
    loadingBarSprite.y = loadingBarBackgroundSprite.y;
    app.stage.addChild(loadingBarSprite);

    // Add application to the page
    document.getElementById("main").appendChild(app.view);
};

/**
 *  Set up the game after the window and resources have finished loading.
 */
const setup = () => {
    // Add backgrounds
    const background = createBackground(backgrounds[Math.round(Math.random() * 4)], app.renderer);
    app.stage.addChild(background);

    // Add cards
    cards = createCards(app.renderer);
    cards.x = (app.renderer.width / 2) - (cards.width / 2);
    cards.y = (app.renderer.height / 2) - (cards.height / 2);
    app.stage.addChild(cards);

    // Add text explaining the game
    const description = new PIXI.Text(
        'Press play to start. Match all cards in the required time to win the game!',
        {
            fontFamily : 'Helvetica',
            fontSize: 24,
            fill : 0xffffff,
            align : 'center',
            dropShadow: true,
            dropShadowDistance: 3,
            wordWrap: true,
            wordWrapWidth: app.renderer.width
        });
    description.x = (app.renderer.width / 2) - (description.width / 2);
    description.y = (app.renderer.height - description.height) - 20;
    app.stage.addChild(description);

    // Play button
    playButton = new PIXI.Sprite(PIXI.utils.TextureCache["play.png"]);
    playButton.width = app.renderer.width / 8;
    playButton.height = (app.renderer.width / 8) * (playButton.texture.height / playButton.texture.width);
    playButton.x = (cards.x + cards.width / 2) - playButton.width / 2;
    playButton.y = (cards.y + cards.height / 2) - playButton.height / 2;
    playButton.interactive = true;
    playButton.on('pointerdown', playButtonClicked);
    app.stage.addChild(playButton);

    // Timer Sprite
    textTimer = new PIXI.Text(
        time,
        {
            fontFamily : 'Helvetica',
            fontSize: 90,
            fill : 0xffffff,
            align : 'center',
            dropShadow: true,
        });
    textTimer.x = (cards.x + cards.width / 2) - textTimer.width / 2;
    textTimer.y = (cards.y + cards.height / 2) - textTimer.height / 2;
    textTimer.visible = false;
    app.stage.addChild(textTimer);

    // Faded overlay
    fadedSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    fadedSprite.tint = 0x000000; //Change with the color wanted
    fadedSprite.width = app.renderer.width;
    fadedSprite.height = app.renderer.height;
    fadedSprite.alpha = 0;
    app.stage.addChild(fadedSprite);

    // Background box for win / lose screen
    const winTexture = PIXI.utils.TextureCache["win.png"];
    winSprite = new PIXI.Sprite(winTexture);
    winSprite.width = app.renderer.width / 2;
    winSprite.height = (app.renderer.width / 2) * (winTexture.height / winTexture.width);
    winSprite.x = (app.renderer.width / 2) - winSprite.width / 2;
    winSprite.y = (app.renderer.height / 2) - winSprite.height / 2;
    winSprite.alpha = 0;
    app.stage.addChild(winSprite);

    // Background box for win / lose screen
    const loseTexture = PIXI.utils.TextureCache["lose.png"];
    loseSprite = new PIXI.Sprite(loseTexture);
    loseSprite.width = app.renderer.width / 2;
    loseSprite.height = (app.renderer.width / 2) * (loseTexture.height / loseTexture.width);
    loseSprite.x = (app.renderer.width / 2) - loseSprite.width / 2;
    loseSprite.y = (app.renderer.height / 2) - loseSprite.height / 2;
    loseSprite.alpha = 0;
    app.stage.addChild(loseSprite);

    const soundButtonTexture = PIXI.utils.TextureCache["sound.png"];
    soundButtonSprite = new PIXI.Sprite(soundButtonTexture);
    soundButtonSprite.width = app.renderer.width / 20;
    soundButtonSprite.height = (app.renderer.width / 20) * (soundButtonTexture.height / soundButtonTexture.width);
    soundButtonSprite.x = app.renderer.width - soundButtonSprite.width * 1.5;
    soundButtonSprite.y = soundButtonSprite.height / 2;
    soundButtonSprite.interactive = true;
    soundButtonSprite.on('pointerdown', () => {
        if(sound) {
            soundButtonSprite.texture = PIXI.utils.TextureCache["sound_off.png"];
            PIXI.loader.resources["sounds/jungle.mp3"].sound.stop();
        } else {
            soundButtonSprite.texture = PIXI.utils.TextureCache["sound.png"];
            PIXI.loader.resources["sounds/jungle.mp3"].sound.play()
        }
        sound = !sound;
    });
    app.stage.addChild(soundButtonSprite);


    // Add the game loop
    app.ticker.add(delta => play(delta));
    animate();

    // Start Music
    PIXI.loader.resources["sounds/jungle.mp3"].sound.play();
    PIXI.loader.resources["sounds/jungle.mp3"].sound.loop = true;
};

/**
 * Game Loop
 *
 * @param delta
 */
const play = (delta) => {
    if (started && !gameover) {
        // Update Timer
        textTimer.text = time;
        // Adjust width of timer based on text size
        textTimer.x = (cards.x + cards.width / 2) - textTimer.width / 2;

        // Game Won
        if (getCardsMatched()) {
            finished(1);
        } else if (time <= 0) { // Game Lose
            finished(0);
        }
    }
};


/**
 * Animation loop
 */
function animate() {
    window.requestAnimationFrame(animate);
    app.renderer.render(app.stage);
    PIXI.actionManager.update(); // update actions
}


/**
 * Finishes the game and prompts the user with the lose / win screen
 *
 * @param flag - How did the game finish? 0 - Lose, 1 - Win
 */
function finished(flag) {
    started = false;
    gameover = true;

    if(sound) PIXI.loader.resources[flag ? "sounds/win.mp3" : "sounds/lose.mp3"].sound.play();

    const actionAlpha = new PIXI.action.AlphaTo(0.75, 0.25);
    const actionShow = new PIXI.action.AlphaTo(1, 0.25);
    const actionHide = new PIXI.action.AlphaTo(0, 0.25);
    const fadedAnimation = PIXI.actionManager.runAction(fadedSprite, actionAlpha);

    fadedAnimation.on('end', () => {
        if(flag) {
            PIXI.actionManager.runAction(winSprite, actionShow);
        } else {
            PIXI.actionManager.runAction(loseSprite, actionShow);
        }

        setTimeout(() => {
            PIXI.actionManager.runAction(fadedSprite, actionHide);
            PIXI.actionManager.runAction(winSprite, actionHide);
            PIXI.actionManager.runAction(loseSprite, actionHide);
            PIXI.actionManager.runAction(playButton, actionShow);
            resetGame();
        }, 5000);
    });
}

/**
 * Resets the scene for the next game
 */
function resetGame(){
    gameover = false;
    textTimer.visible = false;
    resetCards();
    clearInterval(timeInterval);
}

/**
 * Function called when the play button is clicked
 */
const playButtonClicked = () => {
    if(!started) { // Start Game
        // Get data
        const response = fetchGame();
        time = response.time;
        symbols = response.symbols;
        started = true;

        // Add card symbols
        addCardSymbols(symbols);

        // Start and show the timer
        timeInterval = window.setInterval(() => {
            // Subtract Timer
            if(time > 0) time -= 1;
        }, 1000);
        textTimer.visible = true;

        const actionFade = new PIXI.action.FadeOut(0.2);
        PIXI.actionManager.runAction(playButton, actionFade);
    }
};

/* ---------- Initialisation ---------- */
window.addEventListener("load", () => {
    initialSetup();
    // Then load the images
    preloadResources(resources, () => {
        // Then run the setup() function
        setup();
    }, ({ progress }) => {
        // Update loading bar
        loadingBarSprite.width = (loadingBarBackgroundSprite.width * progress / 100);
    });
});

export { started, sound };