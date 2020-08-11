import express from 'express'
import bodyParser from 'body-parser'
import ytdl from 'ytdl-core';
import fs from 'fs'
import cors from 'cors'
import ffmpeg from 'ffmpeg'
import { v4 as uuidv4 } from 'uuid';
import splitVideo from './splitVideo'

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
const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())

app.get('/download', async (req, res) => {
    console.log('Começou o download!')
    try {
        const songs: song[] = req.body.songs
        const dir = uuidv4();
        const title = uuidv4();
        const artist: string = req.body.artist
        const album: string = req.body.album
        const linkCover: string = req.body.linkCover
        const videoURL: string = req.query.videoURL as string
        const ytReadable = ytdl(videoURL, {
            quality: 'highestaudio'
        })
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(`${dir}/songs`)) {
            fs.mkdirSync(`${dir}/songs`);
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
                video.setAudioBitRate(128)
                video.save(`${dir}/${title}PROCESSED.mp4`, (err, file) => {
                    if (err) throw new Error('erro fazendo download do vídeo!')
                    else {
                        console.log('\nTerminou de baixar!')
                        let songBegin = 0
                        let process: processState = { songsReady: 0, songSplit: 0, songsMP3: 0, songsMeta: 0 }
                        for (let i = 0; i < songs.length; i++) {
                            splitVideo(songs.length, `${dir}/${title}PROCESSED.mp4`, songBegin, songs[i], i, dir, artist, album, linkCover, process, res)
                            songBegin += parseInt(songs[i].length) + 1
                        }
                    }
                })
            }, function (err) {
                throw new Error('erro geral!')
            })
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
    /*const songs = [
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
    }*/
})