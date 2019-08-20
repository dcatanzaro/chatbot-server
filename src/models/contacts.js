import mongoose from "mongoose";
const Schema = mongoose.Schema;

const contactsSchema = new Schema(
    {
        name: String,
        email: String,
        phone: String,
        question: String,
        timeCall: String,
        license: String,
        status: String,
        site: String,
        referer: String,
        ip: String,
        messages: Schema.Types.Mixed
    },
    {
        timestamps: true
    }
);

export default mongoose.model("contacts", contactsSchema);
