const cloudinary = require("cloudinary")
  .v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'mattreiley',
    api_key: process.env.CLOUD_API_KEY || '384914399372484',
    api_secret: process.env.CLOUD_API_SECRET || '88bIhq-VuSSQSUhqOXumCA_31QM',
});
module.exports = cloudinary;