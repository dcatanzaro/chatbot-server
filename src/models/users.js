import mongoose from "mongoose";
const Schema = mongoose.Schema;

var Users = new Schema({
    email: String,
    name: String,
    role: String,
    password: String
});

export default mongoose.model("users", Users);
