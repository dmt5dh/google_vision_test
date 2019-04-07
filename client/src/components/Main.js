import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      statusMsg: "",
      statusSuccess: false,
      imageData: null,
      file: null,
      loading: false,
    };

    this.handleUploadImage = this.handleUploadImage.bind(this);
    this.previewImage = this.previewImage.bind(this);
  }

  createData() {
    console.log(this.state.imageData);

    let dataTable = <Table>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Probability</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.imageData.map(label => (
            <TableRow key={label.description}>
              <TableCell component="th" scope="row">
                {label.description}
              </TableCell>
              <TableCell>{Math.floor(label.score * 100)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    let data = this.state.imageData;
    let showData = [];
    for(var i = 0; i < data.length; i++) {
      let score = data[i].score * 100;
      let element = <div key={i}><h3>{data[i].description} {Math.floor(score)}%</h3></div>;

      showData.push(element);
    }

    return dataTable;
  }

  handleUploadImage(e) {
    e.preventDefault();

    if(e.target.files[0] != undefined) {
      const data = new FormData();
      data.append('file', e.target.files[0]);

      fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: data,
      }).then((response) => {
        response.json().then((body) => {
          this.setState({
            statusMsg: "Complete",
            statusSuccess: true,
            imageData: body,
            loading: false,
          });
        });
      }).catch((err) => {
        this.setState({
          statusMsg: "There was a problem with the AI server",
          statusSuccess: false,
          loading: false,
        });
      });
    }
  }

  previewImage(e) {
    e.preventDefault();
    if(e.target.files[0] != undefined) {
      this.setState({
        statusMsg: "",
        loading: true,
        file: URL.createObjectURL(e.target.files[0]),
      });
    }
  }

  render() {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={(e) => {
              this.previewImage(e);
              this.handleUploadImage(e);
              }
            }
          />
          <label htmlFor="raised-button-file">
            <Button style={{margin: '2em'}} color="primary" variant="raised" component="span">
              Upload
            </Button>
          </label>
        </Grid>
        <Grid item xs={12}>
          {this.state.loading &&
            <CircularProgress />
          }
          {this.state.statusMsg.length > 0 &&
            <Typography style={{margin: '2em'}} variant="h3" style={{color: this.state.statusSuccess ? 'green' : 'red'}}>
              {this.state.statusMsg}
            </Typography>
          }
        </Grid>
        <Grid item md={3} />
        <Grid item xs={12} md={3}>
          {this.state.statusSuccess &&
            this.createData()
          }
        </Grid>
        <Grid item xs={12} md={3}>
          <img src={this.state.file}/>
        </Grid>
        <Grid item md={3} />
      </Grid>
    )
  }
}

export default Main;
