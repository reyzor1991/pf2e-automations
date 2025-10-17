import {addItemToActor, deleteItem} from "../global-f";
import {effectUUID, getEffectBySourceId} from "../helpers";
import {BaseRule, MessageForHandling} from "../rule";
import {createItemObjectUuid} from "../hooks/functions";

async function createDialog(actor: Actor, selfEffect: string, targets, targetEffect, mm: MessageForHandling) {
    const options = targets.map(a => {
        return `<option value="${a.uuid}" data-effect="${targetEffect}">${a.name}</option>`
    })

    const content = `<form>
        <div class="form-group">
            <label>Target:</label>
            <select name="bloodline-selector">  <option data-effect="${selfEffect}">Self</option>  ${options}
            </select>
        </div>
    </form>`

    new Dialog({
        title: "Bloodline Target Selector",
        content,
        buttons: {
            ok: {
                label: "Apply effect", callback: async (html) => {
                    const eId = html.find("[name=bloodline-selector]").find(':selected').data('effect');

                    let obj = await createItemObjectUuid(eId, mm);
                    addItemToActor(actor, obj);
                }
            },
            cancel: {
                label: "Cancel"
            }
        },
        default: "cancel",
    }).render(true);
}

async function createDialogDamageOrTempHP(mm: MessageForHandling, damageEff, selfSpells, allySpells, comboSpells) {
    const eff = effectUUID('yYvPtdlew2YctMgt');

    const aEffect = (await fromUuid(eff)).toObject();
    aEffect.system.rules[0].value = mm.itemLvl || 0;

    createDialogDamageOrSelfEffect(mm, damageEff, selfSpells, allySpells, comboSpells, aEffect)
}

async function createDialogDamageOrSelfEffect(mm: MessageForHandling, damageEff, selfSpells, allySpells, comboSpells, aEffect, isException = false) {
    const spell = mm.item as Item;
    const eff = aEffect._stats.compendiumSource;
    if (selfSpells.includes(spell.slug)) {
        addItemToActor(mm.mainActor, aEffect);
        return
    }

    let options = []
    if (allySpells.includes(spell.slug)) {
        options = targetCharacters(mm.mainActor).map(a => {
            return `<option value="${a.uuid}" data-effect="${eff}">${a.name}</option>`
        })
    } else if (comboSpells.includes(spell.slug)) {
        options = targetCharacters(mm.mainActor).map(a => {
            return `<option value="${a.uuid}" data-effect="${eff}">${a.name}</option>`
        })
        options.push(`<option value="${mm.mainActor.uuid}" data-effect="${damageEff}">Add damage to target</option>`)
    } else {
        options.push(`<option value="${mm.mainActor.uuid}" data-effect="${damageEff}">Add damage to target</option>`)
    }
    options = options.join('')


    const content = `<form>
        <div class="form-group">
            <label>Target:</label>
            <select name="bloodline-selector">  <option value="${mm.mainActor.uuid}" data-effect="${eff}">Self</option>  ${options}
            </select>
        </div>
    </form>`

    new Dialog({
        title: "Bloodline Target Selector",
        content,
        buttons: {
            ok: {
                label: "Apply effect", callback: async (html) => {
                    const tId = html.find("[name=bloodline-selector]").val();
                    const eId = html.find("[name=bloodline-selector]").find(':selected').data('effect');
                    const aEffect = (await fromUuid(eId)).toObject();
                    aEffect.system.rules[0].value = mm.itemLvl;
                    if (aEffect.system.rules.length > 1) {
                        aEffect.system.rules[1].value = mm.itemLvl;
                    }
                    if (eId === damageEff && isException && mm.mainActor?.flags?.pf2e?.elementalBloodline?.damageType) {
                        aEffect.system.rules[0].damageType = mm.mainActor?.flags?.pf2e?.elementalBloodline?.damageType;
                        aEffect.name = "Effect: Additional damage bloodline";
                    }
                    await addItemToActor(await fromUuid(tId), aEffect);
                }
            },
            cancel: {
                label: "Cancel"
            }
        },
        default: "cancel",
    }).render(true);
}


async function bloodlineAesir(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.L8m3L4MCGDZJISp0", [], "", mm);
}

async function bloodlineAberrant(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A", mm);
}

async function bloodlineAngelic(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd", mm);
}

async function bloodlineDemonic(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.aKRo5TIhUtu0kyEr", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.yfbP64r4a9e5oyli", mm);
}

async function bloodlineDiabolic(mm: MessageForHandling) {
    const damageEff = effectUUID('2yWSBNLWWYXXSfKZ');
    createDialogDamageOrSelfEffect(
        mm,
        damageEff,
        ["true-seeing", "truesight", "divine-aura", "embrace-the-pit"],
        [],
        [],
        (await fromUuid("Compendium.pf2e.feat-effects.Item.n1vhmOd7aNiuR3nk")).toObject()
    )
}

async function bloodlineDraconic(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq", mm);
}

async function bloodlineElemental(mm: MessageForHandling, isElem = false) {
    const damageEff = effectUUID('2yWSBNLWWYXXSfKZ');
    const bludDamageEff = effectUUID('KFoh6XzV382S9DDr');

    const ee = mm.rollOptions.has("feature:bloodline:elemental:fire") ? damageEff : bludDamageEff;

    const selfE = ["resist-energy", "freedom-of-movement", "unfettered-movement", "elemental-form", "repulsion", "energy-aegis", "elemental-motion"];
    if (isElem) {
        selfE.push("rising-surf")
    }

    await createDialogDamageOrSelfEffect(
        mm,
        ee,
        selfE,
        [],
        [],
        (await fromUuid("Compendium.pf2e.feat-effects.Item.3gGBZHcUFsHLJeQH")).toObject(),
        true
    )
}

async function bloodlineFey(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse", mm);
}

async function bloodlineGenie(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.9AUcoY48H5LrVZiF", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.KVbS7AbhQdeuA0J6", mm);
}

async function bloodlineHag(mm: MessageForHandling) {
    const effect = (await fromUuid("Compendium.pf2e.feat-effects.Item.6fb15XuSV4TNuVAT")).toObject();
    effect.system.level = {value: mm.itemLvl};

    addItemToActor(mm.mainActor, effect);
}

async function bloodlineHarrow(mm: MessageForHandling) {
    addItemToActor(mm.mainActor, await createItemObjectUuid(effectUUID('SbYoI8G8Ze6oE4we'), mm))
}

async function bloodlineImperial(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA", mm);
}

async function bloodlineNymph(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.SVGW8CLKwixFlnTv", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.ruRAfGJnik7lRavk", mm);
}

async function bloodlinePhoenix(mm: MessageForHandling) {
    const damageEff = effectUUID('2yWSBNLWWYXXSfKZ');
    createDialogDamageOrTempHP(
        mm,
        damageEff,
        ["detect-magic", "see-the-unseen", "contingency", "shroud-of-flame"],
        ["remove-curse", "cleanse-affliction", "breath-of-life", "moment-of-renewal"],
        ["rejuvenating-flames"]
    )
}

async function bloodlinePsychopomp(mm: MessageForHandling) {
    const damageEff = effectUUID('CUMpeosjhqDpj4KK');
    createDialogDamageOrSelfEffect(
        mm,
        damageEff,
        ["heal", "death-ward"],
        [],
        [],
        (await fromUuid("Compendium.pf2e.feat-effects.Item.7BFd8A9HFrmg6vwL")).toObject()
    )
}

async function bloodlineShadow(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.OqH6IaeOwRWkGPrk", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.Nv70aqcQgCBpDYp8", mm);
}

async function bloodlineUndead(mm: MessageForHandling) {
    const damageEff = effectUUID('UQEqBomwGFkTOomK');
    createDialogDamageOrTempHP(
        mm,
        damageEff,
        ["false-life", "false-vitality", "bind-undead", "talking-corpse"],
        ["remove-curse"],
        ["harm", "undeaths-blessing"]
    )
}

async function bloodlineWyrmblessed(mm: MessageForHandling) {
    createDialog(mm.mainActor, "Compendium.pf2e.feat-effects.Item.fILVhS5NuCtGXfri", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.aqnx6IDcB7ARLxS5", mm);
}

function targetNpcs(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isEnemyOf(self)).map(a => a.actor) : [];
}

function targetCharacters(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isAllyOf(self)).map(a => a.actor) : [];
}

const bloodlineFeatMap = {
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Aberrant": bloodlineAberrant,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Aesir": bloodlineAesir,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Angelic": bloodlineAngelic,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Demonic": bloodlineDemonic,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Diabolic": bloodlineDiabolic,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Draconic": bloodlineDraconic,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Elemental": bloodlineElemental,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Fey": bloodlineFey,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Genie": bloodlineGenie,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Hag": bloodlineHag,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Harrow": bloodlineHarrow,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Imperial": bloodlineImperial,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Nymph": bloodlineNymph,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Phoenix": bloodlinePhoenix,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Psychopomp": bloodlinePsychopomp,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Shadow": bloodlineShadow,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Undead": bloodlineUndead,
    "PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicLabel.Wyrmblessed": bloodlineWyrmblessed,
} as { [key: string]: (mm: MessageForHandling, is?: boolean) => void };


export async function bloodlines(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.content || !mm.content.includes(game.i18n.localize("PF2E.SpecificRule.Sorcerer.Bloodline.BloodMagicDescription.Title"))) {
        return;
    }
    for (const itemDesc of Object.keys(bloodlineFeatMap)) {
        if (mm.content.includes(game.i18n.localize(itemDesc))) {
            bloodlineFeatMap[itemDesc](mm);
        }
    }
}

export async function effectHagBloodMagic(rule: BaseRule, mm: MessageForHandling) {
    const eff = getEffectBySourceId(mm.mainActor, "Compendium.pf2e.feat-effects.Item.6fb15XuSV4TNuVAT") as Effect;
    ui.notifications.info(`${mm.mainActor} has Effect: Hag Blood Magic. Attacker should take ${eff.level} damage`);
    deleteItem(eff);
}