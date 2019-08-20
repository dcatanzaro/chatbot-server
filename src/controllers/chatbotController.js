import ChatBots from "../models/chatbots";
import ServiceLogicChat from "../service/logic";
import { upsert } from "../utils/helpers";

class ChatBotController {
    getAll(req, res) {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const perPage = 20;
        let page = req.query.page || 0;

        if (page >= 1) {
            page--;
        }

        let query = {};

        const findChatBots = ChatBots.find(query)
            .limit(perPage)
            .skip(perPage * page)
            .select("_id site");

        const countChatBots = ChatBots.find(query).estimatedDocumentCount();

        Promise.all([findChatBots, countChatBots]).then(values => {
            const result = {
                results: values[0],
                count: values[1],
                page: page,
                perPage: perPage
            };

            return res.json(result);
        });
    }

    getChatBot(req, res) {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const id = req.params.id;

        return ChatBots.findOne({ _id: id }).then(result => {
            return res.json({ chatbot: result });
        });
    }

    saveChatbot(req, res) {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const newChatBot = req.body;

        upsert(ChatBots, newChatBot, function(err, result) {
            if (err) {
                return res.json({
                    error: true,
                    message: "Error al guardar el ChatBot."
                });
            }

            ServiceLogicChat.updateChatBotConfig(result._id);

            return res.json({
                id: result._id,
                message: "Datos guardado correctamente."
            });
        });
    }
}

export default new ChatBotController();
