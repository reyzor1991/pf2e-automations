import {PreCreateMessageHook} from "./index";
import {getRollOptions, getSetting} from "../helpers";
import {addItemsToActor, addItemToActor} from "../global-f";
import {GlobalNamespace, moduleName} from "../const";

export class ThaumaturgeHook implements PreCreateMessageHook {
    listen(message: ChatMessage) {
        if (!getSetting("useAutomationThaumaturge")) {
            return;
        }
        messageIntensifyVulnerability(message)
        messageBellIntensify(message)
        messageDrinkFromTheChalice(message)
        messageChaliceIntensify(message)
        messageRegaliaIntensify(message)
    }
}

async function messageIntensifyVulnerability(message: ChatMessage) {
    if (message?.item?.sourceId !== 'Compendium.pf2e.actionspf2e.Item.HAmGozJwLAal5v82') {
        return;
    }
    const thaumFlags = Object.keys(message.actor?.flags?.['pf2e-thaum-vuln']?.['selectedImplements'] ?? {});
    if (!thaumFlags.length) {

    } else if (thaumFlags.length === 1) {
        await intensifyVulnerability(message.actor, thaumFlags[0]);
    } else {
        let options = '';
        for (const value of thaumFlags) {
            options += `<option value=${value}>${value.titleCase()}</option>`
        }

        const {iii} = await Dialog.wait({
            title: "Choose Implement",
            content: `<select id="map">${options}</select><hr>`,
            buttons: {
                ok: {
                    label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
                    callback: (html) => {
                        return {iii: html.find("#map").val()}
                    }
                },
                cancel: {label: "Cancel", icon: "<i class='fa-solid fa-ban'></i>",}
            },
            default: "ok"
        });
        if (!iii) {
            return
        }
        await intensifyVulnerability(message, iii);
    }
}

async function intensifyVulnerability(message: ChatMessage, implementation: string) {
    const objs = [];

    if (implementation === 'amulet') {
        let obj = await fromUuid("Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.icPIf1hOBOVmWtL1");
        obj = obj?.toObject();
        if (obj) {
            obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.icPIf1hOBOVmWtL1"}});

            obj.system.rules[0].predicate = [
                "origin:effect:primary-ev-target-" + game.pf2e.system.sluggify(message.actor.name),
            ];
            obj.system.rules[1].predicate = [
                "origin:effect:primary-ev-target-" + game.pf2e.system.sluggify(message.actor.name),
            ];
            objs.push(obj);
        }
    } else if (implementation === 'bell') {
        let obj = await fromUuid("Compendium.pf2e-automations-patreon.effects.Item.XBve00uwPI0FK4QP");
        obj = obj?.toObject();
        if (obj) {
            obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: "Compendium.pf2e-automations-patreon.effects.Item.XBve00uwPI0FK4QP"}});
            objs.push(obj);
        }
    } else if (implementation === 'chalice') {
        let obj = await fromUuid("Compendium.pf2e-automations-patreon.effects.Item.TgG0ksbrYUiBNfyf");
        obj = obj?.toObject();
        if (obj) {
            obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: "Compendium.pf2e-automations-patreon.effects.Item.TgG0ksbrYUiBNfyf"}});
            objs.push(obj);
        }
    } else if (implementation === 'lantern') {
        let obj = await fromUuid("Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.atECc1SuDgUqNakg");
        obj = obj?.toObject();
        if (obj) {
            obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.atECc1SuDgUqNakg"}});
            objs.push(obj)
        }

        let aura = await fromUuid("Compendium.pf2e-automations-patreon.effects.Item.hA2y0arJg3ztQnF6");
        aura = aura?.toObject();
        if (aura) {
            aura.flags = foundry.utils.mergeObject(aura.flags ?? {}, {core: {sourceId: "Compendium.pf2e-automations-patreon.effects.Item.hA2y0arJg3ztQnF6"}});
            aura.system.rules[0].effects[0].predicate.push("target:effect:primary-ev-target-" + game.pf2e.system.sluggify(message.actor.name))
            objs.push(aura)
        }
    } else if (implementation === 'mirror') {
        let tEff = await fromUuid("Compendium.pf2e-automations-patreon.effects.Item.YdwwACq7ODGs6DdA");
        tEff = tEff?.toObject();
        if (tEff) {
            tEff.system.rules[0].predicate.push(`target:signature:${message.actor.signature}`);
            tEff.system.rules[1].predicate.push(`target:signature:${message.actor.signature}`);
            tEff.system.context = foundry.utils.mergeObject(tEff.system.context ?? {}, {
                "origin": {
                    "actor": message.actor.uuid,
                    "item": message.item?.uuid,
                    "token": message.token?.uuid
                },
                "roll": null,
                "target": null
            });
            message.token.scene.tokens.filter(t => t.actor && t.actor.itemTypes.effect
                .find(e => e.slug === `effect-primary-ev-target-${game.pf2e.system.sluggify('thu')}`))
                .map(t => t.actor)
                .forEach(a => {
                    addItemToActor(a, tEff)
                })
        }
    } else if (implementation === 'regalia') {
        let obj = await fromUuid("Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.qHe8lT8ROOKwFNkg");
        obj = obj?.toObject();
        if (obj) {
            obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.qHe8lT8ROOKwFNkg"}});
            objs.push(obj);
        }
    }
    if (objs.length) {
        addItemsToActor(message.actor, objs)
    }
}

async function messageBellIntensify(message: ChatMessage) {
    const rollOptions = await getRollOptions(message, message.item);
    if (!rollOptions.has("mType:attack-roll")) {
        return;
    }
    if (rollOptions.has("outcome:failure") || rollOptions.has("outcome:criticalFailure")) {
        return;
    }
    if (!rollOptions.has("self:effect:bell-intensify-vulnerability-activation")) {
        return;
    }
    if (!rollOptions.has(`target:effect:primary-ev-target-${game.pf2e.system.sluggify(message.actor.name)}`)) {
        return;
    }

    let obj = await fromUuid("Compendium.pf2e-automations-patreon.effects.Item.vB7dCJfH7H1abldb");
    obj = obj?.toObject();
    if (!obj) {
        return;
    }
    obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: "Compendium.pf2e-automations-patreon.effects.Item.vB7dCJfH7H1abldb"}});
    if (message.flags.pf2e?.context?.outcome === 'criticalSuccess') {
        obj.system.rules[0].value = -3;
    }

    addItemToActor(message.target?.actor, obj)
}

async function messageDrinkFromTheChalice(message: ChatMessage) {
    if (message.item?.slug !== 'drink-from-the-chalice') {
        return;
    }
    const {iii} = await Dialog.wait({
        title: "Choose type of drink",
        content: `<select id="map"><option value=0>Sip</option><option value=1>Drain</option></select><hr>`,
        buttons: {
            ok: {
                label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
                callback: (html) => {
                    return {iii: parseInt(html.find("#map").val())}
                }
            },
            cancel: {label: "Cancel", icon: "<i class='fa-solid fa-ban'></i>",}
        },
        default: "ok"
    });
    if (iii === undefined || iii === null) {
        return
    }

    const target = game.user.targets.first() ? game.user.targets.first() : message.token.object;
    if (iii === 0) {
        let uuid = "Compendium.pf2e.feat-effects.Item.gjxSQgN3MopLxM35";
        let obj = await fromUuid(uuid);
        obj = obj?.toObject();
        if (!obj) {
            return;
        }
        if (obj._stats) {
            obj._stats.compendiumSource = uuid;
        }
        obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: uuid}});

        addItemToActor(target.actor, obj)
    } else if (iii === 1) {
        target.setTarget(true, {releaseOthers: true})
        const value = 3 * message.actor.level + (message.actor?.itemTypes?.effect?.find(e => e.slug === 'effect-chalice-intensify-vulnerability') ? message.actor.level : 0);
        const roll = new GlobalNamespace.DamageRoll(`${value}[healing]`);
        await roll.evaluate();

        await ChatMessage.create({
            flags: {
                [moduleName]: {}
            },
            flavor: '3 Hit Points for each level', content: String(value), roll, type: 5
        })
        target.setTarget(false)
    }
}

async function messageChaliceIntensify(message: ChatMessage) {
    const rollOptions = await getRollOptions(message, message.item);
    if (!rollOptions.has("mType:attack-roll")) {
        return;
    }
    if (rollOptions.has("outcome:failure") || rollOptions.has("outcome:criticalFailure")) {
        return;
    }
    if (!rollOptions.has("self:effect:chalice-intensify-vulnerability-activation")) {
        return;
    }
    if (!rollOptions.has(`target:effect:primary-ev-target-${game.pf2e.system.sluggify(message.actor.name)}`)) {
        return;
    }
    if (rollOptions.has("self:effect:chalice-intensify-vulnerability")) {
        return;
    }

    let obj = await fromUuid("Compendium.pf2e-automations-patreon.effects.Item.IxQH4PQwhbylr5VW");
    obj = obj?.toObject();
    if (!obj) {
        return;
    }
    obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId: "Compendium.pf2e-automations-patreon.effects.Item.IxQH4PQwhbylr5VW"}});
    addItemToActor(message.actor, obj)
}

async function messageRegaliaIntensify(message: ChatMessage) {
    const rollOptions = await getRollOptions(message, message.item);
    if (!rollOptions.has("mType:attack-roll")) {
        return;
    }
    if (rollOptions.has("outcome:failure") || rollOptions.has("outcome:criticalFailure")) {
        return;
    }
    if (!rollOptions.has("self:effect:regalia-intensify-vulnerability")) {
        return;
    }

    if (
        rollOptions.has("target:mark:personal-antithesis")
        || rollOptions.has("target:mark:mortal-weakness")
        || rollOptions.has("target:mark:breached-defenses")
    ) {
        const allies = message.token.scene.tokens
            .filter(t => t.actor && t.actor.isAllyOf(message.actor))
            .filter(t => !CONFIG.Canvas.polygonBackends["sight"].testCollision(message.token.center, t.center, {
                type: "sight",
                mode: "any",
            }))
            .map(t => t.actor);

        const options = allies.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        const {actorId} = await Dialog.wait({
            title: "Choose ally",
            content: `<select id="map">${options}</select><hr>`,
            buttons: {
                ok: {
                    label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
                    callback: (html) => {
                        return {actorId: html.find("#map").val()}
                    }
                },
                cancel: {label: "Cancel", icon: "<i class='fa-solid fa-ban'></i>",}
            },
            default: "ok"
        });
        if (actorId === undefined || actorId === null) {
            return
        }

        const sourceId = message.flags.pf2e?.context?.outcome === 'criticalSuccess'
            ? "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.CGANYKdu4lVXj0nk"
            : "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.gEfHdas8he98C9rR"

        let obj = await fromUuid(sourceId);
        obj = obj?.toObject();
        if (obj) {
            obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {core: {sourceId}});
            obj.system.context = foundry.utils.mergeObject(obj.system.context ?? {}, {
                "origin": {
                    "actor": message.actor.uuid,
                    "item": message.item?.uuid,
                    "token": message.token?.uuid
                },
                "roll": null,
                "target": null
            });
            addItemToActor(game.actors.get(actorId), obj)
        }

    }
}