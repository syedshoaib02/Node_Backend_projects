import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
// import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const registerUser =asyncHandler(async(req,res)=>{
 

    const { fullName, email,username, password}=req.body;
    console.log(req.body)
    console.log(fullName)
    console.log(username)
    console.log(email)
    console.log(password)


    if([ fullName, email,username, password].some((field)=>
        field?.trim()==='')
    )
    {
        throw new ApiError(400,'All fields are required')
    }

   const existedUser= await User.findOne({
        $or:[{email}]
    })
  
    if(existedUser)
    {
        throw new ApiError(409,"Username already exists")
    }


const avatarLocalPath = path.join(__dirname, 'public', 'img', 'avatar.png');
const coverImagePath = path.join(__dirname, 'public', 'img', 'coverImage.png');

console.log(avatarLocalPath)


   if(!avatarLocalPath)
   {
    throw new ApiError(400,"Avatar file is required")
   }
   
   const user=await User.create({
    fullName,
    avatar:avatarLocalPath,
    coverImage:coverImagePath || "",
    email,
    password,
    username:username,

   })
   const createdUser=await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser)
  {
    throw new ApiError(500,"Something Wentwrong while registering User")
  }
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registed Successfully")
  )
   
})

export {registerUser}