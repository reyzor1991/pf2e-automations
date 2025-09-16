import {addItemToActor} from "../global-f";
import {BaseRule, MessageForHandling} from "../rule";
import {EMPTY_EFFECT} from "../const";
import {getEffectBySourceId} from "../helpers";


export async function doublingRings(rule: BaseRule, mm: MessageForHandling) {
    const actor = mm.mainActor;
    if (!actor) {
        return
    }
    if (!mm.item?.isInvested) {
        ui.notifications.info("Doubling Rings should be invested");
        return
    }
    const weapons = actor?.system.actions.filter(a => a.ready && !a.item?.system?.traits?.value?.includes("unarmed"))
        .map(a => a.item)
    if (weapons < 2) {
        ui.notifications.info("Need to have at least 2 weapons");
        return
    }
    const opts = weapons.map(w => `<option value="${w.id}">${w.name}</option>`)

    let {source, target} = await foundry.applications.api.DialogV2.wait({
        window: {title: 'Doubling Rings'},
        content: ` <label for="fob1">Choose a source:</label> <select id="fob1" autofocus>${opts}</select> <label for="fob2">Choose a target:</label> <select id="fob2" autofocus>${opts}</select>  `,
        buttons: [{
            action: "ok", label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
            callback: (event, button, form) => {
                return {source: $(form).find("#fob1").val(), target: $(form).find("#fob2").val(),}
            }
        }]
    });
    source = weapons.find(w => w.id === source)
    target = weapons.find(w => w.id === target)
    if (!source || !target) {
        return
    }

    const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
    newEffect._id = foundry.utils.randomID()
    newEffect.name = `Effect: Doubling Rings (${source.name} -> ${target.name})`;
    newEffect.slug = "effect-doubling-rings";
    if (source.system.runes.potency) {
        newEffect.system.rules.push({
            "key": "WeaponPotency",
            "selector": `${target.id}-attack`,
            "value": source.system.runes.potency
        })
    }
    if (source.system.runes.striking) {
        newEffect.system.rules.push({
            "key": "Striking",
            "selector": `${target.id}-damage`,
            "value": source.system.runes.striking
        })
    }

    if (mm.item.sourceId === "Compendium.pf2e.equipment-srd.Item.gRQXLqUuP4GWfDWI" && source.system.runes.property.length > 0) {
        newEffect.system.rules.push(...source.system.runes.property.map(r => {
            return {
                "key": "AdjustStrike", "mode": "add", "property": "property-runes", "definition": [`item:id:${target.id}`,], "value": r
            }
        }));
    }

    addItemToActor(mm.mainActor, newEffect)
}


const ANIMAL_OR_PLANT_IDS = ["Compendium.pf2e.equipment-srd.Item.L9ZV076913otGtiB"];

export function bagOfDevouringDelete(rule: BaseRule, mm: MessageForHandling) {
    mm.optionalData = {itemChanges: {deleted: true}}
    bagOfDevouring(rule, mm);
}

export function bagOfDevouring(rule: BaseRule, mm: MessageForHandling) {
    const changes = mm.optionalData?.itemChanges;
    const containerId = mm.item?.system.containerId;
    if (!containerId || !changes) {
        return
    }
    const json = mm.item.toJSON()

    let needCheck = false;

    if (changes.deleted) {
        needCheck = true;
    } else if (changes?.system?.quantity && changes.system.quantity < json.system.quantity) {
        needCheck = true;
    } else if (changes?.system?.uses?.value && changes.system.uses.value < json.system.uses.value) {
        needCheck = true;
    }
    if (!needCheck) {
        return
    }

    const container = mm.item.actor.items.get(containerId)
    if (container
        && [
            "Compendium.pf2e.equipment-srd.Item.MN8SF2sArQhJg6QG",
            "Compendium.pf2e.equipment-srd.Item.EIBmADRICTyYzxik",
            "Compendium.pf2e.equipment-srd.Item.n3kJYoTrzXYwlYaV"
        ].includes(container.sourceId)) {
        if (ANIMAL_OR_PLANT_IDS.includes(mm.item.sourceId)) {
            rollFlatCheck(mm.item.actor, 9, "Bag of Devouring Check")
        }
    }
}


export async function bagOfWeaselsDelete(rule: BaseRule, mm: MessageForHandling) {
    mm.optionalData = {itemChanges: {deleted: true}}
    bagOfWeasels(rule, mm);
}

export function bagOfWeasels(rule: BaseRule, mm: MessageForHandling) {
    const changes = mm.optionalData?.itemChanges;
    const containerId = mm.item?.system.containerId;
    if (!containerId || !changes) {
        return
    }
    const json = mm.item.toJSON()

    let needCheck = false;

    if (changes.deleted) {
        needCheck = true;
    } else if (changes?.system?.quantity && changes.system.quantity < json.system.quantity) {
        needCheck = true;
    } else if (changes?.system?.uses?.value && changes.system.uses.value < json.system.uses.value) {
        needCheck = true;
    }
    if (!needCheck) {
        return
    }

    const container = mm.item.actor.items.get(containerId)
    if (container && ["Compendium.pf2e.equipment-srd.Item.W5znRDeklmWEGzFY"].includes(container.sourceId)) {
        rollFlatCheck(mm.item.actor, 11, "Bag of Weasels Check")
    }
}

function rollFlatCheck(actor: Actor, value: number, title: string) {
    game.pf2e.Check.roll(
        new game.pf2e.CheckModifier(`empty`, {modifiers: []}, []),
        {
            actor,
            dc: {
                value,
                label: 'DC Check'
            },
            domains: ["flat-check"],
            options: ["check:type:flat"],
            type: "flat-check",
            title
        }, null, null)
}

export async function removeEffectsWhenUnconscious(rule: BaseRule, mm: MessageForHandling) {
    mm.item?.actor?.itemTypes.effect
        .filter(a => a.slug && a.slug.startsWith('stance-'))
        .forEach(eff => {
            eff.delete()
        });

    getEffectBySourceId(mm.item?.actor, "Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr")?.delete()
    getEffectBySourceId(mm.item?.actor, "Compendium.pf2e.feat-effects.Item.RoGEt7lrCdfaueB9")?.delete()
}

export async function refocus(rule: BaseRule, mm: MessageForHandling) {
    mm.item.actor.update({"system.resources.focus.value": mm.item.actor.system.resources.focus.value + 1});
    ui.notifications.info(`Focus point was restored`);
}