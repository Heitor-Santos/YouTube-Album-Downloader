import express from 'express'
import bodyParser from 'body-parser'
import ytdl from 'ytdl-core';
import fs from 'fs'
import cors from 'cors'
import ffmpeg from 'ffmpeg'
import ffmeta from 'ffmetadata'


const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.get('/download', async (req, res) => {
    console.log('downlaod')
    try {
        //const songs = req.body.songs
        const videoURL: string = req.query.videoURL as string
        /*let songBegin=0
        songs.map((song)=>{

            songBegin = song.length
        })*/
        const ytReadable = ytdl(req.query.videoURL as string, {
            quality: 'highestaudio'
        })
        const writeable = ytReadable.pipe(fs.createWriteStream('video.mp4'));
        ytReadable.on('end', () => {
            //res.download('video2.flv')
            console.log('olá')
            const process = new ffmpeg('video.mp4')
            console.log('pra que serve tratamento de erro?')
            process.then(function (video) {
                video.setAudioBitRate(128)
                video.fnExtractSoundToMP3('video.mp3', (err, file) => {
                    if (!err) console.log("mp3: " + file)
                    else console.log(err)
                })
                var data = {
                    artist: "Heitor",
                    album: "Memories", 
                    title: "Recalls",
                    track: "07"
                };
                var options = {
                    attachments: ["photo.png"],
                };
                ffmeta.write("video.mp3", data, options, function (err) {
                    if (err) console.error("Error writing metadata", err);
                    else console.log("Data written");
                });
            }, function (err) {
                console.log('Error: ' + err);
            })
            return res.json('cabou')
        })
        /*ytReadable.on('info', (info, format) => {
            console.log("On info:", info, format);
        });*/
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
    ffmeta.read("video.mp3", function(err, data) {
        if (err) console.error("Error reading metadata", err);
        else console.log(data);
    });
    var data = {
        artist: "Heitor",
        album: "Memories", 
        title: "Recalls",
        track: "07"
    };
    var options = {
        attachments: ['featured.jpg'],
    };
    ffmeta.write("video.mp3", data, options, function (err) {
        if (err) console.error("Error writing metadata", err);
        else console.log("Data written");
    });
})