import * as PIXI from "pixi.js";

/**
 * All available backgrounds
 *
 * @type {array}
 */
export const backgrounds = ["water", "swamp", "forest", "night"];

/**
 * Stores all our background sprites (so we can pan them)
 *
 * @type {array}
 */
const backgroundSprites = [];

/**
 * Float to reduce the background animation effect
 *
 * @type {number}
 */
const backgroundAnimationDamping = 0.01;

/**
 * Background Delta X
 *
 * @type {number}
 */
let dx = 0;

/**
 * Background Delta Y
 *
 * @type {number}
 */
let dy = 0;

/**
 * Background Previous X
 *
 * @type {number}
 */
let prevX = 0;

/**
 * Background Previous Y
 *
 * @type {number}
 */
let prevY = 0;

/**
 * Creates a segregated background
 *
 * @param type
 * @param renderer
 *
 * @return {PIXI.Container}
 */
export const createBackground = (type = 'water', renderer) => {
    const containerSprite = new PIXI.Container();

    for(let i=7; i>=1; i--){
        const texture = PIXI.loader.resources[`images/backgrounds/${type}/${type}-${i}.png`].texture;
        const sprite = new PIXI.Sprite(texture);

        // Add panning so we can animate parallax
        const backgroundWidthPadding = renderer.width * 1.2;

        sprite.width = backgroundWidthPadding;
        sprite.height = backgroundWidthPadding * (texture.height / texture.width);
        sprite.position.set(0, renderer.height - sprite.height);

        containerSprite.addChild(sprite);
        backgroundSprites.push(sprite);
    }

    containerSprite.hitArea = new PIXI.Rectangle(0, 0, renderer.width, renderer.height);
    containerSprite.interactive = true;
    containerSprite.buttonMode = true;
    containerSprite.on("mousemove", (event) => mouseEventHandler(event, renderer));

    return containerSprite;
};

/**
 * Handles mouse events for our background object
 *
 * @param e
 * @param renderer
 */
const mouseEventHandler = function(e, renderer){
    // Record Delta movement
    if(prevX !== 0 && prevY !== 0) {
        dx = prevX - e.data.global.x;
        dy = prevY - e.data.global.y;
    }

    // Animate background spites
    backgroundSprites.map((sprite, index) => {
        // Calculate background movement
        sprite.x += dx * (backgroundAnimationDamping * index);
        sprite.y += dy * (backgroundAnimationDamping * index);

        // X Bounds
        const xUpperBounds = renderer.width - sprite.width;
        if(sprite.x > 0) sprite.x = 0;
        if(sprite.x < xUpperBounds) sprite.x = xUpperBounds;

        // Y Bounds
        const yUpperBounds = renderer.height - sprite.height;
        if(sprite.y > 0) sprite.y = 0;
        if(sprite.y < yUpperBounds) sprite.y = yUpperBounds;
    });

    // Record prev movement
    prevX = e.data.global.x;
    prevY = e.data.global.y;
};