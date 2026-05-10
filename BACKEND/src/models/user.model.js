import mongoose, { Schema } from "mongoose"

const userSchema = new Schema(
    {
        name: {type: String ,required: true},
        username: {type: String ,required: true,unique : true},
        email: { type: String, required: true, unique: true },
        avatar: { type: String, default: "" },
        password: {type: String ,required: true},
        token: {type: String }

    }


)

const User = mongoose.model("User",userSchema);

export { User };