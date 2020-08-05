export function checkImageExists(imageUrl:string, callBack:Function) {
    var imageData = new Image();
    imageData.onload = function () {
        callBack(true);
    };
    imageData.onerror = function () {
        callBack(false);
    };
    imageData.src = imageUrl;
}
export function sec2time(timeInSeconds: number) {
    const minutes = ("0" + Math.floor(timeInSeconds / 60)).slice(-2);
    let seconds = ("0" + (timeInSeconds % 60)).slice(-2);
    return `${minutes}:${seconds}`
}