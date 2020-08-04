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