import * as PIXI from "pixi.js";

export default class Background extends PIXI.Container {
    constructor(game, type) {
        super();
        this.backgroundSprites = []; // Stores all our background sprites (so we can pan them)
        this.backgroundAnimationDamping = 0.01; // Float to reduce the background animation effect
        this.dx = 0; // Background Delta X
        this.dy = 0; // Background Delta Y
        this.prevX = 0; // Background Previous X
        this.prevY = 0; // Background Previous Y
        this.game = game;
        this.game.stage.addChild(this);
        this.create(type);
    }

    /**
     * Creates a segregated background
     *
     * @param type
     * @param renderer
     *
     * @return {PIXI.Container}
     */
    create(type = 'water') {
        const containerSprite = new PIXI.Container();

        for(let i=7; i>=1; i--){
            const texture = PIXI.loader.resources[`images/backgrounds/${type}/${type}-${i}.png`].texture;
            const sprite = new PIXI.Sprite(texture);

            // Add panning so we can animate parallax
            const backgroundWidthPadding = this.game.renderer.width * 1.2;

            sprite.width = backgroundWidthPadding;
            sprite.height = backgroundWidthPadding * (texture.height / texture.width);
            sprite.position.set(0, this.game.renderer.height - sprite.height);

            containerSprite.addChild(sprite);
            this.backgroundSprites.push(sprite);
        }

        containerSprite.hitArea = new PIXI.Rectangle(0, 0, this.game.renderer.width, this.game.renderer.height);
        containerSprite.interactive = true;
        containerSprite.buttonMode = true;
        containerSprite.on("mousemove", (event) => this.parallax(event));

        this.addChild(containerSprite);
    }

    /**
     * Handles mouse events for our background object
     *
     * @param e
     */
    parallax(e){
        // Record Delta movement
        if(this.evX !== 0 && this.prevY !== 0) {
            this.dx = this.prevX - e.data.global.x;
            this.dy = this.prevY - e.data.global.y;
        }

        // Animate background spites
        this.backgroundSprites.map((sprite, index) => {
            // Calculate background movement
            sprite.x += this.dx * (this.backgroundAnimationDamping * index);
            sprite.y += this.dy * (this.backgroundAnimationDamping * index);

            // X Bounds
            const xUpperBounds = this.game.renderer.width - sprite.width;
            if(sprite.x > 0) sprite.x = 0;
            if(sprite.x < xUpperBounds) sprite.x = xUpperBounds;

            // Y Bounds
            const yUpperBounds = this.game.renderer.height - sprite.height;
            if(sprite.y > 0) sprite.y = 0;
            if(sprite.y < yUpperBounds) sprite.y = yUpperBounds;
        });

        // Record prev movement
        this.prevX = e.data.global.x;
        this.prevY = e.data.global.y;
    }

    /**
     * Gets available backgrounds
     *
     * @return {array}
     */
    static backgrounds() {
        return ["water", "swamp", "forest", "night"];
    }
}