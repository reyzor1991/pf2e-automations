async function furiousAnatomy(message) {
    if (!isCorrectMessageType(message, "saving-throw")) { return }

    if (messageDCLabelHas(message, "Furious Anatomy DC") && anyFailureMessageOutcome(message)) {
        let ff = message.flags.pf2e.origin.type === "feat" ? await fromUuid(message?.flags?.pf2e?.origin?.uuid) : null;
        if (!ff) { return }
        ff = hasFeatBySourceId(ff?.actor, "Compendium.barbarians.barbarians-features.Item.8GiJ5h5acs4ik8k7");//flesh-instinct
        if (!ff) { return }

        if (ff.name.includes('Billowing Orifice')) {
            await setEffectToActor(message.actor, effectUUID('DqspZqJJu4v3k4Zv'));//Stupefied
        } else if (ff.name.includes('Gibbering Mouths')) {
            await setEffectToActor(message.actor, effectUUID('7roTkQ4QHWDWZkJM'));//Deafened
        } else if (ff.name.includes('Tongue Proboscis')) {
            await setEffectToActor(message.actor, effectUUID('NKue7w68dX1yH4bA'));//Enfeebled
        } else if (ff.name.includes('Tentacle Strands')) {
            await setEffectToActor(message.actor, effectUUID('qzjX5A17McTdDHFx'));//Clumsy
        } else if (ff.name.includes('Unblinking Eyes')) {
            await setEffectToActor(message.actor, effectUUID('1u4ZAmfeWKyN3uKK'));//Dazzled
        } else if (ff.name.includes('Warp Spasm')) {
            await setEffectToActor(message.actor, effectUUID('HrHzFVcdcBdG2nv8'));//Fascinated
        }
    }
}

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
    "true-strike",
    "sure-strike",
    "resist-energy",
    "haste",
    "spell-immunity",
    "chromatic-wall",
    "dragon-form",
    "mask-of-terror",
    "prismatic-wall",
    "overwhelming-presence",
    "dragon-claws",
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

async function createDialog(actorId, selfEffect, targets, targetEffect) {
    const options = targets.map(a => {
        return `<option value="${a.uuid}" data-effect="${targetEffect}">${a.name}</option>`
    })

    const content = `<form>
        <div class="form-group">
            <label>Target:</label>
            <select name="bloodline-selector">
                <option value="${actorId}" data-effect="${selfEffect}">Self</option>
                ${options}
            </select>
        </div>
    </form>`

    new Dialog({
        title: "Bloodline Target Selector",
        content,
        buttons: {
            ok: {
                label: "<span class='pf2-icon'>1</span> Apply effect",
                callback: async (html) => {
                    const tId = html.find("[name=bloodline-selector]").val();
                    const eId = html.find("[name=bloodline-selector]").find(':selected').data('effect');
                    const aEffect = await fromUuid(eId);

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

async function createDialogDamageOrTempHP(message, spell, damageEff, selfSpells, allySpells, comboSpells) {
    //self apply
    const eff = effectUUID('yYvPtdlew2YctMgt');//Temp HP

    const aEffect = (await fromUuid(eff)).toObject();
    aEffect.flags = foundry.utils.mergeObject(aEffect.flags ?? {}, { core: { sourceId: eff } });

    aEffect.system.rules[0].value = message?.item?.level ?? 0;

    createDialogDamageOrSelfEffect(message, spell, damageEff, selfSpells, allySpells, comboSpells, aEffect)
}

async function createDialogDamageOrSelfEffect(message, spell, damageEff, selfSpells, allySpells, comboSpells, aEffect) {
    const eff = aEffect.flags.core.sourceId;
    if (selfSpells.includes(spell.slug)) {
        await addItemToActor(message.actor, aEffect);
        return
    }

    let options = []
    if (allySpells.includes(spell.slug)) {
        options = targetCharacters(message.actor).map(a => {
            return `<option value="${a.uuid}" data-effect="${eff}">${a.name}</option>`
        })
    } else if (comboSpells.includes(spell.slug)) {
        options = targetCharacters(message.actor).map(a => {
            return `<option value="${a.uuid}" data-effect="${eff}">${a.name}</option>`
        })
        options.push(`<option value="${message.actor.uuid}" data-effect="${damageEff}">Add damage to target</option>`)
    } else {
        options.push(`<option value="${message.actor.uuid}" data-effect="${damageEff}">Add damage to target</option>`)
    }


    const content = `<form>
        <div class="form-group">
            <label>Target:</label>
            <select name="bloodline-selector">
                <option value="${message.actor.uuid}" data-effect="${eff}">Self</option>
                ${options}
            </select>
        </div>
    </form>`

    new Dialog({
        title: "Bloodline Target Selector",
        content,
        buttons: {
            ok: {
                label: "<span class='pf2-icon'>1</span> Apply effect",
                callback: async (html) => {
                    const tId = html.find("[name=bloodline-selector]").val();
                    const eId = html.find("[name=bloodline-selector]").find(':selected').data('effect');
                    const aEffect = (await fromUuid(eId)).toObject();
                    aEffect.system.rules[0].value = message?.item?.level ?? 0;
                    if (aEffect.system.rules.length > 1) {
                        aEffect.system.rules[1].value = message?.item?.level ?? 0;
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
};

async function bloodlineAberrant(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A");
};

async function bloodlineAngelic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd");
};

async function bloodlineDemonic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.aKRo5TIhUtu0kyEr", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.yfbP64r4a9e5oyli");
};

async function bloodlineDiabolic(message, spell) {
    const damageEff = effectUUID('2yWSBNLWWYXXSfKZ');//Additional damage
    createDialogDamageOrSelfEffect(
        message,
        spell,
        damageEff,
        ["true-seeing", "truesight", "divine-aura", "embrace-the-pit"],//self
        [],//ally
        [],//combo
        (await fromUuid("Compendium.pf2e.feat-effects.Item.n1vhmOd7aNiuR3nk")).toObject()
    )
};

async function bloodlineDraconic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq");
};

async function bloodlineElemental(message, spell, isElem = false) {
    const damageEff = effectUUID('2yWSBNLWWYXXSfKZ');
    const bludDamageEff = effectUUID('KFoh6XzV382S9DDr');//Additional bludgeoning damage

    let ee = damageEff;
    const ff = hasFeatBySourceId(message.actor, "Compendium.pf2e.classfeatures.Item.RXRnJcG4XSabZ35a")//bloodline-elemental
    if (ff && ff?.flags?.pf2e?.rulesSelections?.bloodlineElemental != 'fire') {
        ee = bludDamageEff;
    }

    const selfE = ["resist-energy", "freedom-of-movement", "unfettered-movement", "elemental-form", "repulsion", "energy-aegis", "elemental-motion"];
    if (isElem) {
        selfE.push("rising-surf")
    }

    createDialogDamageOrSelfEffect(
        message,
        spell,
        ee,
        selfE,//self
        [],//ally
        [],//combo
        (await fromUuid("Compendium.pf2e.feat-effects.Item.3gGBZHcUFsHLJeQH")).toObject()
    )
};

async function bloodlineFey(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse");
};

async function bloodlineGenie(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.9AUcoY48H5LrVZiF", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.KVbS7AbhQdeuA0J6");
};

async function bloodlineHag(message) {
    const effect = (await fromUuid("Compendium.pf2e.feat-effects.Item.6fb15XuSV4TNuVAT")).toObject();
    effect.system.level = { value: message?.item?.level ?? 1 };

    message.actor.createEmbeddedDocuments("Item", [effect]);
};

async function bloodlineHarrow(message) {
    setEffectToActor(message.actor, effectUUID('SbYoI8G8Ze6oE4we'))
};

async function bloodlineImperial(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA");
};

async function bloodlineNymph(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.SVGW8CLKwixFlnTv", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.ruRAfGJnik7lRavk");
};

async function bloodlinePhoenix(message, spell) {
    const damageEff = effectUUID('2yWSBNLWWYXXSfKZ');
    createDialogDamageOrTempHP(
        message,
        spell,
        damageEff,
        ["detect-magic", "see-the-unseen", "contingency", "shroud-of-flame"],
        ["remove-curse", "cleanse-affliction", "breath-of-life", "moment-of-renewal"],
        ["rejuvenating-flames"]
    )
};

async function bloodlinePsychopomp(message, spell) {
    const damageEff = effectUUID('CUMpeosjhqDpj4KK');
    createDialogDamageOrSelfEffect(
        message,
        spell,
        damageEff,
        ["heal", "death-ward"],//self
        [],//ally
        [],//combo
        (await fromUuid("Compendium.pf2e.feat-effects.Item.7BFd8A9HFrmg6vwL")).toObject()
    )
};

async function bloodlineShadow(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.OqH6IaeOwRWkGPrk", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.Nv70aqcQgCBpDYp8");
}

async function bloodlineUndead(message, spell) {
    const damageEff = effectUUID('UQEqBomwGFkTOomK');
    createDialogDamageOrTempHP(
        message,
        spell,
        damageEff,
        ["false-life", "bind-undead", "talking-corpse"],
        ["remove-curse"],
        ["harm", "undeaths-blessing"]
    )
};

async function bloodlineWyrmblessed(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.fILVhS5NuCtGXfri", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.aqnx6IDcB7ARLxS5");
};

const bloodlineFeatMap = {
    "bloodline-aberrant": { spells: bloodlineAberrantSpells, handler: bloodlineAberrant },
    "bloodline-angelic": { spells: bloodlineAngelicSpells, handler: bloodlineAngelic },
    "bloodline-demonic": { spells: bloodlineDemonicSpells, handler: bloodlineDemonic },
    "bloodline-diabolic": { spells: bloodlineDiabolicSpells, handler: bloodlineDiabolic },
    "bloodline-draconic": { spells: bloodlineDraconicSpells, handler: bloodlineDraconic },
    "bloodline-elemental": { spells: bloodlineElementalSpells, handler: bloodlineElemental },
    "bloodline-fey": { spells: bloodlineFeySpells, handler: bloodlineFey },
    "bloodline-genie": { spells: bloodlineGenieSpells, handler: bloodlineGenie },
    "bloodline-hag": { spells: bloodlineHagSpells, handler: bloodlineHag },
    "bloodline-imperial": { spells: bloodlineImperialSpells, handler: bloodlineImperial },
    "bloodline-nymph": { spells: bloodlineNymphSpells, handler: bloodlineNymph },
    "bloodline-phoenix": { spells: bloodlinePhoenixSpells, handler: bloodlinePhoenix },
    "bloodline-psychopomp": { spells: bloodlinePsychopompSpells, handler: bloodlinePsychopomp },
    "bloodline-shadow": { spells: bloodlineShadowSpells, handler: bloodlineShadow },
    "bloodline-undead": { spells: bloodlineUndeadSpells, handler: bloodlineUndead },
    "bloodline-wyrmblessed": { spells: bloodlineWyrmblessedSpells, handler: bloodlineWyrmblessed },
};

function targetNpcs(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isEnemyOf(self)).map(a => a.actor) : [];
};

function targetCharacters(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isAllyOf(self)).map(a => a.actor) : [];
};

async function bloodlines(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) { return }
    const _obj = message?.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.type !== "spell") { return }
    if (!hasFeatBySourceId(message.actor, "Compendium.pf2e.classfeatures.Item.H6ziAPvCipTPG8SH")) { return }
    if (hasFeatBySourceId(message.actor, "Compendium.pf2e.classfeatures.Item.RXRnJcG4XSabZ35a") && hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.tx9pkrpmtqe4FnvS")) {
        if (bloodlineFeatMap["bloodline-elemental"].spells.includes(_obj.slug)
            || elementalistSpells.includes(_obj.slug)
        ) {
            bloodlineFeatMap["bloodline-elemental"].handler.call(this, message, _obj, true)
            return;
        }
    }

    for (const featName in bloodlineFeatMap) {
        if (hasFeat(message.actor, featName) && bloodlineFeatMap[featName].spells.includes(_obj.slug)) {
            bloodlineFeatMap[featName].handler.call(this, message, _obj);
            return;
        }
    }
};

async function updateConcussiveRoll(message) {
    let roll = message.rolls[0];
    roll._evaluated = false;
    for (const r in roll.terms[0].rolls) {
        await updateConcussiveDamageInstance(roll.terms[0].rolls[r])
    }
    roll.terms[0].terms.map(function (x) { return x.replace(/piercing/g, 'bludgeoning') });
    roll.resetFormula()
    await roll.evaluate({ async: true })

    await message.update({ rolls: [roll] })
};

async function updateConcussiveDamageInstance(damageInstance) {
    if (damageInstance.type === 'piercing') {
        damageInstance.type = "bludgeoning"
    }
    if (damageInstance?.options?.flavor === 'piercing') {
        damageInstance.options.flavor = "bludgeoning"
    }

    if (damageInstance.terms) {
        for (const d in damageInstance.terms) {
            await updateConcussiveDamageInstance(damageInstance.terms[d])
        }
    }
    if (damageInstance?.resetFormula) {
        damageInstance?.resetFormula()
    }
};

async function handleConcussiveDamage(message, user, _options, userId) {
    if (!isCorrectMessageType(message, "damage-roll")) { return }
    if (!message.actor || !message.target?.actor) { return false; }
    if (!message?.flags?.pf2e?.context?.options?.includes("item:trait:concussive")) { return }

    let pres = message.target?.actor.system.attributes.resistances.find(a => a.type === "piercing")
    if (message.target?.actor.system.attributes.immunities.find(a => a.type === "piercing")) {
        await updateConcussiveRoll(message)
    } else if (pres) {
        let bres = message.target?.actor.system.attributes.resistances.find(a => a.type === "bludgeoning")
        if (bres && bres.value >= pres.value) { return }
        await updateConcussiveRoll(message)
    }
}

const activityExplorationEffects = {
    'avoid-notice': effectUUID('N8vpuGy4TzU10y8E'),
    'cover-tracks': effectUUID('F6vJYLZTWDpnrnCZ'),
    'defend': effectUUID('GYOyFj4ziZX060rZ'),
    'detect-magic': effectUUID('OjRHL0B4WAUUQc13'),
    'follow-the-expert': effectUUID('V347nnVBGDrVWh7k'),
    'hustle': effectUUID('vNUrKvoOSvEnqzhM'),
    'investigate': effectUUID('tDsgl8YmhZbx2May'),
    'repeat-a-spell': effectUUID('kh1QdKkvbNZ0qBsQ'),
    'scout': effectUUID('mGFBHM1lvHNZ9BsH'),
    'search': effectUUID('XiVLHjg5lQVMX8Fj'),
    'track': effectUUID('OcCXjJab7rSR3mDf'),
    'travel-mount': effectUUID('SggYzuL9NtYoktUR'),
    'refocus': effectUUID('ThF8UIN5093xtCaq'),
};

async function explorationEffects(actor, data) {
    if (!data?.system?.exploration) { return; }

    const party = game.actors.filter(a => a.isOfType("party")).find(a => a.members.find(b => b.id === actor.id));
    const slugs = data.system.exploration.map(b => actor.itemTypes.action.find(a => a.id === b)).filter(a => !!a).map(a => a.slug);
    const _keys = Object.keys(activityExplorationEffects);

    Object.values(activityExplorationEffects).map(a => hasEffectBySourceId(actor, a)).filter(a => !!a).forEach(a => {
        const _key = _keys.find(key => activityExplorationEffects[key] === a.sourceId);
        if (!slugs.includes(_key)) {
            a.delete()
        }
    });

    slugs.forEach(async (slug) => {
        if (activityExplorationEffects[slug]) {
            await setEffectToActor(actor, activityExplorationEffects[slug])
        }
    });


    const foll = hasEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3");
    if (!slugs.includes("follow-the-expert") && foll) {
        foll.delete();
    }
    if (!foll && slugs.includes("follow-the-expert")) {
        await setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3")
    }

    const _scout = hasEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF");
    if (!slugs.includes("scout") && _scout?.system?.context?.origin?.actor === actor.uuid) {
        _scout.delete();
    }
    if (!_scout && slugs.includes("scout")) {
        await setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF", undefined, { origin: { actor: actor?.uuid } })
    }

    if (party) {
        const is = hasFeatBySourceId(actor, "Compendium.pf2e.feats-srd.Item.aFoVHsuInMOkTZoQ");//Incredible Scout
        const ded = hasFeatBySourceId(actor, "Compendium.pf2e.feats-srd.Item.qMa2fIP2nqrFzHrq");//Scout Dedication

        if (slugs.includes("scout")) {
            party.members.filter(a => a.uuid != actor.uuid).forEach(async (tt) => {
                await setEffectToActor(tt, ded ? effectUUID('U7tuKcRePhSu2C2P') : is ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF", undefined, { origin: { actor: actor?.uuid } })
            })
        } else {
            party.members.filter(a => a.uuid != actor.uuid).forEach(async (tt) => {
                let _ef = hasEffectBySourceId(tt, ded ? effectUUID('U7tuKcRePhSu2C2P') : is ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
                if (_ef && _ef?.system?.context?.origin?.actor === actor.uuid) {
                    await deleteItem(_ef)
                }

            })
        }
    }
};

async function notifyExplorationActivity(actor, data) {
    if (!data?.system?.exploration) { return; }
    if (!actor.system.exploration) { return; }
    let newActivity = data.system.exploration.map(a=>actor.items.get(a).name);
    let oldActivity = foundry.utils.deepClone(actor.system.exploration).map(a=>actor.items.get(a).name);

    let messages = []

    let stop = oldActivity.filter(x => !newActivity.includes(x));
    if (stop.length === 0) {
        stop = ""
    } else if (stop.length === 1) {
        stop = stop[0] + ' exploration activity'
    } else {
        stop = stop.join(', ') + ' exploration activities'
    }

    if (newActivity.length === 0) {
        newActivity = ""
    } else if (newActivity.length === 1) {
        newActivity = newActivity[0] + ' exploration activity'
    } else {
        newActivity = newActivity.join(', ') + ' exploration activities'
    }

    if (newActivity) {
        messages.push(`${actor.name} is now using ${newActivity}.`)
    }

    if (stop) {
        messages.push(`${actor.name} has stopped using ${stop}.`)
    }

    if (messages.length) {
        ChatMessage.create({
            whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
            type: CONST.CHAT_MESSAGE_TYPES.OOC,
            content: messages.join(' ')
        });
    }
};

async function fortissimoComposition(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) { return }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug != "fortissimo-composition") { return }

    const pack = game.packs.get("pf2e-macros.macros");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === 'Inspire Heroics / Fortissimo Composition')?.toObject())
    }
};

async function selfEffectMessage(message) {
    if (!isCorrectMessageType(message, 'self-effect')) { return }

    const _act = message?.actor?.items?.find(a => a.id === message?.flags?.pf2e?.context.item)
    if (_act) {
        const _eff = _act.system?.selfEffect?.uuid;
        if (_eff) {
            await setEffectToActor(message.actor, _eff)
        }
    }
};

async function demoralize(message) {
    if (!isCorrectMessageType(message, "skill-check")) { return }
    if (message?.target && hasOption(message, "action:demoralize")) {
        const dd = hasEffects(message?.target?.actor, "effect-demoralize-immunity-minutes");
        if (dd.length === 0 || !dd.some(d => d.system?.context?.origin?.actor === message.actor.uuid)) {
            const i = message?.target?.actor?.attributes?.immunities?.map(a => a.type) ?? [];
            if (i.some(d => ["mental", "fear-effects", "emotion"].includes(d))) {
                sendGMNotification(`${message.target.actor.name} has Immunity to Demoralize action. Has mental, fear or emotion immunity`);
            } else {
                const decryThief = hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.4HHw2DjTxdv1jBZd");//decry-thief
                if (successMessageOutcome(message)) {
                    await increaseConditionForActor(message.target.actor, "frightened", 1);
                    if (decryThief) {
                        await setEffectToActor(message.target.actor, "Compendium.pf2e.feat-effects.Item.FyaekbWsazkJhJda")
                    }
                } else if (criticalSuccessMessageOutcome(message)) {
                    await increaseConditionForActor(message.target.actor, "frightened", 2);
                    if (decryThief) {
                        await setEffectToActor(message.target.actor, "Compendium.pf2e.feat-effects.Item.kAgUld9PcI4XkHbq")
                    }
                }
            }
            await setEffectToActor(message?.target?.actor, effectUUID('DFLW2gzu0PGeX6zu'), undefined, { name: `Effect: Demoralize Immunity 10 minutes (${message.actor.name})`, icon: message.token.texture.src, origin: { actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid }, duplication: true })
        }
    }
};

async function feint(message) {
    if (!isCorrectMessageType(message, "skill-check")) { return }
    if (message?.target && hasOption(message, "action:feint")) {
        if (anySuccessMessageOutcome(message)) {
            if (criticalSuccessMessageOutcome(message) && hasFeat(message.actor, "scoundrel")) {
                await setEffectToActor(
                    message.target.actor,
                    "Compendium.pf2e-automations.effects.Item.YsNqG4OocHoErbc9",
                     message?.item?.level,
                     {
                        origin: { "actor": message.actor.uuid, "item": message?.item?.uuid, "token": message.token.uuid },
                        duplication: true,
                    }
                );
            } else if (criticalSuccessMessageOutcome(message) || hasFeat(message.actor, "scoundrel")) {
                setFeintEffect(message, true)
            } else {
                setFeintEffect(message, false)
            }
            if (await hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.hLYoIjH8gPEVXyWG")) {//distracting-feint
                await setEffectToTargetActorNextTurn(message, "Compendium.pf2e.feat-effects.Item.7hRgBo0fRQBxMK7g", 1000)
            }
        } else if (criticalFailureMessageOutcome(message)) {
            setFeintEffect(message, true, true)
        }
    }
};

async function setFeintEffect(message, isCrit = false, isCritFail = false) {
    const actor = isCritFail ? message.target.actor : message.actor;
    const target = isCritFail ? message.actor : message.target.actor;

    const effect = (await fromUuid(isCrit ? effectUUID('lwcyhD03jVchmPGm') : effectUUID('P6DGk2h38xE8O0pw'))).toObject();
    effect.flags = foundry.utils.mergeObject(effect.flags ?? {}, { core: { sourceId: effect.id } });
    effect.system.slug = effect.system.slug.replace("attacker", actor.id)
    effect.name += ` ${actor.name}`
    effect.system.context = foundry.utils.mergeObject(effect.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        },
        "roll": null,
        "target": null
    });
    effect.system.start.initiative = null;

    const aEffect = (await fromUuid(isCrit ? effectUUID('jfn0eHEAnoxNI7YS') : effectUUID('XcJAldj3qsmLKjSL'))).toObject();
    aEffect.system.slug = aEffect.system.slug.replace("attacker", actor.id).replace("target", target.id)

    aEffect.system.rules[0].predicate[0] = aEffect.system.rules[0].predicate[0].replace("attacker", actor.id);
    aEffect.system.rules[0].predicate[1] = aEffect.system.rules[0].predicate[1].replace("attacker", actor.id).replace("target", target.id)
    aEffect.system.rules[1].predicate[1] = aEffect.system.rules[1].predicate[1].replace("attacker", actor.id);
    aEffect.system.rules[1].predicate[2] = aEffect.system.rules[1].predicate[2].replace("attacker", actor.id).replace("target", target.id)
    aEffect.name += ` ${target.name}`


    await addItem(actor.uuid, aEffect);
    await addItem(target.uuid, effect);

    if (isCrit) {
        let qq = hasEffect(actor, "effect-pistol-twirl")
        if (qq) {
            await deleteItem(qq);

            qq = qq.toObject()
            qq.system.duration.unit = "rounds"
            qq.system.duration.value = 1;

            await addItem(actor.uuid, qq);
        }
    }
};



async function disarm(message) {
    if (message.target?.actor?.type != 'npc') { return }
    if (!hasOption(message, "action:disarm")) { return }
    if (!criticalSuccessMessageOutcome(message)) { return }
    if (message.actor.items.find(a => a.name === "Fist") || message.actor.items.find(a => a.name === "Unarmed Attack")) { return }

    let meleeWeapon = message.target.actor.items.find(a => a.type === 'melee')
    let linkedWeapon = message.target.actor.items.find(a => a.id === meleeWeapon?.getFlag("pf2e", "linkedWeapon"))

    await message.target.actor.createEmbeddedDocuments("Item", [{
        "img": "systems/pf2e/icons/default-icons/melee.svg",
        "name": "Fist",
        "system": {
            "attack": {
                "value": ""
            },
            "attackEffects": {
                "value": []
            },
            "bonus": {
                "value": Math.round(1.5 * message.target.actor.level + 7) - 2 - (linkedWeapon?.system?.runes?.potency ?? 0)
            },
            "damageRolls": {
                "i5fbgj11zgotcbbvldhv": {
                    "damage": `1d4+${message.target.actor.system.abilities.str.mod}`,
                    "damageType": "bludgeoning"
                }
            },
            "description": {
                "value": ""
            },
            "rules": [],
            "slug": null,
            "traits": {
                "rarity": "common",
                "value": ["agile", "finesse", "nonlethal", "unarmed"]
            },
            "weaponType": {
                "value": "melee"
            }
        },
        "type": "melee"
    }]);

    ui.notifications.info(`${message.actor.name} disarmed target`);
};



function escape(message) {
    if (message?.target && hasOption(message, "action:escape") && anySuccessMessageOutcome(message)) {
        const rest = hasEffects(message.actor, "effect-restrained-until-end-of-attacker-next-turn")
        const grab = hasEffects(message.actor, "effect-grabbed-until-end-of-attacker-next-turn")
        rest.filter(a => a?.system?.context?.origin?.actor === message.target.actor.uuid).forEach(async (a) => {
            await deleteItem(a);
        });
        grab.filter(a => a?.system?.context?.origin?.actor === message.target.actor.uuid).forEach(async (a) => {
            await deleteItem(a);
        });
    }
};

async function grab(message) {
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.system?.attackEffects?.value?.includes('grab')) {
            const confirm = await Dialog.confirm({
                title: "Grapple Action",
                content: "Do you want to spend action to grapple target?",
            });
            if (!confirm) { return }

            game.pf2e.actions.grapple({actors: [message.actor]})
        }
    }
};

async function grapple(message) {
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.traits?.has('grapple')) {
            const confirm = await Dialog.confirm({
                title: "Grapple Action",
                content: "Do you want to spend action to grapple target?",
            });
            if (!confirm) { return }

            game.pf2e.actions.grapple({actors: [message.actor]})
        }
    }
};

async function grabImproved(message) {
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.system?.attackEffects?.value?.includes('improved-grab')) {
            const confirm = await Dialog.confirm({
                title: "Grapple Action",
                content: "Do you want to grapple target?",
            });
            if (!confirm) { return }

            game.pf2e.actions.grapple({actors: [message.actor]})
        }
    }
};


async function battleMedicineAction(message) {
    if (!isCorrectMessageType(message, "skill-check")) { return }
    if (game.combat && hasOption(message, "action:treat-wounds") && message.isCheckRoll) {
        if (!hasOption(message, "feat:battle-medicine")) {
            ui.notifications.info(`${message.actor.name} hasn't Battle Medicine Feat`);
            return;
        }

        if (game.user.targets.size === 1) {
            const [first] = game.user.targets;

            const immuns = hasEffectsForOwner(
                first.actor,
                ["Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", effectUUID('GMb4x4eHVGD9Tfzp')],
                message.actor.uuid
            );
            let applyTreatWoundsImmunity = true;

            if (immuns.length > 0) {
                if (hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.MJg24e9fJd7OASvF")) {//medic-dedication
                    if (immuns.length > 1) {
                        applyTreatWoundsImmunity = false;
                        if (message.actor.system.skills.med.rank >= 3) {
                            const minV = Math.min(...immuns.map(a => game.time.worldTime - a.system.start.value))
                            if (minV >= 3600) {
                                applyTreatWoundsImmunity = true;
                            }
                        }
                    }
                } else {
                    applyTreatWoundsImmunity = false;
                }
            }

            if (applyTreatWoundsImmunity) {
                const optName = `Effect: Battle Medicine Immunity 1 Hour (${message.actor.name})`;
                if (isActorHeldEquipment(message.actor, "battle-medics-baton")
                    || hasFeatBySourceId(message.actor, "Compendium.pf2e.classfeatures.Item.O3IX7rTxXWWvDVM3")//forensic-medicine-methodology
                    || hasFeatBySourceId(first.actor, "Compendium.pf2e.feats-srd.Item.yTLGclKtWVFZLKIz")//forensic-medicine-methodology
                ) {//1 hour
                    await setEffectToActor(first.actor, effectUUID('GMb4x4eHVGD9Tfzp'), undefined, { name: `Effect: Battle Medicine Immunity 1 Hour (${message.actor.name})`, icon: message.token.texture.src, origin: { actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid }, duplication: true })
                } else {
                    await setEffectToActor(first.actor, "Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", undefined, { name: `Effect: Battle Medicine Immunity (${message.actor.name})`, icon: message.token.texture.src, origin: { actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid }, duplication: true })
                }
            } else {
                ui.notifications.info(`${first.actor.name} has Battle Medicine Immunity`);
            }
        }
    }
};

async function tamper(message) {
    if (!hasOption(message, "action:tamper")) { return }
    if (anyFailureMessageOutcome(message)) { return }
    if (!message.target?.actor) { return }

    let parent = message.target.actor;

    const confirm = await Dialog.confirm({
        title: "Target of Tamper",
        content: `Select target</br></br><select id="map">
                    <option value="armor">Armor</option>
                    <option value="weapon">Weapon</option>
                </select></br></br>`,
        yes: (html) => html.find("#map").val()
    });
    if (!confirm) {return}

    if (confirm === 'armor') {
        let itemSource = (await fromUuid(
            criticalSuccessMessageOutcome(message)
                ? 'Compendium.pf2e.feat-effects.Item.rzcpTJU9MvW1x1gz'
                : 'Compendium.pf2e.feat-effects.Item.IfRkgjyh0JzGalIy'
        ))?.toObject();
        itemSource.system.context = {
            "origin": {
                "actor": message.actor.uuid,
                "item": message.item?.uuid,
                "rollOptions": foundry.utils.deepClone(message.flags.pf2e.context.options),
                "spellcasting": null,
                "token": message.token.uuid
            }
        };

        if (hasPermissions(parent)) {
            await CONFIG.Item.documentClass.createDocuments([itemSource], {parent})
        } else {
            socketlibSocket._sendRequest("createDocumentsParent", [[itemSource], parent.uuid], 0);
        }
    } else {
        let itemSource = (await fromUuid(
            criticalSuccessMessageOutcome(message)
                ? 'Compendium.pf2e.feat-effects.Item.o7qm13OmaYOMwgib'
                : 'Compendium.pf2e.feat-effects.Item.4QWayYR3JSL9bk2T'
        ))?.toObject();
        itemSource.system.context = {
            "origin": {
                "actor": message.actor.uuid,
                "item": message.item?.uuid,
                "rollOptions": foundry.utils.deepClone(message.flags.pf2e.context.options),
                "spellcasting": null,
                "token": message.token.uuid
            }
        };
        itemSource = foundry.utils.deepClone(itemSource);
        let rule = itemSource.system.rules[0];

        const effect = new CONFIG.Item.documentClass(itemSource, { parent });

        const ele = new game.pf2e.RuleElements.builtin.ChoiceSet(foundry.utils.deepClone(rule), {parent: effect});
        await ele.preCreate({itemSource, ruleSource: rule, tempItems: []});

        if (hasPermissions(parent)) {
            await CONFIG.Item.documentClass.createDocuments([itemSource], {parent})
        } else {
            socketlibSocket._sendRequest("createDocumentsParent", [[itemSource], parent.uuid], 0);
        }
    }
};

async function toggleGravityWeapon(message) {
    if (isCorrectMessageType(message, "damage-roll")
        || (isCorrectMessageType(message, "attack-roll") && anyFailureMessageOutcome(message))
    ) {
        if (message?.actor?.rollOptions?.["damage-roll"]?.["gravity-weapon"] && !hasOption(message, "item:category:unarmed")) {
            await message.actor.toggleRollOption("damage-roll", "gravity-weapon")
        }
    }
};

async function toggleFirstAttack(message) {
    if (hasOption(message, "first-attack") && isCorrectMessageType(message, "damage-roll")
        && (hasFeatBySourceId(message.actor, "Compendium.pf2e.classfeatures.Item.u6cBjqz2fiRBadBt")//precision
            || hasEffectBySourceId(message.actor, 'Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0'))
    ) {
        const ranger = message.actor.getFlag("pf2e", "master");
        const _e = hasEffectBySourceId(message.actor, 'Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0');
        if (ranger && hasEffect(message?.target?.actor, `effect-hunt-prey-${ranger}`) && message.actor.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        } else if (_e && hasEffect(message?.target?.actor, `effect-hunt-prey-${_e.getFlag(moduleName, 'originActorId')}`) && message.actor.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        } else if (hasEffect(message?.target?.actor, `effect-hunt-prey-${message.actor.id}`) && message.actor.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        }
    }
};

async function deleteEffectsAfterDamage(message) {
    if (!isCorrectMessageType(message, "damage-roll")) { return }

    if (hasOption(message, "target:effect:off-guard-tumble-behind")) {
        await deleteItem(hasEffect(message.target.actor, "effect-off-guard-tumble-behind"))
    }

    if (message?.item?.isMelee) {
        let pan = hasEffect(message.actor, "effect-panache")

        if (pan && hasOption(message, "finisher") && (hasOption(message, "agile") || hasOption(message, "finesse"))) {
            await deleteItem(pan)
        }
    }
};

async function deleteShieldEffect(message) {
    // maybe delete shield because it was used?
    if ("appliedDamage" in message?.flags?.pf2e && !message?.flags?.pf2e?.appliedDamage?.isHealing) {
        //maybe absorb
        //shield absorb
        const shieldEff = hasEffectBySourceId(message.actor, "Compendium.pf2e.spell-effects.Item.Jemq5UknGdMO7b73");
        if (shieldEff) {
            if (message?.content.includes("shield") && message?.content.includes("absorb")) {
                await deleteItem(shieldEff);
                await setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.QF6RDlCoTvkVHRo4");
            }
        }
    }
};

function messageWeapon(message) {
    if (message.item?.type === 'weapon' || message.item?.type === 'feat') {
        return message.item;
    } else if (message.flags?.pf2e?.strike?.name === "Unarmed Attack") {
        return message.actor?.system?.actions?.filter(h => h.visible && h.item?.isMelee && h.item?.name === 'Unarmed Attack')[0]?.item
    } else if (message.flags?.pf2e?.strike?.name === "Fist") {
        return message.actor?.system?.actions?.filter(h => h.visible && h.item?.isMelee && h.item?.name === 'Fist')[0]?.item
    }
};

function isCriticalSpecialization(message) {
    if (!isCorrectMessageType(message, 'damage-roll')) { return false; }
    if (!criticalSuccessMessageOutcome(message)) { return false; }
    const weapon = messageWeapon(message)
    if (!message.actor || !weapon || !message.target?.actor) { return false; }
    if (["crossbow", "dart", "knife", "pick"].includes(weapon.group)) { return false; }
    return message.actor.synthetics.criticalSpecializations.standard.some(b => b(weapon, message.flags.pf2e?.context?.options))
        || message.actor.synthetics.criticalSpecializations.alternate.some(b => b(weapon, message.flags.pf2e?.context?.options))
};



async function criticalSpecializationSword(message) {
    if (!isCriticalSpecialization(message)) { return; }
    const weapon = messageWeapon(message)
    if (weapon.group === "sword") {
        await setEffectToTargetActorNextTurn(message, effectUUID('YsNqG4OocHoErbc9'))
    }
};

async function getDcValue(message, target) {
    return (
        await message.actor.getCheckContext({
            item: message.item,
            domains: message.flags.pf2e.context.domains,
            statistic: this,
            target: target,
            defense: "armor",
            melee: true,
            options: new Set(message.flags.pf2e.context.options ?? []),
        })
    ).dc.value;
};

async function handleAddDamage(message, target, lastAttack, totalDamage, damageType) {
    let newDc = await getDcValue(message, target)

    if (newDc > lastAttack) {
        ChatMessage.create({
            user: game.user.id,
            content: `Target of Critical Specialization has bigger DC than attack roll`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        });
    } else {
      const roll = new DamageRoll(`${totalDamage}[${damageType}]`, context);
      await roll.evaluate({ async: true });

      let newFlags = message.flags.pf2e;
      newFlags.target = { actor: target.actor.uuid, token: target.uuid }
      newFlags.context.target = { actor: target.actor.uuid, token: target.uuid }

      roll.toMessage(
        {
            speaker: { alias: message.actor.name },
            flags: {
                pf2e: newFlags,
            },
        }
      );
    }
};

async function criticalSpecializationAxe(message) {
    if (!isCriticalSpecialization(message)) { return; }
    if (!message?.target?.token) { return }
    const weapon = messageWeapon(message)
    if (weapon.group === "axe") {
        let lastAttack = game.messages.contents.slice(-10).reverse().find(m => isCorrectMessageType(m, "attack-roll") && m.item === message.item)
        if (!lastAttack) { return }
        lastAttack = Number(lastAttack.content)
        if (isNaN(lastAttack)) { return }

        let targets = message.target.token.scene.tokens.contents
            .filter(a => distanceIsCorrect(a, message.target.token, 5))
            .filter(t => !t.hidden)
            .filter(t => t.actor != message.actor)
            .filter(t => t.actor != message.target.actor)
            .filter(t => !t.actor.itemTypes.condition.find(c => c.slug === 'undetected'))
            .filter(t => !t.actor.itemTypes.condition.find(c => c.slug === 'invisible'))
            .filter(t => !t.actor.isAllyOf(message.actor))
            .filter(t => distanceIsCorrect(t, message.token, message.actor.attributes.reach.base + (message.item.traits.has('reach') ? 5 : 0)))

        let damageType = message.rolls[0]?.terms[0]?.rolls[0]?.options?.flavor;//"slashing"
        let diceTotal = message.rolls[0]?.terms[0]?.dice[0]?.total ?? 0;

        if (targets.length === 1) {
            handleAddDamage(message, targets[0], lastAttack, diceTotal, damageType)
        } else if (targets.length > 1) {
            let selects = targets.map(w => `<option value=${w.uuid}>${showName(w) ? w.name : 'Unknown token'}</option>`).join('');

            const { uuid } = await Dialog.wait({
                title: "Select target",
                content: `
                    <select id="map">
                        ${selects}
                    </select>
                `,
                buttons: {
                    ok: {
                        label: "Attack",
                        icon: "<i class='fa-solid fa-hand-fist'></i>",
                        callback: (html) => { return { uuid: html[0].querySelector("#map").value } }
                    },
                    cancel: {
                        label: "Cancel",
                        icon: "<i class='fa-solid fa-ban'></i>",
                    }
                },
                default: "ok"
            });
            if (!uuid) { return }
            handleAddDamage(message, targets.find(a => a.uuid === uuid), lastAttack, diceTotal, damageType)
        } else {
            ChatMessage.create({
                user: game.user.id,
                content: `No targets for Critical Specialization Axe`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            });
        }
    }
};

async function criticalSpecializationSpear(message) {
    if (!isCriticalSpecialization(message)) { return; }
    const weapon = messageWeapon(message)
    if (weapon.group === "spear") {
        await setEffectToTargetActorNextTurn(message, effectUUID('lsICo0LAyrWy2cDm'))
    }
};

async function criticalSpecializationBow(message) {
    if (!isCriticalSpecialization(message)) { return; }
    const weapon = messageWeapon(message)
    if (weapon.group === "bow" && message.target.token.elevation === 0) {
        increaseConditionForActor(message.target.actor, "immobilized");
    }
};

async function stunningFist(message) {
    if (!isCorrectMessageType(message, 'damage-roll')) { return false; }
    if (!hasOption(message, "stunning-fist")) {return}

    await message.target?.actor.saves.fortitude.roll({
        skipDialog: true,
        dc: { label: `Stunning Fist DC`, value: message.actor.attributes.classDC.value },
        origin: message.actor
    })
}

async function criticalSpecializationRollSavingThrow(message) {
    if (!isCriticalSpecialization(message)) { return; }
    const weapon = messageWeapon(message)
    if (["brawling", "firearm", "sling", "hammer"].includes(weapon.group)) {
        message.target.actor.saves.fortitude.roll({
            skipDialog: true,
            dc: { label: `${weapon.group.capitalize()} Critical Specialization DC`, value: message.actor.attributes.classDC.value },
            origin: message.actor,
            item: weapon
        })
    } else if (["flail"].includes(weapon.group)) {
        message.target.actor.saves.reflex.roll({
            skipDialog: true,
            dc: { label: `${weapon.group.capitalize()} Critical Specialization DC`, value: message.actor.attributes.classDC.value },
            origin: message.actor,
            item: weapon
        })
    } else if (weapon?.type === 'feat') {
        const strikes = weapon.rules.filter(a => a.key === "Strike");
        if (weapon.rules.filter(a => a.key === "ChoiceSet").length > 0 && strikes.map(a => a.group).some(d => ["brawling", "firearm", "sling"].includes(d))) {
            message.target.actor.saves.fortitude.roll({
                skipDialog: true,
                dc: { label: `${Object.values(weapon?.flags?.pf2e?.rulesSelections)[0]?.capitalize()} Critical Specialization DC`, value: message.actor.attributes.classDC.value },
                origin: message.actor,
                item: weapon
            })
        } else if (strikes.length === 1 && ["brawling", "firearm", "sling"].includes(strikes[0].group)) {
            message.target.actor.saves.fortitude.roll({
                skipDialog: true,
                dc: { label: `${strikes[0].label} Critical Specialization DC`, value: message.actor.attributes.classDC.value },
                origin: message.actor,
                item: weapon
            })
        }
    }
};

async function knownWeaknesses(message) {
    if (!isCorrectMessageType(message, undefined)) { return }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug != "known-weaknesses") { return }
    const party = game.actors.filter(a => a.isOfType("party")).find(a => a.members.find(b => b.id === message.actor?.id));
    if (!party) return;
    party.members.filter(a => a.uuid != message.actor.uuid).forEach(async (tt) => {
        await setEffectToActor(tt, "Compendium.pf2e.feat-effects.Item.DvyyA11a63FBwV7x", undefined, { origin: { actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid } })
    })
};

async function lingeringComposition(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) { return }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug != "lingering-composition") { return }

    const pack = game.packs.get("xdy-pf2e-workbench.asymonous-benefactor-macros-internal");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === 'XDY DO_NOT_IMPORT Lingering Fortissimo')?.toObject())
    }
};

async function removeStances(item, data, id) {
    if (item.sourceId != "Compendium.pf2e.conditionitems.Item.fBnFDH2MTzgFijKf") {return}//Unconscious

    item.actor.itemTypes.effect
        .filter(a=>a.slug.startsWith('stance-'))
        .forEach(eff => {
            eff.delete()
        });

        hasEffectBySourceId(item.actor, "Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr")?.delete();
        hasEffectBySourceId(item.actor, "Compendium.pf2e.feat-effects.Item.RoGEt7lrCdfaueB9")?.delete();
};

async function treatWounds(message, target) {
    if (!hasEffectBySourceId(target, "Compendium.pf2e.feat-effects.Lb4q2bBAgxamtix5")) {
        if (!hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.c85a69mB1urW2Se2")) {//continual-recovery
            await setEffectToActor(target, "Compendium.pf2e.feat-effects.Lb4q2bBAgxamtix5")//Immunity
        }
    } else {
        ui.notifications.info(`${target.name} has Treat Wounds Immunity`);
    }
};

function treatWoundsAction(message) {
    if (!isCorrectMessageType(message, "skill-check")) { return }
    if (!game.combat && hasOption(message, "action:treat-wounds") && message.isCheckRoll) {
        if (game.user.targets.size === 1) {
            const [first] = game.user.targets;
            treatWounds(message, first.actor);
        } else if (hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.8c61nOIr5AM3KxZi")) {//ward-medic
            game.user.targets.forEach(a => {
                treatWounds(message, a.actor);
            });
        } else {
            ui.notifications.info(`Need to select 1 token as target`);
        }
    }
};

function trueShapeBomb(message) {
    if (!isCorrectMessageType(message, 'saving-throw')) { return }
    if (hasOption(message, "alchemical") && hasOption(message, "bomb") && anyFailureMessageOutcome(message)) {
        if (messageDCLabelHas(message, "Trueshape Bomb DC") || messageDCLabelHas(message, "Trueshape Bomb (Greater) DC")) {
            ui.notifications.info(`${message.actor.name} fails saving-throw. Need to delete morph/polymorph effects from actor`);
        }
    }
};

async function baneSpell(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) { return }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug != "bane") { return }

    if (_obj.spellcasting.statistic.dc.value) {
        const dc = _obj.spellcasting.statistic.dc.value;
        const baneLevel = (hasEffect(message.actor, "spell-effect-aura-bane")?.system?.badge?.value ?? 0) + 1;
        const all = enemyCombatants(message.actor)
            .filter(a => !hasEffectBySourceId(a.actor, "Compendium.pf2e.spell-effects.Item.UTLp7omqsiC36bso"))//bane
            .filter(a => !hasEffect(a.actor, effectUUID('kLpCaiCZjenXCebV')))
            .filter(a => distanceIsCorrect(message.token, a.token, 10 * baneLevel))

        setTimeout(async function () {
            await rollDCBane(all, dc, _obj, _obj?.actor ?? message.actor);
        }, 1000)
    }
};

async function saveBane(message) {
    if (hasOption(message, 'item:slug:bane') && anySuccessMessageOutcome(message)) {
        await setEffectToActor(message.actor, effectUUID('kLpCaiCZjenXCebV'))
        await deleteEffectFromActor(message.actor, "Compendium.pf2e.spell-effects.Item.UTLp7omqsiC36bso")
    }
};


async function huntPrey(message) {
    if (!isCorrectMessageType(message, undefined)) { return }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug != "hunt-prey") { return }
    const size = game.user.targets.size;
    if (size != 1 && !hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.pbD4lfAPkK1NNag0")) {
        ui.notifications.info(`${message.actor.name} needs to choose target for ${_obj.name}`);
        return;
    }
    if ((size != 1 && size != 2) && hasFeatBySourceId(message.actor, "Compendium.pf2e.feats-srd.Item.pbD4lfAPkK1NNag0")) {
        ui.notifications.info(`${message.actor.name} needs to choose 1 ot 2 targets for ${_obj.name}`);
        return;
    }

    game.combat?.turns?.map(cc => cc.actor)?.forEach(a => {
        const qq = hasEffects(a, `effect-hunt-prey-${message.actor.id}`)
            .forEach(eff => {
                deleteEffectFromActor(a, eff.slug)
            })
    });

    const aEffect = (await fromUuid(effectUUID('a51AN6VfpW9b4ttm'))).toObject();
    aEffect.name = aEffect.name.replace("Actor", message.actor.name)
    aEffect.img = message.token.texture.src
    aEffect.system.context = foundry.utils.mergeObject(aEffect.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        },
        "roll": null,
        "target": null
    });
    aEffect.system.slug = aEffect.system.slug.replace("actor", message?.actor?.id)

    game.user.targets.forEach(async (t) => {
        await addItemToActor(t.actor, aEffect);
    });

    if (!message.actor.rollOptions.all['hunted-prey']) {
        await message.actor.toggleRollOption("all", "hunted-prey")
    }
};

async function executeMacro(macroData) {
    if (!macroData) {return}
    let macro = new Macro(macroData);
    macro.ownership.default = 3;
    macro.execute();
}

async function reactiveShield(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) { return }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug != "reactive-shield") { return }

    (await fromUuid('Compendium.pf2e.action-macros.4hfQEMiEOBbqelAh'))?.execute()
};

Hooks.on('ready', function () {
    registerMessageCreateHandler('Furious Anatomy', furiousAnatomy, "Furious Anatomy from Barbarians+")
    registerMessageCreateHandler('Sorcerer Bloodlines', bloodlines, "Handle Sorcerer Bloodlines effects")
    registerMessageCreateHandler('Concussive Damage', handleConcussiveDamage, "Change damage type for Concussive Damage")
    registerMessageCreateHandler('Fortissimo Composition Spell', fortissimoComposition)
    registerMessageCreateHandler('Lingering Composition Spell', lingeringComposition)
    registerMessageCreateHandler('Self Effect Messages', selfEffectMessage)
    registerMessageCreateHandler('Demoralize', demoralize)
    registerMessageCreateHandler('Feint', feint)
    registerMessageCreateHandler('Disarm', disarm)
    registerMessageCreateHandler('Escape', escape)
    registerMessageCreateHandler('Grab', grab, "Handle Additional Attack Effects - Grab")
    registerMessageCreateHandler('Improved Grab', grabImproved, "Handle Additional Attack Effects - Improved Grab")
    registerMessageCreateHandler('Grapple trait', grapple, "Handle Grapple weapon trait")
    registerMessageCreateHandler('Battle Medicine', battleMedicineAction)
    registerMessageCreateHandler('Tamper', tamper, "Add Tamper effects")
    registerMessageCreateHandler('Toggle Gravity Weapon', toggleGravityWeapon)
    registerMessageCreateHandler('Toggle First Attack', toggleFirstAttack)
    registerMessageCreateHandler('Delete Effects After Damage', deleteEffectsAfterDamage)
    registerMessageCreateHandler('Delete Shield Effect', deleteShieldEffect)
    registerMessageCreateHandler('Critical Specialization sword', criticalSpecializationSword)
    registerMessageCreateHandler('Critical Specialization axe', criticalSpecializationAxe)
    registerMessageCreateHandler('Critical Specialization spear', criticalSpecializationSpear)
    registerMessageCreateHandler('Critical Specialization bow', criticalSpecializationBow)
    registerMessageCreateHandler('Stunning Fist', stunningFist)
    registerMessageCreateHandler('Critical Specialization Roll Saving Throw', criticalSpecializationRollSavingThrow)
    registerMessageCreateHandler('Known Weaknesses', knownWeaknesses)
    registerMessageCreateHandler('Treat Wounds', treatWoundsAction)
    registerMessageCreateHandler('Trueshape Bomb', trueShapeBomb)
    registerMessageCreateHandler('Bane Spell', baneSpell)
    registerMessageCreateHandler('Bane Save', saveBane)
    registerMessageCreateHandler('Hunt Prey', huntPrey)
    registerMessageCreateHandler('Reactive Shield', reactiveShield)

    registerUpdateActorHandler('Exploration Effects', explorationEffects, "Handle Exploration Effects. Add Effect to party")
    registerUpdateActorHandler('Exploration Activity notifications', notifyExplorationActivity, "Notify when actor change Exploration Activity")

    registerCreateItemHandler('Remove effects', removeStances, "Remove effects when Unconscious")
});
