import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    avatar: {
        type: String,
    },
    credits: {
        type: Number,
        default: 100,
        min: 0,
    },
    plan: {
        type: String,
        enum: ['free', 'premium', 'enterprise'],
        default: 'free',
    }
},{timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;