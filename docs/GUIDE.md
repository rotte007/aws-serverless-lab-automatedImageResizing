Steps followed---

1. Using lab.yaml file created a CloudFormation Stack wth 2 resources - "LabS3BucketSource" and "LabS3BucketDestination".
2. Created IAM role named "LabLambdaS3ExecutionRole" for Lambda Execution 
  Added the below execution policies
    i. AWSLambdaBasicExecutionRole -for CloudWatch logs
   ii. AmazonS3FullAccess - for S3 access
3. Created Lambda Function "resizeImages", changed the defualt execution role to "LabLambdaS3ExecutionRole" and added a environment variables "DESTINATION_BUCKET" (value - destination bucket from s3)
4. Added a Lambda layer "nodejs-sharp-layer" for Image processing
  Initialized a Node.js project "lab-resize-images" and installed the Sharp library for multiple architectures using npm install.
  Packaged dependencies into a "layer_content.zip" file following AWS Lambda layer structure (nodejs/node_modules).
  Published the layer using AWS CLI with aws lambda publish-layer-version, ensuring compatibility with nodejs22.x, arm64, and x86_64.
  Verified successful deployment via AWS Console and in CLI using "aws lambda list-layers" command.
5. Attach the Layer "nodejs-sharp-layer" to the Lambda Function "resizeImages"
6. Configure S3 Event Trigger using lab-s3-source-bucket-<unique-id> (source bucket from s3) to lambda function, added .jpeg as suffix.
7. Create and Deploy the Lambda Function Code
  Developed the Lambda function code "index.mjs" using Node.js to process images with the sharp library, which is referenced via the previously added Lambda Layer (not included in the deployment package).
  Implemented structured logging using console.log(JSON.stringify({...})) for machine-readable, filterable logs in CloudWatch.
  Structured logs enable advanced debugging and monitoring, such as filtering by log level, request ID, and analyzing performance trends over time.
  Packaged the Lambda function code using PowerShell's Compress-Archive to create resize-images.zip.
  Uploaded the zip file to the source S3 bucket (lab-s3-source-bucket-<unique-id>) using the AWS CLI.
  Deployed the function code to AWS Lambda by updating the existing resizeImages function via the "aws lambda update-function-code" command.
  Verified successful deployment through the AWS Lambda Console and ensured the function is now ready to trigger on object uploads.
8. Test the Image Processing Pipeline uploaded image with dimensions "dimensions (1312 × 736px) and file size (around 243 KB)" and got a small image with 150px wide and 4kb image in destination bucket.


   
