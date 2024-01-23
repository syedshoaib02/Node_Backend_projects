import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
// import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from "jsonwebtoken";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken();
console.log('Access Token before setting cookie:', accessToken);

// rest of your code...

      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}


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


const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {email, username, password} = req.body
  console.log(email);

  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
          )
          
  )


})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
 
}
