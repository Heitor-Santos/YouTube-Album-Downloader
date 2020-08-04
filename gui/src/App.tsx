import React, { useState } from 'react';
import {Switch, Route, Router, } from 'react-router-dom'
import { createBrowserHistory } from 'history';
import './App.css';
import AlbumsList from './AlbumsList'
import AlbumInfo from './AlbumInfo'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Container, TextField, List, ListItem, Button, CircularProgress } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { getVideoInfo, downloadAlbum } from './requests'
import useStyles from './styles'

const history = createBrowserHistory()
function App() {
  const [videoURL, setVideoURL] = useState<string>('')
  const [videoTitle, setVideoTitle] = useState<string>('')
  const [searching, setSearching] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [albumTitle, setAlbumTitle] = useState<string>('')
  const [numberSearches, setNumberSearches] = useState<number>(0)

  async function download() {
    const download = await downloadAlbum(videoURL)
    const url = window.URL.createObjectURL(new Blob([download]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'video2.flv')
    document.body.appendChild(link)
    link.click()
  }
  async function loadVideoInfo() {
    setLoading(true)
    const resp = await getVideoInfo(videoURL)
    setLoading(false)
    setVideoTitle(resp.videoDetails.title)
  }
  document.getElementById('albumNameInput')?.addEventListener('keydown', e => {
    if (e.code === "Enter")
      searchAlbum()
  });
  document.getElementById('videoURLInput')?.addEventListener('keydown', e=>{
    if(e.code==="Enter")
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
      <Container maxWidth='md' style={{backgroundColor:'#e7dfdd'}}>
        <List>
          <ListItem id='videoURLInput'>
            <TextField id="outlined-basic" size='small' fullWidth label="Insira o URL" variant="outlined"
              onChange={(e) => setVideoURL(e.target.value)} onBlur={() => loadVideoInfo()} />
            {loading ? <div><CircularProgress /></div> : null}
          </ListItem>
          {videoTitle !== '' ? <ListItem><i>{videoTitle}</i></ListItem> : null}
          <ListItem>
            <TextField size='small' id='albumNameInput' fullWidth label="Insira o nome do álbum" variant="outlined" onChange={(e) => setAlbumTitle(e.target.value)} />
            <Button size='large' variant="contained"
              color="primary"
              className={classes.button}
              onClick={searchAlbum}><SearchIcon /></Button>
            {searching ? <div><CircularProgress /></div> : null}
          </ListItem>
        </List>
        <Switch>
          <Route path='/albumsresults' exact={true} render={(props) => <AlbumsList {...props} albumName={albumTitle} numberSearches={numberSearches} setSearching={(e: boolean) => setSearching(e)} />}></Route>
          <Route path='/oi'><h1>OOOOIII</h1></Route>
          <Route path='/noresults'><h1>ohdaddy</h1></Route>
          <Route path='/error'><h1>ohdaddy</h1></Route>
          <Route path='/noinfotracks'><h1>sem info das faixas</h1></Route>
          <Route path='/album=:albumName&artist=:artist' render={(props) => <AlbumInfo {...props} setSearching={(e: boolean) => setSearching(e)} />}></Route>
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
