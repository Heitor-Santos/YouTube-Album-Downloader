"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gambiarra = void 0;
const ffmpeg_1 = __importDefault(require("ffmpeg"));
const ffmetadata_1 = __importDefault(require("ffmetadata"));
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
function splitVideo(numberTracks, videoSrc, songBegin, song, i, dir, artist, album, linkCover, process) {
    const processVideo = new ffmpeg_1.default(videoSrc);
    processVideo.then(function (video) {
        video.setVideoStartTime(songBegin);
        video.setVideoDuration(parseInt(song.length));
        let dest = `${dir}/${song.track.replace(/ /g, '***')}.mp4`;
        dest = dest.replace(/'/g, '%%%');
        dest = dest.replace(/"/g, '@@@');
        video.save(dest, (err, splitedVideo) => {
            if (err)
                throw new Error('erro separando o vídeo!');
            else {
                if (++process.songSplit == 1) {
                    //socket.emit('step', 'Separando as faixas')
                    console.log('Início da separação!');
                }
                extractMP3(numberTracks, dest, song, dir, artist, album, linkCover, i, process);
            }
        });
    });
}
function extractMP3(numberTracks, videoSrc, song, dir, artist, album, linkCover, i, process) {
    const processVideo = new ffmpeg_1.default(videoSrc);
    let dest = `${dir}/songs/${song.track.replace(/ /g, '***')}.mp3`;
    dest = dest.replace(/'/g, '%%%');
    dest = dest.replace(/"/g, '@@@');
    processVideo.then((video) => {
        video.fnExtractSoundToMP3(dest, (err, file) => {
            if (!err) {
                if (++process.songsMP3 == 1) {
                    console.log('Início da extração!');
                }
                applyMetadata(numberTracks, artist, album, song.track, i, linkCover, dir, process);
            }
            else {
                throw new Error('erro extraindo o MP3!');
            }
        });
    });
}
function applyMetadata(numberTracks, artist, album, songName, i, linkCover, dir, process) {
    var data = {
        artist: artist,
        album: album,
        title: songName,
        track: i.toString()
    };
    var options = {
        attachments: [linkCover],
    };
    let dest = `${dir}/songs/${songName.replace(/ /g, '***')}.mp3`;
    dest = dest.replace(/'/g, '%%%');
    dest = dest.replace(/"/g, '@@@');
    ffmetadata_1.default.write(dest, data, options, function (err) {
        if (err)
            throw new Error('erro aplicando metadados!');
        else {
            if (++process.songsMeta == 1) {
                console.log('Início da aplicação de metadados!');
            }
            fs_1.default.rename(dest, `${dir}/songs/${songName}.mp3`, () => {
                if (process.songsMeta == numberTracks) {
                    compactAlbum(dir, album, process);
                }
            });
        }
    });
}
function compactAlbum(dir, album, process) {
    const output = fs_1.default.createWriteStream(`${dir}/${album}.zip`);
    const archive = archiver_1.default('zip', {
        zlib: { level: 9 }
    });
    console.log('Começando a compactar!');
    archive.pipe(output);
    archive.directory(`${dir}/songs/`, album);
    archive.finalize();
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        process.songsMeta++;
        destroyGarbage(dir);
        // /res.setHeader('Access-Control-Allow-Origin', 'https://yt-album-downloader.web.app');
        //res.download(`${dir}/${album}.zip`)
        //return res.json({'oi':'ola'})
        //res.send('UMA STRING PRA VOCÊ')
    });
    output.on('end', function () {
        console.log('Data has been drained');
    });
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.log(err);
        }
        else {
            throw err;
        }
    });
    archive.on('error', function (err) {
        throw err;
    });
}
function destroyGarbage(dir) {
    let listFiles = [];
    fs_1.default.readdir(dir, (err, files) => {
        if (err)
            throw err;
        else {
            listFiles = files;
        }
        listFiles.map(file => {
            if (file.endsWith('mp4')) {
                fs_1.default.unlinkSync(`${dir}/${file}`);
            }
        });
        setTimeout(() => {
            fs_1.default.rmdirSync(dir, { recursive: true });
        }, 600000);
    });
}
function gambiarra(obj, numberTracks) {
    return __awaiter(this, void 0, void 0, function* () {
        if (obj.songsMeta === numberTracks + 1) { //we want it to match
            return true;
        }
        else {
            yield setTimeout(gambiarra, 5000);
        }
    });
}
exports.gambiarra = gambiarra;
exports.default = splitVideo;
//# sourceMappingURL=splitVideo.js.map