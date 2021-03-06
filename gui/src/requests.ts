import axios from 'axios'
import { Song } from './interfaces'
const api = axios.create({
    baseURL: 'https://ytadserver.herokuapp.com/'
});

const lastFmApi = axios.create({
    baseURL: 'https://ws.audioscrobbler.com/2.0'
})
export const getVideoInfo = async (videoURL: string) => {
    const resp = await api.get(`/videoinfo?videoURL=${videoURL}`)
    return resp.data
}
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
export const prepareAlbum = async (videoURL: string, artist: string, album: string, songs: Song[], linkCover: string) => {
    const resp = await api.post(`/download?videoURL=${videoURL}`, { songs, artist, album, linkCover })
    return resp.data
}
export const downloadAlbum = async (album: string, dir: string) => {
    const resp = await api.get(`/downloadReady?album=${album}&dir=${dir}`, {
        responseType: 'blob'
    })
    return resp.data
}
export const getAlbumsList = async (albumName: string) => {
    const resp = await lastFmApi.get(`?method=album.search&album=${albumName}&api_key=99982c4cc358059cd927e1c74d8f7e25&format=json`)
    return resp.data
}
export const getAlbumInfo = async (albumName: string, artist: string) => {
    const resp = await lastFmApi.get(`?method=album.getinfo&api_key=99982c4cc358059cd927e1c74d8f7e25&artist=${artist}&album=${albumName}&format=json`)
    return resp.data
}