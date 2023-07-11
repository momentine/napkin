import moment from "moment";

export const formatTime = (msTime) => {
    let time = msTime / 1000;
    let day = Math.floor(time / 60 / 60 / 24);
    let hour = Math.floor(time / 60 / 60) % 24;
    let minute = Math.floor(time / 60) % 60;
    let second = Math.floor(time) % 60;
    return `${day} days ${hour} hours ${minute} minutes ${second} seconds`
}

// Sort dates in ascending order
export const timePositive = (a: string, b: string) => {
    return Date.parse(a) - Date.parse(b)
}

// Sort dates in descending order
export const timeReverse = (a: string, b: string) => {
    return Date.parse(b) - Date.parse(a)
}

// Get the current date
export const getNowMomentDate = (): moment.Moment => {
    return moment().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
}
