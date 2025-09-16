import {RenderMessageHook} from "./index";
import {getSetting, isActiveGM, triggerType} from "../helpers";
import {moduleName} from "../const";
import {deleteItem, updateMessageContent} from "../global-f";

class PingRenderMessageHook implements RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void {
        if (!getSetting("pingMessage") || !message.token) {
            return
        }

        html.querySelector('.message-metadata .message-delete')
            ?.before(foundry.utils.parseHTML(`<a aria-label="Ping" class="message-ping" data-token=${message.token.uuid}><i class="fa-solid fa-fw fa-signal-stream ping"></i></a>`))
        clickPing(html.querySelector(".message-metadata .message-ping"));
    }

}

class LifeLinkRenderMessageHook implements RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void {
        html.querySelector("a.life-link")?.addEventListener('click', async (event) => {
            const data = message.getFlag(moduleName, "hpTransfer")
            if (!data) {
                return
            }

            const source = await fromUuid(data.source)
            const target = await fromUuid(data.target)

            await source.update({"system.attributes.hp.value": source.system.attributes.hp.value - data.value})
            await target.update({"system.attributes.hp.value": target.system.attributes.hp.value + data.value})

            const content = html.querySelector('.message-content')
            content?.querySelector('a.life-link')?.remove()
            content?.append(foundry.utils.parseHTML(`
            <span class="life-link-undo-data">
                ${data.value} HP transferred from ${source.name} to ${target.name}
                <i class="fa-solid fa-rotate-left life-link-undo"></i>
            </span>
        `))

            await message.update({
                content: content.outerHTML,
            })
        });

        html.querySelector(".life-link-undo")?.addEventListener('click', async (event) => {
            const data = message.getFlag(moduleName, "hpTransfer")
            if (!data) {
                return
            }

            const source = await fromUuid(data.source)
            const target = await fromUuid(data.target)

            await source.update({"system.attributes.hp.value": source.system.attributes.hp.value + data.value})
            await target.update({"system.attributes.hp.value": target.system.attributes.hp.value - data.value})

            const content = html.querySelector('.message-content')
            content?.querySelector('.life-link-undo-data')?.remove()

            let text = data?.baseText || `Life Link ${data.value} HP to ${target.name}`

            content?.append(foundry.utils.parseHTML(`
            <a class="content-link life-link" style="white-space: normal;">
                <i class="fa-solid fa-heart-pulse"></i>
                ${text}
            </a>
        `))

            await message.update({
                content: content.outerHTML,
            })
        });
    }

}

class SustainRenderMessageHook implements RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void {
        html.querySelector(".sustain-spell-item")?.addEventListener('click', async (event) => {
            const item = $(event.target);
            const ownerId = item.parent().parent().data().ownerId;
            const itemId = item.parent().parent().data().itemId;

            item.parent().append(" was sustained");
            item.parent().find(".dismiss-spell-item").remove();
            item.parent().find(".sustain-spell-item").remove();

            if (ownerId) {
                const owner = await fromUuid(ownerId);
                if (owner) {
                    await owner.itemTypes.action.find((a) => a.slug === "sustain-a-spell")?.toMessage();
                }
            }

            if (itemId) {
                const item = await fromUuid(itemId);
                if (item && item.flags?.[moduleName]?.["sustained-damage"]) {
                    const spell = await fromUuid(item.flags?.[moduleName]?.["sustained-damage"]?.spell)
                    const castRank = item.flags?.[moduleName]?.["sustained-damage"]?.castRank ?? 0;
                    const outcome = item.flags?.[moduleName]?.["sustained-damage"]?.outcome;
                    if (spell && castRank && outcome) {
                        const target = item?.actor?.combatant?.token;
                        if (target) {
                            target.object.setTarget(true, {releaseOthers: true})
                        }

                        function PD(cm) {
                            if (cm.user.id === game.userId && cm.isDamageRoll) {
                                const keys = Object.keys(cm.flags?.['pf2e-target-helper']?.['targets'] ?? {})
                                for (const k of keys) {
                                    cm.updateSource({
                                        [`flags.pf2e-target-helper.targets.${k}.outcome`]: outcome,
                                    });
                                }
                            }
                        }

                        let id = Hooks.on("preCreateChatMessage", PD);
                        const variant = spell.loadVariant({castRank}) ?? spell;
                        await variant.rollDamage({target: castRankElement(castRank)})
                        Hooks.off("preCreateChatMessage", id);
                        if (target) {
                            target.object.setTarget(false)
                        }
                    }
                }
            }

            updateMessageContent(message, html.querySelector('.spell-message')?.outerHTML || '');
        });

        html.querySelector(".dismiss-spell-item")?.addEventListener('click', async (event) => {
            const item = $(event.target);
            let li = item.closest('li');
            const itemId = li.data().itemId;
            item.closest('.spell-message-item-sub').append(" was dismissed");
            li.find(".dismiss-spell-item").remove();
            li.find(".sustain-spell-item").remove();

            if (itemId) {
                deleteItem(await fromUuid(itemId));
            }
            updateMessageContent(message, html.querySelector('.spell-message')?.outerHTML || '');
        });
    }
}

function castRankElement(castRank: number) {
    const target = document.createElement("div");
    target.dataset.castRank = castRank.toString();
    target.closest = () => {
        return {dataset: {castRank: castRank}};
    };
    return target;
}

class MinMaxDamageRenderMessageHook implements RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void {
        if (
            !getSetting("minMaxDamage")
            || triggerType(message) !== 'damage-roll'
            || !isActiveGM()
        ) {
            return;
        }

        html.querySelector(".tags.modifiers")?.before(foundry.utils.parseHTML(`
        <div style="display: flex;">
            <button class="fa-solid fa-arrow-down roll-min-damage" data-tooltip="Update to min damage"></button>    
            <button class="fa-solid fa-arrow-up roll-max-damage" data-tooltip="Update to max damage"></button>    
        </div>    
    `));

        html.querySelector(".roll-min-damage")?.addEventListener('click', async (_event) => {
            setNewDamage(message, false)
        });

        html.querySelector(".roll-max-damage")?.addEventListener('click', async (_event) => {
            setNewDamage(message, true)
        });
    }

}

class HideRollMessageHook implements RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void {
        if (!getSetting('hidePrivateGMRolls') && !getSetting('hidePrivatePlayerRolls')) {
            return;
        }

        if ((game.user.isGM || !message.author?.isGM) && !getSetting('hidePrivatePlayerRolls')) {
            return;
        }
        if (!message.whisper.length || message.whisper.includes(game.user.id)) {
            return;
        }

        if (getSetting('hidePrivatePlayerRolls') && message.isOwner) {
            return;
        }

        message.sound = null;
        html.classList.add("roll-hidden");
        html.style.display = "none";
    }
}

function clickPing(html: HTMLElement) {
    html?.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!canvas.ready) return;

        const obj = await fromUuid($(event.currentTarget).data().token);
        canvas.ping(obj.center);
    });
}

async function setNewDamage(message: ChatMessage, isMax: boolean) {
    const roll = message.rolls[0]

    for (const instance of roll.instances) {
        instance._evaluated = false;
        for (const die of instance.dice) {
            die._evaluated = false;
            die.results.map(a => {
                a.result = isMax ? die._faces : 1;
            })
            await die.evaluate()
        }
        await instance.evaluate()
    }
    for (const t of roll.terms) {
        t.results = t.rolls.map(a => {
            return {active: true, result: a.total}
        })
    }

    roll._evaluated = false
    await roll.resetFormula()
    await roll.evaluate()

    await message.update({
        'rolls': [roll],
        content: `${roll.total}`,
    });

    ui.notifications.info("Message damage updated successfully.");
}

export {
    PingRenderMessageHook,
    MinMaxDamageRenderMessageHook,
    LifeLinkRenderMessageHook,
    SustainRenderMessageHook,
    HideRollMessageHook,
}