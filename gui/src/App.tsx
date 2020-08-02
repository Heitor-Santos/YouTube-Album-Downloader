import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import './App.css';
import axios from 'axios'
import AlbumsList from './AlbumsList'
import AlbumInfo from './AlbumInfo'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Container, TextField, List, ListItem, Button, Icon } from '@material-ui/core';
import { AccessAlarm } from '@material-ui/icons'
import SearchIcon from '@material-ui/icons/Search';
function App() {
  const [videoURL, setVideoURL] = useState<string>('')
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
  document.addEventListener('keydown', (e) => {
    if (e.code === "Enter")
      setNumberSearches(numberSearches + 1)
  });
  return (
    <BrowserRouter>
      <Container maxWidth='md' style={{}}>
        <List>
          <ListItem>
            <TextField id="outlined-basic" size='small' fullWidth label="Insira o URL" variant="outlined" onChange={(e) => setVideoURL(e.target.value)} />
            <Button size='large' variant="contained" onClick={() => download()}>Download</Button>
          </ListItem>
          <ListItem>
            <TextField size='small' fullWidth label="Insira o nome do álbum" variant="outlined" onChange={(e) => setAlbumTitle(e.target.value)} />
            <Button size='large' variant="contained" onClick={(e) => { setNumberSearches(numberSearches + 1) }}><SearchIcon /></Button>
          </ListItem>
        </List>
        <Switch>
          <Route path='/' exact={true} render={() => (numberSearches==1 ? <Redirect to='/albumsresults' /> : null)}></Route>
          <Route path='/albumsresults' exact={true} render={(props) => <AlbumsList {...props} albumName={albumTitle} numberSearches={numberSearches} />}></Route>
          <Route path='/oi'><h1>OOOOIII</h1></Route>
          <Route path='/album=:albumName&artist=:artist' component={AlbumInfo}/>
        </Switch>
      </Container>
    </BrowserRouter>
  );
}

export default App;
