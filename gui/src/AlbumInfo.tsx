import React, { useState, useEffect } from 'react';
import './App.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { TablePagination, Typography, Grid, Button, Container, Box, Divider, CircularProgress } from '@material-ui/core';
import { AlbumInfoColumn, Song, InfoProps, createSong } from './interfaces'
import { getAlbumInfo, downloadAlbum } from './requests'
import useStyles from './styles'
import { sec2time, labelRows } from './util'
import socket from 'socket.io-client'
let io;

function AlbumInfo(props: InfoProps) {
    const [rows, setRows] = useState<Array<Song>>([])
    const [cover, setCover] = useState<string>('')
    const [disabled, setDisabled] = useState<boolean>(true)
    const [downloading, setDownloading]= useState<boolean>(false)
    const [percentDown,setPercentDown] = useState<number>(0)
    const [step, setStep] = useState<string>('')
    const [durationError, setDurationError] = useState<boolean>(false)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    useEffect(() => {
        async function loadSongsData() {
            props.setSearching(true)
            try {
                const resp = await getAlbumInfo(props.match.params.albumName, props.match.params.artist)
                if (resp?.album?.tracks?.track.length) {
                    const treatedData = resp.album.tracks.track.map((song: any) => {
                        return createSong(song.name, song.duration)
                    })
                    setCover(resp?.album?.image[3]['#text'] || '[Sem capa]')
                    setRows(treatedData)
                }
                else window.location.href = '/noinfotracks'
            }
            catch (error) {
                window.location.href = '/error'
            }
            props.setSearching(false)
        }
        loadSongsData()
    }, [props.match.params.albumName, props.match.params.artist])
    useEffect(() => {
        const unsupported = ['Isso não é um link do YouTube', 'Ocorreu um erro', '']
        const albumDuration = rows.reduce((songPrev, songCurr) => {
            return { length: (parseInt(songPrev.length) + parseInt(songCurr.length)).toString(), track: 'useless' }
        }, { length: '0', track: 'useles' })
        setDurationError(false)
        if (unsupported.includes(props.videoTitle) || parseInt(albumDuration.length) > props.videoDuration) {
            setDisabled(true)
            if (parseInt(albumDuration.length) > props.videoDuration)
                setDurationError(true)
            else 
            setDurationError(false)
        }
        else
            setDisabled(false)
    }, [props.videoTitle, props.videoDuration])
    async function download() {
        setDownloading(true)
        setDisabled(true)
        io = socket('https://ytadserver.herokuapp.com/')
        io.on('connect',()=>{console.log('conectou')})
        io.on('step',(step: string)=>{setStep(step)})
        io.on('prdwn',(progress:number)=>progressDownload(progress))
        setTimeout(async()=>{
            const download = await downloadAlbum(props.videoURL,props.match.params.artist, 
                props.match.params.albumName, rows, cover)
            const url = window.URL.createObjectURL(new Blob([download]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${props.match.params.albumName}.zip`)
            document.body.appendChild(link)
            link.click()
            setStep('Download finalizado!')
        },5000)
    }
    function progressDownload(progress:number){
        if(progress===100){
            setDownloading(false)
            setStep('Processando o vídeo')
        }
        else setPercentDown(progress)
    }
    const columns: AlbumInfoColumn[] = [
        { id: 'track', label: 'Faixa', align: 'center' },
        { id: 'length', label: 'Duração', align: 'right' }
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
        <Box className={classes.pages}>
            {console.log(rows)}
            {rows.length ?
                <Paper className={classes.root} style={{ backgroundColor: '#e7dfdd' }}>
                    <Grid container>
                        <Grid item xs={12} sm={5} style={{ borderRight: 'solid thin #d3d3d3' }}>
                            <Container>
                                <img src={cover} style={{ border: 'solid thin gray' }} alt='[Sem capa]' />
                                <Typography variant="h4">{props.match.params.albumName}</Typography>
                                <Typography variant="h5">{props.match.params.artist}</Typography>
                                <Button variant="contained" disabled={disabled} onClick={() => download()} style={{ backgroundColor: "#4717f6", marginBottom: '5px' }} startIcon={<CloudDownloadIcon />}>Download</Button>
                                {durationError ? <Typography variant="body2"><i>Álbum mais longo que o vídeo</i></Typography> : null}
                                {downloading ? <div><Typography variant="body2"><i>{`Download do vídeo: ${percentDown}%`}</i></Typography><CircularProgress value={percentDown}/></div> : null}
                                {step!==''&& step!=='Download finalizado!' ? <div><Typography variant="body2"><i>{step}</i></Typography><CircularProgress/></div> : null}
                                {step==='Download finalizado!'?<Typography variant="body2"><i>{step}</i></Typography>: null}
                            </Container>
                        </Grid>
                        <Grid item xs={12} sm={7}>
                            <TableContainer className={classes.container}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead >
                                        <TableRow >
                                            {columns.map((column) => (
                                                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth, backgroundColor: '#a239ca' }}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: Song) => {
                                            console.log(row)
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={row.track}>
                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align}>
                                                                {column.id === 'length' ? sec2time(parseInt(value)) : value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <Divider />
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
                                labelDisplayedRows={() => labelRows(page, rowsPerPage, rows.length)}
                                page={page}
                                onChangePage={handleChangePage}
                                onChangeRowsPerPage={handleChangeRowsPerPage}
                            />
                        </Grid>
                    </Grid>
                </Paper > : <div></div>}
        </Box >
    )
}
export default AlbumInfo
