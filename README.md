# AwsResizeImageLambda
Lambda@Edge : It lets you run Lambda functions in response to CloudFront events giving you the ability to modify static content that is served through CloudFront, such as images.

There are four possible events with which you can integrate Lambda.
1) Viewer Request
2) Viewer Response
3) Origin Request
4) Origin Response

I have use the origin request event. This event is triggered after a cache miss, but before the origin request takes place, which gives us the ability to swap the origin resource to something else. In this case, we'll download the image from the origin server, resize it, and return the resized image, which will subsequently be cached by CloudFront.

Benefits of this approach: If you need to serve same file with different dimensions then instead of saving all different dimension images on S3 just process them on fly and serve it. By this you can save the cost of S3 bucket. Second advantage, in case you need to change the entire website image dimensions then you don't need to change your code, just update lambda as per your need.

Please create S3 bucket and cloudfront serving the images from S3. You need to create IAM role with policy of AWSLambdaExecute, by which lambda function can access cloudfront and S3

Currently lambda@edge is available for North Virginia region. So make sure you create lamnda in right region.

For testing in your local you can setup the aws-sam-local, as it will create the exact environment which will be present in AWS lambda.

Note: The sharp library is dependent on your OS (mac/windows/linux). The AWS lambda works on Linux based environment, so you will need to get the sharp package of Linux region before deployment.
