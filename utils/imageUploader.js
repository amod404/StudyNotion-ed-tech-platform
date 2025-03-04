const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async(file, folder, heigth, quality) => {
    const options = {folder};
    if(heigth){
        options.heigth = heigth;
    }
    if(quality){
        options.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}