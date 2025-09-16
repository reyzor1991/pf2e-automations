import {addItemToActor, deleteItem} from "../global-f";
import {effectUUID, getEffectBySourceId} from "../helpers";
import {BaseRule, MessageForHandling} from "../rule";
import {createItemObjectUuid} from "../hooks/functions";

const bloodlineAberrantSpells = [
    "spider-sting",
    "touch-of-idiocy",
    "stupefy",
    "vampiric-touch",
    "vampiric-feast",
    "confusion",
    "black-tentacles",
    "feeblemind",
    "never-mind",
    "warp-mind",
    "uncontrollable-dance",
    "spirit-song",
    "tentacular-limbs",
    "aberrant-whispers",
    "unusual-anatomy",
];

const bloodlineAngelicSpells = [
    "heal",
    "spiritual-weapon",
    "searing-light",
    "holy-light",
    "divine-wrath",
    "flame-strike",
    "blade-barrier",
    "divine-decree",
    "divine-aura",
    "foresight",
    "angelic-halo",
    "angelic-wings",
    "celestial-brand",
];

const bloodlineDemonicSpells = [
    "fear",
    "enlarge",
    "slow",
    "divine-wrath",
    "abyssal-plague",
    "disintegrate",
    "divine-decree",
    "divine-aura",
    "implosion",
    "gluttons-jaw",
    "swamp-of-sloth",
    "abyssal-wrath",
];

const bloodlineDiabolicSpells = [
    "charm",
    "flaming-sphere",
    "enthrall",
    "suggestion",
    "crushing-despair",
    "wave-of-despair",
    "true-seeing",
    "truesight",
    "divine-decree",
    "divine-aura",
    "falling-stars",
    "diabolic-edict",
    "embrace-the-pit",
    "hellfire-plume",
];

const bloodlineDraconicSpells = [
//olds
    "true-strike",
    "sure-strike",
    "resist-energy",
    "spell-immunity",
    "chromatic-wall",
    "prismatic-wall",
    "dragon-claws",

//new
    "shield",
    "fear",

    "blazing-bolt",
    "augury",
    "blood-vendetta",
    "shatter",

    "haste",
    "fly",

    "subconscious-suggestion",
    "divine-immolation",
    "slither",
    "howling-blizzard",

    "dragon-form",
    "mask-of-terror",

    "quandary",
    "divine-inspiration",
    "unrelenting-observation",
    "earthquake",

    "overwhelming-presence",

    "flurry-of-claws",
    "dragon-breath",
    "dragon-wings",
];

const bloodlineElementalSpells = [
    "breathe-fire",
    "resist-energy",
    "fireball",
    "freedom-of-movement",
    "unfettered-movement",
    "elemental-form",
    "repulsion",
    "energy-aegis",
    "prismatic-wall",
    "storm-of-vengeance",
    "elemental-toss",
    "elemental-motion",
    "elemental-blast",
];

const elementalistSpells = [
    "combustion",
    "crushing-ground",
    "powerful-inhalation",
    "pulverizing-cascade",
    "rising-surf",
    "stone-lance",
    "updraft",
    "wildfire",
];

const bloodlineFeySpells = [
    "charm",
    "hideous-laughter",
    "laughing-fit",
    "enthrall",
    "suggestion",
    "cloak-of-colors",
    "mislead",
    "visions-of-danger",
    "uncontrollable-dance",
    "resplendent-mansion",
    "faerie-dust",
    "fey-disappearance",
    "fey-glamour",
];

const bloodlineGenieSpells = [
    "illusory-disguise",
    "create-food",
    "invisibility",
    "enlarge",
    "banishment",
    "illusory-scene",
    "punishing-winds",
    "scintillating-pattern",
    "enthrall",
    "elemental-form",
    "creation",
    "earthquake",
    "quandary",
    "desiccate",
    "wall-of-stone",
    "revealing-light",
    "water-walk",
    "control-water",
    "true-seeing",
    "truesight",
    "energy-aegis",
    "resplendent-mansion",
    "genies-veil",
    "hearts-desire",
    "wish-twisted-form",
];

const bloodlineHagSpells = [
    "illusory-disguise",
    "touch-of-idiocy",
    "stupefy",
    "blindness",
    "outcasts-curse",
    "mariners-curse",
    "baleful-polymorph",
    "cursed-metamorphosis",
    "warp-mind",
    "spiritual-epidemic",
    "natures-enmity",
    "jealous-hex",
    "horrific-visage",
    "youre-mine",
];

const bloodlineHarrowSpells = [
    "ill-omen",
    "augury",
    "wanderers-guide",
    "suggestion",
    "shadow-siphon",
    "true-seeing",
    "truesight",
    "retrocognition",
    "unrelenting-observation",
    "weird",
    "unraveling-blast",
    "invoke-the-harrow",
    "rewrite-possibility",
];

const bloodlineImperialSpells = [
    "magic-missile",
    "force-barrage",
    "dispel-magic",
    "haste",
    "translocate",
    "prying-eye",
    "disintegrate",
    "prismatic-spray",
    "maze",
    "quandary",
    "prismatic-sphere",
    "ancestral-memories",
    "extend-spell",
    "arcane-countermeasure",
];

const bloodlineNymphSpells = [
    "charm",
    "calm",
    "animal-vision",
    "vital-beacon",
    "crushing-despair",
    "wave-of-despair",
    "repulsion",
    "unfettered-pack",
    "moment-of-renewal",
    "overwhelming-presence",
    "nymphs-token",
    "blinding-beauty",
    "establish-ward",
];

const bloodlinePhoenixSpells = [
    "breathe-fire",
    "see-the-unseen",
    "fireball",
    "remove-curse",
    "cleanse-affliction",
    "breath-of-life",
    "disintegrate",
    "contingency",
    "moment-of-renewal",
    "falling-stars",
    "rejuvenating-flames",
    "shroud-of-flame",
    "cleansing-flames",
];

const bloodlinePsychopompSpells = [
    "heal",
    "calm",
    "searing-light",
    "holy-light",
    "dimensional-anchor",
    "planar-tether",
    "death-ward",
    "spirit-blast",
    "finger-of-death",
    "execute",
    "spirit-song",
    "massacre",
    "sepulchral-mask",
    "spirit-veil",
    "shepherd-of-souls",
];

const bloodlineShadowSpells = [
    "grim-tendrils",
    "darkness",
    "chilling-darkness",
    "phantasmal-killer",
    "shadow-siphon",
    "collective-transposition",
    "duplicate-foe",
    "disappearance",
    "weird",
    "dim-the-light",
    "steal-shadow",
    "consuming-darkness",
];

const bloodlineUndeadSpells = [
    "harm",
    "false-life",
    "false-vitality",
    "bind-undead",
    "talking-corpse",
    "cloudkill",
    "toxic-cloud",
    "vampiric-exsanguination",
    "finger-of-death",
    "execute",
    "horrid-wilting",
    "desiccate",
    "wail-of-the-banshee",
    "wails-of-the-damned",
    "undeaths-blessing",
    "drain-life",
    "grasping-grave",
];

const bloodlineWyrmblessedSpells = [
    "mystic-armor",
    "resist-energy",
    "haste",
    "reflective-scales",
    "cloak-of-colors",
    "repulsion",
    "mask-of-terror",
    "divine-inspiration",
    "overwhelming-presence",
    "dragon-claws",
    "dragon-breath",
    "dragon-wings",
];

async function createDialog(actorId:string, selfEffect:string, targets, targetEffect) {
    const options = targets.map(a => {
        return `<option value="${a.uuid}" data-effect="${targetEffect}">${a.name}</option>`
    })

    const content = `<form>
        <div class="form-group">
            <label>Target:</label>
            <select name="bloodline-selector">  <option value="${actorId}" data-effect="${selfEffect}">Self</option>  ${options}
            </select>
        </div>
    </form>`

    new Dialog({
        title: "Bloodline Target Selector",
        content,
        buttons: {
            ok: {
                label: "<span class='pf2-icon'>1</span> Apply effect", callback: async (html) => {
                    const tId = html.find("[name=bloodline-selector]").val();
                    const eId = html.find("[name=bloodline-selector]").find(':selected').data('effect');
                    const aEffect = await fromUuid(eId);
                    addItemToActor(await fromUuid(tId), aEffect.toObject());
                }
            },
            cancel: {
                label: "<span class='pf2-icon'>R</span> Cancel"
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

async function createDialogDamageOrSelfEffect(mm: MessageForHandling, damageEff, selfSpells, allySpells, comboSpells, aEffect, isException=false) {
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
                label: "<span class='pf2-icon'>1</span> Apply effect", callback: async (html) => {
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
                label: "<span class='pf2-icon'>R</span> Cancel"
            }
        },
        default: "cancel",
    }).render(true);
}


async function bloodlineAberrant(mm: MessageForHandling) {
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A");
}

async function bloodlineAngelic(mm: MessageForHandling) {
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd");
}

async function bloodlineDemonic(mm: MessageForHandling) {
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.aKRo5TIhUtu0kyEr", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.yfbP64r4a9e5oyli");
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
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq");
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
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse");
}

async function bloodlineGenie(mm: MessageForHandling) {
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.9AUcoY48H5LrVZiF", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.KVbS7AbhQdeuA0J6");
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
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA", targetCharacters(mm.mainActor), "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA");
}

async function bloodlineNymph(mm: MessageForHandling) {
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.SVGW8CLKwixFlnTv", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.ruRAfGJnik7lRavk");
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
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.OqH6IaeOwRWkGPrk", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.Nv70aqcQgCBpDYp8");
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
    createDialog(mm.mainActor.uuid, "Compendium.pf2e.feat-effects.Item.fILVhS5NuCtGXfri", targetNpcs(mm.mainActor), "Compendium.pf2e.feat-effects.Item.aqnx6IDcB7ARLxS5");
}

const bloodlineFeatMap = {
    "feature:bloodline-aberrant": {spells: bloodlineAberrantSpells, handler: bloodlineAberrant},
    "feature:bloodline-angelic": {spells: bloodlineAngelicSpells, handler: bloodlineAngelic},
    "feature:bloodline-demonic": {spells: bloodlineDemonicSpells, handler: bloodlineDemonic},
    "feature:bloodline-diabolic": {spells: bloodlineDiabolicSpells, handler: bloodlineDiabolic},
    "feature:bloodline-draconic": {spells: bloodlineDraconicSpells, handler: bloodlineDraconic},
    "feature:bloodline-elemental": {spells: bloodlineElementalSpells, handler: bloodlineElemental},
    "feature:bloodline-fey": {spells: bloodlineFeySpells, handler: bloodlineFey},
    "feature:bloodline-genie": {spells: bloodlineGenieSpells, handler: bloodlineGenie},
    "feature:bloodline-hag": {spells: bloodlineHagSpells, handler: bloodlineHag},
    "feature:bloodline-imperial": {spells: bloodlineImperialSpells, handler: bloodlineImperial},
    "feature:bloodline-harrow": {spells: bloodlineHarrowSpells, handler: bloodlineHarrow},
    "feature:bloodline-nymph": {spells: bloodlineNymphSpells, handler: bloodlineNymph},
    "feature:bloodline-phoenix": {spells: bloodlinePhoenixSpells, handler: bloodlinePhoenix},
    "feature:bloodline-psychopomp": {spells: bloodlinePsychopompSpells, handler: bloodlinePsychopomp},
    "feature:bloodline-shadow": {spells: bloodlineShadowSpells, handler: bloodlineShadow},
    "feature:bloodline-undead": {spells: bloodlineUndeadSpells, handler: bloodlineUndead},
    "feature:bloodline-wyrmblessed": {spells: bloodlineWyrmblessedSpells, handler: bloodlineWyrmblessed},
} as { [key: string]: { spells: string[], handler: (mm: MessageForHandling, is?:boolean) => void } };

function targetNpcs(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isEnemyOf(self)).map(a => a.actor) : [];
}

function targetCharacters(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isAllyOf(self)).map(a => a.actor) : [];
}


export async function bloodlines(rule: BaseRule, mm: MessageForHandling) {
    const _obj = mm.item as Item;
    if (mm.rollOptions.has("feature:bloodline-elemental")
        && mm.rollOptions.has("feat:elementalist-dedication")
    ) {
        if (bloodlineFeatMap["feature:bloodline-elemental"].spells.includes(_obj.slug)
            || elementalistSpells.includes(_obj.slug)
        ) {
            bloodlineFeatMap["feature:bloodline-elemental"].handler(mm, true)
            return;
        }
    }

    for (const featId of Object.keys(bloodlineFeatMap)) {
        if (mm.rollOptions.has(featId) && bloodlineFeatMap[featId]?.spells.includes(_obj.slug)) {
            bloodlineFeatMap[featId].handler(mm);
            return;
        }
    }
}

export async function effectHagBloodMagic(rule: BaseRule, mm: MessageForHandling) {
    const eff = getEffectBySourceId(mm.mainActor, "Compendium.pf2e.feat-effects.Item.6fb15XuSV4TNuVAT") as Effect;
    ui.notifications.info(`${mm.mainActor} has Effect: Hag Blood Magic. Attacker should take ${eff.level} damage`);
    deleteItem(eff);
}