import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3333'
});

const lastFmApi = axios.create({
    baseURL: 'http://ws.audioscrobbler.com/2.0'
})
export const getVideoInfo = async(videoURL:string)=>{
    const resp = await api.get(`/videoinfo?videoURL=${videoURL}`)
    return resp.data
}
export const downloadAlbum = async(videoURL: string)=>{
    const resp = await api.get(`/download?videoURL=${videoURL}`, { responseType: 'blob' })
    return resp.data
}
export const getAlbumsList=async(albumName:string)=>{
    const resp = await lastFmApi.get(`?method=album.search&album=${albumName}&api_key=99982c4cc358059cd927e1c74d8f7e25&format=json`)
    return resp.data
} 
export const getAlbumInfo=async(albumName:string, artist:string)=>{
    const resp = await lastFmApi.get(`?method=album.getinfo&api_key=99982c4cc358059cd927e1c74d8f7e25&artist=${artist}&album=${albumName}&format=json`)
    return resp.data
}