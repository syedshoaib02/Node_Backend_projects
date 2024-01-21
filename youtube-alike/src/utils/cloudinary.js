import {v2 as cloudinary} from "cloudinary"
import fs from 'fs';

cloudinary.config({
    cloud_name:'',
    api_key:"",
    api_secret:""
})

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploded on cloudinary",response.url)
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
        
    }
}

cloudinary.v2.uploader.upload("",{public_id:"olympic_flag"},function(error,result){console.log(result);})

export {cloudinary}