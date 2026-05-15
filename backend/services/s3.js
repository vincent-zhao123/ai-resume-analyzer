const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

async function uploadResumeToS3(file) {
  const fileKey = `resumes/${uuidv4()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return {
    bucket: process.env.S3_BUCKET_NAME,
    key: fileKey,
  };
}

module.exports = {
  uploadResumeToS3,
};