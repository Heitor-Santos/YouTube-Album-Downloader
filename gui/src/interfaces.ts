export interface Album {
    cover: string;
    title: string;
    artist: string;
}
export function createAlbum(cover: string, title: string, artist: string): Album {
    const unsupported = ['','null','(null)','unknown','Unknown','[Unknown]','(Unknown)']
    if(unsupported.includes(title)) title='[Desconhecido]'
    if(unsupported.includes(artist)) artist='[Desconhecido]'
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
    const unsupported = ['','null','(null)','unknown','Unknown','[Unknown]','(Unknown)']
    if(unsupported.includes(track)) track='[Desconhecido]'
    if(unsupported.includes(length)) length='[Desconhecido]'
    return { track, length };
}
export interface InfoProps {
    match: {
        params: {
            albumName: string;
            artist: string;
        }
    }
    videoURL: string,
    videoTitle: string,
    videoDuration: number,
    setSearching: Function;
}