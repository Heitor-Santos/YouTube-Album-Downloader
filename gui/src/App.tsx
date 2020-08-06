import React, { useState } from 'react';
import { Switch, Route, Router } from 'react-router-dom'
import { createBrowserHistory } from 'history';
import './App.css';
import AlbumsList from './AlbumsList'
import AlbumInfo from './AlbumInfo'
import { Container, TextField, List, ListItem, Button, CircularProgress, Box, Typography, Grid } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { getVideoInfo } from './requests'
import useStyles from './styles'
import Error from './Error'
const history = createBrowserHistory()
function App() {
  const [videoURL, setVideoURL] = useState<string>('')
  const [videoTitle, setVideoTitle] = useState<string>('')
  const [searching, setSearching] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [albumTitle, setAlbumTitle] = useState<string>('')
  const [numberSearches, setNumberSearches] = useState<number>(0)
  const [videoDuration, setVideoDuration] = useState<number>(0)

  async function loadVideoInfo() {
    setLoading(true)
    setVideoTitle('')
    const re = new RegExp('^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+')
    const match = re.test(videoURL)
    if (match) {
      const resp = await getVideoInfo(videoURL)
      console.log(resp)
      if (resp?.videoDetails?.title !== '' && resp?.videoDetails?.lengthSeconds !== '') {
        setVideoTitle(resp.videoDetails.title)
        setVideoDuration(resp.videoDetails.lengthSeconds)
      }
      else
        setVideoTitle('Ocorreu um erro')
    }
    else
      setVideoTitle('Isso não é um link do YouTube')
    setLoading(false)
  }
  document.getElementById('albumNameInput')?.addEventListener('keydown', e => {
    if (e.code === "Enter")
      searchAlbum()
  });
  document.getElementById('videoURLInput')?.addEventListener('keydown', e => {
    if (e.code === "Enter")
      loadVideoInfo()
  })
  const classes = useStyles()
  function searchAlbum() {
    setSearching(true)
    setNumberSearches(numberSearches + 1)
    history.push("/albumsresults")
  }
  return (
    <Router history={history}>
      <Box style={{ backgroundColor: '#0e0b16' }}>
        <Container maxWidth='md' style={{ backgroundColor: '#e7dfdd', minHeight: '100vh' }}>
          <Typography variant="h2" style={{ color: '#a239ca', fontWeight: 'lighter', textAlign: 'center' }}> YouTube Album Downloader </Typography>
          <Typography variant="body1" gutterBottom style={{ textAlign: 'center', color: '#0e0b16' }}>Esta ferramenta permite a você baixar um vídeo do YouTube no formato de várias faixas MP3 usando metadados do last.fm</Typography>
          <List>
            <ListItem id='videoURLInput'>
              <TextField id="outlined-basic" size='small' fullWidth label="Insira o URL" variant="outlined"
                onChange={(e) => setVideoURL(e.target.value)} onBlur={() => loadVideoInfo()} />
              {loading ? <div><CircularProgress /></div> : null}
            </ListItem>
            {videoTitle !== '' ? <ListItem><i>{videoTitle}</i></ListItem> : null}
            <ListItem>
              <TextField size='small' id='albumNameInput' fullWidth label="Insira o nome do álbum" variant="outlined" onChange={(e) => setAlbumTitle(e.target.value)} />
              <Button size='large' variant="contained" style={{ backgroundColor: "#4717f6" }}
                className={classes.button}
                onClick={searchAlbum}><SearchIcon /></Button>
              {searching ? <div><CircularProgress /></div> : null}
            </ListItem>
          </List>
          <Box style={{ minHeight: '53vh' }}>
            <Switch>
              <Route path='/albumsresults' exact={true} render={(props) => <AlbumsList {...props} albumName={albumTitle} numberSearches={numberSearches} setSearching={(e: boolean) => setSearching(e)} />}></Route>
              <Route path='/noresults' render={(props)=><Error {...props} text='Desculpe, não há resultados para sua pesquisa'/>}></Route>
              <Route path='/error' render={(props)=><Error {...props} text='Desculpe, algo deu errado'/>}></Route>
              <Route path='/noinfotracks' render={(props)=><Error {...props} text='Desculpe, não há informações das faixas desse álbum'/>}></Route>
              <Route path='/album=:albumName&artist=:artist' render={(props) => <AlbumInfo {...props} setSearching={(e: boolean) => setSearching(e)} videoTitle={videoTitle} videoURL={videoURL} videoDuration={videoDuration} />}></Route>
            </Switch>
          </Box>
          <footer style={{ position: 'relative', marginTop: '5px' }}>
            <Typography variant="body2" style={{ textAlign: 'center', color: '#0e0b16' }}>Desenvolvido por <a style={{ color: '#0e0b16' }} href='https://github.com/Heitor-Santos'> Heitor Santos</a></Typography>
            <Typography variant='body2' style={{ textAlign: 'center', color: '#0e0b16' }}>Me siga no <a style={{ color: '#0e0b16' }} href='https://www.last.fm/pt/user/tuto_'>last.fm</a>!</Typography>
          </footer>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
