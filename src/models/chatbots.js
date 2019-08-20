import mongoose from "mongoose";
const Schema = mongoose.Schema;

const chatbotsSchema = new Schema(
    {
        identifier: String,
        site: String,
        nameRequired: Boolean,
        emailRequired: Boolean,
        phoneRequired: Boolean,
        timeCallRequired: Boolean,
        licenseRequired: Boolean,
        initialGreeting: String,
        requestName: String,
        requestEmail: String,
        requestQuestion: String,
        requestPhone: String,
        requestTimecall: String,
        requestLicense: String,
        closeConversation: String,
        finalGreeting: String
    },
    {
        timestamps: true
    }
);

export default mongoose.model("chatbots", chatbotsSchema);

//Collection de test
// {
//     "identifier" : "test",
//     "site" : "http://localhost:3000",
//     "nameRequired" : true,
//     "emailRequired" : true,
//     "phoneRequired" : true,
//     "timeCallRequired" : false,
//     "licenseRequired" : false,
//     "initialGreeting" : "Hola, soy Sofía. ¿En qué puedo ayudarte?",
//     "requestName" : "Gracias por contactarnos. ¿Cómo es tu nombre?",
//     "requestEmail" : "Podrías dejarme tu email?",
//     "requestQuestion" : "¿Alguna consulta más?",
//     "requestPhone" : "Te pido un teléfono de contacto por favor.",
//     "requestTimecall" : "requestTimecall",
//     "requestLicense" : "requestLicense",
//     "closeConversation" : "Muchas gracias!",
//     "finalGreeting" : "En unos instantes un representante se estará comunicando con usted. Que tenga un buen día."
// }
