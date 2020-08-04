import { checkImageExists } from './util'
export interface Album {
    cover: string;
    title: string;
    artist: string;
}
export function createAlbum(cover: string, title: string, artist: string): Album {
    checkImageExists(cover, function (existsImage:boolean) {
        if (existsImage !== true) {
            cover = 'gui/src/assets/broken-1.png'
        }
    });
    if(title===(''||'null'||'(null)'||'unknown'||'Unknown'||'[Unknown]'||'(Unknown)')) title='[Desconhecido]'
    if(artist===(''||'null'||'(null)'||'unknown'||'Unknown'||'[Unknown]'||'(Unknown)')) artist='[Desconhecido]'
    return { cover, title, artist };
}
export interface ListProps {
    albumName: string;
    numberSearches: number;
    setSearching: Function;
}
export interface Column {
    id: 'cover' | 'title' | 'artist';
    label: string;
    minWidth?: number;
    align?: 'right' | 'center';
    format?: (value: number) => string;
}
export interface AlbumInfoColumn {
    id: 'track' | 'length';
    label: string;
    minWidth?: number;
    align?: 'right' | 'center';
    format?: (value: number) => string;
}
export interface Song {
    track: string;
    length: string;
}
export function createSong(track: string, length: string): Song {
    if(track===(''||'null'||'(null)'||'unknown'||'Unknown'||'[Unknown]'||'(Unknown)')) track='[Desconhecido]'
    if(length===(''||'null'||'(null)'||'unknown'||'Unknown'||'[Unknown]'||'(Unknown)')) length='[Desconhecido]'
    return { track, length };
}
export interface InfoProps {
    match: {
        params: {
            albumName: string;
            artist: string;
        }
    }
    setSearching: Function;
}