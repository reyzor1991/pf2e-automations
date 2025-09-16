import {MessageHook} from "./index";
import {getSetting} from "../helpers";

export class BasicActionRollHook implements MessageHook {
    async listen(message: ChatMessage) {
        if (!getSetting("basicActionRoll") || !message.isAuthor) {
            return
        }
        game.pf2e.actions.get(message.item?.slug)?.use();
    }
}