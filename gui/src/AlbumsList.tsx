import React, { useState, useEffect } from 'react';
import './App.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { TablePagination, Container } from '@material-ui/core';
import { Album, createAlbum, ListProps, Column } from './interfaces'
import { Link } from 'react-router-dom';
import { getAlbumsList } from './requests'
import useStyles from './styles'
function AlbumsList(props: ListProps) {
    useEffect(() => {
        async function loadAlbunsData() {
            try {
                const resp = await getAlbumsList(props.albumName)
                if(resp?.results?.albummatches?.album?.length){
                    const treatedData = resp.results.albummatches.album.map((album: any) => {
                        return createAlbum(album['image'][1]['#text'], album['name'], album['artist'])
                    })
                    setRows(treatedData)
                }
                else{
                    window.location.href='/noresults'
                }
            }
            catch(error){
                window.location.href='/error'
            }
            props.setSearching(false)
        }
        loadAlbunsData()
    }, [props.numberSearches])
    const [rows, setRows] = useState<Array<Album>>([])
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const columns: Column[] = [
        { id: 'cover', label: 'Capa', minWidth: 170 },
        { id: 'title', label: 'Título', minWidth: 100, align: 'center' },
        { id: 'artist', label: 'Artista', minWidth: 170, align: 'right' }
    ];
    const classes = useStyles();
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    return (
        <Container>
            {rows.length ?
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
                                        <TableRow hover component={Link} to={link} style={{ textDecoration: 'none' }} role="checkbox" tabIndex={-1} key={row.cover}>
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
                        labelRowsPerPage='Linhas por página'
                        labelDisplayedRows={() => { return `${page * rowsPerPage + 1}-${page * rowsPerPage + rowsPerPage} de ${rows.length}` }}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                </Paper> : <div></div>}
        </Container>
    )
}
export default AlbumsList