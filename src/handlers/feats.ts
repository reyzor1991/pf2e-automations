import {BaseRule, HandlerRule, MessageForHandling} from "../rule";
import {createItemObject, createItemObjectUuid} from "../hooks/functions";
import {
    actorRollSaveThrow,
    addItemsToActor,
    addItemToActor,
    createDocumentsParent,
    decreaseConditionByStepForActor,
    deleteItem
} from "../global-f";
import {distanceIsCorrect, effectUUID, getAllEffectBySourceIdAndOwner, getEffectBySourceId, getFeatBySourceId, showName} from "../helpers";
import {EMPTY_EFFECT, end1MinEffect, GlobalNamespace, moduleName} from "../const";

async function forcibleEnergy(r: BaseRule, mm: MessageForHandling) {
    const parent = game.user.targets.first().actor;
    if (!parent) {
        ui.notifications.info(`Need to select target`);
        return;
    }
    r = r.rawValue()
    r.value = 'Compendium.pf2e.feat-effects.Item.0Ai0u9kNJrEudPnN'
    const itemSource = await createItemObject(r, mm)
    const rule = itemSource.system.rules[0];

    const effect = new CONFIG.Item.documentClass(itemSource, {parent});

    const ele = new game.pf2e.RuleElements.builtin.ChoiceSet(foundry.utils.deepClone(rule), {parent: effect});
    await ele.preCreate({itemSource, ruleSource: rule, tempItems: []});

    createDocumentsParent(parent, [itemSource])
}

async function gameHunter(rule: BaseRule, mm: MessageForHandling) {
    actorRollSaveThrow(mm.targetActor, 'fortitude', {
            dc: {
                label: `Game Hunter DC`,
                value: mm.mainActor?.attributes.classDC.value
            },
            item: mm.mainActor?.itemTypes.feat.find(f => f.slug === 'game-hunter-dedication'),
            origin: mm.mainActor
        }
    )
}

async function redGoldMortalityEffect(rule: BaseRule, mm: MessageForHandling) {
    if (!mm?.item?.system?.traits?.otherTags?.includes('physical-ikon')
        || !mm?.targetActor
    ) {
        return
    }
    const i = await createItemObjectUuid(effectUUID('YdWsNobIKIMBSSBP'), mm)
    addItemToActor(mm.targetActor, i)
}

async function redGoldMortalityHealing(rule: BaseRule, mm: MessageForHandling) {
    if (mm.optionalData?.damageUndo || !mm.optionalData?.damageTaken || mm.optionalData?.damageTaken > 0) {
        return
    }
    const effect = getEffectBySourceId(mm.mainActor, effectUUID("YdWsNobIKIMBSSBP"))
    if (!effect || !effect.origin) {
        return
    }
    const dc = effect.origin?.classDCs?.['exemplar']?.dc?.value
    if (!dc) {
        return
    }
    const healing = Math.abs(options?.damageTaken);

    const result = await actorRollSaveThrow(mm.mainActor, 'will', {
            dc: {

                label: `Red-Gold Mortality DC`,
                value: dc
            },
            origin: effect.origin
        }
    )
    if (result?.degreeOfSuccess === 0) {
        mm.mainActor?.update({
            "system.attributes.hp.value": mm.data.system.attributes.hp.value - healing
        })
    } else if (result?.degreeOfSuccess === 1) {
        mm.mainActor?.update({
            "system.attributes.hp.value": mm.data.system.attributes.hp.value - Math.ceil(healing / 2)
        })
    }
}

async function reactiveShield(rule: BaseRule, mm: MessageForHandling) {
    (await fromUuid('Compendium.pf2e.action-macros.4hfQEMiEOBbqelAh'))?.execute()
}

async function dashOfHerbs(rule: BaseRule, mm: MessageForHandling) {
    const target = mm.targetToken;
    const targetActor = target?.actor as Actor;
    if (!targetActor) {
        ui.notifications.info(`Need to select target`);
        return;
    }
    if (targetActor.getRollOptions().includes("self:effect:dash-of-herbs-immunity")) {
        ui.notifications.info(`Target has immunity to action`);
        return;
    }

    const {type} = await foundry.applications.api.DialogV2.wait({
        window: {title: 'Select type'},
        content: ` <select id="fob1" autofocus>     <option value="confused">Confused</option>     <option value="disease">Disease</option>     <option value="poison">Poison</option>     <option value="sickened">Sickened</option>     <option value="injuries">Injuries</option> </select>  `,
        buttons: [{
            action: "ok", label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
            callback: (event, button, form) => {
                return {type: $(form).find("#fob1").val(),}
            }
        }]
    });
    if (!type) {
        return
    }

    const dieSize = type === 'injuries' ? 'd10' : 'd8'

    const roll = new GlobalNamespace.DamageRoll(`((floor((max(6,@actor.level)-6)/2)+2)${dieSize}+4)[healing]`);
    roll.evaluateSync();

    roll.toMessage(
        {
            speaker: foundry.utils.deepClone(mm.speaker),
            flags: {
                pf2e: {
                    context: {
                        type: "damage-roll",
                        actor: mm.mainActor?.id,
                        token: mm.mainToken?.id,
                        domains: ["healing"],
                        traits: mm.item.system.traits.value,
                        target: {actor: targetActor.uuid, token: target.document.uuid},
                        options: [...mm.rollOptions]
                    }, origin: mm.item.getOriginData(), target: {actor: targetActor.uuid, token: target.uuid},
                }
            },
        }
    );

    addItemToActor(targetActor, await createItemObjectUuid(effectUUID('rg21PkfOqRC4wKwa'), mm));

    if (type !== 'injuries') {
        ChatMessage.create({
            flags: {
                [moduleName]: {}
            },
            style: CONST.CHAT_MESSAGE_STYLES.OOC,
            content: `The ${target.name} can attempt a new save against one malady of the ${type}.`
        });
    }
}

function winterSleetEffect(target: Actor) {
    const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
    newEffect._id = foundry.utils.randomID()
    newEffect.name = 'Effect: Winter Sleet (Critical)'
    newEffect.system.duration.expiry = "turn-end";
    newEffect.system.duration.unit = "rounds";
    newEffect.system.duration.value = 1;
    newEffect.system.rules.push({
        "key": "GrantItem",
        "onDeleteActions": {"grantee": "restrict"},
        "uuid": 'Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3'
    })

    addItemToActor(target, newEffect)
}

function winterSleetAttack(rule: BaseRule, mm: MessageForHandling) {
    if (game.pf2e.Predicate.test([
        {
            "lte": ["target:distance", mm?.mainActor?.flags?.pf2e?.kineticist?.auraRadius || 0]
        }
    ], mm.rollOptions)) {
        winterSleetEffect(mm.targetActor)
    }
}

async function winterSleetSavingThrow(rule: BaseRule, mm: MessageForHandling) {
    const origin = mm.messageFlags?.pf2e?.context?.origin
    if (origin) {
        const oToken = await fromUuid(origin.token)
        if (distanceIsCorrect(mm.mainToken, oToken, oToken.actor?.flags?.pf2e?.kineticist?.auraRadius || 0)) {
            winterSleetEffect(mm.mainActor)
        }
    }
}

function apparitionSense(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.mainToken) {
        return
    }

    let traits = mm.mainToken.scene.tokens
        .filter(token => token !== mm.mainToken)
        .filter(token => token.actor && !token.actor.isAllyOf(mm.mainActor))
        .filter(token => distanceIsCorrect(token, mm.mainToken, 30))
        .filter(token => (
            token.actor.traits.has('spirit')
            || token.actor.traits.has('haunt')
            || token.actor.traits.has('undead')
        ))
        .filter(token => token.actor.itemTypes.condition.find(c => c.slug === 'invisible' || c.slug === 'hidden'))
        .map(token => token.actor.traits.filter(t => ['spirit', 'undead', 'haunt'].includes(t)))
        .map(t => t.first())
    let uniqueTraits = [...(new Set(traits))] as string[];

    ChatMessage.create({
        flags: {
            [moduleName]: {}
        },
        content: uniqueTraits.length
            ? `You feel the presence of ${uniqueTraits.join(" and ")}`
            : "You don't feel the presence of spirits, haunts or undead near you.",
        speaker: ChatMessage.getSpeaker({token: mm.mainToken}),
        style: CONST.CHAT_MESSAGE_STYLES.IC
    });
}

function extendSmite(rule: BaseRule, mm: MessageForHandling) {
    if (!game.combat?.active
        || !mm.mainActor?.combatant
        || !mm.targetActor?.combatant
    ) {
        return
    }

    const enemies = game.combat.turns.filter(c => mm.mainActor?.isEnemyOf(c.actor));
    const smiteEffects = enemies.map(c => c.actor.itemTypes.effect
        .find(e => e.sourceId === "Compendium.pf2e.feat-effects.Item.AlnxieIRjqNqsdVu"))
        .filter(b => !!b);

    const effectsWithCorrectTarget = smiteEffects
        .filter(e => e.rules.find(r => r.key === "TokenMark" && r.uuid === mm.mainToken?.uuid))

    effectsWithCorrectTarget.forEach(e => {
        e.update({
            "system.start": {
                value: game.time.worldTime,
                initiative: mm.mainActor?.combatant.initiative,
            },
            "system.duration.expiry": "turn-end"
        })
    })
}

async function pinpointPoisoner(rule: BaseRule, mm: MessageForHandling) {
    const formula = await mm.mainActor?.system.actions.find(a => a.item === mm.item)?.damage({getFormula: true})
    if (!formula.includes('poison')) {
        return
    }

    const aEffect = await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.XAdhPJqssO3v4Zvw", mm);
    addItemToActor(mm.targetActor, aEffect);
}

async function debilitatingBombRoll(rule: HandlerRule, mm: MessageForHandling) {
    let isPerfect = mm.rollOptions.has('feat:perfect-debilitation');
    let uuid = isPerfect
        ? 'Compendium.pf2e.feats-srd.Item.HBhLR980Q0cb2rxp'
        : 'Compendium.pf2e.feats-srd.Item.sv4LeEbkOJyLen10';

    actorRollSaveThrow(
        mm?.targetActor,
        'fortitude',
        {
            dc: {
                label: `${isPerfect ? 'Perfect Debilitation' : 'Debilitating Bomb'} DC`,
                value: mm.mainActor?.attributes.classDC.value
            },
            item: mm.mainActor.items.find(i => i.sourceId === uuid),
            origin: mm.mainActor
        }
    )
}

function wardensBoon(rule: BaseRule, mm: MessageForHandling) {
    const target = mm.targetActor;
    if (!target) {
        ui.notifications.info(`${mm.mainActor.name} needs to choose target for Warden's Boon`);
        return;
    }

    if (mm.mainActor?.rollOptions.all['feature:flurry']) {
        applyEffectWardensBoon(mm.mainActor, "Compendium.pf2e.feat-effects.Item.uXCU8GgriUjuj5FV", target);
    }
    if (mm.mainActor?.rollOptions.all['feature:outwit']) {
        applyEffectWardensBoon(mm.mainActor, "Compendium.pf2e.feat-effects.Item.ltIvO9ZQlmqGD89Y", target);
    }
    if (mm.mainActor?.rollOptions.all['feature:precision']) {
        applyEffectWardensBoon(mm.mainActor, "Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0", target);
    }
}

async function applyEffectWardensBoon(actor: Actor, uuid: string, targetActor: Actor) {
    const effect = (await fromUuid(uuid)).toObject();
    effect.flags = foundry.utils.mergeObject(effect.flags, {[moduleName]: {"originActorId": actor.id}});

    effect.system.duration.expiry = 'turn-end';
    effect.system.duration.unit = 'rounds';
    if (game.combat?.combatant?.initiative <= targetActor?.combatant?.initiative) {
        effect.system.duration.value = 1;
    } else {
        effect.system.duration.value = 0;
    }

    addItemToActor(targetActor, effect);
}

async function knownWeaknesses(rule: BaseRule, mm: MessageForHandling) {
    const actor = mm.mainActor as Actor;
    const flat = actor.parties.map(a => a.members).flat();
    const targets = flat.filter(a => a.uuid !== actor.uuid);
    for (const tt of targets) {
        addItemToActor(tt, await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.DvyyA11a63FBwV7x", mm))
    }
}

async function sharedPrey(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.targetActor) {
        ui.notifications.info(`${mm.mainToken.name} needs to choose target for Shared Prey`);
        return;
    }

    const target = mm.targetActor;

    const hasHuntPrey = !!mm.mainToken?.scene.tokens
        .map(token => token.actor)
        .filter(actor => !!actor)
        .flatMap(actor => {
            return getAllEffectBySourceIdAndOwner(actor, effectUUID('a51AN6VfpW9b4ttm'), mm.mainActor.uuid)
        })
        .length

    if (!hasHuntPrey) {
        ui.notifications.info(`${mm.mainActor.name} needs to have 1 Hunted Prey Target`);
        return;
    }
    if (mm.mainActor?.rollOptions.all['feature:flurry']) {
        applyEffectSharedPrey(mm.mainActor, "Compendium.pf2e.feat-effects.Item.uXCU8GgriUjuj5FV", target);
    }
    if (mm.mainActor?.rollOptions.all['feature:outwit']) {
        applyEffectSharedPrey(mm.mainActor, "Compendium.pf2e.feat-effects.Item.ltIvO9ZQlmqGD89Y", target);
    }
    if (mm.mainActor?.rollOptions.all['feature:precision']) {
        applyEffectSharedPrey(mm.mainActor, "Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0", target);
    }
}

async function applyEffectSharedPrey(actor: Actor, uuid: string, target: Actor) {
    const effect = (await fromUuid(uuid)).toObject();
    effect.flags = foundry.utils.mergeObject(effect.flags, {[moduleName]: {"originActorId": actor.id}});

    addItemToActor(target, effect);
}

async function toggleGravityWeapon(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.rollOptions.has("item:category:unarmed")) {
        mm.mainActor.toggleRollOption("damage-roll", "gravity-weapon")
    }
}

async function toggleFirstAttack(rule: BaseRule, mm: MessageForHandling) {
    const ranger = game.actors.get(mm.mainActor.getFlag("pf2e", "master"));
    const ownerOfEffect = getEffectBySourceId(mm.mainActor, 'Compendium.pf2e.feat-effects.Item.mNk0KxsZMFnDjUA0')?.origin;

    if (ranger && getAllEffectBySourceIdAndOwner(mm.targetActor, effectUUID('a51AN6VfpW9b4ttm'), ranger.uuid).length) {
        mm.mainActor.toggleRollOption("all", "first-attack")
    } else if (ownerOfEffect && getAllEffectBySourceIdAndOwner(mm.targetActor, effectUUID('a51AN6VfpW9b4ttm'), ownerOfEffect.uuid).length) {
        mm.mainActor.toggleRollOption("all", "first-attack")
    } else if (getAllEffectBySourceIdAndOwner(mm.targetActor, effectUUID('a51AN6VfpW9b4ttm'), mm.mainActor).length) {
        mm.mainActor.toggleRollOption("all", "first-attack")
    }
}

async function stumblingStanceStrike(rule: BaseRule, mm: MessageForHandling) {
    const eff = mm.mainActor.itemTypes.effect.find(e => e.slug === `effect-stumbling-stance-${mm.targetActor?.signature}`);
    if (eff) {
        deleteItem(eff)
    }
}

async function stumblingStanceOffGuard(rule: BaseRule, mm: MessageForHandling) {
    const aEffect = (await fromUuid(effectUUID('ESDysTknpmThdvQs'))).toObject();
    aEffect.name = aEffect.name.slice(0, -10) + `${showName(mm.mainToken) ? mm.mainToken : 'Target'} is ` + aEffect.name.slice(-10)
    aEffect.system.rules[0].predicate.push(`target:signature:${mm.mainActor.signature}`)
    aEffect.system.slug = `effect-stumbling-stance-${mm.mainActor.signature}`

    addItemToActor(mm.mainActor, aEffect);
}

function stunningBlows(rule: BaseRule, mm: MessageForHandling) {
    actorRollSaveThrow(mm.targetActor, 'fortitude', {
            dc: {
                label: `Stunning Blows DC`,
                value: mm.mainActor.attributes.classDC.value
            },
            origin: mm.mainActor,
            extraRollOptions: ["origin:item:stunning-blows"]
        },
    )
}

function deleteTumbleBehindOffGuard(rule: BaseRule, mm: MessageForHandling) {
    const eff = getEffectBySourceId(mm.mainActor, effectUUID('Vh5E1Qgp34sTKfVs'));
    deleteItem(eff)
}

function deletePanache(rule: BaseRule, mm: MessageForHandling) {
    const pan = getEffectBySourceId(mm.mainActor, "Compendium.pf2e.feat-effects.Item.uBJsxCzNhje8m8jj")
    deleteItem(pan)
}

function createchannelingBlockName(spellcastingEntry, spell, rank) {
    return `${spellcastingEntry.name} ${spell.name} ${rank} Rank spell`;
}

async function channelingBlock(rule: BaseRule, mm: MessageForHandling) {
    const actor = mm.mainActor;
    if (!actor) {
        return
    }

    const checkData = {};

    actor.itemTypes.spellcastingEntry.filter(a => a.system.prepared.value === "prepared").forEach(spellcastingEntry => {
        for (const key in spellcastingEntry.system.slots) {
            if (['slot0', 'slot11'].includes(key)) {
                continue
            }
            if (!spellcastingEntry.system.slots[key].max) {
                continue
            }
            const value = spellcastingEntry.system.slots[key];
            for (const p in value.prepared) {
                if (!value.prepared[p].id || value.prepared[p].expended) {
                    continue
                }
                const spell = spellcastingEntry.spells.get(value.prepared[p].id);
                if (!['heal', 'harm'].includes(spell.slug)) {
                    continue
                }
                checkData[createchannelingBlockName(spellcastingEntry, spell, key.replace('slot', ''))] = `${spellcastingEntry.id}-${spell.id}-${key.replace('slot', '')}-${p}`
            }
        }
    })
    actor.itemTypes.spellcastingEntry.filter(a => a.system.prepared.value === "spontaneous").forEach(spontaneous => {
        const availableSlots = []
        for (const key in spontaneous.system.slots) {
            if (['slot0', 'slot11'].includes(key)) {
                continue
            }
            if (!spontaneous.system.slots[key].max || !spontaneous.system.slots[key].value) {
                continue
            }
            availableSlots.push(Number(key.replace('slot', '')))
        }
        spontaneous.spells
            .filter(s => ['heal', 'harm'].includes(s.slug))
            .forEach(s => {
                if (s?.system?.location?.signature) {
                    availableSlots.filter(as => as >= s.system.location.heightenedLevel).forEach(as => {
                        checkData[createchannelingBlockName(spontaneous, s, as)] = `${spontaneous.id}-${s.id}-${as}-`
                    })
                } else {
                    if (availableSlots.find(as => as === s.system.location.heightenedLevel)) {
                        checkData[createchannelingBlockName(spontaneous, s, s.system.location.heightenedLevel)] = `${spontaneous.id}-${s.id}-${s.system.location.heightenedLevel}-`
                    }
                }
            })
    })

    if (!Object.keys(checkData).length) {
        return
    }

    let options = ''
    for (const key in checkData) {
        const split = checkData[key].split('-')
        options += `<option value="${split[1]}" data-rank="${split[2]}" data-slot-idx="${split[3]}" data-entry-id="${split[0]}">${key}</option>`;
    }

    const confirm = await Dialog.confirm({
        title: "Channeling Block",
        content: `Select level of harm/ heal spell</br></br><select id="map"> ${options}  </select></br></br>`,
        yes: (html) => {
            return {
                entryId: html.find("#map  :selected").data('entryId'),
                spellId: html.find("#map").val(),
                rank: Number(html.find("#map  :selected").data('rank')),
                slotIdx: Number(html.find("#map  :selected").data('slotIdx'))
            }
        }
    });
    if (!confirm) {
        return
    }

    await actor.spellcasting.get(confirm.entryId)
        ?.consume(actor.items.get(confirm.spellId), confirm.rank, confirm.slotIdx);

    const source = (await fromUuid(effectUUID("An3CuEIthnfIYnid"))).toObject();
    source.system.level.value = confirm.rank;
    if (game.combats?.active?.combatant) {
        source.system.context ??= {}
        source.system.context.origin = {
            actor: game.combats?.active?.combatant?.actor?.uuid,
        };
    }

    addItemToActor(actor, source);
}

function deleteIntimidatingStrikeEffect(rule: BaseRule, mm: MessageForHandling) {
    deleteItem(getEffectBySourceId(mm?.mainActor, effectUUID('w9i0aY2IQ3jvCX9K')));
}

async function imposeOrderPsy(rule: BaseRule, mm: MessageForHandling) {
    const roll = mm.roll;
    roll._evaluated = false;
    roll.terms[0]._evaluated = false;
    roll.terms[0].results = [];
    for (const r of roll.terms[0].rolls) {
        handleRollDefDice(r)
    }
    await roll.evaluate({async: true});

    game.messages.get(mm.messageId)?.update({
        'rolls': [roll],
        content: `${roll.total}`
    });
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

function martialPerformance(rule: BaseRule, mm: MessageForHandling) {
    const inspireCourage = getEffectBySourceId(mm.mainActor, effectUUID('RR8MSbHqxJdQxh2e'));
    const inspireDefense = getEffectBySourceId(mm.mainActor, effectUUID('g2LBvDHPRZBabiU2'));
    const songOfStrength = getEffectBySourceId(mm.mainActor, effectUUID('7kyjK9Pm7wKSZtdQ'));
    const xdyInspireCourage = getEffectBySourceId(mm.mainActor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.KIPV1TiPCzlhuAzo");
    const xdyInspireDefense = getEffectBySourceId(mm.mainActor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.tcnjhVxyRchqjt71");

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

    if (selected && !selected.getFlag(moduleName, "extendedMartialPerformance")) {
        selected.update({
            "system.duration.value": selected.system.duration.value + 1,
            [`flags.${moduleName}.extendedMartialPerformance`]: true
        })
    }
}

async function shieldWardenDamageTaken(rule: BaseRule, mm: MessageForHandling) {
    const shieldEffect = mm.mainActor.itemTypes.effect.find(a => a.slug === 'effect-shield-warden');
    if (!shieldEffect) {
        return
    }
    if (mm.messageFlags?.pf2e?.appliedDamage?.shield?.damage > 0) {
        const shield = await fromUuid(shieldEffect.system.context.origin.item);
        if (shield) {
            await shield.update({"system.hp.value": shield.system.hp.value - mm.messageFlags.pf2e.appliedDamage.shield.damage})
        }
        deleteItem(shieldEffect)
    }
}

function shieldWarden(rule: BaseRule, mm: MessageForHandling) {
    const target = mm.targetActor;
    if (!target) {
        ui.notifications.info(`${mm.mainActor.name} needs to choose target for Shield Warden`);
        return;
    }
    const shield = mm.mainActor.attributes.shield;
    const effect = {
        type: 'effect',
        name: `Shield Warden (${mm.mainActor.name})`,
        img: `${shield.icon}`,
        system: {
            context: {
                origin: {
                    actor: mm.mainActor?.uuid,
                    item: mm.mainActor?.items.get(shield.itemId)?.uuid,
                    token: mm.mainToken?.uuid
                }
            },
            tokenIcon: {show: true},
            duration: {value: '0', unit: 'rounds', sustained: false, expiry: 'turn-end'},
            rules: [{"key": "ActiveEffectLike", "mode": "override", "path": "system.attributes.shield", "value": shield}],
            slug: `effect-shield-warden`
        },
    };
    addItemToActor(target, effect)
}

async function theOscillatingWaveRefocus(rule: BaseRule, mm: MessageForHandling) {
    await mm.mainActor?.toggleRollOption("all", "conservation-of-energy", undefined, true, "none")
}

async function theOscillatingWave(rule: BaseRule, mm: MessageForHandling) {
    const _obj = mm.item;
    const wave = getFeatBySourceId(mm.mainActor, "Compendium.pf2e.classfeatures.Item.5tSR0WzMPFn5s3Xs")
    if (!_obj || !wave) {
        return
    }

    if (mm.rollOptions.has('conservation-of-energy:fire')) {
        await mm.mainActor.toggleRollOption("all", "conservation-of-energy", wave.id, true, "cold")
    } else if (mm.rollOptions.has('conservation-of-energy:cold')) {
        await mm.mainActor.toggleRollOption("all", "conservation-of-energy", wave.id, true, "fire")
    } else {
        const {action} = await Dialog.wait({
            title: "The Oscillating Wave",
            content: `  <h3>Actions</h3>  <select id="map"> <option value="fire">Adding Energy</option> <option value="cold">Removing Energy</option>  </select><hr>
            `,
            buttons: {
                ok: {
                    label: "Use", icon: "<i class='fa-solid fa-hand-fist'></i>", callback: (html) => {
                        return {action: html[0].querySelector("#map").value}
                    }
                }, cancel: {label: "Cancel", icon: "<i class='fa-solid fa-ban'></i>",}
            },
            default: "ok"
        });
        if (action === undefined) {
            return;
        }

        await mm.mainActor.toggleRollOption("all", "conservation-of-energy", wave.id, true, action)
    }
}

function auraOfCourage(rule: BaseRule, mm: MessageForHandling) {
    const championsAura = mm.mainToken.auras.get("champions-aura");
    if (championsAura) {
        const tokenInsideAura = mm.mainToken.scene.tokens.filter(t =>
            t.actor
            && t.actor.isAllyOf(mm.mainActor)
            && championsAura.containsToken(t)
        );

        for (const t of tokenInsideAura) {
            decreaseConditionByStepForActor(t.actor, "frightened")
        }
    }
}

async function strategicBypass(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.targetActor) {
        return
    }
    let damage = await mm.strike?.damage({getFormula: true, target: mm.targetToken.object, checkContext: mm.messageFlags?.pf2e?.context});
    if (!damage) {
        return;
    }

    let search = Object.keys(GlobalNamespace.LOCALIZED_RESISTANCES).filter(v => !!v).join("|");
    const regex = new RegExp(search.trim(), "gi");
    let matches = damage.match(regex);
    matches = matches.filter(m => !!m);
    if (!matches.length) {
        return;
    }
    let addedDamage = matches
        .map(m => GlobalNamespace.LOCALIZED_RESISTANCES[m])
        .reduce((o, type) => {
            o[type] = Math.min(mm.targetActor.attributes.resistances.find(r => r.type === type)?.value || 0, mm.mainActor.abilities.int.mod)
            return o;
        }, {})

    addedDamage = Object.fromEntries(
        Object.entries(addedDamage).filter(([key, value]) => value > 0)
    );

    const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
    newEffect._id = foundry.utils.randomID()
    newEffect.name = "Effect: Strategic Bypass";
    newEffect.system.duration.expiry = "turn-end";
    newEffect.system.duration.unit = "rounds";
    newEffect.system.duration.value = 0;

    for (let type in addedDamage) {
        newEffect.system.rules.push({
            "key": "FlatModifier",
            "selector": "damage",
            "value": addedDamage[type],
            "damageType": type,
            "predicate": [],
            "label": `Strategic Bypass - ${game.i18n.localize(CONFIG.PF2E.resistanceTypes[type]).capitalize()}`,
        })
    }

    addItemToActor(mm.mainActor, newEffect);
}

async function devotedGuardian(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.targetActor) {
        return
    }

    const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
    newEffect._id = foundry.utils.randomID()
    newEffect.name = "Effect: Devoted Guardian";
    newEffect.img = mm.mainToken?.texture?.src
    newEffect.system.context = {
        "origin": {
            "actor": mm.mainActor?.uuid,
            "item": mm.item?.uuid,
            "token": mm.mainToken?.uuid
        }
    };
    newEffect.system.rules.push({
        "key": "FlatModifier",
        "selector": "ac",
        "type": "circumstance",
        "value": mm.mainActor.items.get(mm.mainActor.attributes.shield.itemId)?.slug === 'tower-shield' ? 2 : 1,
        "predicate": [
            "parent:origin:shield:raised"
        ]
    })

    addItemToActor(mm.targetActor, newEffect);
}

async function connectTheDots(rule: BaseRule, mm: MessageForHandling) {
    if (mm.tokenTargets.size !== 2) {
        ui.notifications.warn(`Need to select 2 target: ally & enemy`);
        return;
    }
    let allyActor = mm.tokenTargets.find(t => t.actor.isAllyOf(mm.mainActor))?.actor
    if (!allyActor) {
        ui.notifications.warn(`Need to select ally target`);
        return;
    }
    let enemy = mm.tokenTargets.find(t => t.actor.isEnemyOf(mm.mainActor))
    if (!enemy) {
        ui.notifications.warn(`Need to select enemy target`);
        return;
    }
    let enemyActor = enemy.actor
    let slug = enemyActor.skills.deception.dc.value > enemyActor.saves.will.dc.value
        ? "deception"
        : "will";

    let res = await mm.mainActor?.perception.roll({
        dc: enemyActor?.getStatistic(slug)?.dc,
        extraRollOptions: ["action:connect-the-dots"],
        modifiers: []
    })

    if (res?.degreeOfSuccess === 3 || res?.degreeOfSuccess === 2) {
        let eff = (await fromUuid("Compendium.pf2e.feat-effects.Item.4a7g78DOZqHE9pRD")).toObject();
        eff.system.rules.find(r => r.key === "TokenMark").uuid = enemy.document.uuid;
        eff.system.rules.find(r => r.key === "ChoiceSet").selection = res?.degreeOfSuccess === 2 ? "success" : "critical-success";

        addItemToActor(allyActor, eff);
    }
}

async function agonizingRebuke(rule: HandlerRule, mm: MessageForHandling) {
    let dice = mm.mainActor.skills.intimidation.rank === 3
        ? 2
        : mm.mainActor.skills.intimidation.rank >= 4 ? 3 : 1

    let effect = end1MinEffect();
    effect.name = 'Effect: Agonizing Rebuke'
    effect.flags = {
        [moduleName]: {
            damageTrigger: "start-turn",
            damageFormula: `${dice}d4[mental]`,
        }
    }

    addItemToActor(mm.targetActor, effect);
}

async function inventedVulnerability(rule: HandlerRule, mm: MessageForHandling) {
    mm.rollOptions.has("outcome:criticalSuccess")

    let parent = mm.targetActor;

    const itemSource = await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.nOYXxWUT9i3z75GI", mm)
    const ruleDamage = itemSource.system.rules[1];
    const ruleOutcome = itemSource.system.rules[0];

    const effect = new CONFIG.Item.documentClass(itemSource, {parent});

    const ele = new game.pf2e.RuleElements.builtin.ChoiceSet(foundry.utils.deepClone(ruleDamage), {parent: effect});
    await ele.preCreate({itemSource, ruleSource: ruleDamage, tempItems: []});

    ruleOutcome.selection = mm.rollOptions.has("outcome:criticalSuccess") ? "3 + floor(@item.origin.level/2)" : 5;


    addItemToActor(parent, itemSource);
}

async function spasmOfTheBerserker(rule: HandlerRule, mm: MessageForHandling) {
    let items = []
    const itemSource = await createItemObjectUuid("Compendium.pf2e.spell-effects.Item.sPCWrhUHqlbGhYSD", mm)
    const ruleOutcome = itemSource.system.rules[0];
    ruleOutcome.selection = {
        "damage": 4,
        "reach": 15,
        "size": "huge"
    }
    itemSource.system.level.value = 4;
    itemSource.system.duration = {expiry: 'turn-end', sustained: false, unit: 'rounds', value: 1};
    items.push(itemSource);


    const fr = await createItemObjectUuid("Compendium.pf2e.spell-effects.Item.zRKw95WMezr6TgiT", mm)
    fr.system.level.value = 6;
    fr.system.duration = {expiry: 'turn-end', sustained: false, unit: 'rounds', value: 1};
    items.push(fr);

    addItemsToActor(mm.mainActor, items);
}

export const FEAT_FUNCTIONS = {
    'forcibleEnergy': forcibleEnergy,
    'gameHunter': gameHunter,
    'redGoldMortalityEffect': redGoldMortalityEffect,
    'redGoldMortalityHealing': redGoldMortalityHealing,
    'reactiveShield': reactiveShield,
    'dashOfHerbs': dashOfHerbs,
    'theOscillatingWave': theOscillatingWave,
    'auraOfCourage': auraOfCourage,
    'strategicBypass': strategicBypass,
    'theOscillatingWaveRefocus': theOscillatingWaveRefocus,
    'stumblingStanceStrike': stumblingStanceStrike,
    'stumblingStanceOffGuard': stumblingStanceOffGuard,
    'deleteTumbleBehindOffGuard': deleteTumbleBehindOffGuard,
    'deletePanache': deletePanache,
    'imposeOrderPsy': imposeOrderPsy,
    'deleteIntimidatingStrikeEffect': deleteIntimidatingStrikeEffect,
    'martialPerformance': martialPerformance,
    'shieldWarden': shieldWarden,
    'shieldWardenDamageTaken': shieldWardenDamageTaken,
    'channelingBlock': channelingBlock,
    'winterSleetAttack': winterSleetAttack,
    'winterSleetSavingThrow': winterSleetSavingThrow,
    'apparitionSense': apparitionSense,
    'extendSmite': extendSmite,
    'pinpointPoisoner': pinpointPoisoner,
    'debilitatingBombRoll': debilitatingBombRoll,
    'wardensBoon': wardensBoon,
    'knownWeaknesses': knownWeaknesses,
    'sharedPrey': sharedPrey,
    'toggleGravityWeapon': toggleGravityWeapon,
    'toggleFirstAttack': toggleFirstAttack,
    'devotedGuardian': devotedGuardian,
    'connectTheDots': connectTheDots,
    'stunningBlows': stunningBlows,
    'agonizingRebuke': agonizingRebuke,
    'inventedVulnerability': inventedVulnerability,
    'spasmOfTheBerserker': spasmOfTheBerserker,
}