import express from 'express'
import bodyParser from 'body-parser'
import ytdl from 'ytdl-core';
import fs from 'fs'
import cors from 'cors'


const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.get('/download', async (req, res) => {
    console.log('downlaod')
    try {
        const ytReadable= ytdl(req.query.videoURL as string)
        const writeable= ytReadable.pipe(fs.createWriteStream('video2.flv'));
        ytReadable.on('end',()=>{
            res.download('video2.flv')
        })
    }
    catch (err) {
        console.log(err)
    }
})
app.get('/videoinfo', async (req, res)=>{
    let info={}
    try{
        info = await ytdl.getInfo(req.query.videoURL as string)
    }
    catch(error){
        info={}
    }
    return res.json(info)
})
app.listen(3333, () => {
    console.log('server at the 3333')
})