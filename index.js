'use strict';
const querystring = require('querystring');
const accessKeyId ="AKIAINHX26WLDNUAKWAQ";
const secretAccessKey="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";

const AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.accessKeyId = accessKeyId;
AWS.config.secretAccessKey = secretAccessKey;
AWS.config.httpOptions = {timeout: 5000};
AWS.config.region = "us-east-1";
const S3 = new AWS.S3({
  signatureVersion: 'v4'
});
// set the S3 and API GW endpoints
const BUCKET ='elasticbeanstalk-us-east-2-388758051039';
const Sharp = require('sharp');
// exports.handler = async (event) => {
//   console.log('Handler start')

// headers that cloudfront does not allow in the http response
const blacklistedHeaders = [
  /^connection$/i,
  /^content-length$/i,
  /^expect$/i,
  /^keep-alive$/i,
  /^proxy-authenticate$/i,
  /^proxy-authorization$/i,
  /^proxy-connection$/i,
  /^trailer$/i,
  /^upgrade$/i,
  /^x-accel-buffering$/i,
  /^x-accel-charset$/i,
  /^x-accel-limit-rate$/i,
  /^x-accel-redirect$/i,
  /^X-Amz-Cf-.*/i,
  /^X-Amzn-.*/i,
  /^X-Cache.*/i,
  /^X-Edge-.*/i,
  /^X-Forwarded-Proto.*/i,
  /^X-Real-IP$/i
];

exports.handler = async (event) => {
    // TODO implement


    console.log(JSON.stringify(event)); 


    let response = event.Records[0].cf.response;

    let request = event.Records[0].cf.request;
    let params = querystring.parse(request.querystring);
    
    // if there is no dimension attribute, just pass the response
    if (!params.d) {
   return response;
    }

    // read the dimension parameter value = width x height and split it by 'x'
    let dimensionMatch = params.d.split("*");
// set the width and height parameters
    let width = parseInt(dimensionMatch[0],10);
    let height = parseInt(dimensionMatch[1],10);
    // read the required path. Ex: uri /images/image.jpg
    let path = request.uri.split("?")[0];

    // read the S3 key from the path variable.
    // Ex: path variable /images/image.jpg
    let key = path.substring(1);

    // parse the prefix, width, height and image name
    let prefix, originalKey,match,requiredFormat;
    let startIndex;
    
    
    try {
     match = path.match(/(.*)\/(.*)\.(.*)/);

     prefix = match[1];
     requiredFormat = match[3];

      // correction for jpg required for 'Sharp'
      requiredFormat = match[3] == "jpg" ? "jpeg" : match[3];
      
    }
    catch (err) {
      // no prefix exist for image..
      console.log("no prefix present..");
      match = path.match(/(.*)\/(.*)\.(.*)/);
      

      // correction for jpg required for 'Sharp'
      requiredFormat = match[2] == "jpg" ? "jpeg" : match[2];
    }
console.log(key);
    // get the source image file
    try {
      // const originHeaders = Object.keys(response.headers).filter((header) => blacklistedHeaders.every((blheader) => !blheader.test(header)))
      // .reduce((acc, header) => {
      //     acc[header.toLowerCase()] = [
      //         {
      //             key: header,
      //             value: response.headers[header]
      //         }
      //     ];
      //     return acc;
      // }, {});
       var data = await S3.getObject({ Bucket: BUCKET, Key: key }).promise();
       if (data.err) { console.log('error');}
       else { console.log('fetched response');
   
       var bufferTemp = await Sharp(data.Body)
       .resize(width,height)    
        .toFormat(requiredFormat)
        .toBuffer();

        if (bufferTemp.err) { console.log('error');}
        else { console.log('fetched buffer after resize');}
        var resizeResponse = {};
        ;
       // resizeResponse.isBase64Encoded = true;
      //  response.bodyEncoding = 'base64';
      //  response.body = bufferTemp.toString('base64');        
       //resizeResponse.header = {};
       //response.headers["content-type"]=[{"key":"Content-Type","value":"image/jpeg"}];
       //response.headers["accept-ranges"]=[{"key":"Accept-Ranges","value":"bytes"}];
        //resizeResponse.headers["server"]=[{"key":"server","value":"AmazonS3"}];
        // response.status = '200'
        // response.statusDescription= 'OK';
        
        //console.log(response);
        //return response;
        // originHeaders["accept-ranges"]=[{"key":"Accept-Ranges","value":"bytes"}];
        // originHeaders["content-type"]=[{"key":"Content-Type","value":"image/jpeg"}];
        //headers: { 'Content-Type': contentType },
        // https://s3.amazonaws.com/chiragdump/deployment.zip
        return ({
          bodyEncoding: 'base64',
          body:  bufferTemp.toString('base64'),
          headers: {
           // 'accept-ranges': [{"key":"Accept-Ranges","value":"bytes"}],
           'content-type': [{"key":"Content-Type","value":"image/jpeg"}]
            },
          // { 'x-amz-id-2': '/b96VPnOhOz1aVJQQZXYgbmkkNqxDh2xIyUOqNShT0u4+PzEXxThhh1lFYdfoulhPHvMUERQD4A=',
          // 'x-amz-request-id': 'F2D0F1DC1DACE805',
          // 'last-modified': 'Wed, 12 Dec 2018 11:30:16 GMT',
          // 'accept-ranges': 'bytes',
          // 'content-type': 'image/jpeg',
          // 'server': 'AmazonS3' },
          status: '200',
          statusDescription: 'OK'
      });
    }
  }
    catch (err) {
        console.log('Error ***************');
        console.log(err);
        return err;
    }
    
};



