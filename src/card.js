import * as PIXI from "pixi.js";
import { started } from "./index";

/**
 * Stores all the card sprites.
 *
 * @type {Array}
 */
let cards = [];

/**
 * Keeps a track of active cards
 */
let activeCards = [];

/**
 * Number of matches needed
 */
let matchAmount = 2;

/**
 * Number of rows to render
 *
 * @type {number}
 */
const rows = 2;

/**
 * Number of columns to render
 *
 * @type {number}
 */
const columns = 5;

/**
 * Creates the cards
 *
 * @param renderer
 * @return {PIXI.Container}
 */
export const createCards = (renderer) => {
    const containerSprite = new PIXI.Container();

    // Rows
    for (let row=0; row<rows; row++) {
        // Columns
        for (let col=0; col<columns; col++) {
            const texture = PIXI.utils.TextureCache[`_back.png`];
            const cardSprite = new PIXI.Sprite(texture);
            // We use the number of columns to determine the width of the card
            const width = renderer.width / (columns + 1);
            // We calculate the index of the card from the row and column
            const index = row * (columns) + col;

            cardSprite.width = width;
            cardSprite.height = width * (texture.height / texture.width);

            /*
             * We need to switch col and row in this formula
             * because col represents the X axis and row the Y.
             */
            cardSprite.x = cardSprite.width * col;
            cardSprite.y = cardSprite.height * row;
            cardSprite.face = "_back";
            cardSprite.activated = false;
            cardSprite.alpha = 0.80;

            cardSprite.interactive = true;
            cardSprite.on('pointerdown', () => cardPressed(index));

            cards.push(cardSprite);
            containerSprite.addChild(cardSprite);
        }
    }

    return containerSprite;
};

/**
 * Add all the symbols to the cards
 *
 * @param symbols
 */
export const addCardSymbols = (symbols) => {
    cards.map((sprite, index) => {
        sprite.face = symbols[index].toString();
    });
};

/**
 * Shows a card
 *
 * @param index
 */
const cardPressed = (index) => {
    const card = cards[index];

    // Flip
    if(started && activeCards.length < matchAmount && !card.activated) {
        PIXI.loader.resources["sounds/flip.mp3"].sound.play();

        // Change the sprite texture
        card.texture = PIXI.utils.TextureCache[`${card.face}.png`];
        activeCards.push(card);

        // Check for matches
        if(activeCards.length === matchAmount){
            const matched = activeCards.every(value => value.face === activeCards[0].face);

            // Flip back
            if(!matched){
                activeCards.map((sprite, index) => {
                    const actionBlink = new PIXI.action.Blink(10, 2);
                    const animation = PIXI.actionManager.runAction(sprite, actionBlink);

                    animation.on('end', () => {
                        sprite.texture = PIXI.utils.TextureCache['_back.png'];
                        activeCards.splice(index);
                    });
                });
            } else {
                PIXI.loader.resources["sounds/yay.mp3"].sound.play();
                // MATCH! Set the sprites to activated
                activeCards.map((sprite) => sprite.activated = true);
                activeCards = [];
            }
        }
    }
};

export const resetCards = () => {
    cards.map((sprite) => {
        sprite.activated = false;
        sprite.face = "_back";
        sprite.texture = PIXI.utils.TextureCache['_back.png'];
    });
    activeCards = [];
};

/**
 * True if all cards are matched
 *
 * @return {boolean}
 */
export const getCardsMatched = () => cards.reduce((acc, sprite) => acc && sprite.activated, true);