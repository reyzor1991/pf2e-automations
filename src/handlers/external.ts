import {BaseRule, MessageForHandling} from "../rule";
import {effectUUID} from "../helpers";
import {addItemToActor, rollDamage} from "../global-f";
import {createItemObject} from "../hooks/functions";

export async function furiousAnatomy(rule: BaseRule, mm: MessageForHandling) {
    let ff = mm.item
    if (!ff) {
        return
    }
    ff = ff?.actor?.itemTypes?.feat
        ?.find((c) => "Compendium.barbarians.barbarians-features.Item.8GiJ5h5acs4ik8k7" === c.sourceId)
    if (!ff) {
        return
    }

    const r = rule.rawValue()
    r.value = "";

    if (ff.name.includes('Billowing Orifice')) {
        r.value = effectUUID('DqspZqJJu4v3k4Zv');
    } else if (ff.name.includes('Gibbering Mouths')) {
        r.value = effectUUID('7roTkQ4QHWDWZkJM');
    } else if (ff.name.includes('Tongue Proboscis')) {
        r.value = effectUUID('NKue7w68dX1yH4bA');
    } else if (ff.name.includes('Tentacle Strands')) {
        r.value = effectUUID('qzjX5A17McTdDHFx');
    } else if (ff.name.includes('Unblinking Eyes')) {
        r.value = effectUUID('1u4ZAmfeWKyN3uKK');
    } else if (ff.name.includes('Warp Spasm')) {
        r.value = effectUUID('HrHzFVcdcBdG2nv8');
    }
    if (r.value) {
        addItemToActor(mm.mainActor, await createItemObject(r, mm))
    }
}

export async function causticBelch(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.item) {
        return
    }
    const _d = Math.floor(mm.item.actor.level / 2);
    rollDamage(mm.mainActor, mm.mainToken, `${_d}d8[poison]`)
}