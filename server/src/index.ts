import express from 'express'
import bodyParser from 'body-parser'
import ytdl from 'ytdl-core';
import fs from 'fs'
import cors from 'cors'
import ffmpeg from 'ffmpeg'
import ffmeta from 'ffmetadata'
import { v4 as uuidv4 } from 'uuid';

const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())

function splitVideo(videoSrc: string, songBegin: number, song: { 'track': string, 'length': string }, i, dir, artist: string, album: string, linkCover: string) {
    const processVideo = new ffmpeg(videoSrc)
    console.log(i, songBegin, song.length)
    processVideo.then(function (video) {
        console.log(i, songBegin, song.length, 'PROCESSO')
        const start = Date.now()
        video.setVideoStartTime(songBegin)
        video.setVideoDuration(parseInt(song.length))
        let dest = `${dir}/${song.track.replace(/ /g, '***')}.mp4`
        dest = dest.replace(/'/g, '%%%')
        dest = dest.replace(/"/g, '@@@')
        video.save(dest, (err, splitedVideo) => {
            if (err) console.log("linha 21" + err)
            else {
                console.log('salvou')
                const bit = Date.now() - start
                console.log(bit)
                extractMP3(dest, song, dir, artist, album, linkCover, i)
            }
        })
    })
}
function extractMP3(videoSrc: string, song: { 'track': string, 'length': string }, dir: string, artist: string, album: string, linkCover: string, i: number) {
    const processVideo = new ffmpeg(videoSrc)
    console.log(song.track)
    let dest = `${dir}/${song.track.replace(/ /g, '***')}.mp3`
    dest = dest.replace(/'/g, '%%%')
    dest = dest.replace(/"/g, '@@@')
    console.log(dest)
    processVideo.then((video) => {
        video.fnExtractSoundToMP3(dest, (err, file) => {
            if (!err) {
                    applyMetadata(artist, album, song.track, i, linkCover, dir)
                    console.log("mp3: " + file)
            }
            else {
                console.log('erro extraindo MP3')
                console.log(err)
            }
        })
    })
}
function applyMetadata(artist: string, album: string, songName: string, i: number, linkCover, dir: string) {
    var data = {
        artist: artist,
        album: album,
        title: songName,
        track: i.toString()
    };
    var options = {
        attachments: [linkCover],
    };
    let dest = `${dir}/${songName.replace(/ /g, '***')}.mp3`
    dest = dest.replace(/'/g, '%%%')
    dest = dest.replace(/"/g, '@@@')
    ffmeta.write(dest, data, options, function (err) {
        if (err) console.error("Error writing metadata", err);
        else {
            console.log("Data written" + i);
            fs.rename(dest, `${dir}/${songName}.mp3`,()=>{
                console.log("ACABOU!!")
            })
        }
    });
}
app.get('/download', async (req, res) => {
    console.log('downlaod')
    try {
        const songs = req.body.songs
        const dir = uuidv4();
        const title = uuidv4();
        const artist = req.body.artist
        const album = req.body.album
        const linkCover = req.body.linkCover
        const videoURL: string = req.query.videoURL as string
        const ytReadable = ytdl(videoURL, {
            quality: 'highestaudio'
        })
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const writeable = ytReadable.pipe(fs.createWriteStream(`${dir}/${title}.mp4`));
        ytReadable.on('progress', (chunk, downloaded, total) => {
            let percent = Math.floor((downloaded / total) * 100);
            process.stdout.write("\r\x1b[K")
            process.stdout.write(`Progress: ${percent}%`);
        })
        ytReadable.on('end', () => {
            const processVideo = new ffmpeg(`${dir}/${title}.mp4`)
            processVideo.then(function (video) {
                const start = Date.now()
                video.setAudioBitRate(128)
                video.save(`${dir}/${title}PROCESSED.mp4`, (err, file) => {
                    if (err) console.log(err)
                    else {
                        console.log('salvou')
                        console.log(Date.now() - start)
                        let songBegin = 0
                        for (let i = 0; i < songs.length; i++) {
                            splitVideo(`${dir}/${title}PROCESSED.mp4`, songBegin, songs[i], i, dir, artist, album, linkCover)
                            songBegin += parseInt(songs[i].length) + 1
                        }
                    }
                })
            }, function (err) {
                console.log('Error: ' + err);
            })
            return res.json('cabou')
        })
    }
    catch (err) {
        console.log(err)
    }
})
app.get('/videoinfo', async (req, res) => {
    let info = {}
    try {
        info = await ytdl.getInfo(req.query.videoURL as string)
    }
    catch (error) {
        info = {}
    }
    return res.json(info)
})
app.listen(3333, () => {
    console.log('server at the 3333')
    const songs = [
        { "track": "Five Years", "length": "282" },
        { "track": "Soul Love", "length": "214" },
        { "track": "Moonage Daydream", "length": "277" },
        { "track": "Starman", "length": "250" },
        { "track": "It Ain't Easy", "length": "178" },
        { "track": "Lady Stardust", "length": "199" },
        { "track": "Star", "length": "167" },
        { "track": "Hang on to Yourself", "length": "160" },
        { "track": "Ziggy Stardust", "length": "193" },
        { "track": "Suffragette City", "length": "205" },
        { "track": "Rock 'n' Roll Suicide", "length": "178" }
    ]
    const album = "Ziggy Stardust"
    const artist = "David Bowie"
    const linkCover = "https://lastfm.freetls.fastly.net/i/u/300x300/3017b2f31110e4f6de45a212fe93b4a3.png"
    let songBegin = 0
    for (let i = 0; i < songs.length; i++) {
        splitVideo(`teste/teste.mp4`, songBegin, songs[i], i, 'teste', artist, album, linkCover)
        songBegin += parseInt(songs[i].length) + 1
    }
})