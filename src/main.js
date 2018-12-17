import Game from "./Game";
import Cards from "./Cards";
import { fetchGame } from "./api";
import { preloadResources, resources } from "./loader";
import { defaultSymbols, defaultTime } from "./values";
import Background from "./Background";


/**
 * The application
 */
let game = null;
let started = false;
let gameover = false;
let time = defaultTime;
let timeInterval = null;
let symbols = defaultSymbols;
let sound = true;
let cards = null;
let textTimer = null;
let loadingScreenSprite = null;
let loadingBarSprite = null;
let loadingBarBackgroundSprite = null;
let playButton = null;
let fadedSprite = null;
let winSprite = null;
let loseSprite = null;
let soundButtonSprite = null;

/**
 * Sets the initial setup. The loading bar.
 */
const initialSetup = () => {
    game = new Game();

    // Loading Screen Overlay
    loadingScreenSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    loadingScreenSprite.tint = 0x000000; //Change with the color wanted
    loadingScreenSprite.width = game.renderer.width;
    loadingScreenSprite.height = game.renderer.height;
    game.stage.addChild(loadingScreenSprite);

    // Loading Bar Background
    loadingBarBackgroundSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    loadingBarBackgroundSprite.tint = 0xffffff;
    loadingBarBackgroundSprite.width = game.renderer.width / 4;
    loadingBarBackgroundSprite.height = game.renderer.width / 14;
    loadingBarBackgroundSprite.x = (game.renderer.width / 2) - loadingBarBackgroundSprite.width / 2;
    loadingBarBackgroundSprite.y = (game.renderer.height / 2) - loadingBarBackgroundSprite.height / 2;
    game.stage.addChild(loadingBarBackgroundSprite);

    // Loading Bar
    loadingBarSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    loadingBarSprite.tint = 0xff0000;
    loadingBarSprite.width = 0;
    loadingBarSprite.height = game.renderer.width / 14;
    loadingBarSprite.x = loadingBarBackgroundSprite.x;
    loadingBarSprite.y = loadingBarBackgroundSprite.y;
    game.stage.addChild(loadingBarSprite);
};

/**
 *  Set up the game after the window and resources have finished loading.
 */
const setup = () => {
    // Add backgrounds
    const randomBackground = Math.round(Math.random() * 4);
    const background = new Background(game, Background.backgrounds()[randomBackground]);
    game.stage.addChild(background);

    cards = new Cards(game, 2, 5);
    cards.x = (game.renderer.width / 2) - (cards.width / 2);
    cards.y = (game.renderer.height / 2) - (cards.height / 2);
    game.stage.addChild(cards);

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
            wordWrapWidth: game.renderer.width
        });
    description.x = (game.renderer.width / 2) - (description.width / 2);
    description.y = (game.renderer.height - description.height) - 20;
    game.stage.addChild(description);

    // Play button
    playButton = new PIXI.Sprite(PIXI.utils.TextureCache["play.png"]);
    playButton.width = game.renderer.width / 8;
    playButton.height = (game.renderer.width / 8) * (playButton.texture.height / playButton.texture.width);
    playButton.x = (cards.x + cards.width / 2) - playButton.width / 2;
    playButton.y = (cards.y + cards.height / 2) - playButton.height / 2;
    playButton.interactive = true;
    playButton.on('pointerdown', playButtonClicked);
    game.stage.addChild(playButton);

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
    game.stage.addChild(textTimer);

    // Faded overlay
    fadedSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    fadedSprite.tint = 0x000000; //Change with the color wanted
    fadedSprite.width = game.renderer.width;
    fadedSprite.height = game.renderer.height;
    fadedSprite.alpha = 0;
    game.stage.addChild(fadedSprite);

    // Background box for win / lose screen
    const winTexture = PIXI.utils.TextureCache["win.png"];
    winSprite = new PIXI.Sprite(winTexture);
    winSprite.width = game.renderer.width / 2;
    winSprite.height = (game.renderer.width / 2) * (winTexture.height / winTexture.width);
    winSprite.x = (game.renderer.width / 2) - winSprite.width / 2;
    winSprite.y = (game.renderer.height / 2) - winSprite.height / 2;
    winSprite.alpha = 0;
    game.stage.addChild(winSprite);

    // Background box for win / lose screen
    const loseTexture = PIXI.utils.TextureCache["lose.png"];
    loseSprite = new PIXI.Sprite(loseTexture);
    loseSprite.width = game.renderer.width / 2;
    loseSprite.height = (game.renderer.width / 2) * (loseTexture.height / loseTexture.width);
    loseSprite.x = (game.renderer.width / 2) - loseSprite.width / 2;
    loseSprite.y = (game.renderer.height / 2) - loseSprite.height / 2;
    loseSprite.alpha = 0;
    game.stage.addChild(loseSprite);

    const soundButtonTexture = PIXI.utils.TextureCache["sound.png"];
    soundButtonSprite = new PIXI.Sprite(soundButtonTexture);
    soundButtonSprite.width = game.renderer.width / 20;
    soundButtonSprite.height = (game.renderer.width / 20) * (soundButtonTexture.height / soundButtonTexture.width);
    soundButtonSprite.x = game.renderer.width - soundButtonSprite.width * 1.5;
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
    game.stage.addChild(soundButtonSprite);


    // Add the game loop
    game.ticker.add(delta => play(delta));
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
        if (cards.getCardsMatched()) {
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
    game.renderer.render(game.stage);
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
    cards.reset();
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
        cards.addCardSymbols(symbols);

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