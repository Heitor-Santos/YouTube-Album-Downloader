export interface Album {
    cover: string;
    title: string;
    artist: string;
}
export interface ListProps {
    albumName: string;
    numberSearches: number;
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
export interface InfoProps {
    match: {
        params: {
            albumName: string;
            artist: string;
        }
    }
}