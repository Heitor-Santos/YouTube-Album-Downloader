import React from "react";
import { Grid, Typography } from "@material-ui/core";

export default function Error(props: { text: string }) {
    return (
        <Grid container>
            <Grid item xs={12} sm={6} style={{}}>
                <img src={require('./assets/error.png')} style={{ width: '100%' }} />
            </Grid>
            <Grid item xs={12} sm={6} style={{textAlign:'center', color:'#a239ca', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '5vh', marginBottom: '5vh'}}>
                <Typography variant="h5">{props.text}
                </Typography>
            </Grid>
        </Grid>
    )
}
