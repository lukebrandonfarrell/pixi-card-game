import * as PIXI from "pixi.js";

/**
 * All the game resources
 *
 * @type {array}
 */
export const resources = [
    "images/backgrounds/water/water-1.png",
    "images/backgrounds/water/water-2.png",
    "images/backgrounds/water/water-3.png",
    "images/backgrounds/water/water-4.png",
    "images/backgrounds/water/water-5.png",
    "images/backgrounds/water/water-6.png",
    "images/backgrounds/water/water-7.png",
    "images/backgrounds/night/night-1.png",
    "images/backgrounds/night/night-2.png",
    "images/backgrounds/night/night-3.png",
    "images/backgrounds/night/night-4.png",
    "images/backgrounds/night/night-5.png",
    "images/backgrounds/night/night-6.png",
    "images/backgrounds/night/night-7.png",
    "images/backgrounds/swamp/swamp-1.png",
    "images/backgrounds/swamp/swamp-2.png",
    "images/backgrounds/swamp/swamp-3.png",
    "images/backgrounds/swamp/swamp-4.png",
    "images/backgrounds/swamp/swamp-5.png",
    "images/backgrounds/swamp/swamp-6.png",
    "images/backgrounds/swamp/swamp-7.png",
    "images/backgrounds/forest/forest-1.png",
    "images/backgrounds/forest/forest-2.png",
    "images/backgrounds/forest/forest-3.png",
    "images/backgrounds/forest/forest-4.png",
    "images/backgrounds/forest/forest-5.png",
    "images/backgrounds/forest/forest-6.png",
    "images/backgrounds/forest/forest-7.png",
    "textures/cards-0.json",
    "textures/cards-0.png",
    "textures/cards-1.json",
    "textures/cards-1.png",
    "textures/cards-2.json",
    "textures/cards-2.png",
    "textures/gui.json",
    "textures/gui.png",
    "sounds/lose.mp3",
    "sounds/win.mp3",
    "sounds/jungle.mp3",
    "sounds/flip.mp3",
    "sounds/yay.mp3",
];

/**
 *  Loads the resources we need in the Game
 *  and calls the provided callback when done.
 *
 *  @param {Array}      resources       The resources to load
 *  @param {Function}   callback              The function to call when the loading is completed
 *  @param {Function}   progress              The function to call on progress
 *
 */
export const preloadResources = (resources, callback, progress) => {

    // Add the resources and trigger Callback when loaded
    PIXI.loader
        .add(resources)
        .on('progress', progress)
        .load(callback);
};
