require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    endpoint: process.env.B2_REGION,
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
    signatureVersion: 'v4'
});

async function uploadImage(file) {
    const params = {
        Bucket: process.env.B2_BUCKET,
        Key: `images/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };
    const result = await s3.upload(params).promise();
    return result.Location; // Public URL to the uploaded image
}

module.exports = { uploadImage };