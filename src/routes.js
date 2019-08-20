import passport from "passport";

import chatbotController from "./controllers/chatbotController";

const Routes = app => {
    app.get("/chatbots", chatbotController.getAll);
    app.get("/chatbot/:id", chatbotController.getChatBot);
    app.post("/chatbot", chatbotController.saveChatbot);

    app.post("/login", function(req, res, next) {
        passport.authenticate("local", function(err, user) {
            if (err) {
                return next(err);
            }

            if (!user._id) {
                return res.json(user);
            }

            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }

                return res.json(user);
            });
        })(req, res, next);
    });

    app.get("/logout", function(req, res, next) {
        req.logout();

        return res.send("logout");
    });
};

export default Routes;
