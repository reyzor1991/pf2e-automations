import {MessageHook} from "./index";
import {isActiveGM} from "../helpers";
import {moduleName} from "../const";

function lifeLinkDamage(effect: Effect) {
    if (effect.level >= 9) {
        return 15
    } else if (effect.level >= 6) {
        return 10
    } else if (effect.level >= 3) {
        return 5
    }
    return 3;
}

export class LifeLinkMessageHook implements MessageHook {
    async listen(message: ChatMessage) {
        if (!isActiveGM() || !message.actor) {
            return
        }
        if (!(message?.flags?.pf2e?.appliedDamage && !message.flags.pf2e.appliedDamage.isHealing)) {
            return
        }

        const lifeLink = message.actor.itemTypes.effect.find(e => e.slug === 'effect-life-link')
        const shareLife = message.actor.itemTypes.effect.find(e => e.slug === 'effect-share-life')

        if (lifeLink && shareLife
            && lifeLink.origin && shareLife.origin
            && lifeLink.origin.uuid !== message.actor.uuid
            && shareLife.origin.uuid !== message.actor.uuid
            && lifeLink.origin.uuid === shareLife.origin.uuid
        ) {
            const lifeLinkDecreaseDamage = Math.min(message.flags.pf2e.appliedDamage.updates[0]?.value || 0, lifeLinkDamage(lifeLink))
            const shareLifeDecreaseDamage = Math.round((message.flags.pf2e.appliedDamage.updates[0]?.value || 0) / 2)

            const decreaseDamage = Math.min(message.flags.pf2e.appliedDamage.updates[0]?.value || 0, lifeLinkDecreaseDamage + shareLifeDecreaseDamage)

            ChatMessage.create({
                flags: {
                    [moduleName]: {
                        hpTransfer: {
                            target: message.actor.uuid,
                            source: lifeLink.origin.uuid,
                            value: decreaseDamage
                        }
                    }
                },
                content: `<strong>Damage Transfer</strong><br>
                <a class="content-link life-link">
                    <i class="fa-solid fa-heart-pulse"></i>
                    Life Link ${decreaseDamage} HP to ${message.actor.name}
                </a>
            `,
                whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
                speaker: ChatMessage.getSpeaker(message.actor.uuid),
            });
            return
        }

        if (lifeLink && lifeLink.origin && lifeLink.origin.uuid !== message.actor.uuid) {
            const decreaseDamage = Math.min(message.flags.pf2e.appliedDamage.updates[0]?.value || 0, lifeLinkDamage(lifeLink))

            ChatMessage.create({
                flags: {
                    [moduleName]: {
                        hpTransfer: {
                            target: message.actor.uuid,
                            source: lifeLink.origin.uuid,
                            value: decreaseDamage
                        }
                    }
                },
                content: `<strong>Damage Transfer</strong><br>
                <a class="content-link life-link">
                    <i class="fa-solid fa-heart-pulse"></i>
                    Life Link ${decreaseDamage} HP to ${message.actor.name}
                </a>
            `,
                whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
                speaker: ChatMessage.getSpeaker(message.actor.uuid),
            });
        }

        if (shareLife && shareLife.origin && shareLife.origin.uuid !== message.actor.uuid) {
            const decreaseDamage = Math.round((message.flags.pf2e.appliedDamage.updates[0]?.value || 0) / 2)

            ChatMessage.create({
                flags: {
                    [moduleName]: {
                        hpTransfer: {
                            target: message.actor.uuid,
                            source: shareLife.origin.uuid,
                            value: decreaseDamage
                        }
                    }
                },
                content: `<strong>Damage Transfer</strong><br>
                <a class="content-link life-link">
                    <i class="fa-solid fa-heart-pulse"></i>
                    Life Link ${decreaseDamage} HP to ${message.actor.name}
                </a>
            `,
                whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
                speaker: ChatMessage.getSpeaker(message.actor.uuid),
            });
        }
    }
}