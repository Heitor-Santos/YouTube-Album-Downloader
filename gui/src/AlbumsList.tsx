import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { TablePagination, Container } from '@material-ui/core';
import { Album, ListProps, Column } from './interfaces'
import { Link } from 'react-router-dom';

function AlbumsList(props: ListProps) {
    useEffect(() => { loadAlbunsData() }, [props.numberSearches])
    const [rows, setRows] = useState<Array<Album>>([])
    const lastFmApi = axios.create({
        baseURL: 'http://ws.audioscrobbler.com/2.0'
    })
    async function loadAlbunsData() {
        console.log(props.albumName)
        const resp = await lastFmApi.get(`?method=album.search&album=${props.albumName}&api_key=99982c4cc358059cd927e1c74d8f7e25&format=json`)
        let rowsY = resp.data['results']['albummatches']['album'].map((album: any) => {
            return createAlbum(album['image'][1]['#text'], album['name'], album['artist'])
        })
        console.log(resp.data)
        console.log(rowsY)
        setRows(rowsY)
        props.setSearching(false)
    }
    const columns: Column[] = [
        { id: 'cover', label: 'Capa', minWidth: 170 },
        { id: 'title', label: 'Título', minWidth: 100, align: 'center' },
        { id: 'artist', label: 'Artista', minWidth: 170, align: 'right' }
    ];
    function createAlbum(cover: string, title: string, artist: string): Album {
        return { cover, title, artist};
    }
    const useStyles = makeStyles({
        root: {
            width: '100%',
        },
        container: {
            maxHeight: 440,
        },
    });

    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    return (
        <Container>
            {rows.length?
            <Paper className={classes.root}>
            <TableContainer className={classes.container}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {console.log(rows)}
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: Album) => {
                            console.log(row)
                            const link = `/album=${row['title']}&artist=${row['artist']}`
                            return (
                                <TableRow hover component={Link} to={link} style={{textDecoration:'none'}} role="checkbox" tabIndex={-1} key={row.cover}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (                                            
                                            <TableCell key={column.id} align={column.align}>
                                                {column.id === 'cover' && typeof value === 'string' ? <img src={value} /> : value} 
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </Paper>:<div></div>}
        </Container>
        
    )
}
export default AlbumsList