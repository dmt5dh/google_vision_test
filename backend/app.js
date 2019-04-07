const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const request = require('request');
const fs = require('fs');

//Google apis
const {Storage} = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const visionApi = 'https://vision.googleapis.com/v1/images:annotate?key=[API_KEY]';

const apiConfig = {
  projectId: '[BUCKET_NAME]',
  keyFilename: '[API_KEY_FILE]'
}

// Creates a gcp storage client
const bucketName = 'cloudvisiontest-dmt';
const storage = new Storage(apiConfig);
const bucket = storage.bucket(bucketName);

//Google Vision client
const client = new vision.ImageAnnotatorClient(apiConfig);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));


app.post('/upload', (req, res, next) => {
  console.log(req);
  let imageFile = req.files.file;

  let tmpFileName = `${__dirname}/public/${imageFile.name}`;

  imageFile.mv(tmpFileName, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    console.log('hello');
    bucket.upload(tmpFileName, {
      gzip: false,
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'public, max-age=31536000',
      },
    },
    (err, file, apiResponse) => {
      // console.log(apiResponse);
      if(err == null) {

        console.log('gs://' + bucketName + '/' + imageFile.name);

        const imageUri = 'gs://' + bucketName + '/' + imageFile.name;

        const requestBody = {
          image: {
            source: {
              imageUri: imageUri,
            },
          },
          features:[
            {
              type:"LABEL_DETECTION",
              "maxResults": 5
            }
          ],
        };

        client
          .annotateImage(requestBody)
          .then(response => {
            fs.unlink(tmpFileName, (err) => {
              console.log("deleted local");
            });

            return res.status(200).send(response[0].labelAnnotations);
          })
          .catch(err => {
            return res.status(500).send(err);
          });
      }
    });
  });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8000, () => {
  console.log('8000');
});

module.exports = app;
