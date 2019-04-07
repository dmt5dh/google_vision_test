import React, { Component } from 'react';
import './App.css';
import Main from './components/Main';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

class App extends Component {
  render() {
    return (
      <Grid className="App" container spacing={16}>
        <Grid item xs={12}>
          <Typography variant="h2" gutterBottom>
            Upload an image for analysis
          </Typography>
        </Grid>
        <Main />
      </Grid>
    );
  }
}

export default App;
