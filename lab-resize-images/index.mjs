import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event, context) => {
    const requestId = context.awsRequestId; // Get request ID for tracing
    try {
        console.log(JSON.stringify({
            level: "info",
            requestId,
            message: "Processing S3 event",
            event
        }));

        const { bucket, object } = event.Records[0].s3;
        const key = decodeURIComponent(object.key.replace(/\+/g, " "));

        // Get the destination bucket name from the environment variable
        const destinationBucket = process.env.DESTINATION_BUCKET;
        if (!destinationBucket) {
            throw new Error("Destination bucket environment variable not set.");
        }

        console.log(JSON.stringify({
            level: "info",
            requestId,
            message: "Fetching image from S3",
            bucket: bucket.name,
            key
        }));

        // Fetch image from S3
        const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket.name, Key: key }));

        console.log(JSON.stringify({
            level: "info",
            requestId,
            message: "Resizing image",
            resizeWidth: 150
        }));

        // Resize the image
        const resizedImage = await sharp(await Body.transformToByteArray()).resize(150).toBuffer();

        // Generate new filename
        const newKey = key.replace(".jpeg", "-small.jpeg");

        console.log(JSON.stringify({
            level: "info",
            requestId,
            message: "Uploading resized image",
            destinationBucket,
            newKey
        }));

        // Upload resized image to destination bucket
        await s3.send(new PutObjectCommand({
            Bucket: destinationBucket,
            Key: newKey,
            Body: resizedImage,
            ContentType: "image/jpeg"
        }));

        console.log(JSON.stringify({
            level: "info",
            requestId,
            message: "Image successfully resized and uploaded",
            destinationBucket,
            newKey
        }));

        return { status: "success", bucket: destinationBucket, key: newKey };
    } catch (error) {
        console.error(JSON.stringify({
            level: "error",
            requestId,
            message: "Error processing image",
            error: error.message,
            stack: error.stack
        }));
        throw new Error("Image processing failed.");
    }
};