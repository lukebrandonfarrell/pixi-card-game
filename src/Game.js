export default class Game {
    /**
     * Game Constructor
     */
    constructor() {
        this._app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
        document.getElementById("main").appendChild(this._app.view);
    }

    /**
     * Gets the game stage
     */
    get stage() {
        return this._app.stage;
    }

    /**
     * Gets the game renderer
     */
    get renderer() {
        return this._app.renderer;
    }

    /**
     * Gets the game ticker
     */
    get ticker() {
        return this._app.ticker;
    }
}