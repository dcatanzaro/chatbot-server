import { randomIntFromInterval, getParameterByName } from "../utils/helpers";
import ChatBots from "../models/chatbots";
import Contacts from "../models/contacts";

const REQUEST_EMAIL_RETRY = [
    "Necesitaria un email para continuar",
    "Por favor, nos podria dejar un email para continuar?",
    "Para poder continuar con su consulta necesitariamos un email para comunicarnos"
];
const REQUEST_PHONE_RETRY = [
    "Necesitariamos un telefono para contactarte",
    "Por favor, nos podrias dejar un telefono para contactarte?"
];

class ServiceLogicChat {
    constructor() {
        this.io = {};
        this.chatbots = {};
        this.users = {};
    }

    initiate(io) {
        const that = this;
        this.io = io;

        this.io.on("connection", function(socket) {
            socket.on("connectNewUser", data => {
                console.log("Conectamos" + socket.id);

                that.connectNewUser(socket, data);
            });

            socket.on("messageFromUser", data => {
                that.messageFromUser(socket, data);
            });

            socket.on("disconnect", data => {
                console.log("Desconectamos" + socket.id);

                if (that.users[socket.id]) {
                    delete that.users[socket.id];
                }
            });
        });
    }

    updateChatBotConfig(id) {
        const that = this;

        return ChatBots.findOne({ identifier: "test" })
            .then(data => {
                that.chatbots[data._id] = data;
                return data;
            })
            .catch(err => {});
    }

    connectNewUser(socket, data) {
        const headers = socket.request.headers;
        const referer = headers.referer;
        const origin = headers.origin;

        const key = getParameterByName("key", referer);

        let promiseChatBot = [];

        if (!this.chatbots[key]) {
            promiseChatBot = this.updateChatBotConfig(key);
        } else {
            promiseChatBot = this.chatbots[key];
        }

        Promise.all([promiseChatBot]).then(values => {
            const chatbot = values[0];

            if (!chatbot || origin != chatbot.site) {
                return socket.disconnect();
            }

            const socketId = socket.id;

            this.users[socketId] = {
                socket: socket,
                chatBotId: chatbot._id,
                name: "",
                email: "",
                question: "",
                phone: "",
                timeCall: "",
                license: "",
                triesName: 0,
                triesEmail: 0,
                triesQuestion: 0,
                triesPhone: 0,
                triesTimeCall: 0,
                triesLicense: 0,
                messages: []
            };

            socket.emit("messageFromAdmin", {
                message: chatbot.initialGreeting
            });

            this.users[socketId].messages.push({
                type: "bot",
                message: chatbot.initialGreeting
            });
        });
    }

    messageFromUser(socket, data) {
        const socketId = socket.id;

        const user = this.users[socketId];
        const chatbot = this.chatbots[user.chatBotId];

        if (!chatbot) {
            return socket.disconnect();
        }

        if (chatbot.nameRequired && !user.name) {
            if (user.triesName === 0) {
                user.messages.push({
                    type: "user",
                    message: data.message
                });

                socket.emit("messageFromAdmin", {
                    message: chatbot.requestName
                });

                user.messages.push({
                    type: "bot",
                    message: chatbot.requestName
                });

                user.triesName++;
            } else if (user.triesName === 1) {
                user.name = requestName(data.message);

                user.messages.push({
                    type: "user",
                    message: data.message
                });

                this.messageFromUser(socket, data);
            }
        } else if (chatbot.emailRequired && !user.email) {
            if (user.triesEmail === 0) {
                socket.emit("messageFromAdmin", {
                    message: chatbot.requestEmail
                });

                user.messages.push({
                    type: "bot",
                    message: chatbot.requestEmail
                });

                user.triesEmail++;
            } else if (user.triesEmail > 0) {
                const getEmail = requestMail(data.message);
                user.triesEmail++;

                if (!getEmail.err) {
                    user.email = getEmail;

                    user.messages.push({
                        type: "user",
                        message: data.message
                    });

                    this.messageFromUser(socket, data);
                } else {
                    const randomRequestEmail = randomIntFromInterval(
                        0,
                        REQUEST_EMAIL_RETRY.length - 1
                    );
                    const messageTry = REQUEST_EMAIL_RETRY[randomRequestEmail];

                    socket.emit("messageFromAdmin", {
                        message: messageTry
                    });

                    user.messages.push({
                        type: "bot",
                        message: messageTry
                    });
                }
            }
        } else if (!user.question) {
            if (user.triesQuestion === 0) {
                socket.emit("messageFromAdmin", {
                    message: chatbot.requestQuestion
                });

                user.messages.push({
                    type: "bot",
                    message: chatbot.requestQuestion
                });

                user.triesQuestion++;
            } else if (user.triesQuestion === 1) {
                user.question = data.message;

                user.messages.push({
                    type: "user",
                    message: data.message
                });

                this.messageFromUser(socket, data);
            }
        } else if (chatbot.phoneRequired && !user.phone) {
            if (user.triesPhone === 0) {
                socket.emit("messageFromAdmin", {
                    message: chatbot.requestPhone
                });

                user.messages.push({
                    type: "bot",
                    message: chatbot.requestPhone
                });

                user.triesPhone++;
            } else if (user.triesPhone > 0) {
                const getPhone = requestPhone(data.message);

                user.triesPhone++;

                if (!getPhone.err) {
                    user.phone = getPhone;

                    user.messages.push({
                        type: "user",
                        message: data.message
                    });

                    this.messageFromUser(socket, data);
                } else {
                    const randomRequestEmail = randomIntFromInterval(
                        0,
                        REQUEST_PHONE_RETRY.length - 1
                    );
                    const messageTry = REQUEST_PHONE_RETRY[randomRequestEmail];

                    socket.emit("messageFromAdmin", {
                        message: messageTry
                    });

                    user.messages.push({
                        type: "bot",
                        message: messageTry
                    });
                }
            }
        } else if (chatbot.timeCallRequired && !user.timeCall) {
            if (user.triesTimeCall === 0) {
                socket.emit("messageFromAdmin", {
                    message: chatbot.requestTimecall
                });

                user.messages.push({
                    type: "bot",
                    message: chatbot.requestTimecall
                });

                user.triesTimeCall++;
            } else if (user.triesTimeCall === 1) {
                user.timeCall = data.message;

                user.messages.push({
                    type: "user",
                    message: data.message
                });

                this.messageFromUser(socket, data);
            }
        } else if (chatbot.licenseRequired && !user.license) {
            if (user.triesLicense === 0) {
                socket.emit("messageFromAdmin", {
                    message: chatbot.requestLicense
                });

                user.messages.push({
                    type: "bot",
                    message: chatbot.requestLicense
                });

                user.triesLicense++;
            } else if (user.triesLicense === 1) {
                user.license = data.message;

                user.messages.push({
                    type: "user",
                    message: data.message
                });

                this.messageFromUser(socket, data);
            }
        } else {
            socket.emit("messageFromAdmin", {
                message: chatbot.closeConversation
            });

            user.messages.push({
                type: "bot",
                message: chatbot.closeConversation
            });

            socket.emit("messageFromAdmin", { message: chatbot.finalGreeting });

            user.messages.push({
                type: "bot",
                message: chatbot.finalGreeting
            });

            socket.emit("messageFromAdmin", {
                message:
                    "<strong>DEBUG</strong><br/>Nombre: " +
                    user.name +
                    "<br/>Email: " +
                    user.email +
                    "<br/>Pregunta: " +
                    user.question +
                    "<br/>Telefono: " +
                    user.phone +
                    "<br/>Horario de llamada: " +
                    user.timeCall +
                    "<br/>Documento: " +
                    user.license
            });

            const newContact = new Contacts();
            newContact.name = user.name;
            newContact.email = user.email;
            newContact.phone = user.phone;
            newContact.question = user.question;
            newContact.timeCall = user.timeCall;
            newContact.license = user.license;
            newContact.status = "Nuevo";
            newContact.site = chatbot.site;
            newContact.messages = user.messages;
            newContact.save();

            socket.disconnect();
        }
    }
}

function requestName(text) {
    const arKeywords = ["nombre es", "me llamo", "soy", "es", "nombre"];
    let name = "";
    let processText = text.toLowerCase();

    arKeywords.forEach(keyword => {
        let indexOfKeyword = processText.indexOf(keyword);

        if (indexOfKeyword > -1 && !name) {
            name = text.substr(keyword.length + indexOfKeyword);
        }
    });

    if (!name) {
        name = text;
    }

    return name
        .trim()
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
}

function requestMail(text) {
    let processText = text.toLowerCase();

    let regexMail =
        "(?:[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[A-Za-z0-9-]*[A-Za-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";

    let getProcessMail = processText.match(regexMail);

    if (getProcessMail && getProcessMail[0]) {
        return getProcessMail[0].trim();
    } else {
        return {
            err: true,
            message: "E-Mail missing"
        };
    }
}

function requestPhone(text) {
    let processText = text.toLowerCase();

    let regexPhone = /(?:[-+() ]*\d){8,13}/gm;

    let getProcessPhone = processText.match(regexPhone);

    if (getProcessPhone && getProcessPhone[0]) {
        return getProcessPhone[0].trim();
    } else {
        return {
            err: true,
            message: "E-Mail missing"
        };
    }
}

export default new ServiceLogicChat();
