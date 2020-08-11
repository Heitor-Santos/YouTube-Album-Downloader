import ffmpeg from 'ffmpeg'
import ffmeta from 'ffmetadata'
import archiver from 'archiver'
import fs from 'fs'

interface processState {
    songsReady: number,
    songsMeta: number,
    songsMP3: number,
    songSplit: number,
}
interface song {
    track: string,
    length: string
}
function splitVideo(numberTracks: number, videoSrc: string, songBegin: number, song: song, i, dir, artist: string, album: string, linkCover: string, process: processState, res:any) {
    const processVideo = new ffmpeg(videoSrc)
    processVideo.then(function (video) {
        video.setVideoStartTime(songBegin)
        video.setVideoDuration(parseInt(song.length))
        let dest = `${dir}/${song.track.replace(/ /g, '***')}.mp4`
        dest = dest.replace(/'/g, '%%%')
        dest = dest.replace(/"/g, '@@@')
        video.save(dest, (err, splitedVideo) => {
            if (err) throw new Error('erro separando o vídeo!')
            else {
                if (++process.songSplit == 1)
                    console.log('Início da separação!')
                extractMP3(numberTracks, dest, song, dir, artist, album, linkCover, i, process, res)
            }
        })
    })
}
function extractMP3(numberTracks: number, videoSrc: string, song: song, dir: string, artist: string, album: string, linkCover: string, i: number, process: processState, res:any) {
    const processVideo = new ffmpeg(videoSrc)
    let dest = `${dir}/songs/${song.track.replace(/ /g, '***')}.mp3`
    dest = dest.replace(/'/g, '%%%')
    dest = dest.replace(/"/g, '@@@')
    processVideo.then((video) => {
        video.fnExtractSoundToMP3(dest, (err, file) => {
            if (!err) {
                if (++process.songsMP3 == 1)
                    console.log('Início da extração!')
                applyMetadata(numberTracks, artist, album, song.track, i, linkCover, dir, process, res)
            }
            else {
                throw new Error('erro extraindo o MP3!')
            }
        })
    })
}
function applyMetadata(numberTracks: number, artist: string, album: string, songName: string, i: number, linkCover, dir: string, process: processState, res:any) {
    var data = {
        artist: artist,
        album: album,
        title: songName,
        track: i.toString()
    };
    var options = {
        attachments: [linkCover],
    };
    let dest = `${dir}/songs/${songName.replace(/ /g, '***')}.mp3`
    dest = dest.replace(/'/g, '%%%')
    dest = dest.replace(/"/g, '@@@')
    ffmeta.write(dest, data, options, function (err) {
        if (err) throw new Error('erro aplicando metadados!')
        else {
            if (++process.songsMeta == 1)
                console.log('Início da aplicação de metadados!')
            fs.rename(dest, `${dir}/songs/${songName}.mp3`, () => {
                if (process.songsMeta == numberTracks - 1) {
                    compactAlbum(dir, album, res)
                }
            })
        }
    });
}
function compactAlbum(dir: string, album: string,res:any) {
    const output = fs.createWriteStream(`${dir}/${album}.zip`);
    const archive = archiver('zip', {
        zlib: { level: 9 } 
    });
    console.log('Começando a compactar!')
    archive.pipe(output);
    archive.directory(`${dir}/songs/`, album);
    archive.finalize();
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        destroyGarbage(dir)
        res.download(`${dir}/${album}.zip`)
    });
    output.on('end', function () {
        console.log('Data has been drained');
    });
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.log(err)
        } else {
            throw err;
        }
    });
    archive.on('error', function (err) {
        throw err;
    });

}
function destroyGarbage(dir: string){
    fs.readdir(dir,(err, files)=>{
        if(err) throw err;
        else{
            files.map(file=>{
                if(file.endsWith('mp4')){
                    fs.unlinkSync(file)
                }
            })
            setTimeout(()=>{
                fs.rmdirSync(dir, { recursive: true })
            },600000)
        }
    })
}
export default splitVideo