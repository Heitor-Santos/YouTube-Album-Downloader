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
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { makeStyles } from '@material-ui/core/styles';
import { TablePagination, Card, CardMedia, CardActionArea, CardContent, Typography, Grid, Button } from '@material-ui/core';
import { Album, ListProps, Column, AlbumInfoColumn, Song, InfoProps } from './interfaces'
import { getAlbumInfo } from './requests'

function AlbumInfo(props: InfoProps) {
    const [rows, setRows] = useState<Array<Song>>([])
    const [cover, setCover] = useState<string>('')
    useEffect(() => { loadSongsData() }, [])
    function sec2time(timeInSeconds: number) {
        const minutes = ("0" + Math.floor(timeInSeconds / 60)).slice(-2);
        let seconds = ("0" + (timeInSeconds % 60)).slice(-2);
        return `${minutes}:${seconds}`
    }
    async function loadSongsData() {
        const resp = await getAlbumInfo(props.match.params.albumName, props.match.params.artist)
        const rowsY = resp['album']['tracks']['track'].map((song: any) => {
            return createSong(song['name'], sec2time(song['duration']))
        })
        setCover(resp['album']['image'][3]['#text'])
        setRows(rowsY)
    }
    const columns: AlbumInfoColumn[] = [
        { id: 'track', label: 'Faixa', minWidth: 100, align: 'center' },
        { id: 'length', label: 'Duração', minWidth: 170, align: 'right' }
    ];
    function createSong(track: string, length: string): Song {
        return { track, length };
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
        <Paper className={classes.root}>
            <Grid container spacing={4}>
                <Grid item>
                    <img src={cover} />
                </Grid>
                <Grid item>
                    <Typography variant="h4">{props.match.params.albumName}</Typography>
                    <Typography variant="h5">{props.match.params.artist}</Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<CloudDownloadIcon />}
                    >
                        Download
                    </Button>
                </Grid>
            </Grid>
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
                        {console.log(cover)}
                        {console.log(rows)}
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: Song) => {
                            console.log(row)
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.track}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                {value}
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
        </Paper>
    )
}
export default AlbumInfo