import moongoose,{Schema} from 'mongoose'

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"

    }
},{})



export const Subscription = moongoose.model("Subsscription",subscriptionSchema)