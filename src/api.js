import { defaultSymbols } from "./values";

/**
 * An API request which gets the game configuration
 *
 * We would swap this out for an API fetch request or
 * something which checks the local storage for a
 * previous request and loads the data.
 */
export const fetchGame = () => {
    return {
        symbols: defaultSymbols,
        time: 60,
    };
};