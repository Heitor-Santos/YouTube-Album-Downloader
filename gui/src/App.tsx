import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect , useHistory, withRouter, Router, } from 'react-router-dom'
import { createBrowserHistory } from 'history';
import './App.css';
import axios from 'axios'
import AlbumsList from './AlbumsList'
import AlbumInfo from './AlbumInfo'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Container, TextField, List, ListItem, Button, Icon, Grid, CircularProgress } from '@material-ui/core';
import { AccessAlarm } from '@material-ui/icons'
import SearchIcon from '@material-ui/icons/Search';
import ytdl from 'ytdl-core'

const history = createBrowserHistory()
function App() {
  const [videoURL, setVideoURL] = useState<string>('')
  const [searching, setSearching] = useState<boolean>(false)
  const [albumTitle, setAlbumTitle] = useState<string>('')
  const [numberSearches, setNumberSearches] = useState<number>(0)
  const api = axios.create({
    baseURL: 'http://localhost:3333'
  });
  
  async function download() {
    let resp = await api.get(`/download?videoURL=${videoURL}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([resp.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'video2.flv')
    document.body.appendChild(link)
    link.click()
  }
  async function getVideoInfo(){
    const info = await ytdl.getBasicInfo(videoURL)
    console.log(info)
  }
  document.getElementById('albumNameInput')?.addEventListener('keydown', (e) => {
    if (e.code === "Enter")
      searchAlbum()
  });
  const useStyles = makeStyles((theme: Theme)=>
  createStyles({
    input: {
      height: 40
    },
    button: {
      height: 40
    },
    selectRoot: {
      height: 40,
      display: "table"
      // display: "flex",
      // justifyContent: "center",
      // alignItems: "center",
    },
    select: {
      height: 40,
      paddingTop: 0,
      paddingBottom: 0,
      display: "table-cell",
      verticalAlign: "middle"
    }
  }));
  const classes = useStyles()
  function searchAlbum(){
    setSearching(true)
    setNumberSearches(numberSearches + 1) 
    history.push("/albumsresults")
  }
  return (
    <Router history={history}>
      <Container maxWidth='md' style={{}}>
        <List>
          <ListItem>
            <TextField id="outlined-basic" size='small' fullWidth label="Insira o URL" variant="outlined" 
            onChange={(e) => setVideoURL(e.target.value)} />
            <Button size='large' variant="contained"
            color="primary"
            className={classes.button} onClick={() => getVideoInfo()}>Download</Button>
          </ListItem>
          <ListItem>
            <TextField size='small' id='albumNameInput' style={{width:'87%'}} label="Insira o nome do álbum" variant="outlined" onChange={(e) => setAlbumTitle(e.target.value)} />
            <Button size='large' variant="contained"
            color="primary"
            className={classes.button}
            onClick={searchAlbum}><SearchIcon /></Button>
            {searching?<div><CircularProgress/></div>:null} 
          </ListItem>
        </List>
        <Switch>
          <Route path='/albumsresults' exact={true} render={(props) => <AlbumsList {...props} albumName={albumTitle} numberSearches={numberSearches} setSearching={(e:boolean)=>setSearching(e)}/>}></Route>
          <Route path='/oi'><h1>OOOOIII</h1></Route>
          <Route path='/album=:albumName&artist=:artist' render={(props) => <AlbumInfo {...props} setSearching={(e:boolean)=>setSearching(e)} />}></Route>
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
