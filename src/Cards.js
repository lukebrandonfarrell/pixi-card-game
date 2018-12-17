import * as PIXI from "pixi.js";
import { sound, started } from "./main";

export default class Cards extends PIXI.Container {
    constructor(game, rows, columns) {
        super();
        this.cards = []; // cards
        this.activeCards = []; // Keeps a track of active cards
        this.matchAmount = 2; // Number of matches needed
        this.game = game;
        this.game.stage.addChild(this);
        this.create(rows, columns);
    }

    /**
     * Creates the cards
     *
     * @param rows
     * @param columns
     *
     * @return {PIXI.Container}
     */
    create(rows, columns){
        // Rows
        for (let row=0; row<rows; row++) {
            // Columns
            for (let col=0; col<columns; col++) {
                const texture = PIXI.utils.TextureCache[`_back.png`];
                const cardSprite = new PIXI.Sprite(texture);
                // We use the number of columns to determine the width of the card
                const width = this.game.renderer.width / 6;
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
                cardSprite.on('pointerdown', () => this.cardPressed(index));

                this.cards.push(cardSprite);
                this.addChild(cardSprite);
            }
        }
    }

    /**
     * Shows a card
     *
     * @param index
     */
    cardPressed(index) {
        const card = this.cards[index];

        // Flip
        if(started && this.activeCards.length < this.matchAmount && !card.activated && this.activeCards.indexOf(card) === -1) {
            if(sound) PIXI.loader.resources["sounds/flip.mp3"].sound.play();

            // Change the sprite texture
            card.texture = PIXI.utils.TextureCache[`${card.face}.png`];
            this.activeCards.push(card);

            // Check for matches
            if(this.activeCards.length === this.matchAmount){
                const matched = this.activeCards.every(value => value.face === this.activeCards[0].face);

                // Flip back
                if(!matched){
                    this.activeCards.map((sprite, index) => {
                        const actionBlink = new PIXI.action.Blink(10, 2);
                        const animation = PIXI.actionManager.runAction(sprite, actionBlink);

                        animation.on('end', () => {
                            sprite.texture = PIXI.utils.TextureCache['_back.png'];
                            this.activeCards.splice(index);
                        });
                    });
                } else {
                    if(sound) PIXI.loader.resources["sounds/yay.mp3"].sound.play();
                    // MATCH! Set the sprites to activated
                    this.activeCards.map((sprite) => sprite.activated = true);
                    this.activeCards = [];
                }
            }
        }
    }

    /**
     * Add all the symbols to the cards
     *
     * @param symbols
     */
    addCardSymbols(symbols) {
        this.cards.map((sprite, index) => {
            sprite.face = symbols[index].toString();
        });
    }

    /**
     * Resets the cards to initial state
     */
    reset() {
        this.cards.map((sprite) => {
            sprite.activated = false;
            sprite.face = "_back";
            sprite.texture = PIXI.utils.TextureCache['_back.png'];
        });
        this.activeCards = [];
    }

    /**
     * True if all cards are matched
     *
     * @return {boolean}
     */
    getCardsMatched() {
        return this.cards.reduce((acc, sprite) => acc && sprite.activated, true);
    }
}