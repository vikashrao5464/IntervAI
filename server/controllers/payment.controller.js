import razorpay from "../services/razorpay.service.js";
import payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";


export const createOrder = async (req, res) => {
    try{
    const {planId,amount,credits}=req.body;
    const options= {
        amount: amount*100, // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    await payment.create({
      userId:req.userId,
      planId,
            account: amount,
      credits,
      razorpayOrderId:order.id,
      status:"created"
    });
    return res.json(order);
    }
     catch(error){
        return res.status(500).json({message:`failed to create order :${error}`});
    }
}


export const verifyPayment = async (req, res) => {
    try{
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature}=req.body;

        const body=razorpay_order_id+"|"+razorpay_payment_id;
        const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

        if(expectedSignature!==razorpay_signature){
            return res.status(400).json({message:"invalid payment signature"});
        }

        const paymentRecord=await payment.findOne({razorpayOrderId:razorpay_order_id});
        if(!paymentRecord){
            return res.status(404).json({message:"payment not found"});
        }

        if(paymentRecord.status==="paid"){
            return res.status(400).json({message:"payment already verified"});
        }

        // Update payment status to paid
        paymentRecord.status="paid";
        paymentRecord.razorpayPaymentId=razorpay_payment_id;
        await paymentRecord.save();

        // Update user's credits based on the plan purchased
        const user=await User.findByIdAndUpdate(paymentRecord.userId, { $inc: { credits: paymentRecord.credits } },{new:true});
        res.json({
            success:true,
            message:"payment verified and credits added",
            user,
        })
    }catch(error){
      return res.status(500).json({message:`failed to verify payment :${error}`});
    }
}