import express from 'express'
import bodyParser from 'body-parser'
import ytdl from 'ytdl-core';
import fs from 'fs'
import cors from 'cors'
import ffmpeg from 'ffmpeg'
import { v4 as uuidv4 } from 'uuid';
import splitVideo from './splitVideo'
import http from 'http'
import socket from 'socket.io'

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
app.use('*',cors({origin: 'https://yt-album-downloader.web.app'}))
app.options('*',cors({origin: 'https://yt-album-downloader.web.app'}))
app.use(express.json())
app.use(bodyParser.json())
const server = http.createServer(app)
const io = socket(server)
io.on('connection',(socket)=>{
    console.log('conectou')
    //socket.emit('odio','tbm te odeio')
    //console.log(socket)oo
    /*app.options('/download', async(req, res)=>{
        //res.setHeader('Access-Control-Allow-Origin', 'https://yt-album-downloader.web.app')
        return res.json('deixa')
    })*/
    app.post('/download', cors({origin: 'https://yt-album-downloader.web.app'}), async (req, res) => {
        console.log('Começou o download!')
        try {
            const songs: song[] = req.body.songs
            const dir = uuidv4();
            const title = uuidv4();
            console.log(dir)
            const artist: string = req.body.artist
            const album: string = req.body.album
            const linkCover: string = req.body.linkCover
            const videoURL: string = req.query.videoURL as string
            let socketProgress: socket.Socket
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
                socket.emit('prdwn', percent)
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
                                splitVideo(songs.length, `${dir}/${title}PROCESSED.mp4`, songBegin, songs[i], i, dir, artist, album, linkCover, process, res, socket)
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
})
app.get('/teste', async(req,res)=>{
    return res.json({'foo':'bar'})
})
app.get('/videoinfo', async (req, res) => {
    console.log('info')
    let info = {}
    try {
        info = await ytdl.getInfo(req.query.videoURL as string)
    }
    catch (error) {
        info = {}
    }
    return res.json(info)
})
const port = process.env.PORT || 3333
server.listen(port, () => {
    console.log('server at the '+port)
})
