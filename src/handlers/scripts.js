async function furiousAnatomy(message) {
    if (!isCorrectMessageType(message, "saving-throw")
        || !hasOption(message, "item:granter:flesh-instinct")
        || !hasOption(message, "item:furious-anatomy")
    ) {
        return
    }

    if (messageDCLabelHas(message, "Furious Anatomy DC") && anyFailureMessageOutcome(message)) {
        let ff = message.flags.pf2e.origin.type === "feat" ? await fromUuid(message?.flags?.pf2e?.origin?.uuid) : null;
        if (!ff) {
            return
        }
        ff = ff?.actor?.itemTypes?.feat
            ?.find((c) => "Compendium.barbarians.barbarians-features.Item.8GiJ5h5acs4ik8k7" === c.sourceId)//flesh-instinct
        if (!ff) {
            return
        }

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
    aEffect.system.rules[0].value = message?.item?.level ?? 0;

    createDialogDamageOrSelfEffect(message, spell, damageEff, selfSpells, allySpells, comboSpells, aEffect)
}

async function createDialogDamageOrSelfEffect(message, spell, damageEff, selfSpells, allySpells, comboSpells, aEffect) {
    const eff = aEffect._stats.compendiumSource;
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
    options = options.join('')


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
}

async function bloodlineAberrant(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A");
}

async function bloodlineAngelic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd");
}

async function bloodlineDemonic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.aKRo5TIhUtu0kyEr", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.yfbP64r4a9e5oyli");
}

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
}

async function bloodlineDraconic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq");
}

async function bloodlineElemental(message, spell, isElem = false) {
    const damageEff = effectUUID('2yWSBNLWWYXXSfKZ');
    const bludDamageEff = effectUUID('KFoh6XzV382S9DDr');//Additional bludgeoning damage

    let ee = hasOption(message, "feature:bloodline:elemental:fire") ? damageEff : bludDamageEff;

    const selfE = ["resist-energy", "freedom-of-movement", "unfettered-movement", "elemental-form", "repulsion", "energy-aegis", "elemental-motion"];
    if (isElem) {
        selfE.push("rising-surf")
    }

    await createDialogDamageOrSelfEffect(
        message,
        spell,
        ee,
        selfE,//self
        [],//ally
        [],//combo
        (await fromUuid("Compendium.pf2e.feat-effects.Item.3gGBZHcUFsHLJeQH")).toObject()
    )
}

async function bloodlineFey(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse");
}

async function bloodlineGenie(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.9AUcoY48H5LrVZiF", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.KVbS7AbhQdeuA0J6");
}

async function bloodlineHag(message) {
    const effect = (await fromUuid("Compendium.pf2e.feat-effects.Item.6fb15XuSV4TNuVAT")).toObject();
    effect.system.level = {value: message?.item?.level ?? 1};

    message.actor.createEmbeddedDocuments("Item", [effect]);
}

async function bloodlineHarrow(message) {
    setEffectToActor(message.actor, effectUUID('SbYoI8G8Ze6oE4we'))
}

async function bloodlineImperial(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA", targetCharacters(message.actor), "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA");
}

async function bloodlineNymph(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.SVGW8CLKwixFlnTv", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.ruRAfGJnik7lRavk");
}

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
}

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
}

async function bloodlineShadow(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.OqH6IaeOwRWkGPrk", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.Nv70aqcQgCBpDYp8");
}

async function bloodlineUndead(message, spell) {
    const damageEff = effectUUID('UQEqBomwGFkTOomK');
    createDialogDamageOrTempHP(
        message,
        spell,
        damageEff,
        ["false-life", "false-vitality", "bind-undead", "talking-corpse"],
        ["remove-curse"],
        ["harm", "undeaths-blessing"]
    )
}

async function bloodlineWyrmblessed(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.fILVhS5NuCtGXfri", targetNpcs(message.actor), "Compendium.pf2e.feat-effects.Item.aqnx6IDcB7ARLxS5");
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
    "feature:bloodline-nymph": {spells: bloodlineNymphSpells, handler: bloodlineNymph},
    "feature:bloodline-phoenix": {spells: bloodlinePhoenixSpells, handler: bloodlinePhoenix},
    "feature:bloodline-psychopomp": {spells: bloodlinePsychopompSpells, handler: bloodlinePsychopomp},
    "feature:bloodline-shadow": {spells: bloodlineShadowSpells, handler: bloodlineShadow},
    "feature:bloodline-undead": {spells: bloodlineUndeadSpells, handler: bloodlineUndead},
    "feature:bloodline-wyrmblessed": {spells: bloodlineWyrmblessedSpells, handler: bloodlineWyrmblessed},
};

function targetNpcs(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isEnemyOf(self)).map(a => a.actor) : [];
}

function targetCharacters(self) {
    return game.combat ? game.combat.turns.filter(a => a.actor.isAllyOf(self)).map(a => a.actor) : [];
}

async function bloodlines(message) {
    if ((!isCorrectMessageType(message, undefined)
            && !isCorrectMessageType(message, "spell-cast")
        )
        || !hasOption(message, "feature:bloodline-spells")
    ) {
        return
    }
    const _obj = message?.item;
    if (_obj?.type !== "spell") {
        return
    }
    if (hasOption(message, "feature:bloodline-elemental")
        && hasOption(message, "feat:elementalist-dedication")
    ) {
        if (bloodlineFeatMap["feature:bloodline-elemental"].spells.includes(_obj.slug)
            || elementalistSpells.includes(_obj.slug)
        ) {
            await bloodlineFeatMap["feature:bloodline-elemental"].handler.call(this, message, _obj, true)
            return;
        }
    }

    for (const featId in bloodlineFeatMap) {
        if (hasOption(message, featId) && bloodlineFeatMap[featId].spells.includes(_obj.slug)) {
            await bloodlineFeatMap[featId].handler.call(this, message, _obj);
            return;
        }
    }
}

async function updateConcussiveRoll(message) {
    let roll = message.rolls[0];
    roll._evaluated = false;
    for (const r in roll.terms[0].rolls) {
        await updateConcussiveDamageInstance(roll.terms[0].rolls[r])
    }
    roll.terms[0].terms.map(function (x) {
        return x.replace(/piercing/g, 'bludgeoning')
    });
    roll.resetFormula()
    await roll.evaluate({async: true})

    await message.update({rolls: [roll]})
}

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
}

async function disarm(message) {
    if (
        !hasOption(message, "action:disarm")
        || !criticalSuccessMessageOutcome(message)
    ) {
        return
    }
    if (message.target?.actor?.isOfType('character')) {
        let availableWeapons = message.target.actor.system.actions.filter(a => a.ready && !a.item.parentItem && !a.item.traits?.has("unarmed")).map(a => a.item)
        if (availableWeapons.length === 0) {
            ui.notifications.info(`Target can not be disarmed`);
            return
        } else {
            let w;
            if (availableWeapons.length === 1) {
                w = availableWeapons[0]
            } else {
                let weaponOptions = availableWeapons.map(w => `<option value=${w.id}>${w.name}</option>`).join('');
                const {currentWeapon} = await foundry.applications.api.DialogV2.wait({
                    window: {title: 'Select target'},
                    content: `
                    <select id="fob1" autofocus>
                        ${weaponOptions}
                    </select>
                `,
                    buttons: [{
                        action: "ok", label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
                        callback: (event, button, form) => {
                            return {
                                currentWeapon: $(form).find("#fob1").val(),
                            }
                        }
                    }, {
                        action: "cancel",
                        label: "Cancel",
                        icon: "<i class='fa-solid fa-ban'></i>",
                    }],
                    default: "ok"
                });
                if (!currentWeapon) {
                    return
                }

                w = availableWeapons.find(a => a.id === currentWeapon);
            }

            await changeCarryTypeToWorn(w)
        }
    }
    if (message.target?.actor?.isOfType('npc')) {
        let availableWeapons = message.target.actor.system.actions.filter(a => a.item?.getFlag("pf2e", "linkedWeapon"));
        if (!availableWeapons.length) {
            ui.notifications.info(`Target can not be disarmed`);
            return
        } else if (!message.target.actor.items.find(a => a.name === "Fist")) {
            let meleeWeapon = message.target.actor.items.find(a => a.type === 'melee')
            let linkedWeapon = message.target.actor.items.get(meleeWeapon?.getFlag("pf2e", "linkedWeapon"))

            await addItemToActor(message.target.actor, {
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
            })
        }
    }

    ui.notifications.info(`${message.actor.name} disarmed target`);
}

async function huntPrey(message) {
    if (!isCorrectMessageType(message, undefined)
        || !hasOption(message, "origin:item:hunt-prey")) {
        return
    }
    const size = game.user.targets.size;
    let doublePrey = message.actor?.rollOptions.all["feat:double-prey"];
    if (size !== 1 && !doublePrey) {
        ui.notifications.info(`${message.actor.name} needs to choose target for ${_obj.name}`);
        return;
    }
    if ((size !== 1 && size !== 2) && doublePrey) {
        ui.notifications.info(`${message.actor.name} needs to choose 1 ot 2 targets for ${_obj.name}`);
        return;
    }

    game.combat?.turns?.map(cc => cc.actor)?.flatMap(a => {
        return getEffectsBySlug(a, `effect-hunt-prey-${message.actor.id}`)
    }).forEach(eff => {
        deleteEffectFromActor(a, eff.slug)
    });

    const aEffect = (await fromUuid(effectUUID('a51AN6VfpW9b4ttm'))).toObject();
    aEffect.name = aEffect.name.replace("Actor", message.actor.name)
    aEffect.img = getSrc(message)
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

    if (!message.actor?.rollOptions.all['hunted-prey']) {
        await message.actor.toggleRollOption("all", "hunted-prey")
    }
}

async function frostbiteAmped(message) {
    if (!("appliedDamage" in message?.flags?.pf2e && !message?.flags?.pf2e?.appliedDamage?.isHealing)) {
        return
    }
    if (message.item?.slug !== "frostbite") {
        return
    }

    let m = lastMessages(2).filter(m => m !== message).find(m => m.item?.slug === "frostbite" && isCorrectMessageType(m, "damage-roll"))
    if (!m) {
        return
    }
    if (!m.item?.traits?.has("amp") && !hasOption(m, 'amp-spell')) {
        return
    }

    let rollOptions = await getRollOptions(message);
    if (!rollOptions.has("feature:the-oscillating-wave")) {
        return
    }


    const eff = effectUUID('yYvPtdlew2YctMgt');//Temp HP
    let damage = message?.flags?.pf2e?.appliedDamage?.updates?.[0]?.value ?? 0;
    if (!damage) {
        return
    }

    const aEffect = (await fromUuid(eff)).toObject();
    aEffect.system.rules[0].value = Math.floor(damage / 2) ?? 0;//damage
    aEffect.system.duration.unit = "minutes";//1 minute

    const _e = getEffectBySourceId(m.actor, eff);
    if (_e) {
        await _e.delete()
        setTimeout(async function () {
            await addItemToActor(m.actor, aEffect);
        }, 1000)
    } else {
        await addItemToActor(m.actor, aEffect);
    }
}

async function baneEffectImmunity(item) {
    if ("Compendium.pf2e.spell-effects.Item.UTLp7omqsiC36bso" !== item.sourceId) {
        return
    }
    if (!item.origin) {
        return
    }
    let aura = item.origin.itemTypes.effect.find(e => e.sourceId === effectUUID("FcUe8TT7bhqlURIf"))
    if (!aura) {
        return
    }
    let source = await fromUuid(aura.system?.context?.origin?.item)
    if (!source) {
        return
    }

    const dc = source.spellcasting.statistic.dc.value;
    await actorRollSaveThrow(item.actor, 'will', {value: dc}, source, item.origin)
}

async function saveBane(message) {
    if (hasOption(message, 'item:slug:bane') && anySuccessMessageOutcome(message)) {
        await setEffectToActor(message.actor, effectUUID('kLpCaiCZjenXCebV'))
        await deleteEffectFromActor(message.actor, "Compendium.pf2e.spell-effects.Item.UTLp7omqsiC36bso")
    }
}

async function masterStrike(message) {
    if (!hasOption(message, "origin:item:master-strike")) {
        return
    }

    if (game.user.targets.size !== 1) {
        ui.notifications.info(`${message.actor.name} needs to choose target for Master Strike`);
        return;
    }

    const target = game.user.targets.first().actor;

    if (!checkPredicate(["self:effect:master-strike-immunity"], target.getRollOptions())) {
        await setEffectToActor(target, effectUUID('gVd4wmPDvwpD7hsC'))
    }
}

async function handleMasterStrikeResult(message) {
    if (!isCorrectMessageType(message, "saving-throw")
        || !hasOption(message, "item:master-strike")
    ) {
        return
    }
    const {degreeOfSuccess} = message.rolls[0];
    if (degreeOfSuccess === 0) {
        ChatMessage.create({
            type: CONST.CHAT_MESSAGE_TYPES.OOC,
            content: `The ${message.token.name} is paralyzed for 4 rounds, knocked @UUID[Compendium.pf2e.conditionitems.Item.fBnFDH2MTzgFijKf]{Unconscious} for 2 hours, or killed (your choice).`
        });
    } else if (degreeOfSuccess === 1) {
        await setEffectToActor(message.actor, effectUUID('5Mk3CmmLDTLVf8l5'))
    } else if (degreeOfSuccess === 2) {
        let originActor = message?.flags?.pf2e?.origin?.actor ?? message?.flags?.pf2e?.context?.origin?.actor;
        if (originActor) {
            await setEffectToActor(message.actor, effectUUID('KLd1H370WVyj1uih'), undefined, {
                origin: {actor: originActor, item: message.item?.uuid},
                duplication: true,
            });
        }
    }
}

async function lingeringComposition(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug !== "lingering-composition") {
        return
    }

    const pack = game.packs.get("xdy-pf2e-workbench.asymonous-benefactor-macros-internal");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === 'XDY DO_NOT_IMPORT Lingering Fortissimo')?.toObject())
    }
}

async function fortissimoComposition(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug !== "fortissimo-composition") {
        return
    }

    const pack = game.packs.get("pf2e-macros.macros");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === 'Inspire Heroics / Fortissimo Composition')?.toObject())
    }
}

async function extendBoost(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug !== "extend-boost") {
        return
    }

    const pack = game.packs.get("pf2e-eidolon-helper.pf2e-eidolon-helper-macros");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === "Extend Boost")?.toObject())
    }
}

async function executeMacro(macroData) {
    if (!macroData) {
        return
    }
    let macro = new Macro(macroData);
    macro.ownership.default = 3;
    macro.execute();
}

async function reactiveShield(message) {
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug !== "reactive-shield") {
        return
    }

    (await fromUuid('Compendium.pf2e.action-macros.4hfQEMiEOBbqelAh'))?.execute()
}

function trueShapeBomb(message) {
    if (!isCorrectMessageType(message, 'saving-throw')) {
        return
    }
    if (hasOption(message, "alchemical") && hasOption(message, "bomb") && anyFailureMessageOutcome(message)) {
        if (messageDCLabelHas(message, "Trueshape Bomb DC") || messageDCLabelHas(message, "Trueshape Bomb (Greater) DC")) {
            ui.notifications.info(`${message.actor.name} fails saving-throw. Need to delete morph/polymorph effects from actor`);
        }
    }
}

async function treatWounds(message, target) {
    if (!target.rollOptions?.all['self:effect:treat-wounds-immunity']) {
        if (!hasOption(message, "feat:continual-recovery")) {
            await setEffectToActor(target, "Compendium.pf2e.feat-effects.Lb4q2bBAgxamtix5")//Immunity
        }
    } else {
        ui.notifications.info(`${target.name} has Treat Wounds Immunity`);
    }
}

function treatWoundsAction(message) {
    if (!isCorrectMessageType(message, "skill-check")) {
        return
    }
    if (!game.combat?.started && hasOption(message, "action:treat-wounds") && message.isCheckRoll) {
        if (game.user.targets.size === 1) {
            const [first] = game.user.targets;
            treatWounds(message, first.actor);
        } else if (hasOption(message, "feat:ward-medic")) {
            game.user.targets.forEach(a => {
                treatWounds(message, a.actor);
            });
        } else {
            ui.notifications.info(`Need to select 1 token as target`);
        }
    }
}

function isActorHeldEquipment(actor, item) {
    return actor?.itemTypes?.equipment?.find(a => a.isHeld && a.slug === item)
}

async function selfEffectMessage(message) {
    if (!isCorrectMessageType(message, 'self-effect')) {
        return
    }
    const _eff = message?.item?.system?.selfEffect?.uuid;
    if (_eff) {
        await setEffectToActor(message.actor, _eff)
    }
}

async function toggleGravityWeapon(message) {
    if (isCorrectMessageType(message, "damage-roll")
        || (isCorrectMessageType(message, "attack-roll") && anyFailureMessageOutcome(message))
    ) {
        if (message?.actor?.rollOptions?.["damage-roll"]?.["gravity-weapon"] && !hasOption(message, "item:category:unarmed")) {
            await message.actor.toggleRollOption("damage-roll", "gravity-weapon")
        }
    }
}

async function toggleFirstAttack(message) {
    if (hasOption(message, "first-attack") && isCorrectMessageType(message, "damage-roll")
        && (hasOption(message, "feature:precision")
            || hasOption(message, 'self:effect:hunters-edge-precision'))
    ) {
        const ranger = message.actor.getFlag("pf2e", "master");
        const _e = hasEffectBySourceId(message.actor, 'Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0');
        if (ranger && hasEffect(message?.target?.actor, `effect-hunt-prey-${ranger}`) && message.actor.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        } else if (_e && hasEffect(message?.target?.actor, `effect-hunt-prey-${_e.getFlag(moduleName, 'originActorId')}`) && message.actor?.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        } else if (hasEffect(message?.target?.actor, `effect-hunt-prey-${message.actor.id}`) && message.actor?.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        }
    }
}

async function effectHagBloodMagic(message) {
    if (!("appliedDamage" in message?.flags?.pf2e && !message?.flags?.pf2e?.appliedDamage?.isHealing)) {
        return
    }
    const eff = hasEffectBySourceId(message.actor, "Compendium.pf2e.feat-effects.Item.6fb15XuSV4TNuVAT");
    if (!eff) {
        return;
    }

    ui.notifications.info(`${message.actor.name} has Effect: Hag Blood Magic. Attacker should take ${eff.system.level.value} damage`);
    await deleteItem(eff);
}

async function knownWeaknesses(message) {
    if (!isCorrectMessageType(message, undefined)) {
        return
    }
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.slug !== "known-weaknesses") {
        return
    }
    const party = game.actors.filter(a => a.isOfType("party")).find(a => a.members.find(b => b.id === message.actor?.id));
    if (!party) return;
    party.members.filter(a => a.uuid !== message.actor.uuid).forEach(async (tt) => {
        await setEffectToActor(tt, "Compendium.pf2e.feat-effects.Item.DvyyA11a63FBwV7x", undefined, {
            origin: {
                actor: message?.actor?.uuid,
                item: message?.item?.uuid,
                token: message?.token?.uuid
            }
        })
    })
}

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
}

function messageWeapons(message) {
    let weapons = [messageWeapon(message)]

    if (message?.flags?.pf2e?.criticalItems?.length) {
        weapons.push(message.flags.pf2e.criticalItems
            .map(a => a.uuid)
            .map(ss => message.actor.system.actions.find(a => a.item?.uuid === ss)?.item)
        );
    }
    return weapons.flat().filter(a => !!a);
}

function messageWeapon(message) {
    if (message.item?.type === 'weapon' || message.item?.type === 'feat') {
        return message.item;
    } else if (message.flags?.pf2e?.strike?.name === "Unarmed Attack") {
        return message.actor?.system?.actions?.filter(h => h.visible && h.item?.isMelee && h.item?.name === 'Unarmed Attack')[0]?.item
    } else if (message.flags?.pf2e?.strike?.name === "Fist") {
        return message.actor?.system?.actions?.filter(h => h.visible && h.item?.isMelee && h.item?.name === 'Fist')[0]?.item
    }
}

async function handleAddDamage(message, target, lastAttack, totalDamage, damageType) {
    let newDc = target.actor.getStatistic("armor").dc.value

    if (newDc > lastAttack) {
        ChatMessage.create({
            user: game.user.id,
            content: `Target of Critical Specialization has bigger DC than attack roll`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        });
    } else {
        const roll = new DamageRoll(`${totalDamage}[${damageType}]`, context);
        await roll.evaluate({async: true});

        roll.toMessage(
            {
                speaker: foundry.utils.deepClone(message.speaker),
                flags: {
                    "pf2e-toolbelt.targetHelper.targets": [target.uuid],
                    pf2e: {
                        target: {actor: target.actor.uuid, token: target.uuid},
                        context: {
                            target: {actor: target.actor.uuid, token: target.uuid}
                        }
                    },
                },
            }
        );
    }
}


function isCriticalSpecialization(message, weapon) {
    if (!weapon) {
        return
    }
    if (["crossbow", "dart", "knife", "pick"].includes(weapon.group)) {
        return false;
    }
    return message.actor.synthetics.criticalSpecializations.standard.some(b => b(weapon, message.flags.pf2e?.context?.options))
        || message.actor.synthetics.criticalSpecializations.alternate.some(b => b(weapon, message.flags.pf2e?.context?.options))
}

async function criticalSpecializationRollSavingThrow(message) {
    if (!message.actor
        || !message.target?.actor
        || !isCorrectMessageType(message, 'damage-roll')
        || !hasOption(message, 'critical-specialization')
        || !hasOption(message, 'check:outcome:critical-success')
    ) {
        return false;
    }

    let allWeapons = messageWeapons(message);
    let weapon = allWeapons.find(a => ["brawling", "firearm", "sling", "hammer"].includes(a.group));
    let flailWeapon = allWeapons.find(a => ["flail"].includes(a.group));
    let featWeapon = allWeapons.find(a => a?.type === 'feat');

    if (isCriticalSpecialization(message, weapon)) {
        await actorRollSaveThrow(message.target?.actor, 'fortitude', {
                label: `${weapon.group.capitalize()} Critical Specialization DC`,
                value: message.actor.attributes.classDC.value
            },
            weapon,
            message.actor
        )
    } else if (isCriticalSpecialization(message, flailWeapon)) {
        await actorRollSaveThrow(message.target?.actor, 'reflex', {
                label: `Flail Critical Specialization DC`,
                value: message.actor.attributes.classDC.value
            },
            flailWeapon,
            message.actor
        )
    } else if (isCriticalSpecialization(message, featWeapon)) {
        const strikes = featWeapon.rules.filter(a => a.key === "Strike");
        if (
            featWeapon.rules.filter(a => a.key === "ChoiceSet").length > 0
            && strikes.map(a => a.group).some(d => ["brawling", "firearm", "sling"].includes(d))
        ) {
            await actorRollSaveThrow(message.target?.actor, 'fortitude', {
                    label: `${Object.values(featWeapon?.flags?.pf2e?.rulesSelections)[0]?.capitalize()} Critical Specialization DC`,
                    value: message.actor.attributes.classDC.value
                },
                featWeapon,
                message.actor
            )
        } else if (strikes.length === 1 && ["brawling", "firearm", "sling"].includes(strikes[0].group)) {
            await actorRollSaveThrow(message.target?.actor, 'fortitude', {
                    label: `${strikes[0].label} Critical Specialization DC`,
                    value: message.actor.attributes.classDC.value
                },
                featWeapon,
                message.actor
            )
        }
    }
}

async function criticalSpecializationSpear(message) {
    if (!message.actor
        || !message.target?.actor
        || !isCorrectMessageType(message, 'damage-roll')
        || !hasOption(message, 'critical-specialization')
        || !hasOption(message, 'check:outcome:critical-success')
    ) {
        return false;
    }
    let weapon = messageWeapons(message).find(a => a.group === "spear");
    if (!isCriticalSpecialization(message, weapon)) {
        return;
    }
    await setEffectToTargetActorNextTurn(message, {value: effectUUID('lsICo0LAyrWy2cDm')})
}

async function criticalSpecializationSword(message) {
    if (!message.actor
        || !message.target?.actor
        || !isCorrectMessageType(message, 'damage-roll')
        || !hasOption(message, 'critical-specialization')
        || !hasOption(message, 'check:outcome:critical-success')
    ) {
        return false;
    }
    let weapon = messageWeapons(message).find(a => a.group === "sword");

    if (!isCriticalSpecialization(message, weapon)) {
        return;
    }

    await setEffectToTargetActorNextTurn(message, {value: effectUUID('YsNqG4OocHoErbc9')})
}

async function criticalSpecializationAxe(message) {
    if (!message.actor
        || !message.target?.token
        || !isCorrectMessageType(message, 'damage-roll')
        || !hasOption(message, 'critical-specialization')
        || !hasOption(message, 'check:outcome:critical-success')
        || !hasOption(message, 'item:group:axe')
    ) {
        return false;
    }

    let lastAttack = game.messages.contents.slice(-10).reverse().find(m => isCorrectMessageType(m, "attack-roll") && m.item === message.item)
    if (!lastAttack) {
        return
    }
    lastAttack = Number(lastAttack.content)
    if (isNaN(lastAttack)) {
        return
    }

    let targets = message.target.token.scene.tokens.contents
        .filter(a => distanceIsCorrect(a, message.target.token, 5))
        .filter(t => !t.hidden)
        .filter(t => t.actor !== message.actor)
        .filter(t => t.actor !== message.target.actor)
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

        const {uuid} = await Dialog.wait({
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
                    callback: (html) => {
                        return {uuid: html[0].querySelector("#map").value}
                    }
                },
                cancel: {
                    label: "Cancel",
                    icon: "<i class='fa-solid fa-ban'></i>",
                }
            },
            default: "ok"
        });
        if (!uuid) {
            return
        }
        handleAddDamage(message, targets.find(a => a.uuid === uuid), lastAttack, diceTotal, damageType)
    } else {
        ChatMessage.create({
            user: game.user.id,
            content: `No targets for Critical Specialization Axe`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        });
    }
}

async function criticalSpecializationBow(message) {
    if (isCorrectMessageType(message, 'damage-roll')
        && hasOption(message, 'critical-specialization')
        && hasOption(message, 'check:outcome:critical-success')
        && hasOption(message, 'item:group:bow')
        && message.target.token.elevation === 0) {
        await increaseConditionForActor(message.target.actor, "immobilized");
    }
}

async function stunningFist(message) {
    if (!isCorrectMessageType(message, 'damage-roll')) {
        return false;
    }
    if (!hasOption(message, "stunning-fist")) {
        return
    }

    await actorRollSaveThrow(message.target?.actor, 'fortitude', {
            label: `Stunning Fist DC`,
            value: message.actor.attributes.classDC.value
        },
        undefined,
        message.actor
    )
}

async function stunningBlows(message) {
    if (!isCorrectMessageType(message, 'damage-roll')) {
        return false;
    }
    if (!hasOption(message, "stunning-blows")) {
        return
    }

    await actorRollSaveThrow(message.target?.actor, 'fortitude', {
            label: `Stunning Blows DC`,
            value: message.actor.attributes.classDC.value
        },
        undefined,
        message.actor
    )
}

async function deleteEffectsAfterDamage(message) {
    if (!isCorrectMessageType(message, "damage-roll")) {
        return
    }

    if (hasOption(message, "target:effect:off-guard-tumble-behind")) {
        await deleteItem(hasEffect(message.target.actor, "effect-off-guard-tumble-behind"))
    }

    if (message?.item?.isMelee) {
        let pan = hasEffect(message.actor, "effect-panache")

        if (pan && hasOption(message, "finisher") && (hasOption(message, "agile") || hasOption(message, "finesse"))) {
            await deleteItem(pan)
        }
    }
}

async function deleteEffectsAfterRoll(message) {
    if (message?.flags?.pf2e?.modifiers?.find(a => a.slug === "aid" && a.enabled)) {
        await deleteEffectFromActor(message.actor, "effect-aid")
    }
}

async function deleteFeintEffects(message) {
    if (
        (isCorrectMessageType(message, "damage-roll") && message?.item?.isMelee)
        || (isCorrectMessageType(message, "attack-roll") && message?.item?.isMelee && anyFailureMessageOutcome(message))
    ) {
        const aef = hasEffect(message.actor, `effect-feint-success-${message.actor.id}-${message?.target?.actor.id}`)
        const tef = hasEffect(message?.target?.actor, `effect-feint-success-${message.actor.id}`)
        if (aef && tef) {
            await deleteItem(aef)
            await deleteItem(tef)
        }
    }
}

async function demoralize(message) {
    if (!isCorrectMessageType(message, "skill-check")) {
        return
    }
    if (message?.target && hasOption(message, "action:demoralize")) {
        const dd = getEffectsBySlug(message?.target?.actor, "effect-demoralize-immunity-minutes");
        if (dd.length === 0 || !dd.some(d => d.system?.context?.origin?.actor === message.actor.uuid)) {
            const i = message?.target?.actor?.attributes?.immunities?.map(a => a.type) ?? [];
            if (i.some(d => ["mental", "fear-effects", "emotion"].includes(d))) {
                sendGMNotification(`${message.target.actor.name} has Immunity to Demoralize action. Has mental, fear or emotion immunity`);
            } else {
                const decryThief = hasOption(message, "feat:decry-thief");//decry-thief
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
            await setEffectToActor(message?.target?.actor, effectUUID('DFLW2gzu0PGeX6zu'), undefined, {
                name: `Effect: Demoralize Immunity 10 minutes (${message.actor.name})`,
                icon: getSrc(message),
                origin: {actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid},
                duplication: true
            })
        }
    }
}

async function feint(message) {
    if (!isCorrectMessageType(message, "skill-check")) {
        return
    }
    if (message?.target && hasOption(message, "action:feint")) {
        if (anySuccessMessageOutcome(message)) {
            let scoundrel = hasOption(message, "feature:scoundrel");

            if (hasOption(message, "goading-feint")) {
                let source = await fromUuid("Compendium.pf2e.feat-effects.Item.rflbFzV44Fd6aBLE");
                source = source.toObject();
                let cSet = source.system.rules.filter(r => r.key === "ChoiceSet");
                if (cSet.length === 1) {
                    cSet[0].selection = criticalSuccessMessageOutcome(message) ? "critical-success" : "success";
                }
                source.system.context = foundry.utils.mergeObject(source.system.context ?? {}, {
                    origin: {
                        "actor": message.actor.uuid,
                        "item": message?.item?.uuid,
                        "token": message.token.uuid
                    }
                });

                addItemToActor(message.target.actor, source);
            } else if (criticalSuccessMessageOutcome(message) && scoundrel) {
                await setEffectToActor(
                    message.target.actor,
                    "Compendium.pf2e-automations.effects.Item.YsNqG4OocHoErbc9",
                    message?.item?.level,
                    {
                        origin: {
                            "actor": message.actor.uuid,
                            "item": message?.item?.uuid,
                            "token": message.token.uuid
                        },
                        duplication: true,
                    }
                );
            } else if (criticalSuccessMessageOutcome(message) || scoundrel) {
                await setFeintEffect(message, true)
            } else {
                await setFeintEffect(message, false)
            }
            if (await hasOption(message, "feat:distracting-feint")) {
                await setEffectToTargetActorNextTurn(message, {value: "Compendium.pf2e.feat-effects.Item.7hRgBo0fRQBxMK7g"})
            }
        } else if (criticalFailureMessageOutcome(message)) {
            await setFeintEffect(message, true, true)
        }
    }
}

async function setFeintEffect(message, isCrit = false, isCritFail = false) {
    const actor = isCritFail ? message.target.actor : message.actor;
    const target = isCritFail ? message.actor : message.target.actor;

    const effect = (await fromUuid(isCrit ? effectUUID('lwcyhD03jVchmPGm') : effectUUID('P6DGk2h38xE8O0pw'))).toObject();
    let actorId = actor.id.toLowerCase();
    let targetId = target.id.toLowerCase();

    effect.system.slug = effect.system.slug.replace("attacker", actorId)
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
    aEffect.system.slug = aEffect.system.slug.replace("attacker", actorId).replace("target", targetId)

    aEffect.system.rules[0].predicate[0] = aEffect.system.rules[0].predicate[0].replace("attacker", actorId);
    aEffect.system.rules[0].predicate[1] = aEffect.system.rules[0].predicate[1].replace("attacker", actorId).replace("target", targetId)
    aEffect.system.rules[1].predicate[1] = aEffect.system.rules[1].predicate[1].replace("attacker", actorId);
    aEffect.system.rules[1].predicate[2] = aEffect.system.rules[1].predicate[2].replace("attacker", actorId).replace("target", targetId)
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
}

async function stumblingStance(message) {
    //NPC attacks PC
    if (isCorrectMessageType(message, 'damage-roll')
        && message.item?.isMelee
        && hasEffectBySourceId(message.target?.actor, "Compendium.pf2e.feat-effects.Item.BCyGDKcplkJiSAKJ")
        && !hasEffect(message.target?.actor, `effect-stumbling-stance-${message.actor.signature}`)
    ) {
        const aEffect = (await fromUuid(effectUUID('ESDysTknpmThdvQs'))).toObject();
        aEffect.name = aEffect.name.slice(0, -10) + `${showName(message.token) ? message.token.name : 'Target'} is ` + aEffect.name.slice(-10)
        aEffect.system.rules[0].predicate.push(`target:signature:${message.actor.signature}`)
        aEffect.system.slug = `effect-stumbling-stance-${message.actor.signature}`

        await addItemToActor(message.target.actor, aEffect);
    }

    if (hasEffectBySourceId(message.actor, "Compendium.pf2e.feat-effects.Item.BCyGDKcplkJiSAKJ")) {
        let eff = hasEffect(message.actor, `effect-stumbling-stance-${message.target?.actor?.signature}`);
        if (eff) {
            if (isCorrectMessageType(message, "damage-roll")
                || (isCorrectMessageType(message, "attack-roll") && anyFailureMessageOutcome(message))
            ) {
                eff.delete()
            }
        }
    }
}

function escape(message) {
    if (message?.target && hasOption(message, "action:escape") && anySuccessMessageOutcome(message)) {
        const rest = getEffectsBySlug(message.actor, "effect-restrained-until-end-of-attacker-next-turn")
        const grab = getEffectsBySlug(message.actor, "effect-grabbed-until-end-of-attacker-next-turn")
        rest.filter(a => a?.system?.context?.origin?.actor === message.target.actor.uuid).forEach(async (a) => {
            await deleteItem(a);
        });
        grab.filter(a => a?.system?.context?.origin?.actor === message.target.actor.uuid).forEach(async (a) => {
            await deleteItem(a);
        });
    }
}

async function grab(message) {
    if (!message?.actor?.isOfType('npc')) {
        return
    }
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.system?.attackEffects?.value?.includes('grab')) {
            const confirm = await Dialog.confirm({
                title: "Grapple Action",
                content: "Do you want to spend action to grapple target?",
            });
            if (!confirm) {
                return
            }

            game.pf2e.actions.grapple({actors: [message.actor]})
        }
    }
}

async function grapple(message) {
    if (!message?.actor?.isOfType('npc')) {
        return
    }
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.traits?.has('grapple')) {
            const confirm = await Dialog.confirm({
                title: "Grapple Action",
                content: "Do you want to spend action to grapple target?",
            });
            if (!confirm) {
                return
            }

            game.pf2e.actions.grapple({actors: [message.actor]})
        }
    }
}

async function grabImproved(message) {
    if (!message?.actor?.isOfType('npc')) {
        return
    }
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.system?.attackEffects?.value?.includes('improved-grab')) {
            const confirm = await Dialog.confirm({
                title: "Grapple Action",
                content: "Do you want to grapple target?",
            });
            if (!confirm) {
                return
            }

            game.pf2e.actions.grapple({actors: [message.actor]})
        }
    }
}

async function knockdown(message) {
    if (!message?.actor?.isOfType('npc')) {
        return
    }
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.system?.attackEffects?.value?.includes('knockdown') || message.item?.system?.attackEffects?.value?.includes('improved-knockdown')) {
            const confirm = await Dialog.confirm({
                title: message.item?.system?.attackEffects?.value?.includes('improved-knockdown') ? "Improved Knockdown free action" : "Knockdown action",
                content: "Do you want to knockdown target?",
            });
            if (!confirm) {
                return
            }

            game.pf2e.actions.trip({actors: [message.actor]})
        }
    }
}

async function push(message) {
    if (!message?.actor?.isOfType('npc')) {
        return
    }
    if (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "attack-roll")) {
        if (message.item?.system?.attackEffects?.value?.includes('push')) {
            const confirm = await Dialog.confirm({
                title: "Push Action",
                content: "Do you want to push target?",
            });
            if (!confirm) {
                return
            }

            game.pf2e.actions.shove({actors: [message.actor]})
        }
    }
}

async function entropicWheel(message) {
    if (message?.item?.sourceId !== 'Compendium.pf2e.spells-srd.Item.X4T5RlQBrdpmA35n') {
        return
    }
    let traits = [...(message.item.system?.traits?.value ?? []), ...(message.item.system?.traits?.otherTags ?? [])]
    let eff = (await fromUuid("Compendium.pf2e.spell-effects.Item.znwjWUvGOFQ6VYaE")).toObject()
    if (traits.includes("amped")) {
        eff.system.badge.value = 2
    }
    await addItemToActor(message.actor, eff)
}

async function wardensBoon(message) {
    if (!isCorrectMessageType(message, undefined)
        || !hasOption(message, "origin:item:wardens-boon")) {
        return
    }
    if (game.user.targets.size !== 1) {
        ui.notifications.info(`${message.actor.name} needs to choose target for Warden's Boon`);
        return;
    }

    if (message.actor?.rollOptions.all['feature:flurry']) {
        await applyEffectWardensBoon(message, "Compendium.pf2e.feat-effects.Item.uXCU8GgriUjuj5FV", game.user.targets.first().actor);
    }
    if (message.actor?.rollOptions.all['feature:outwit']) {
        await applyEffectWardensBoon(message, "Compendium.pf2e.feat-effects.Item.ltIvO9ZQlmqGD89Y", game.user.targets.first().actor);
    }
    if (message.actor?.rollOptions.all['feature:precision']) {
        await applyEffectWardensBoon(message, "Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0", game.user.targets.first().actor);
    }
}

async function applyEffectWardensBoon(message, uuid, target) {
    const effect = (await fromUuid(uuid)).toObject();
    effect.flags = foundry.utils.mergeObject(effect.flags, {[moduleName]: {"originActorId": message.actor.id}});

    effect.system.duration.expiry = 'turn-end';
    effect.system.duration.unit = 'rounds';
    if (game.combat?.combatant?.initiative <= target?.combatant?.initiative) {
        effect.system.duration.value = 1;
    } else {
        effect.system.duration.value = 0;
    }

    addItemToActor(target, effect);
}


async function sharedPrey(message) {
    if (!isCorrectMessageType(message, undefined)
        || !hasOption(message, "origin:item:shared-prey")
    ) {
        return
    }
    if (game.user.targets.size !== 1) {
        ui.notifications.info(`${message.actor.name} needs to choose target for Shared Prey`);
        return;
    }

    const efTargets = game.combat?.turns?.map(cc => cc.actor)?.map((a) => {
        return hasEffect(a, `effect-hunt-prey-${message.actor.id}`)
    }).filter(a => a) || [];
    if (efTargets.length !== 1) {
        ui.notifications.info(`${message.actor.name} needs to have 1 Hunted Prey Target`);
        return;
    }

    if (message.actor?.rollOptions.all['feature:flurry']) {
        await applyEffectSharedPrey(message, "Compendium.pf2e.feat-effects.Item.uXCU8GgriUjuj5FV", game.user.targets.first().actor);
    }
    if (message.actor?.rollOptions.all['feature:outwit']) {
        await applyEffectSharedPrey(message, "Compendium.pf2e.feat-effects.Item.ltIvO9ZQlmqGD89Y", game.user.targets.first().actor);
    }
    if (message.actor?.rollOptions.all['feature:precision']) {
        await applyEffectSharedPrey(message, "Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0", game.user.targets.first().actor);
    }
}

async function applyEffectSharedPrey(message, uuid, target) {
    const effect = (await fromUuid(uuid)).toObject();
    effect.flags = foundry.utils.mergeObject(effect.flags, {[moduleName]: {"originActorId": message.actor.id}});

    addItemToActor(target, effect);
}

async function causticBelch(message) {
    if (!isCorrectMessageType(message, 'saving-throw')) {
        return
    }
    if (!anyFailureMessageOutcome(message)) {
        return
    }
    if (!messageDCLabelHas(message, "Caustic Belch DC")) {
        return
    }

    const _f = await fromUuid(message.flags.pf2e.origin?.uuid);
    if (!_f) {
        return
    }

    const _d = Math.floor(_f.actor.level / 2);

    await applyDamage(message.actor, message.token, `${_d}d8[poison]`)
}

const theOscillatingWaveSpells = [
    "breathe-fire",
    "heat-metal",
    "fireball",
    "fire-shield",
    "cone-of-cold",
    "flame-vortex",
    "fiery-body",
    "polar-ray",
    "falling-stars",
    "produce-flame",
    "ray-of-frost",
    "ignition",
    "frostbite",
];

async function theOscillatingWave(message) {
    if (!message.actor?.rollOptions.all['feature:the-oscillating-wave']) {
        return
    }

    if (hasOption(message, "origin:item:refocus")) {
        await message.actor?.toggleRollOption("all", "conservation-of-energy", undefined, true, "none")
    }

    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }

    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (!_obj) {
        return
    }
    if (!(_obj.type === "spell" && theOscillatingWaveSpells.includes(_obj.slug))
        && !(_obj.type === "feat" && _obj.traits.has("mindshift") && message.actor?.rollOptions?.all?.['mindshift:add-remove-energy'])
    ) {
        return
    }
    if (!message.actor?.rollOptions?.all?.['conservation-of-energy']) {
        return
    }

    if (message.actor?.rollOptions?.all?.['conservation-of-energy:fire']) {
        await _token.actor.toggleRollOption("all", "conservation-of-energy", wave.id, true, "cold")
    } else if (message.actor?.rollOptions?.all?.['conservation-of-energy:cold']) {
        await _token.actor.toggleRollOption("all", "conservation-of-energy", wave.id, true, "fire")
    } else {
        const {action} = await Dialog.wait({
            title: "The Oscillating Wave",
            content: `
                <h3>Actions</h3>
                <select id="map">
                    <option value="fire">Adding Energy</option>
                    <option value="cold">Removing Energy</option>
                </select><hr>
            `,
            buttons: {
                ok: {
                    label: "Use",
                    icon: "<i class='fa-solid fa-hand-fist'></i>",
                    callback: (html) => {
                        return {action: html[0].querySelector("#map").value}
                    }
                },
                cancel: {
                    label: "Cancel",
                    icon: "<i class='fa-solid fa-ban'></i>",
                }
            },
            default: "ok"
        });
        if (action === undefined) {
            return;
        }

        await _token.actor.toggleRollOption("all", "conservation-of-energy", wave.id, true, action)
    }
}

async function shieldWarden(message) {
    if (['shield-warden-champion', "shield-warden-fighter"].includes(message?.item?.slug)) {
        if (!hasEffectBySourceId(message.actor, 'Compendium.pf2e.equipment-effects.Item.2YgXoHvJfrDHucMr')) {
            ui.notifications.info(`${message.actor.name} needs to Raise a Shield`);
            return
        }
        if (game.user.targets.size !== 1) {
            ui.notifications.info(`${message.actor.name} needs to choose target for Shield Warden`);
            return;
        }
        const target = game.user.targets.first().actor;
        const shield = message.actor.attributes.shield;
        const effect = {
            type: 'effect',
            name: `Shield Warden (${message.token.actor.name})`,
            img: `${shield.icon}`,
            system: {
                content: {
                    origin: {
                        actor: message?.actor?.uuid,
                        item: message.actor.items.get(shield.itemId)?.uuid,
                        token: message?.token?.uuid
                    }
                },
                tokenIcon: {show: true},
                duration: {value: '0', unit: 'rounds', sustained: false, expiry: 'turn-end'},
                rules: [{
                    "key": "ActiveEffectLike",
                    "mode": "override",
                    "path": "system.attributes.shield",
                    "value": shield
                }],
                slug: `effect-shield-warden`
            },
        };
        await addItem(target.uuid, effect)
    } else if (("appliedDamage" in message?.flags?.pf2e && !message?.flags?.pf2e?.appliedDamage?.isHealing)) {
        const shieldEffect = message.actor.itemTypes.effect.find(a => a.slug === 'effect-shield-warden');
        if (!shieldEffect) {
            return
        }
        if (message.flags.pf2e?.appliedDamage?.shield?.damage > 0) {
            const shield = await fromUuid(shieldEffect.system.content.origin.item);
            if (shield) {
                await shield.update({"system.hp.value": shield.system.hp.value - message.flags.pf2e.appliedDamage.shield.damage})
            }
            shieldEffect.delete();
        }
    }
}

async function actorRollSaveThrow(target, save, dc, item, origin) {
    if (!target) {
        return
    }
    if (!target.canUserModify(game.user, "update")) {
        executeAsGM("actorRollSaveThrow", {
            target: target.uuid,
            save,
            dc,
            item: item?.uuid,
            origin: origin.uuid
        });
        return
    }
    return await target.saves[save].roll({
        dc,
        origin,
        item
    })
}

async function rollDC(message, item, target, label, value) {
    await actorRollSaveThrow(target, "fortitude", {label, value}, item, message.actor);
}

async function weaponRunes(message) {
    if (!isCorrectMessageType(message, 'damage-roll')) {
        return false;
    }
    if (!criticalSuccessMessageOutcome(message) && !message?.flags?.pf2e?.criticalItems?.length) {
        return false;
    }
    if (!message.target?.actor) {
        return false;
    }
    let allWeapons = messageWeapons(message).filter(weapon => (weapon?.system?.runes?.property?.length > 0));
    if (!allWeapons.length) {
        return false;
    }
    let find = allWeapons.find(weapon => weapon.system.runes.property.includes("thundering"));
    if (find) {
        await rollDC(message, find, message.target.actor, `Thundering Rune DC`, 24)
    }
    let find1 = allWeapons.find(weapon => weapon.system.runes.property.includes("brilliant"));
    if (find1) {
        await rollDC(message, find1, message.target.actor, `Brilliant Rune DC`, 29)
    }
    let find2 = allWeapons.find(weapon => weapon.system.runes.property.includes("frost"));
    if (find2) {
        await rollDC(message, find2, message.target.actor, `Frost Rune DC`, 24)
    }

    let find3 = allWeapons.find(weapon => weapon.system.runes.property.includes("greaterThundering"));
    if (find3) {
        await rollDC(message, find3, message.target.actor, `Greater Thundering Rune DC`, 34)
    }
    let find4 = allWeapons.find(weapon => weapon.system.runes.property.includes("greaterBrilliant"));
    if (find4) {
        await rollDC(message, find4, message.target.actor, `Greater Brilliant Rune DC`, 41)
    }
    let find5 = allWeapons.find(weapon => weapon.system.runes.property.includes("greaterFrost"));
    if (find5) {
        await rollDC(message, find5, message.target.actor, `Greater Frost Rune DC`, 34)
    }
}

function getEffectsForOwner(actor, effs, ownerUuid) {
    return actor?.itemTypes?.effect
        .filter((c) => effs.includes(c.sourceId))
        .filter((a) => a?.system?.context?.origin?.actor === ownerUuid);
}

async function battleMedicineAction(message) {
    if (!isCorrectMessageType(message, "skill-check")) {
        return
    }
    if (game.combat?.started && hasOption(message, "action:treat-wounds") && message.isCheckRoll) {
        if (!hasOption(message, "feat:battle-medicine")) {
            ui.notifications.info(`${message.actor.name} hasn't Battle Medicine Feat`);
            return;
        }

        if (game.user.targets.size === 1) {
            const [first] = game.user.targets;

            const immuns = getEffectsForOwner(
                first.actor,
                ["Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", effectUUID('GMb4x4eHVGD9Tfzp')],
                message.actor.uuid
            );
            let applyTreatWoundsImmunity = true;

            if (immuns.length > 0) {
                if (hasOption(message, "feat:medic-dedication")) {
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
                // const optName = `Effect: Battle Medicine Immunity 1 Hour (${message.actor.name})`;
                if (isActorHeldEquipment(message.actor, "battle-medics-baton")
                    || hasOption(message, "feature:forensic-medicine-methodology")//forensic-medicine-methodology
                    || first.actor?.rollOptions.all["feat:robust-health"]
                ) {//1 hour
                    await setEffectToActor(first.actor, effectUUID('GMb4x4eHVGD9Tfzp'), undefined, {
                        name: `Effect: Battle Medicine Immunity 1 Hour (${message.actor.name})`,
                        icon: getSrc(message),
                        origin: {actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid},
                        duplication: true
                    })
                } else {
                    await setEffectToActor(first.actor, "Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", undefined, {
                        name: `Effect: Battle Medicine Immunity (${message.actor.name})`,
                        icon: getSrc(message),
                        origin: {actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid},
                        duplication: true
                    })
                }
            } else {
                ui.notifications.info(`${first.actor.name} has Battle Medicine Immunity`);
            }
        }
    }
}

async function debilitatingStrikeAttack(message) {
    if (!isCorrectMessageType(message, "attack-roll")) {
        return
    }
    if (anyFailureMessageOutcome(message)) {
        return
    }
    if (!hasOption(message, 'target:condition:off-guard')) {
        return
    }

    if (criticalSuccessMessageOutcome(message)) {
        if (hasOption(message, 'second-debilitation:critical')
            || hasOption(message, 'debilitation:critical')
        ) {
            message.actor.itemTypes.feat.find(a => 'Compendium.pf2e.feats-srd.Item.lPTcPIshChHWz4J6' === a.sourceId)?.toMessage()
        }
    }

    let eff = 'Compendium.pf2e.feat-effects.Item.yBTASi3FvnReAwHy' //Effect: Debilitating Strike
    let effDamage = 'Compendium.pf2e.feat-effects.Item.ZZXIUvZqqIxkMfYa' //Effect: Precise Debilitations
    if (hasOption(message, 'second-debilitation:off-guard')
        || hasOption(message, 'second-debilitation:enfeebled')
        || hasOption(message, 'second-debilitation:speed-penalty')
        || hasOption(message, 'second-debilitation:precision-damage')
        || hasOption(message, 'second-debilitation:reduce-cover')
        || hasOption(message, 'second-debilitation:prevent-flanking')
        || hasOption(message, 'debilitation:off-guard')
        || hasOption(message, 'debilitation:enfeebled')
        || hasOption(message, 'debilitation:speed-penalty')
        || hasOption(message, 'debilitation:precision-damage')
        || hasOption(message, 'debilitation:reduce-cover')
        || hasOption(message, 'debilitation:prevent-flanking')
    ) {
        const exist = getEffectsForOwner(message.target.actor, [eff, effDamage], message.actor.uuid);
        if (exist) {
            for (const i of exist) {
                await deleteItem(i)
            }
        }

        hasEffectBySourceId(message.actor, effDamage)?.delete()

        if (hasOption(message, 'second-debilitation:precision-damage') || hasOption(message, 'debilitation:precision-damage')) {
            await message.actor.createEmbeddedDocuments("Item", [(await fromUuid(effDamage)).toObject()])

            const aEffect = (await fromUuid(effDamage)).toObject();
            aEffect.system.context = foundry.utils.mergeObject(aEffect.system.context ?? {}, {
                origin: {actor: message.actor.uuid, item: message.item.uuid, token: message.token.uuid},
            });
            await addItemToActor(message.target.actor, aEffect);
        }
    }
}

async function debilitatingStrike(message) {
    if (!message.target?.actor) {
        return
    }
    if (!isCorrectMessageType(message, "damage-roll")) {
        await debilitatingStrikeAttack(message)
        return;
    }

    let rules = []

    if (hasOption(message, 'target:condition:off-guard')) {
        if (hasOption(message, 'second-debilitation:enfeebled') || hasOption(message, 'debilitation:enfeebled')) {
            rules.push({
                "key": "GrantItem",
                "onDeleteActions": {
                    "grantee": "restrict"
                },
                "uuid": "Compendium.pf2e.conditionitems.Item.MIRkyAjyBeXivMa7"
            })
        }

        if (hasOption(message, 'second-debilitation:speed-penalty') || hasOption(message, 'debilitation:speed-penalty')) {
            rules.push({
                "key": "FlatModifier",
                "selector": "speed",
                "slug": "second-debilitation-speeds",
                "type": "circumstance",
                "value": -10
            })
        }

        if (hasOption(message, 'second-debilitation:reduce-cover') || hasOption(message, 'debilitation:reduce-cover')) {
            rules.push({
                "key": "AdjustModifier",
                "mode": "add",
                "selector": "ac",
                "slug": "cover",
                "value": -2
            });
            rules.push({
                "key": "AdjustModifier",
                "mode": "upgrade",
                "selector": "ac",
                "slug": "cover",
                "value": 0
            });
        }

        if (hasOption(message, 'second-debilitation:off-guard') || hasOption(message, 'debilitation:off-guard')) {
            rules.push({
                "key": "GrantItem",
                "onDeleteActions": {
                    "grantee": "restrict"
                },
                "uuid": "Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg"
            })
        }

        if (hasOption(message, 'second-debilitation:prevent-flanking') || hasOption(message, 'debilitation:prevent-flanking')) {
            rules.push({
                "key": "ActiveEffectLike",
                "mode": "override",
                "path": "system.attributes.flanking.canFlank",
                "value": false
            });
        }
    }

    if (rules.length === 0) {
        return
    }

    let eff = 'Compendium.pf2e.feat-effects.Item.yBTASi3FvnReAwHy' //Effect: Debilitating Strike
    const aEffect = (await fromUuid(eff)).toObject();
    aEffect.system.rules = rules;
    aEffect.system.context = foundry.utils.mergeObject(aEffect.system.context ?? {}, {
        origin: {actor: message.actor.uuid, item: message.item?.uuid, token: message.token.uuid},
    });
    addItemToActor(message.target.actor, aEffect);
}

async function familiarBalancedLuck(message) {
    if (!message?.token?.scene) {
        return
    }
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    if (!message?.item?.traits?.has('hex')) {
        return
    }
    let familiar = message.token.scene.tokens.find(a => a.actor?.type === 'familiar' && a.actor?.master === message.actor && a.actor.items.find(a => a.slug === 'familiar-of-balanced-luck'))
    if (!familiar) {
        return
    }

    let targets = (game.combat ? game.combat.turns.filter(a => distanceIsCorrect(familiar, a.token, 15)).map(a => a.actor) : [])
    if (targets.length === 0) {
        return
    }

    let buff = effectUUID('6NKMkaEvSWRY78wG')
    let debuff = effectUUID('AGXI9lBnnuEPYDGX')

    const options = targets.map(a => {
        return `<option value="${a.uuid}" >${a.name}</option>`
    })

    const {target, effect} = await Dialog.wait({
        title: "Familiar of Balanced Luck",
        content: `
            <h3>Targets</h3>
            <select id="target">
                ${options}
            </select>
            <select id="effect">
                <option value="${buff}" >+1 AC</option>
                <option value="${debuff}" >-1 AC</option>
            </select>
            <hr>
        `,
        buttons: {
            ok: {
                label: "Attack",
                icon: "<i class='fa-solid fa-hand-fist'></i>",
                callback: (html) => {
                    return {
                        target: html[0].querySelector("#target").value,
                        effect: html[0].querySelector("#effect").value
                    }
                }
            },
            cancel: {
                label: "Cancel",
                icon: "<i class='fa-solid fa-ban'></i>",
            }
        },
        default: "ok"
    });
    if (!target || !effect) {
        return
    }

    let effObj = (await fromUuid(effect)).toObject();
    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        }
    });

    await addItem(target, effObj);
}


async function familiarFlowingScript(message) {
    if (!message?.token?.scene) {
        return
    }
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    if (!message?.item?.traits?.has('hex')) {
        return
    }
    let familiar = message.token.scene.tokens.find(a => a.actor?.type === 'familiar' && a.actor?.master === message.actor && a.actor.items.find(a => a.slug === 'familiar-of-flowing-script'))?.actor
    if (!familiar) {
        return
    }

    let effect = effectUUID('sPASbnNqRjt2pZWv')
    let effObj = (await fromUuid(effect)).toObject()
    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        }
    });

    await addItemToActor(familiar, effObj);
}

async function familiarFreezingRime(message) {
    if (!message?.token?.scene) {
        return
    }
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    if (!message?.item?.traits?.has('hex')) {
        return
    }
    let familiar = message.token.scene.tokens.find(a => a.actor?.type === 'familiar' && a.actor?.master === message.actor && a.actor.items.find(a => a.slug === 'familiar-of-freezing-rime'))
    if (!familiar) {
        return
    }

    const result = await Dialog.confirm({
        title: `Familiar Ability`,
        content: `Add Burst centered on a square of your familiar's space?`,
    });
    if (!result) {
        return
    }

    familiar.scene.createEmbeddedDocuments("MeasuredTemplate", [{
        x: familiar.x,
        y: familiar.y,
        distance: 5,
        flags: {
            pf2e: {areaType: 'burst'},
            "enhanced-terrain-layer": {
                active: true,
                cost: 2
            }
        }
    }]);
}

async function familiarKeenSenses(message) {
    if (!message?.token?.scene) {
        return
    }
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    if (!message?.item?.traits?.has('hex')) {
        return
    }
    let familiar = message.token.scene.tokens.find(a => a.actor?.type === 'familiar' && a.actor?.master === message.actor && a.actor.items.find(a => a.slug === 'familiar-of-keen-senses'))?.actor
    if (!familiar) {
        return
    }

    let effect = "Compendium.pf2e.feat-effects.Item.4wJM0OA9y2gsBAh7";
    let effObj = (await fromUuid(effect)).toObject();
    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        }
    });
    await addItemToActor(familiar, effObj);
}

async function familiarRestoredSpirit(message) {
    if (!message?.token?.scene) {
        return
    }
    if (!isCorrectMessageType(message, undefined) && !isCorrectMessageType(message, "spell-cast")) {
        return
    }
    if (!message?.item?.traits?.has('hex')) {
        return
    }
    let familiar = message.token.scene.tokens.find(a => a.actor?.type === 'familiar' && a.actor?.master === message.actor && a.actor.items.find(a => a.slug === 'familiar-of-restored-spirit'))
    if (!familiar) {
        return
    }

    let targets = (game.combat ? game.combat.turns.filter(a => distanceIsCorrect(familiar, a.token, 15))
        .filter(a => a.actor.isAllyOf(message.actor) || a.actor === message.actor)
        .map(a => a.actor) : [])

    if (targets.length === 0) {
        return
    }

    const options = targets.map(a => {
        return `<option value="${a.uuid}" >${a.name}</option>`
    })

    const {target} = await Dialog.wait({
        title: "Familiar of Restored Spirit",
        content: `
            <h3>Targets</h3>
            <select id="target">
                ${options}
            </select>
            <hr>
        `,
        buttons: {
            ok: {
                label: "Attack",
                icon: "<i class='fa-solid fa-hand-fist'></i>",
                callback: (html) => {
                    return {target: html[0].querySelector("#target").value}
                }
            },
            cancel: {
                label: "Cancel",
                icon: "<i class='fa-solid fa-ban'></i>",
            }
        },
        default: "ok"
    });
    if (!target) {
        return
    }


    let effect = "Compendium.pf2e.feat-effects.Item.twvhTLrLEfr7dz1m"
    let effObj = (await fromUuid(effect)).toObject();
    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        }
    });
    await addItem(target, effObj);
}

async function martialPerformance(message) {
    if (!isCorrectMessageType(message, "damage-roll")) {
        return
    }
    if (!hasDomain(message, "strike-damage")) {
        return
    }

    let inspireCourage = hasEffectBySourceId(message.actor, effectUUID('RR8MSbHqxJdQxh2e'));
    let inspireDefense = hasEffectBySourceId(message.actor, effectUUID('g2LBvDHPRZBabiU2'));
    let songOfStrength = hasEffectBySourceId(message.actor, effectUUID('7kyjK9Pm7wKSZtdQ'));
    let xdyInspireCourage = hasEffectBySourceId(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.KIPV1TiPCzlhuAzo");
    let xdyInspireDefense = hasEffectBySourceId(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.tcnjhVxyRchqjt71");

    let selected = inspireCourage && !inspireCourage.getFlag(moduleName, "extendedMartialPerformance")
        ? inspireCourage
        : inspireDefense && !inspireDefense.getFlag(moduleName, "extendedMartialPerformance")
            ? inspireDefense
            : songOfStrength && !songOfStrength.getFlag(moduleName, "extendedMartialPerformance")
                ? songOfStrength
                : xdyInspireCourage && !xdyInspireCourage.getFlag(moduleName, "extendedMartialPerformance")
                    ? xdyInspireCourage
                    : xdyInspireDefense && !xdyInspireDefense.getFlag(moduleName, "extendedMartialPerformance")
                        ? xdyInspireDefense : null


    if (selected) {
        await selected.update({
            "system.duration.value": selected.system.duration.value + 1,
            [`flags.${moduleName}.extendedMartialPerformance`]: true
        })
    }
}

async function sorcerousSweets(message) {
    if (game.user.targets.size !== 1) {
        return
    }
    if (message?.item?.sourceId !== actionUUID('4um6b6ZCdPcXROtG')) {
        return
    }
    let target = game.user.targets.first().actor;
    let _obj = (await fromUuid(equipmentUUID('mlzLmD33eNyJSrGj'))).toObject();
    _obj.system.level.value = message.actor.level;

    addItemToActor(target, _obj)
}

async function inkSpray(message) {
    if (!isCorrectMessageType(message, 'saving-throw')) {
        return
    }
    if (criticalSuccessMessageOutcome(message)) {
        return
    }
    const origin = await fromUuid(message?.flags?.pf2e?.origin?.uuid);
    if (!origin || "ink-spray" !== origin.slug) {
        return
    }

    const effect = (await fromUuid(effectUUID('lDuNGtQSwHxy8FLw'))).toObject();
    effect.system.context = foundry.utils.mergeObject(effect.system.context ?? {}, {
        "origin": {
            "actor": origin.actor?.uuid,
            "item": origin.uuid
        }
    });

    let units = "rounds"
    let value = 2;
    if (failureMessageOutcome(message)) {
        units = "minutes"
        value = 1;
    } else if (criticalFailureMessageOutcome(message)) {
        units = "minutes"
        value = 10;
    }

    effect.system.duration.unit = units;
    effect.system.duration.value = value;

    await addItemToActor(message.actor, effect);

    let invisible = message.actor.itemTypes.condition.find(c => c.slug === 'invisible');
    let concealed = message.actor.itemTypes.condition.find(c => c.slug === 'concealed');
    if (invisible) {
        await invisible.delete()
        increaseConditionForActor(message.actor, "concealed");
    } else if (concealed) {
        concealed.delete()
    }
}

async function turnOfFate(message) {
    if (!isCorrectMessageType(message, 'saving-throw')) {
        return
    }
    if (anySuccessMessageOutcome(message)) {
        return
    }
    const origin = await fromUuid(message?.flags?.pf2e?.origin?.uuid);
    if (!origin || "turn-of-fate" !== origin.slug) {
        return
    }
    const effect = (await fromUuid(effectUUID('djfRMv5xXOgHAbkz'))).toObject();
    effect.system.context = foundry.utils.mergeObject(effect.system.context ?? {}, {
        "origin": {
            "actor": origin.actor?.uuid,
            "item": origin.uuid
        }
    });

    if (criticalFailureMessageOutcome(message)) {
        effect.system.badge.value = 3;
    }

    await addItemToActor(message.actor, effect);
}

async function intimidationStrike(message) {
    if (
        (isCorrectMessageType(message, "attack-roll") && message.item?.isMelee && anyFailureMessageOutcome(message))
        || (anySuccessMessageOutcome(message) && message.item?.isMelee && isCorrectMessageType(message, "damage-roll"))
    ) {
        const eff = hasEffectBySourceId(message?.actor, effectUUID('w9i0aY2IQ3jvCX9K'))
        if (eff) {
            await deleteItem(eff);
        }
    }
}

async function deleteMightyRage(message) {
    if (
        (isCorrectMessageType(message, "attack-roll") && message.item?.isMelee && anyFailureMessageOutcome(message))
        || (anySuccessMessageOutcome(message) && isCorrectMessageType(message, "damage-roll"))
    ) {
        if (message.actor?.rollOptions.all['mighty-rage-attack']) {
            await message.actor.toggleRollOption("all", 'mighty-rage-attack')
        }
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

function getFeatBySourceId(actor, eff) {
    return actor?.itemTypes?.feat?.find((c) => eff === c.sourceId);
}

async function explorationEffects(actor, data) {
    if (!data?.system?.exploration) {
        return;
    }

    const party = game.actors.filter(a => a.isOfType("party")).find(a => a.members.find(b => b.id === actor.id));
    const slugs = data.system.exploration.map(b => actor.itemTypes.action.find(a => a.id === b)).filter(a => !!a).map(a => a.slug);
    const _keys = Object.keys(activityExplorationEffects);

    Object.values(activityExplorationEffects).map(a => hasEffectBySourceId(actor, a)).filter(a => !!a).forEach(async a => {
        const _key = _keys.find(key => activityExplorationEffects[key] === a.sourceId);
        if (!slugs.includes(_key)) {
            a.delete()
            if (a.sourceId === "Compendium.pf2e-automations.effects.Item.XiVLHjg5lQVMX8Fj") {
                let tok = actor.getActiveTokens()[0];

                if (tok) {
                    tok.control({releaseOthers: true})
                    let pack = game.packs.get("perceptive.perceptive");
                    executeMacro((await pack.getDocuments()).find((i) => i.name === 'Remove lingering AP selected')?.toObject())
                    tok.release()
                }
            }
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
        await setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF", undefined, {origin: {actor: actor?.uuid}})
    }

    if (party) {
        const is = getFeatBySourceId(actor, "Compendium.pf2e.feats-srd.Item.aFoVHsuInMOkTZoQ");//Incredible Scout
        const ded = getFeatBySourceId(actor, "Compendium.pf2e.feats-srd.Item.qMa2fIP2nqrFzHrq");//Scout Dedication

        if (slugs.includes("scout")) {
            party.members.filter(a => a.uuid !== actor.uuid).forEach(async (tt) => {
                await setEffectToActor(tt, ded ? effectUUID('U7tuKcRePhSu2C2P') : is ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF", undefined, {origin: {actor: actor?.uuid}})
            })
        } else {
            party.members.filter(a => a.uuid !== actor.uuid).forEach(async (tt) => {
                let _ef = hasEffectBySourceId(tt, ded ? effectUUID('U7tuKcRePhSu2C2P') : is ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
                if (_ef && _ef?.system?.context?.origin?.actor === actor.uuid) {
                    await deleteItem(_ef)
                }

            })
        }
    }
}

async function notifyExplorationActivity(actor, data) {
    if (!data?.system?.exploration) {
        return;
    }
    if (!actor.system.exploration) {
        return;
    }
    let newActivity = data.system.exploration.map(a => actor.items.get(a).name);
    let oldActivity = foundry.utils.deepClone(actor.system.exploration).map(a => actor.items.get(a).name);

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
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: messages.join(' ')
        });
    }
}

async function guidanceImmunity(effect) {
    if (effect.slug === "spell-effect-guidance") {
        await setEffectToActor(effect.actor, "Compendium.pf2e.spell-effects.Item.3LyOkV25p7wA181H");
    }
}

async function unleashPsyche(effect) {
    if (effect.slug === "effect-unleash-psyche") {
        await setEffectToActor(effect.actor, effectUUID('P54XrNMIaS7VAhXa'));
    }
}

const ANIMAL_OR_PLANT_IDS = ["Compendium.pf2e.equipment-srd.Item.L9ZV076913otGtiB"];

async function bagOfDevouringDelete(item, options, id) {
    bagOfDevouring(item, {deleted: true}, options, id)
}

function bagOfDevouring(item, changes) {
    let json = item.toJSON()
    if (!item?.system?.containerId) {
        return
    }

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

    let container = item.actor.items.get(item.system.containerId)
    if (container && ["Compendium.pf2e.equipment-srd.Item.MN8SF2sArQhJg6QG", "Compendium.pf2e.equipment-srd.Item.EIBmADRICTyYzxik", "Compendium.pf2e.equipment-srd.Item.n3kJYoTrzXYwlYaV"].includes(container.sourceId)) {
        //roll flat if animal or plant
        if (ANIMAL_OR_PLANT_IDS.includes(item.sourceId)) {
            game.pf2e.Check.roll(new game.pf2e.StatisticModifier(`${container.name} - Flat Check`, []), {
                options: ["flat-check"],
                type: 'flat-check',
                dc: {value: 9}
            });
        }
    }
}

async function bagOfWeaselsDelete(item, options, id) {
    bagOfWeasels(item, {deleted: true}, options, id)
}

function bagOfWeasels(item, changes) {
    let json = item.toJSON()
    if (!item?.system?.containerId) {
        return
    }

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

    let container = item.actor.items.get(item.system.containerId)
    if (container && ["Compendium.pf2e.equipment-srd.Item.W5znRDeklmWEGzFY"].includes(container.sourceId)) {
        game.pf2e.Check.roll(new game.pf2e.StatisticModifier(`${container.name} - Flat Check`, []), {
            options: ["flat-check"],
            type: 'flat-check',
            dc: {value: 11}
        });
    }
}

async function deleteMetalCarapace(item) {
    await handleDeleteArmorEffect(item, 'wITJ6L8mcbbgoCHu', 'A0AP7oLqdRwOCje7')
}

async function deleteHardwoodArmor(item) {
    await handleDeleteArmorEffect(item, 'mxIt7zfVKgLZ8AeC', '9jbCQQAzUbXNGzZq')
}

async function deleteArmorInEarth(item) {
    await handleDeleteArmorEffect(item, 'NT4T6gEdEQsoHItQ', 'TDvicwRah0zBhsYg')
}

async function handleDeleteArmorEffect(item, effectUuid, equipmentUuid) {
    if (item.sourceId !== effectUUID(effectUuid)) {
        return
    }
    await item.actor.itemTypes.armor.find(a => a.sourceId === equipmentUUID(equipmentUuid))?.delete()

    let armorId = item.getFlag(moduleName, 'oldArmor');
    let oldArmorBulk = item.getFlag(moduleName, 'oldArmorBulk');
    if (armorId) {
        let armor = item.actor.items.get(armorId);
        if (armor) {
            await item.actor.changeCarryType(armor, {carryType: 'worn', inSlot: true})
            if (oldArmorBulk !== undefined) {
                await armor.update({"system.bulk.value": oldArmorBulk})
            }

        }
    }
}

async function deleteMetalCarapaceShield(item) {
    if (item.sourceId !== effectUUID('aH805tedt3A5Suuc')) {
        return
    }
    await item.actor.itemTypes.shield.find(a => a.sourceId === equipmentUUID('Yr9yCuJiAlFh3QEB'))?.delete()
}

async function deleteHardwoodArmorShield(item) {
    if (item.sourceId !== effectUUID('iqvdFq5V1b2HSAW4')) {
        return
    }
    await item.actor.itemTypes.shield.find(a => a.sourceId === equipmentUUID('gkqzWcFgbib1BFne'))?.delete()
}

async function removeStances(item) {
    if (item.sourceId !== "Compendium.pf2e.conditionitems.Item.fBnFDH2MTzgFijKf") {
        return
    }//Unconscious

    item.actor.itemTypes.effect
        .filter(a => a.slug && a.slug.startsWith('stance-'))
        .forEach(eff => {
            eff.delete()
        });

    hasEffectBySourceId(item.actor, "Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr")?.delete();
    hasEffectBySourceId(item.actor, "Compendium.pf2e.feat-effects.Item.RoGEt7lrCdfaueB9")?.delete();
}

async function refocus(item) {
    if (item?.flags?.core?.sourceId === effectUUID('ThF8UIN5093xtCaq')) {
        await item.actor.update({"system.resources.focus.value": item.actor.system.resources.focus.value + 1});
        ui.notifications.info(`Focus point was restored`);
    }
}

async function blessingOfDefiance(item) {
    if (item.sourceId !== "Compendium.pf2e.spell-effects.Item.FD9Ce5pqcZYstcMI") {
        return
    }
    if (item.flags?.pf2e?.rulesSelections?.blessingOfDefianceActions !== "three") {
        return
    }
    if (item.flags?.[moduleName]?.ignoreBlessingOfDefiance) {
        return
    }
    let activeToken = item.actor?.getActiveTokens(true, false)?.[0];
    if (!activeToken) {
        return
    }

    let targetActors = activeToken.scene.tokens.filter(a => a.object.distanceTo(activeToken) <= 30)
        .map(a => a.actor)
        .filter(a => a.isAllyOf(activeToken.actor))

    let eff = item.toObject();
    eff.flags = item.flags;
    eff.flags[moduleName] = {ignoreBlessingOfDefiance: true};
    eff.system.context = foundry.utils.mergeObject(eff.system.context ?? {}, {
        "origin": {
            "actor": item.actor.uuid,
            "item": item?.uuid,
            "token": activeToken.document.uuid
        }
    });

    for (const actor of targetActors) {
        await addItemToActor(actor, eff)
    }
}

async function createSpikeSkin(item) {
    if (item.sourceId !== effectUUID('J3GGbKP247JWY883')) {
        return
    }

    game.combat?.turns?.map(cc => cc.actor)?.filter(a => a !== item.actor)?.forEach(a => {
        deleteItem(hasEffectBySourceId(a, effectUUID('J3GGbKP247JWY883')))
    });
}

async function metalCarapaceShield(item) {
    if (item.sourceId !== effectUUID('aH805tedt3A5Suuc')) {
        return
    }

    let sourceId = equipmentUUID('Yr9yCuJiAlFh3QEB')
    let _obj = (await fromUuid(sourceId)).toObject();
    if (item.actor.level >= 3) {
        _obj.system.hardness += 1;
        _obj.system.hp.value += 4;
        _obj.system.hp.max += 4;
    }

    let addedArmor = (await item.actor.createEmbeddedDocuments("Item", [_obj]))[0]
    if (addedArmor) {
        await item.actor.changeCarryType(addedArmor, {carryType: "held", handsHeld: 1})
    }
}

async function metalCarapace(item) {
    if (item.sourceId !== effectUUID('wITJ6L8mcbbgoCHu')) {
        return
    }

    await applyEffectArmor(item, 'A0AP7oLqdRwOCje7', null, async (item) => {
        if (item.actor?.rollOptions.all['hands-free:1'] || item.actor.rollOptions.all['hands-free:2']) {
            const confirm = await Dialog.confirm({
                title: "Metal Carapace",
                content: "Do you want to create Rusty Steel Shield?",
            });
            if (!confirm) {
                return
            }

            await setEffectToActor(item.actor, effectUUID("aH805tedt3A5Suuc"), item?.level);
        }
    });
}

async function hardwoodArmorShield(item) {
    if (item.sourceId !== effectUUID('iqvdFq5V1b2HSAW4')) {
        return
    }

    let sourceId = equipmentUUID('gkqzWcFgbib1BFne')
    let _obj = (await fromUuid(sourceId)).toObject();
    if (item.actor.level >= 3) {
        _obj.system.hardness += 1;
        _obj.system.hp.value += 4;
        _obj.system.hp.max += 4;
    }

    let addedArmor = (await item.actor.createEmbeddedDocuments("Item", [_obj]))[0]
    if (addedArmor) {
        await item.actor.changeCarryType(addedArmor, {carryType: "held", handsHeld: 1})
    }
}

async function hardwoodArmor(item) {
    if (item.sourceId !== effectUUID('mxIt7zfVKgLZ8AeC')) {
        return
    }

    await applyEffectArmor(item, '9jbCQQAzUbXNGzZq', null, async (item) => {
        if (item.actor?.rollOptions.all['hands-free:1'] || item.actor.rollOptions.all['hands-free:2']) {
            const confirm = await Dialog.confirm({
                title: "Hardwood Armor",
                content: "Do you want to create Hardwood Shield?",
            });
            if (!confirm) {
                return
            }

            await setEffectToActor(item.actor, effectUUID("iqvdFq5V1b2HSAW4"), item?.level);
        }
    });
}

async function ArmorInEarth(item) {
    if (item.sourceId !== effectUUID('NT4T6gEdEQsoHItQ')) {
        return
    }

    await applyEffectArmor(item, 'TDvicwRah0zBhsYg', (item, _obj) => {
        if (item.actor.level >= 3) {
            _obj.system.acBonus = 5;
            _obj.system.traits.value.push("bulwark")
        }
    })
}

async function applyEffectArmor(item, armorUUID, handleItemLevel, afterAdd) {
    let wornArmor = item.actor.itemTypes.armor.filter(a => a.isWorn && a.system.equipped.inSlot)[0]
    if (wornArmor?.id) {
        await item.setFlag(moduleName, 'oldArmor', wornArmor.id)
        await item.setFlag(moduleName, 'oldArmorBulk', wornArmor.system.bulk.value)
        await wornArmor.update({"system.bulk.value": Math.max(wornArmor.system.bulk.value - 1, 0)})
    }

    let sourceId = equipmentUUID(armorUUID)

    let _obj = (await fromUuid(sourceId)).toObject();
    if (wornArmor) {
        _obj.system.runes = wornArmor.system.runes
        _obj.system.bulk.value = 0
    }
    let defenses = item.actor.system.proficiencies.defenses
    let maxCategory = Object.keys(defenses).reduce(function (a, b) {
        return defenses[a].value > defenses[b].value ? a : b
    })
    if (maxCategory) {
        _obj.system.category = maxCategory;
    }

    if (handleItemLevel) {
        await handleItemLevel(item, _obj)
    }

    let addedArmor = (await item.actor.createEmbeddedDocuments("Item", [_obj]))[0]
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

function handleRollDefDice(r) {
    r._evaluated = false;
    if (r.constructor.name === 'DamageInstance') {
        for (const rr of r.terms) {
            handleRollDefDice(rr)
        }
    } else if (r.constructor.name === 'Grouping') {
        r.term._evaluated = false;
        for (const rr of r.term.operands) {
            handleRollDefDice(rr)
        }
    } else if (r instanceof Die) {
        r._evaluated = true;
        r.results = r.results.map(q => {
            return {result: Math.ceil((r.faces / 2) + 1), active: q.active}
        })
    }
}

async function spikeSkin(message, user, _options) {
    if (!message.isDamageRoll) {
        return
    }
    if (!PHYSICAL_DAMAGE_TYPES.some(dt => message.rolls[0].formula.includes(dt))) {
        return
    }

    let target = message.rolls[0].formula.includes('bleed') && message.flags.pf2e?.origin?.uuid
        ? message.actor
        : message.target?.actor

    if (!target) {
        return
    }
    let eff = hasEffectBySourceId(target, effectUUID('J3GGbKP247JWY883'))
    if (!eff) {
        return
    }

    updateItem(eff, {"system.duration.value": eff.system.duration.value - 1})
}

async function spikeSkinDamage(message, user, _options) {
    if (!message.isDamageRoll) {
        return
    }
    if (!message.actor) {
        return
    }
    if (!hasEffectBySourceId(message?.target?.actor, effectUUID('J3GGbKP247JWY883'))) {
        return
    }

    let weapon = message.actor.system.actions[message.flags.pf2e?.strike?.index]?.item
    if (!weapon) {
        return;
    }

    if (weapon.isMelee && !weapon?.traits?.has('reach')) {
        message.token.object.setTarget(true, {releaseOthers: true})
        await applyDamage(message.actor, message.token, `2[piercing]`)
        message.token.object.setTarget(false)
    }
}

async function imposeOrderPsy(message, user, _options) {
    if (!isCorrectMessageType(message, "damage-roll")) {
        return
    }
    if (!hasEffectBySourceId(message.actor, effectUUID("s3N22GgSxeWZ2bM8"))) {
        return
    }

    let roll = message.rolls[0];
    roll._evaluated = false;
    roll.terms[0]._evaluated = false;
    roll.terms[0].results = [];
    for (const r of roll.terms[0].rolls) {
        handleRollDefDice(r)
    }
    await roll.evaluate({async: true});

    await message.update({
        'rolls': [roll],
        content: `${roll.total}`
    });
}

async function buzzingBites(message) {
    if (!isCorrectMessageType(message, 'saving-throw') || !message?.flags?.pf2e?.origin?.uuid) {
        return
    }
    if (criticalSuccessMessageOutcome(message)) {
        return
    }
    let spell = await fromUuid(message?.flags?.pf2e?.origin?.uuid);
    if (!spell || spell.slug !== "buzzing-bites") {
        return;
    }

    const eff = effectUUID('Vn57RpGjnNBtAfnj');//Buzzing Bites effect
    const effObj = (await fromUuid(eff)).toObject();
    effObj.flags[moduleName] = {
        'sustained-damage': {
            outcome: message.flags.pf2e.context.outcome,
            spell: message?.flags?.pf2e?.origin?.uuid,
            castRank: message.flags.pf2e.origin.castRank,
        }
    }

    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        origin: {actor: spell.actor?.uuid, item: spell?.uuid}
    });

    await message.actor.createEmbeddedDocuments("Item", [effObj])
}

async function synesthesia(message) {
    if (!isCorrectMessageType(message, 'saving-throw')) {
        return
    }
    if (criticalSuccessMessageOutcome(message)) {
        return
    }
    let spell = await fromUuid(message?.flags?.pf2e?.origin?.uuid);
    if (!spell || spell.slug !== "synesthesia") {
        return;
    }

    const eff = effectUUID('dyuItanPd1SRPZBc');//Synesthesia effect
    const effObj = (await fromUuid(eff)).toObject();
    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        origin: {actor: spell.actor?.uuid, item: spell?.uuid}
    });

    if (successMessageOutcome(message)) {
        effObj.system.duration.unit = "rounds";//1 round
    }

    await message.actor.createEmbeddedDocuments("Item", [effObj])
}

async function channelingBlock(message) {
    if (message.item?.slug !== "channeling-block") {
        return;
    }

    let spellcastingEntry = message.actor.itemTypes.spellcastingEntry.find(a => a.system.prepared.value === "prepared");
    if (!spellcastingEntry) {
        return
    }

    let checkData = {};

    for (const key in spellcastingEntry.system.slots) {
        if (['slot0', 'slot11'].includes(key)) {
            continue
        }
        if (!spellcastingEntry.system.slots[key].max) {
            continue
        }
        let value = spellcastingEntry.system.slots[key];
        for (const p in value.prepared) {
            if (!value.prepared[p].id || value.prepared[p].expended) {
                continue
            }
            let spell = spellcastingEntry.spells.get(value.prepared[p].id);
            if (!['heal', 'harm'].includes(spell.slug)) {
                continue
            }

            checkData[`${spell.name}-${key.replace('slot', '')}`] = p
        }
    }

    if (!Object.keys(checkData).length) {
        return
    }

    let options = ''
    for (let key in checkData) {
        let split = key.split('-')
        options += `<option value=${split[1]} data-slot-id=${checkData[key]}>${split[0]} ${split[1]} Rank spell</option>`;
    }

    const confirm = await Dialog.confirm({
        title: "Channeling Block",
        content: `Select level of harm/ heal spell</br></br><select id="map">
                    ${options}
                </select></br></br>`,
        yes: (html) => {
            return {groupId: Number(html.find("#map").val()), 'slotId': html.find("#map  :selected").data('slotId')}
        }
    });
    if (!confirm) {
        return
    }

    await message.actor.spellcasting.collections.get(spellcastingEntry.id)
        ?.setSlotExpendedState(confirm.groupId, confirm.slotId, true);

    let source = (await fromUuid(effectUUID("An3CuEIthnfIYnid"))).toObject();
    source.system.level.value = confirm.groupId;
    await message.actor.createEmbeddedDocuments("Item", [source]);
}

async function forcibleEnergy(message) {
    if (message.item?.slug !== "forcible-energy") {
        return;
    }
    const parent = game.user.targets.first().actor;
    if (!parent) {
        ui.notifications.info(`Need to select target`);
        return;
    }

    let itemSource = (await fromUuid('Compendium.pf2e.feat-effects.Item.0Ai0u9kNJrEudPnN'))?.toObject();
    itemSource.system.context = {
        "origin": {
            "actor": message.flags.pf2e.origin.actor,
            "item": message.item.uuid,
            "rollOptions": message.flags.pf2e.origin.rollOptions,
            "spellcasting": null,
            "token": message.token.uuid
        }
    };
    itemSource = foundry.utils.deepClone(itemSource);
    let rule = itemSource.system.rules[0];

    const effect = new CONFIG.Item.documentClass(itemSource, {parent});

    const ele = new game.pf2e.RuleElements.builtin.ChoiceSet(foundry.utils.deepClone(rule), {parent: effect});
    await ele.preCreate({itemSource, ruleSource: rule, tempItems: []});

    if (parent.canUserModify(game.user, "update")) {
        await createDocumentsParent([itemSource], parent);
    } else {
        executeAsGM("createDocumentsParent", {data: [itemSource], parent: parent.uuid})
    }
}

async function tamper(message) {
    if (!hasOption(message, "action:tamper")) {
        return
    }
    if (anyFailureMessageOutcome(message)) {
        return
    }
    if (!message.target?.actor) {
        return
    }

    let parent = message.target.actor;

    const confirm = await Dialog.confirm({
        title: "Target of Tamper",
        content: `Select target</br></br><select id="map">
                    <option value="armor">Armor</option>
                    <option value="weapon">Weapon</option>
                </select></br></br>`,
        yes: (html) => html.find("#map").val()
    });
    if (!confirm) {
        return
    }

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

        if (parent.canUserModify(game.user, "update")) {
            await createDocumentsParent([itemSource], parent);
        } else {
            executeAsGM("createDocumentsParent", {data: [itemSource], parent: parent.uuid})
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

        const effect = new CONFIG.Item.documentClass(itemSource, {parent});

        const ele = new game.pf2e.RuleElements.builtin.ChoiceSet(foundry.utils.deepClone(rule), {parent: effect});
        await ele.preCreate({itemSource, ruleSource: rule, tempItems: []});

        if (parent.canUserModify(game.user, "update")) {
            await createDocumentsParent([itemSource], parent);
        } else {
            executeAsGM("createDocumentsParent", {data: [itemSource], parent: parent.uuid})
        }
    }
}

const RollInitiativeItems = [
    'Compendium.pf2e.feats-srd.Item.0IVnIC6gQUdQyM8b',
    'Compendium.pf2e.feats-srd.Item.ePObIpaJDgDb9CQj',
    'Compendium.pf2e.feats-srd.Item.18UQefmhcNq6tFav',
    'Compendium.pf2e.feats-srd.Item.3kH0fGOIoYvPNQsq',
    'Compendium.pf2e.feats-srd.Item.BV9k3nmVrWDLv8z6',
    'Compendium.pf2e.feats-srd.Item.Bk07joho2dUG3lVw',
    'Compendium.pf2e.feats-srd.Item.DmcJtpMBSh3R5MHI',
    'Compendium.pf2e.feats-srd.Item.Gcliatty0MGYbTVV',
    'Compendium.pf2e.feats-srd.Item.JJPoMcxUf3QoKA6h',
    'Compendium.pf2e.feats-srd.Item.LI9VtCaL5ZRk0Wo8',
    'Compendium.pf2e.feats-srd.Item.OOBSMpdAfYuiiQqo',
    'Compendium.pf2e.feats-srd.Item.QA4IJbtW1NoYJY9M',
    'Compendium.pf2e.feats-srd.Item.T8cBEhuHWkh3MqgO',
    'Compendium.pf2e.feats-srd.Item.UHJ93iBd1Q5iKbKa',
    'Compendium.pf2e.feats-srd.Item.tOtrtDR7ftHhPFm4',
    'Compendium.pf2e.feats-srd.Item.yeSyGnYDkl2GUNmu'
]

async function rollInitiative(message) {
    if (!hasOption(message, "check:statistic:initiative")) {
        return
    }

    for (let el of RollInitiativeItems) {
        let item = message.actor.items.find(a => a.sourceId === el);
        if (item) {
            if (
                await Dialog.confirm({
                    title: item.name,
                    content: "Do you want use free action?",
                })
            ) {
                await item.toMessage();
                return
            }
        }
    }

    //Quick-Tempered
    let quickTempered = getFeatBySourceId(message.actor, 'Compendium.pf2e.classfeatures.Item.04lXNnt73rF3RNc4');
    if (quickTempered) {
        let armor = message.actor?.itemTypes.armor.find(a => a.isEquipped && a.system.category === 'heavy');
        if (!hasOption(message, 'self:condition:encumbered') && !armor) {
            if (
                await Dialog.confirm({
                    title: "Quick-Tempered",
                    content: "Do you want use free action?",
                })
            ) {
                await quickTempered.toMessage();
                await setEffectToActor(message.actor, 'Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr');
            }
        }
    }
}

async function rageImmunity(item) {
    if (item.sourceId === "Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr") {
        await setEffectToActor(item.actor, 'Compendium.pf2e.feat-effects.Item.MaepXeSHiMoWDm7u');
    }
}

async function conjureBullet(message) {
    if (!isCorrectMessageType(message, undefined)) {
        return
    }
    if (message.item?.sourceId !== "Compendium.pf2e.actionspf2e.Item.KC6o1cvbr45xnMei") {
        return
    }

    let res = await foundry.applications.api.DialogV2.wait({
        content: "Select type of ammon",
        buttons: [{action: "bullet", label: "Bullet"}, {action: "bolt", label: "Bolt"}]
    });
    if (!res) {
        return
    }

    let uuid = res === "bullet"
        ? "Compendium.pf2e.equipment-srd.Item.MKSeXwUm56c15MZa"
        : "Compendium.pf2e.equipment-srd.Item.AITVZmakiu3RgfKo"
    let obj = (await fromUuid(uuid)).toObject()
    obj.system.quantity = 1
    obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {[moduleName]: {tempEndTurn: true}});

    await message.actor.createEmbeddedDocuments("Item", [obj]);
}

async function extendSmite(message) {
    if (!isCorrectMessageType(message, "attack-roll")
        || !message.target?.actor
        || !game.combat?.active
        || !message.actor.combatant
        || !message.target?.actor?.combatant
    ) {
        return
    }

    let enemies = game.combat.turns.filter(c => message.actor.isEnemyOf(c.actor));
    let smiteEffects = enemies.map(c => c.actor.itemTypes.effect
        .find(e => e.sourceId === "Compendium.pf2e.feat-effects.Item.AlnxieIRjqNqsdVu"))
        .filter(b => !!b);
    let effectsWithCorrectTarget = smiteEffects
        .filter(e => e.rules.find(r => r.key === "TokenMark" && r.uuid === message.token.uuid))

    effectsWithCorrectTarget.forEach(e => {
        e.update({
            "system.start": {
                value: game.time.worldTime,
                initiative: message.actor.combatant.initiative,
            },
            "system.duration.expiry": "turn-end"
        })
    })
}

async function pinpointPoisoner(message) {
    if (!message.actor?.rollOptions.all['feat:pinpoint-poisoner']
        || !isCorrectMessageType(message, "attack-roll")
        || !anySuccessMessageOutcome(message)
        || !message.target?.actor
        || !hasOption(message, "target:condition:off-guard")
    ) {
        return
    }

    let formula = await message.actor.system.actions.find(a => a.item === message.item)?.damage({getFormula: true})
    if (!formula.includes('poison')) {
        return
    }

    const aEffect = (await fromUuid("Compendium.pf2e.feat-effects.Item.XAdhPJqssO3v4Zvw")).toObject();
    aEffect.system.context = foundry.utils.mergeObject(aEffect.system.context ?? {}, {
        origin: {actor: message.actor.uuid, item: message.item.uuid, token: message.token.uuid},
    });
    await addItemToActor(message.target.actor, aEffect);
}

Hooks.on("pf2e.endTurn", combatant => {
    if (game.user !== game.users.activeGM) {
        return
    }
    combatant.actor.itemTypes.consumable.filter(i => i.getFlag(moduleName, "tempEndTurn")).forEach(i => {
        i.delete()
    })
});

async function gameHunter(message) {
    if (
        triggerType(message) !== 'attack-roll'
    ) {
        return
    }
    if (!checkPredicate([
        {
            "not": "target:effect:game-hunter-immunity"
        },
        {
            "or": [
                "outcome:success",
                "outcome:criticalSuccess",
            ]
        },
        "feat:game-hunter-dedication",
        "target:condition:off-guard",
        "hunted-prey",
        {
            "or": [
                "hunted-prey-game-hunter",
                "grants-hunt-prey:1"
            ]
        },
        {
            "or": [
                "target:trait:animal",
                "target:trait:beast",
                "target:trait:dragon"
            ]
        }
    ], await getRollOptions(message))
    ) {
        return
    }

    await actorRollSaveThrow(message.target.actor, 'fortitude', {
            label: `Game Hunter DC`,
            value: message.actor.attributes.classDC.value
        },
        message.actor.itemTypes.feat.find(f => f.slug === 'game-hunter-dedication'),
        message.actor
    )
}

async function apparitionSense(message) {
    if (message.item?.slug !== "apparition-sense") {
        return
    }
    if (!message.token) {
        return
    }

    let traits = message.token.scene.tokens
        .filter(token => token !== message.token)
        .filter(token => token.actor && !token.actor.isAllyOf(message.actor))
        .filter(token => distanceIsCorrect(token, message.token, 30))
        .filter(token => (
            token.actor.traits.has('spirit')
            || token.actor.traits.has('haunt')
            || token.actor.traits.has('undead')
        ))
        .filter(token => token.actor.itemTypes.condition.find(c => c.slug === 'invisible' || c.slug === 'hidden'))
        .map(token => token.actor.traits.filter(t => ['spirit', 'undead', 'haunt'].includes(t)))
        .map(t => t.first())
    let uniqueTraits = [...(new Set(traits))];

    ChatMessage.create({
        flags: {
            [moduleName]: {}
        },
        content: uniqueTraits.length
            ? `You feel the presence of ${uniqueTraits.join(" and ")}`
            : "You don't feel the presence of spirits, haunts or undead near you.",
        speaker: ChatMessage.getSpeaker({token: message.token}),
        style: CONST.CHAT_MESSAGE_STYLES.IC
    });
}

Hooks.on('ready', async function () {
    await registerMessageCreateHandler('Furious Anatomy', furiousAnatomy, "Furious Anatomy from Barbarians+")
    await registerMessageCreateHandler('Sorcerer Bloodlines', bloodlines, "Handle Sorcerer Bloodlines effects")
    await registerMessageCreateHandler('Disarm', disarm, "Disarm target weapon on critical success. Create fist action if it's NPC")
    await registerMessageCreateHandler('Hunt Prey', huntPrey, "Set hunt prey effect to target, delete from other targets")
    await registerMessageCreateHandler('Frostbite Amped', frostbiteAmped, "Add Temp HP when cast amped spell")
    await registerMessageCreateHandler('Bane Save', saveBane, "Add Immunity to bane")
    await registerMessageCreateHandler('Master Strike', masterStrike, "Target get effect")
    await registerMessageCreateHandler('Master Strike handle roll result', handleMasterStrikeResult, "Handle rolls fortitude save")
    await registerMessageCreateHandler('Lingering Composition Spell', lingeringComposition, "Run macro from Workbench")
    await registerMessageCreateHandler('Fortissimo Composition Spell', fortissimoComposition, "Run Inspire Heroics / Fortissimo Composition macro")
    await registerMessageCreateHandler('Extend Boost Spell', extendBoost, "Run Extend Boost macro")
    await registerMessageCreateHandler('Reactive Shield', reactiveShield, "Run Raise a Shield macro")
    await registerMessageCreateHandler('Trueshape Bomb', trueShapeBomb, "Notification about deleting morph effects")
    await registerMessageCreateHandler('Treat Wounds', treatWoundsAction, "Add Treat Wounds Immunity if needed")
    await registerMessageCreateHandler('Battle Medicine', battleMedicineAction, "Add Immunity if needed")
    await registerMessageCreateHandler('Self Effect Messages', selfEffectMessage, "Apply effect from Self-Effect messages")
    await registerMessageCreateHandler('Toggle Gravity Weapon', toggleGravityWeapon, "Toggle Gravity Weapon Roll Option after damage roll or missed attack")
    await registerMessageCreateHandler('Toggle First Attack', toggleFirstAttack, "Toggle First Attack roll option if needed")
    await registerMessageCreateHandler('Effect Hag Blood Magic', effectHagBloodMagic, "Notify about Hag Blood Magic effect damage")
    await registerMessageCreateHandler('Known Weaknesses', knownWeaknesses, "Apply Known Weakness effect to party")
    await registerMessageCreateHandler('Delete Shield Effect', deleteShieldEffect, "Delete effect after taking damage")
    await registerMessageCreateHandler('Critical Specialization sword', criticalSpecializationSword, "Handle Sword Critical Specialization")
    await registerMessageCreateHandler('Critical Specialization axe', criticalSpecializationAxe, "Handle Sword Critical Axe")
    await registerMessageCreateHandler('Critical Specialization spear', criticalSpecializationSpear, "Handle Sword Critical Spear")
    await registerMessageCreateHandler('Critical Specialization bow', criticalSpecializationBow, "Handle Sword Critical Bow")
    await registerMessageCreateHandler('Stunning Fist', stunningFist, "Target roll saving throw after damage")
    await registerMessageCreateHandler('Stunning Blows', stunningBlows, "Target roll saving throw after damage")
    await registerMessageCreateHandler('Critical Specialization Roll Saving Throw', criticalSpecializationRollSavingThrow, "Target roll saving throw after roll damage")
    await registerMessageCreateHandler('Delete Effects After Damage', deleteEffectsAfterDamage, "Delete effects after roll damage. Panache, Off-guard Tumble Behind")
    await registerMessageCreateHandler('Delete Effects After Roll', deleteEffectsAfterRoll, "Delete effects after roll check. Aid")
    await registerMessageCreateHandler('Delete Feint Effects', deleteFeintEffects, "Delete feint effects after missed attack or damage")
    await registerMessageCreateHandler('Demoralize', demoralize, "Handling logic of demoralize action. Add immunity, logic of feats")
    await registerMessageCreateHandler('Feint', feint, "Add feint effect, off-guard, devrins-dazzling-diversion")
    await registerMessageCreateHandler('Stumbling Stance', stumblingStance, "Apply effects from stance")
    await registerMessageCreateHandler('Escape', escape, "Delete effects when escape successfully")
    await registerMessageCreateHandler('Grab', grab, "Handle Additional Attack Effects - Grab")
    await registerMessageCreateHandler('Improved Grab', grabImproved, "Handle Additional Attack Effects - Improved Grab")
    await registerMessageCreateHandler('Grapple trait', grapple, "Handle Grapple weapon trait")
    await registerMessageCreateHandler('Entropic Wheel', entropicWheel, "Add Entropic Wheel")
    await registerMessageCreateHandler('Wardens Boon', wardensBoon, "Add Wardens Boon effects flurry/outwit/precision")
    await registerMessageCreateHandler('Shared Prey', sharedPrey, "Add Shared Prey effects flurry/outwit/precision")
    await registerMessageCreateHandler('Caustic Belch', causticBelch, "Apply daamge from Caustic Belch")
    await registerMessageCreateHandler('The Oscillating Wave', theOscillatingWave, "Handling logic of Adding/Removing Energy")
    await registerMessageCreateHandler('Shield Warden', shieldWarden, "Apply effect Shield Warden, logic of daamge")
    await registerMessageCreateHandler('Weapon Runes', weaponRunes, "Roll saving for thundering/brilliant/frost runes")
    await registerMessageCreateHandler('Debilitating Strike', debilitatingStrike, "Handle debilitating strike. Apply effect related to selected types")
    await registerMessageCreateHandler('Familiar of Balanced Luck', familiarBalancedLuck, "Apply effect related to action")
    await registerMessageCreateHandler('Familiar of Flowing Script', familiarFlowingScript, "Apply effect related to action")
    await registerMessageCreateHandler('Familiar of Freezing Rime', familiarFreezingRime, "Apply effect related to action")
    await registerMessageCreateHandler('Familiar of Keen Senses', familiarKeenSenses, "Apply effect related to action")
    await registerMessageCreateHandler('Familiar of Restored Spirit', familiarRestoredSpirit, "Apply effect related to action")
    await registerMessageCreateHandler('Martial Performance', martialPerformance, "Extend duration of effect")
    await registerMessageCreateHandler('Sorcerous Sweets', sorcerousSweets, "Add Sweets to target")
    await registerMessageCreateHandler('Ink Spray', inkSpray, "Apply effect related to action")
    await registerMessageCreateHandler('Turn Of Fate', turnOfFate, "Apply effect related to action")
    await registerMessageCreateHandler('Delete Intimidation Strike', intimidationStrike, "Delete Intimidation Strike Effect after melee Strike")
    await registerMessageCreateHandler('Impose Order Psy', imposeOrderPsy, "Change damage dices")
    await registerMessageCreateHandler('Spike Skin - decrease time', spikeSkin, "Decrease time when actor takes physical damage")
    await registerMessageCreateHandler('Spike Skin damage', spikeSkinDamage, "Roll damage to attacker")
    await registerMessageCreateHandler('Buzzing Bites', buzzingBites, "Apply Buzzing Bites effect based on result")
    await registerMessageCreateHandler('Synesthesia', synesthesia, "Apply Synesthesia effect based on result")
    await registerMessageCreateHandler('Channeling Block', channelingBlock, "Apply Synesthesia effect based on result")
    await registerMessageCreateHandler('Forcible Energy', forcibleEnergy, "Apply Weakness to target")
    await registerMessageCreateHandler('Tamper', tamper, "Add Tamper effects")
    await registerMessageCreateHandler('Knockdown', knockdown, "Handle Additional Attack Effects - Knockdown")
    await registerMessageCreateHandler('Push', push, "Handle Additional Attack Effects - Push")
    await registerMessageCreateHandler('Roll Initiative', rollInitiative, "Handle Feats/Action related to initiative roll")
    await registerMessageCreateHandler('Delete Mighty Rage', deleteMightyRage, "Delete Mighty Rage after roll damage")
    await registerMessageCreateHandler('Conjure Bullet', conjureBullet, "Add ordinary level-0 bolt or bullet to inventory")
    await registerMessageCreateHandler('Pinpoint Poisoner', pinpointPoisoner, "Apply Pinpoint Poisoner effect")
    await registerMessageCreateHandler('Extend Smite', extendSmite, "Extend smite effect")
    await registerMessageCreateHandler('Game Hunter', gameHunter, "Roll saving throw")
    await registerMessageCreateHandler('Apparition Sense', apparitionSense, "Create message about creatures around token")

    await registerUpdateActorHandler('Exploration Effects', explorationEffects, "Handle Exploration Effects. Add Effect to party")
    await registerUpdateActorHandler('Exploration Activity notifications', notifyExplorationActivity, "Notify when actor change Exploration Activity")

    await registerDeleteItemHandler('Guidance Immunity', guidanceImmunity, "Add Guidance Immunity when Guidance effect was deleted")
    await registerDeleteItemHandler('Unleash Psyche', unleashPsyche, "Add Stupefied when Unleash Psyche effect was deleted")
    await registerDeleteItemHandler('Bag of Devouring', bagOfDevouringDelete, "Send message about flat check")
    await registerDeleteItemHandler('Bag of Weasels', bagOfWeaselsDelete, "Send message about flat check")
    await registerDeleteItemHandler('Delete Metal Carapace', deleteMetalCarapace, "Delete Metal Carapace Armor when effect gone")
    await registerDeleteItemHandler('Delete Metal Carapace Shield', deleteMetalCarapaceShield, "Delete Metal Carapace Shield when effect gone")
    await registerDeleteItemHandler('Delete Hardwood Armor', deleteHardwoodArmor, "Delete Hardwood Armor when effect gone")
    await registerDeleteItemHandler('Delete Hardwood Armor Shield', deleteHardwoodArmorShield, "Delete Hardwood Shield when effect gone")
    await registerDeleteItemHandler('Delete Armor in Earth', deleteArmorInEarth, "Delete Armor in Earth when effect gone")
    await registerDeleteItemHandler('Rage Temporary Hit Points Immunity', rageImmunity, "Add Rage Temporary Hit Points Immunity when rage gone")

    await registerUpdateItemHandler('Bag of Devouring', bagOfDevouring, "Send message about flat check")
    await registerUpdateItemHandler('Bag of Weasels', bagOfWeasels, "Send message about flat check")

    await registerCreateItemHandler('Remove effects', removeStances, "Remove effects when Unconscious")
    await registerCreateItemHandler('Refocus', refocus, "Refocus activity")
    await registerCreateItemHandler('Blessing of Defiance', blessingOfDefiance, "Apply to all willing allies within 30 feet.")
    await registerCreateItemHandler('Metal Carapace', metalCarapace, "Worn armor based on feat")
    await registerCreateItemHandler('Metal Carapace Shield', metalCarapaceShield, "Worn shield based on feat")
    await registerCreateItemHandler('Hardwood Armor', hardwoodArmor, "Worn armor based on feat")
    await registerCreateItemHandler('Hardwood Armor Shield', hardwoodArmorShield, "Worn shield based on feat")
    await registerCreateItemHandler('Create Spike Skin', createSpikeSkin, "Handle unique state of effect")
    await registerCreateItemHandler('Armor in Earth', ArmorInEarth, "Worn armor based on feat")
    await registerCreateItemHandler('Bane effect', baneEffectImmunity, "Roll bane saving throw")
});
