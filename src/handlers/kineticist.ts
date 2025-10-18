import {moduleName, PHYSICAL_DAMAGE_TYPES} from "../const";
import {BaseRule, MessageForHandling} from "../rule";
import {effectUUID, equipmentUUID, getEffectBySourceId} from "../helpers";
import {addItemToActor, deleteItem, rollDamage, updateItem} from "../global-f";
import {createItemObjectUuid} from "../hooks/functions";

export function armorInEarth(rule: BaseRule, mm: MessageForHandling) {
    applyEffectArmor(mm.item, 'TDvicwRah0zBhsYg', (item: Item, _obj: any) => {
        if (item.actor.level >= 3) {
            _obj.system.acBonus = 5;
            _obj.system.traits.value.push("bulwark")
        }
    })
}


export function hardwoodArmor(rule: BaseRule, mm: MessageForHandling) {
    applyEffectArmor(mm.item, '9jbCQQAzUbXNGzZq', null, async (item: Item) => {
        if (item.actor?.rollOptions.all['hands-free:1'] || item.actor.rollOptions.all['hands-free:2']) {
            const confirm = await Dialog.confirm({
                title: "Hardwood Armor", content: "Do you want to create Hardwood Shield?",
            });
            if (!confirm) {
                return
            }

            addItemToActor(item.actor, await createItemObjectUuid(effectUUID("iqvdFq5V1b2HSAW4"), mm))
        }
    });
}

export function metalCarapace(rule: BaseRule, mm: MessageForHandling) {
    applyEffectArmor(mm.item, 'A0AP7oLqdRwOCje7', null, async (item: Item) => {
        if (item.actor?.rollOptions.all['hands-free:1'] || item.actor.rollOptions.all['hands-free:2']) {
            const confirm = await Dialog.confirm({
                title: "Metal Carapace", content: "Do you want to create Rusty Steel Shield?",
            });
            if (!confirm) {
                return
            }
            addItemToActor(item.actor, await createItemObjectUuid(effectUUID("aH805tedt3A5Suuc"), mm))
        }
    });
}

export function deleteArmorInEarth(rule: BaseRule, mm: MessageForHandling) {
    handleDeleteArmorEffect(mm.item, 'NT4T6gEdEQsoHItQ', 'TDvicwRah0zBhsYg')
}

export function deleteMetalCarapace(rule: BaseRule, mm: MessageForHandling) {
    handleDeleteArmorEffect(mm.item, 'wITJ6L8mcbbgoCHu', 'A0AP7oLqdRwOCje7')
}

export function deleteHardwoodArmor(rule: BaseRule, mm: MessageForHandling) {
    handleDeleteArmorEffect(mm.item, 'mxIt7zfVKgLZ8AeC', '9jbCQQAzUbXNGzZq')
}

async function applyEffectArmor(item: Item, armorUUID: string, handleItemLevel?: Function, afterAdd?: Function) {
    const wornArmor = item.actor.itemTypes.armor.filter(a => a.isWorn && a.system.equipped.inSlot)[0]
    if (wornArmor?.id) {
        await item.setFlag(moduleName, 'oldArmor', wornArmor.id)
        await item.setFlag(moduleName, 'oldArmorBulk', wornArmor.system.bulk.value)
        await wornArmor.update({"system.bulk.value": Math.max(wornArmor.system.bulk.value - 1, 0)})
    }

    const sourceId = equipmentUUID(armorUUID)

    const _obj = (await fromUuid(sourceId)).toObject();
    if (wornArmor) {
        _obj.system.runes = wornArmor.system.runes
        _obj.system.bulk.value = 0
    }
    const defenses = item.actor.system.proficiencies.defenses
    const maxCategory = Object.keys(defenses).reduce(function (a, b) {
        return defenses[a].value > defenses[b].value ? a : b
    })
    if (maxCategory) {
        _obj.system.category = maxCategory;
    }

    if (handleItemLevel) {
        await handleItemLevel(item, _obj)
    }

    const addedArmor = (await item.actor.createEmbeddedDocuments("Item", [_obj]))[0]
    if (addedArmor) {
        await item.actor.changeCarryType(addedArmor, {carryType: 'worn', inSlot: true})
        if (wornArmor && wornArmor.system.equipped.invested) {
            item.actor.toggleInvested(addedArmor.id)
        }
    }

    if (afterAdd) {
        await afterAdd(item, addedArmor)
    }
}


async function handleDeleteArmorEffect(item: Item, effectUuid: string, equipmentUuid: string) {
    if (item.sourceId !== effectUUID(effectUuid)) {
        return
    }
    await item.actor.itemTypes.armor.find(a => a.sourceId === equipmentUUID(equipmentUuid))?.delete()

    const armorId = item.getFlag(moduleName, 'oldArmor');
    const oldArmorBulk = item.getFlag(moduleName, 'oldArmorBulk');
    if (armorId) {
        const armor = item.actor.items.get(armorId);
        if (armor) {
            await item.actor.changeCarryType(armor, {carryType: 'worn', inSlot: true})
            if (oldArmorBulk !== undefined) {
                await armor.update({"system.bulk.value": oldArmorBulk})
            }

        }
    }
}

export async function metalCarapaceShield(rule: BaseRule, mm: MessageForHandling) {
    const sourceId = equipmentUUID('Yr9yCuJiAlFh3QEB')
    const _obj = (await fromUuid(sourceId)).toObject();

    let multiplier = Math.floor((mm.item.actor.level-1)/3);
    if (multiplier > 0) {
        _obj.system.hardness += multiplier;
        _obj.system.hp.value += 4 * multiplier;
        _obj.system.hp.max += 4 * multiplier;
    }

    const addedArmor = (await mm.item.actor.createEmbeddedDocuments("Item", [_obj]))[0]
    if (addedArmor) {
        mm.item.actor.changeCarryType(addedArmor, {carryType: "held", handsHeld: 1})
    }
}

export async function hardwoodArmorShield(rule: BaseRule, mm: MessageForHandling) {
    const sourceId = equipmentUUID('gkqzWcFgbib1BFne')
    const _obj = (await fromUuid(sourceId)).toObject();

    let multiplier = Math.floor((mm.item.actor.level-1)/3);
    if (multiplier > 0) {
        _obj.system.hardness += multiplier;
        _obj.system.hp.value += 4 * multiplier;
        _obj.system.hp.max += 4 * multiplier;
    }

    const addedArmor = (await mm.item.actor.createEmbeddedDocuments("Item", [_obj]))[0]
    if (addedArmor) {
        mm.item.actor.changeCarryType(addedArmor, {carryType: "held", handsHeld: 1})
    }
}

export function deleteMetalCarapaceShield(rule: BaseRule, mm: MessageForHandling) {
    mm.item.actor.itemTypes.shield.find(a => a.sourceId === equipmentUUID('Yr9yCuJiAlFh3QEB'))?.delete()
}

export function deleteHardwoodArmorShield(rule: BaseRule, mm: MessageForHandling) {
    mm.item.actor.itemTypes.shield.find(a => a.sourceId === equipmentUUID('gkqzWcFgbib1BFne'))?.delete()
}


export async function createSpikeSkin(rule: BaseRule, mm: MessageForHandling) {
    game.combat?.turns?.map(cc => cc.actor)?.filter(a => a !== mm.item.actor)?.forEach(a => {
        deleteItem(getEffectBySourceId(a, effectUUID('J3GGbKP247JWY883')))
    });
}

export async function spikeSkin(rule: BaseRule, mm: MessageForHandling) {
    if (!PHYSICAL_DAMAGE_TYPES.some(dt => mm.roll.formula.includes(dt))) {
        return
    }

    const target = mm.roll.formula.includes('bleed') && mm.messageFlags.pf2e?.origin?.uuid
        ? mm.mainActor
        : mm.targetActor

    if (!target) {
        return
    }
    const eff = getEffectBySourceId(target, effectUUID('J3GGbKP247JWY883'))
    if (!eff) {
        return
    }

    updateItem(eff, {"system.duration.value": eff.system.duration.value - 1})
}

export async function spikeSkinDamage(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.mainActor) {
        return
    }
    if (!getEffectBySourceId(mm?.targetActor, effectUUID('J3GGbKP247JWY883'))) {
        return
    }

    const weapon = mm.mainActor.system.actions[mm.messageFlags.pf2e?.strike?.index]?.item
    if (!weapon) {
        return;
    }

    if (weapon.isMelee && !weapon?.traits?.has('reach')) {
        mm.mainToken.object.setTarget(true, {releaseOthers: true})
        await rollDamage(mm.mainActor, mm.mainToken, `2[piercing]`)
        mm.mainToken.object.setTarget(false)
    }
}