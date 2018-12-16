import { defaultSymbols } from "./values";

/**
 * An API request which gets the game configuration
 */
export const fetchGame = () => {
    return {
        symbols: defaultSymbols,
        time: 15,
    };
    // const res = await fetch('https://api.gigdemo.com/game');
    //
    // console.log(res);
};