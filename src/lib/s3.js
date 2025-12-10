import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!BUCKET_NAME) {
  console.warn('Warning: AWS_S3_BUCKET_NAME not set in environment variables');
}

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The file name/key in S3
 * @param {string} contentType - The MIME type of the file (e.g., 'application/pdf')
 * @returns {Promise<string>} - The S3 URL of the uploaded file
 */
export async function uploadToS3(fileBuffer, fileName, contentType = 'application/pdf') {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const key = `reports/${fileName}`;

  // Upload file to S3 with public-read ACL
  // Note: If your bucket has ACLs disabled, you MUST set up a bucket policy for public access
  // See the comment at the bottom of this file for the required bucket policy
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read', // This will fail if ACLs are disabled - use bucket policy instead
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    // If ACL fails, it might be because ACLs are disabled on the bucket
    if (error.name === 'AccessControlListNotSupported' || error.Code === 'AccessControlListNotSupported') {
      console.error('❌ ACLs are disabled on this bucket. You MUST configure a bucket policy for public access.');
      console.error('See S3_SETUP.md or the comment in src/lib/s3.js for the required bucket policy.');
      // Still throw the error so the user knows something is wrong
      throw new Error('S3 bucket ACLs are disabled. Please configure a bucket policy for public read access. See server logs for details.');
    }
    throw error;
  }

  // Return the public URL
  const region = process.env.AWS_REGION || 'us-east-1';
  const s3Url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  
  return s3Url;
}

/**
 * Delete a file from S3
 * @param {string} s3Url - The S3 URL of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFromS3(s3Url) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  try {
    // Extract the key from the S3 URL using the helper function
    const key = getS3KeyFromUrl(s3Url);
    if (!key) {
      console.warn(`Invalid S3 URL format: ${s3Url}`);
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    // Don't throw - allow deletion to continue even if S3 delete fails
  }
}

/**
 * Extract S3 key from URL
 * @param {string} s3Url - The S3 URL
 * @returns {string|null} - The S3 key or null if invalid
 */
export function getS3KeyFromUrl(s3Url) {
  if (!s3Url || !s3Url.includes('.amazonaws.com/')) {
    return null;
  }
  const urlParts = s3Url.split('.amazonaws.com/');
  return urlParts.length >= 2 ? urlParts[1] : null;
}

/**
 * REQUIRED S3 BUCKET POLICY FOR PUBLIC ACCESS
 * 
 * If your S3 bucket has ACLs disabled (which is common in newer AWS accounts),
 * you MUST add this bucket policy to allow public read access to PDF files:
 * 
 * Go to: AWS Console > S3 > Your Bucket > Permissions > Bucket Policy
 * 
 * Replace YOUR_BUCKET_NAME with your actual bucket name:
 * 
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Sid": "PublicReadGetObject",
 *       "Effect": "Allow",
 *       "Principal": "*",
 *       "Action": "s3:GetObject",
 *       "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/reports/*"
 *     }
 *   ]
 * }
 * 
 * Also ensure:
 * 1. Block Public Access settings allow public access (or at least allow "Block public access to buckets and objects granted through new access control lists (ACLs)")
 * 2. The bucket is in the same region as specified in AWS_REGION
 */
