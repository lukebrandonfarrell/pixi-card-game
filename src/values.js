import _ from "lodash";

/**
 * Generates random symbols for the game
 *
 * @type {string[]}
 */
export const randomSymbols = Array.from({ length: 5 }, () => `_face${Math.floor(Math.random() * 15) + 1}`);

/**
 * Default symbols
 *
 * @type {Array}
 */
export const defaultSymbols = _.shuffle([ ...randomSymbols, ...randomSymbols ]);

/**
 * Default time
 *
 * @type {number}
 */
export const defaultTime = 60;