// frontend data->create user->generate token->store token to cookies
import User from "../models/user.model.js";
import genToken from "../config/token.js";

export const googleAuth=async(req,res)=>{
    try{

    
    const {name,email}=req.body;
    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
        // Create new user
        user = await User.create({ name, email });
    }
    // Generate token
    let token = await genToken(user._id);
    // Set cookie
    res.cookie("token", token, {
         httpOnly: true,
         secure: true,
        sameSite: "none",
        maxAge: 7*24 * 60 * 60 * 1000, });
    res.status(200).json(user);
} catch (error) {
    res.status(500).json({ message: `google auth error: ${error}` });
}   

}

export const logout=async(req,res)=>{
    try{
     res.clearCookie("token");
     return res.status(200).json({message:"logout successful"});
    }catch(error){
return res.status(500).json({message:`logout error: ${error}`}); 
    }
}