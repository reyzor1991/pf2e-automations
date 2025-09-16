import {MessageHook} from "./index";
import {isActiveGM} from "../helpers";
import {moduleName} from "../const";

export class ProtectorTreeMessageHook implements MessageHook {
    async listen(message: ChatMessage) {
        let token = message.token;
        if (!isActiveGM() || !message.actor || !token) {
            return
        }
        if (!(message?.flags?.pf2e?.appliedDamage && !message.flags.pf2e.appliedDamage.isHealing)) {
            return
        }

        if (!(message?.flags?.pf2e?.context?.options?.includes("origin:action:slug:strike"))) {
            return
        }

        let adjacentTokens = token.scene.tokens
            .filter(td=>td.actor?.sourceId === 'Compendium.pf2e-summons-helper.summons-actors.Actor.QqE1NLXmtnGBKv6H')
            .filter(td=>td.actor?.alliance === message.actor?.alliance)
            .filter(td=>td!=token && token.object.isAdjacentTo(td.object))
            .filter(td=>td.actor?.hitPoints.value > 0);

        if (!adjacentTokens.length) {
            return
        }
        let tree = adjacentTokens[0];
        let decreaseDamage = Math.min(message.flags.pf2e.appliedDamage.updates[0]?.value || 5, tree.actor.hitPoints.value);
        if (!decreaseDamage) {
            return
        }

        let baseText = `Pretector Tree decrease ${decreaseDamage} damage for ${message.actor.name}`

        ChatMessage.create({
            flags: {
                [moduleName]: {
                    hpTransfer: {
                        target: message.actor.uuid,
                        source: tree.actor.uuid,
                        value: decreaseDamage,
                        baseText,
                    }
                }
            },
            content: `<strong>Damage Transfer</strong><br>
                <a class="content-link life-link" style="white-space: normal;">
                    <i class="fa-solid fa-heart-pulse"></i>
                    ${baseText}
                </a>
            `,
            whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
            speaker: ChatMessage.getSpeaker(message.actor.uuid),
        });
    }
}