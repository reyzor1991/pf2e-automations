import {PreCreateMessageHook} from "./index";
import {getSetting} from "../helpers";
import {EMPTY_EFFECT, moduleName} from "../const";
import {addItemToActor} from "../global-f";
import * as module from "node:module";


function ordinalString(value: number) {
    const pluralRules = new Intl.PluralRules(game.i18n.lang, {type: "ordinal"});
    const suffix = game.i18n.localize(`PF2E.OrdinalSuffixes.${pluralRules.select(value)}`);
    return game.i18n.format("PF2E.OrdinalNumber", {value, suffix});
}

export class HighlightHeightenedSpellsHook implements PreCreateMessageHook {
    listen(message: ChatMessage) {
        if (!getSetting("highlightSpells") || !message.item || !message.item.isOfType('spell')) {
            return
        }
        const heightening = Object.keys(message.item.system?.heightening?.levels || {})
        if (heightening.length === 0) {
            return;
        }

        const heighteningLevel = heightening
            .map(a => Number(a))
            .findLast(lvl => lvl <= message.item.level)
        if (!heighteningLevel) {
            return;
        }
        const ord = ordinalString(heighteningLevel);

        const regExp = new RegExp(`<p><strong>Heightened \\(${ord}\\)<\/strong>(.*?)<\/p>`);
        message.updateSource({
            content: message.content.replace(regExp, `<p style="color: blue"><strong>Heightened (${ord})</strong>` + '$1' + "</p>")
        });
    }
}

export class DelayConsequencesHook implements PreCreateMessageHook {
    listen(message: ChatMessage) {
        if (message.isDamageRoll) {
            if (message.target?.actor) {
                let effect = message.target.actor.itemTypes.effect.find(e=>e.slug === 'effect-delay-consequences');
                if (effect && !effect.getFlag(moduleName, 'delayDamage')) {
                    effect.setFlag(moduleName, 'delayDamage', message.toObject())
                    ui.notifications.info("Damage was delayed")
                    return false;
                }
            }
            return;
        }

        if (message?.item?.sourceId === "Compendium.pf2e.spells-srd.Item.3wmX7htzOXiHLdAn") {
            let target = game.user.targets.first()?.actor;
            let actor = message.actor;
            if (target && actor) {
                let eff = foundry.utils.deepClone(EMPTY_EFFECT);
                eff._id = foundry.utils.randomID()
                eff.name = `Effect: Delay Consequences`
                eff.system.slug = 'effect-delay-consequences'
                eff.system.duration = {
                    "expiry": "turn-end",
                    "sustained": true,
                    "unit": "rounds",
                    "value": 1
                }
                eff.system.context = foundry.utils.mergeObject(eff.system.context ?? {}, {
                    origin: {
                        actor: actor.uuid,
                        item: message.item.uuid
                    },
                });

                addItemToActor(target, eff);
            }
        }
    }
}