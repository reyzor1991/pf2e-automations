import {BaseRule, MessageForHandling, Rule} from "../rule";

export function applySelfEffect(rule: BaseRule, mm: MessageForHandling) {
    foundry.utils.debounce(async () => {
        ui.chat.element
            .querySelector(`[data-message-id="${mm.messageId}"] [data-action="applyEffect"]`)
            ?.click()
        return true
    }, 500)()
}

export async function createItemObjectUuid(uuid: string, mm: MessageForHandling, rule?: Rule) {
    let obj = await fromUuid(uuid);
    if (!obj) {
        console.warn(`Cannot create item object with id "${uuid}"`);
    }
    obj = obj.toObject();
    if (mm.itemLvl) {
        obj.system.level = {value: mm.itemLvl};
    }
    if (mm.optionalData?.origin && !rule?.skipOrigin) {
        let origin = mm?.rollOptions?.has("mType:saving-throw")
            ? mm?.optionalData?.stOrigin
            :  mm?.optionalData?.origin

        obj.system.context = foundry.utils.mergeObject(obj.system.context ?? {}, {
            origin
        });
    }
    if (obj._stats) {
        obj._stats.compendiumSource = uuid;
    }
    if (rule?.choiceSetSelection) {
        let cSet = obj.system.rules.filter(r=>r.key==="ChoiceSet");
        if (cSet.length === 1) {
            cSet[0].selection = rule?.choiceSetSelection;
        }
    }

    return obj
}

export async function createItemObject(rule: BaseRule, mm: MessageForHandling) {
    return createItemObjectUuid(rule.value, mm, rule);
}