import {BaseRule, HandlerRule, MessageForHandling} from "../rule";
import {effectUUID, executeMacro, getEffectBySourceId, isActiveGM} from "../helpers";
import {actorRollSaveThrow, addItemToActor, createDocumentsParent, deleteEffectFromActor, deleteItem} from "../global-f";
import {createItemObject, createItemObjectUuid} from "../hooks/functions";
import {EMPTY_EFFECT, GlobalNamespace, moduleName} from "../const";

export async function applyBaneImmunity(rule: BaseRule, mm: MessageForHandling) {
    rule = rule.rawValue()
    rule.value = effectUUID('kLpCaiCZjenXCebV');
    addItemToActor(mm.mainActor, await createItemObject(rule, mm))
    deleteEffectFromActor(mm.mainActor, "Compendium.pf2e.spell-effects.Item.UTLp7omqsiC36bso")
}

export async function rollSavingThrowVsBane(rule: BaseRule, mm: MessageForHandling) {
    const aura = mm.mainActor?.itemTypes.effect.find(e => e.sourceId === effectUUID("FcUe8TT7bhqlURIf"))
    if (!aura) {
        return
    }
    const source = await fromUuid(aura.system?.context?.origin?.item)
    if (!source) {
        return
    }

    const dc = source.spellcasting.statistic.dc.value;
    actorRollSaveThrow(mm?.targetActor, 'will', {dc: {value: dc}, item: source, origin: mm.mainActor})
}

export async function lingeringComposition(rule: BaseRule, mm: MessageForHandling) {
    const pack = game.packs.get("xdy-pf2e-workbench.asymonous-benefactor-macros-internal");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === 'XDY DO_NOT_IMPORT Lingering Fortissimo')?.toObject())
    }
}

export async function fortissimoComposition(rule: BaseRule, mm: MessageForHandling) {
    const pack = game.packs.get("pf2e-macros.macros");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === 'Inspire Heroics / Fortissimo Composition')?.toObject())
    }
}

export async function extendBoost(rule: BaseRule, mm: MessageForHandling) {
    const pack = game.packs.get("pf2e-eidolon-helper.pf2e-eidolon-helper-macros");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === "Extend Boost")?.toObject())
    }
}

export async function guidanceHandler(rule: BaseRule, mm: MessageForHandling) {
    const target = mm.targetActor || mm.mainActor;

    if (game.pf2e.Predicate.test(["origin:item:tag:amped", {"not": "alternate-amp"}], mm.rollOptions)) {
        addItemToActor(target, await createItemObjectUuid("Compendium.pf2e.spell-effects.Item.3qHKBDF7lrHw8jFK", mm))
    } else if (mm.rollOptions.has("target:effect:guidance-immunity")) {
        ui.notifications.warn(`The target is immune to Guidance Spell.`);
        return;
    } else {
        addItemToActor(target, await createItemObjectUuid("Compendium.pf2e.spell-effects.Item.3qHKBDF7lrHw8jFK", mm))
        addItemToActor(target, await createItemObjectUuid("Compendium.pf2e.spell-effects.Item.3LyOkV25p7wA181H", mm))
    }
}

export async function addShieldEffect(rule: BaseRule, mm: MessageForHandling) {
    let target;
    let effect = "Compendium.pf2e.spell-effects.Item.Jemq5UknGdMO7b73";
    if (mm.rollOptions.has("origin:item:tag:psi-cantrip") && mm.rollOptions.has("origin:item:tag:amped")) {
        target = mm.targetActor || mm.mainActor;
        effect = "Compendium.pf2e.spell-effects.Item.N1b28wOrZmuSjN9i"
    } else if (mm.rollOptions.has("origin:item:tag:psi-cantrip") && !mm.rollOptions.has("origin:item:tag:amped")) {
        target = mm.targetActor || mm.mainActor;
    } else {
        target = mm.mainActor;
    }
    if (!target) {
        ui.notifications.warn(`Select correct target`);
        return;
    }

    if (target.getRollOptions().includes("self:effect:shield-immunity")) {
        ui.notifications.warn(`The target is immune to Shield Spell.`);
        return;
    }
    addItemToActor(target, await createItemObjectUuid(effect, mm));
}

export async function deleteShieldEffect(rule: BaseRule, mm: MessageForHandling) {
    const actor = mm.mainActor as Actor;
    const shieldEff = getEffectBySourceId(actor, "Compendium.pf2e.spell-effects.Item.Jemq5UknGdMO7b73");
    if (shieldEff) {
        deleteItem(shieldEff);
        addItemToActor(actor, await createItemObjectUuid('Compendium.pf2e.spell-effects.Item.QF6RDlCoTvkVHRo4', mm))
    }
}

export async function deleteShieldEffectAmp(rule: BaseRule, mm: MessageForHandling) {
    const actor = mm.mainActor as Actor;
    const shieldEff = getEffectBySourceId(actor, "Compendium.pf2e.spell-effects.Item.N1b28wOrZmuSjN9i");
    if (shieldEff) {
        const isLast = shieldEff.badge.value === 1;
        shieldEff.decrease();
        if (isLast) {
            addItemToActor(actor, await createItemObjectUuid('Compendium.pf2e.spell-effects.Item.QF6RDlCoTvkVHRo4', mm))
        }
    }
}

export async function deleteSelfishShield(rule: BaseRule, mm: MessageForHandling) {
    deleteItem(getEffectBySourceId(mm.mainActor, "Compendium.pf2e.feat-effects.Item.h6nyMp4dtPXBfCJc"));
}

export async function shieldsOfTheSpiritDamage(rule: BaseRule, mm: MessageForHandling) {
    const target = mm.targetActor as Actor;
    const eff = getEffectBySourceId(target, "Compendium.pf2e.spell-effects.Item.mlvDokpnQBhvQrSk");
    if (eff?.origin && target.uuid !== eff.origin?.uuid) {
        const origin = eff?.origin as Actor;
        const originEffect = getEffectBySourceId(origin, "Compendium.pf2e.spell-effects.Item.mlvDokpnQBhvQrSk");
        if (!originEffect) {
            return
        }
        const roll = new GlobalNamespace.DamageRoll(`${Math.ceil(originEffect.level / 2)}d4[spirit]`);
        await roll.evaluate({async: true});

        roll.toMessage(
            {
                speaker: ChatMessage.getSpeaker({token: mm.targetToken}),
                flags: {
                    pf2e: {
                        target: {actor: mm.mainActor.uuid, token: mm.mainToken.uuid},
                        context: {target: {actor: mm.mainActor.uuid, token: mm.mainToken.uuid},}
                    },
                },
            }
        );
    }

    const secEff = getEffectBySourceId(target, "Compendium.pf2e.spell-effects.Item.5AIV3cCLUt442Mmp");
    if (secEff) {
        const roll = new GlobalNamespace.DamageRoll(`${Math.ceil(secEff.level / 2)}d4[spirit]`);
        await roll.evaluate({async: true});

        roll.toMessage(
            {
                speaker: ChatMessage.getSpeaker({token: mm.targetToken}),
                flags: {
                    pf2e: {
                        target: {actor: mm.mainActor.uuid, token: mm.mainToken.uuid},
                        context: {target: {actor: mm.mainActor.uuid, token: mm.mainToken.uuid},}
                    },
                },
            }
        );
    }
}

export async function frostbiteAmped(rule: BaseRule, mm: MessageForHandling) {
    const eff = effectUUID('yYvPtdlew2YctMgt');
    const damage = mm.messageFlags?.pf2e?.appliedDamage?.updates?.[0]?.value ?? 0;
    if (!damage) {
        return
    }

    const aEffect = (await fromUuid(eff)).toObject();
    aEffect.system.rules[0].value = Math.floor(damage / 2) ?? 0;
    aEffect.system.duration.unit = "minutes";

    const _e = getEffectBySourceId(mm.item.actor, eff);
    if (_e) {
        _e.delete()
        addItemToActor(mm.item.actor, aEffect);
    } else {
        addItemToActor(mm.item.actor, aEffect);
    }
}

export async function entropicWheel(rule: BaseRule, mm: MessageForHandling) {
    const eff = (await fromUuid("Compendium.pf2e.spell-effects.Item.znwjWUvGOFQ6VYaE")).toObject()
    if (mm.rollOptions.has("amped")) {
        eff.system.badge.value = 2
    }
    addItemToActor(mm.mainActor, eff)
}

export async function buzzingBites(rule: BaseRule, mm: MessageForHandling) {
    const effObj = (await fromUuid(effectUUID('Vn57RpGjnNBtAfnj'))).toObject();
    effObj.flags[moduleName] = {
        'sustained-damage': {
            outcome: mm.messageFlags?.pf2e?.context?.outcome,
            spell: mm.messageFlags?.pf2e?.origin?.uuid,
            castRank: mm.messageFlags?.pf2e?.origin?.castRank,
        }
    }

    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        origin: {actor: mm.item?.actor?.uuid, item: mm.item?.uuid}
    });

    addItemToActor(mm.mainActor, effObj);
}

export async function synesthesia(rule: BaseRule, mm: MessageForHandling) {
    const eff = effectUUID('dyuItanPd1SRPZBc');
    const effObj = (await fromUuid(eff)).toObject();
    effObj.system.context = foundry.utils.mergeObject(effObj.system.context ?? {}, {
        origin: {actor: mm.item.actor?.uuid, item: mm.item?.uuid}
    });

    if (mm.rollOptions.has("outcome:success")) {
        effObj.system.duration.unit = "rounds";
    }

    addItemToActor(mm.mainActor, effObj);
}

export async function petrifyEffect(rule: BaseRule, mm: MessageForHandling) {
    const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
    newEffect._id = foundry.utils.randomID()
    newEffect.name = 'Effect: Petrify (Failure)';
    newEffect.system.slug = 'effect-petrify-failure';

    const newRule = {
        "key": "GrantItem",
        "onDeleteActions": {"grantee": "restrict"},
        "uuid": "Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3"
    };
    if (mm.rollOptions.has("outcome:criticalFailure")) {
        newRule["alterations"] = [{
            "mode": "override",
            "property": "badge-value",
            "value": 2
        }];
    }
    newEffect.system.rules.push(newRule)

    const item = mm.item;

    newEffect.system.context = foundry.utils.mergeObject(newEffect.system.context ?? {}, {
        origin: {
            actor: mm?.messageFlags?.pf2e?.origin?.actor ?? mm?.messageFlags?.pf2e?.context?.origin?.actor,
            item
        },
    });

    newEffect.flags[moduleName] = foundry.utils.mergeObject(newEffect.flags[moduleName] ?? {}, {
        rollEffect: {
            when: 'end',
            item
        },
    });

    addItemToActor(mm.mainActor, newEffect);
}

export async function dehydrateEffect(rule: BaseRule, mm: MessageForHandling) {
    const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
    newEffect._id = foundry.utils.randomID()
    newEffect.name = 'Effect: Dehydrate';
    newEffect.system.slug = 'effect-dehydrate';
    newEffect.system.duration.expiry = 'turn-end'
    newEffect.system.duration.unit = 'minutes'
    newEffect.system.duration.value = 1

    const cond = game.pf2e.ConditionManager.getCondition('persistent-damage')
    const newRule = {
        "key": "GrantItem",
        "onDeleteActions": {"grantee": "cascade"},
        "uuid": cond.sourceId
    };

    const dices = ((Math.round(spell.level / 2 - 1) * 3) + 1)
    newRule["alterations"] = [{
        "mode": "override",
        "property": "persistent-damage",
        "value": {
            "damageType": "fire",
            "formula": `${dices}d6`
        }
    }];
    newEffect.system.rules.push(newRule)

    const item = mm?.messageFlags?.pf2e?.origin?.uuid;

    newEffect.system.context = foundry.utils.mergeObject(newEffect.system.context ?? {}, {
        origin: {
            actor: mm?.messageFlags?.flags?.pf2e?.origin?.actor ?? mm?.messageFlags?.flags?.pf2e?.context?.origin?.actor,
            item
        },
    });

    newEffect.flags[moduleName] = foundry.utils.mergeObject(newEffect.flags[moduleName] ?? {}, {
        rollEffect: {
            when: 'end',
            item
        },
    });

    addItemToActor(mm.mainActor, newEffect)
}

export async function blessingOfDefiance(rule: BaseRule, mm: MessageForHandling) {
    if (mm.item.flags?.[moduleName]?.ignoreBlessingOfDefiance) {
        return
    }
    const activeToken = mm.item.actor?.getActiveTokens(true, false)?.[0] as Token;
    if (!activeToken) {
        return
    }

    const targetActors = activeToken.scene.tokens.filter(a => a.object.distanceTo(activeToken) <= 30)
        .map(a => a.actor)
        .filter(a => a.isAllyOf(activeToken.actor))

    const eff = mm.item.toObject();
    eff.flags = mm.item.flags;
    eff.flags[moduleName] = {ignoreBlessingOfDefiance: true};
    eff.system.context = foundry.utils.mergeObject(eff.system.context ?? {}, {
        "origin": {
            "actor": mm.item.actor.uuid,
            "item": mm.item?.uuid,
            "token": activeToken.document.uuid
        }
    });

    targetActors.forEach(actor => addItemToActor(actor, eff))
}

async function agitateInformation(rule: BaseRule, mm: MessageForHandling) {
    if (!isActiveGM()) {
        return
    }
    const value = await Dialog.confirm({
        title: "Check",
        content: `Should damage be rolled because actor not use Stride, Fly or Swim action?`,
    });

    if (!value) {
        return
    }

    let agitate = getEffectBySourceId(mm.mainActor, "Compendium.pf2e-automations.effects.Item.NXzdAozn7oODIdai");
    if (agitate) {
        let baseSpell = await fromUuid(agitate?.system?.context?.origin?.item)
        if (baseSpell) {
            let variant = baseSpell.loadVariant({castRank: agitate.level}) ?? baseSpell;
            mm.mainToken.object.setTarget(true, {releaseOthers: true})
            await variant.rollDamage({})
            mm.mainToken.object.setTarget(false)
            return
        }
    }
    ui.notifications.warn(`Can't roll damage because information about spell is broken please do it manually`)
}

async function forbiddingWard(rule: BaseRule, mm: MessageForHandling) {
    let itemData = await createItemObjectUuid("Compendium.pf2e.spell-effects.Item.ctMxYPGEpstvhW9C", mm);
    if (!mm.tokenTargets.size || mm.tokenTargets.size === 1) {
        addItemToActor(mm.mainActor, itemData)
    } else if (mm.tokenTargets.size === 2) {
        let ally = mm.tokenTargets.find(t => mm.mainActor?.isAllyOf(t.actor) || t.actor === mm.mainActor)?.document
        if (!ally) {
            ui.notifications.warn(`Need to select ally as target`)
            return
        }
        let enemy = mm.tokenTargets.find(t => t.document !== ally)?.document;
        if (!enemy) {
            ui.notifications.warn(`Need to select ally as target`)
            return
        }

        let markRule = itemData.system.rules.find(r => r.key === 'TokenMark');
        if (markRule) {
            markRule['uuid'] = enemy.uuid;
        }

        addItemToActor(ally.actor, itemData)
    } else {
        ui.notifications.warn(`Incorrect number of targets`)
    }
}

async function elementalBetrayal(r: HandlerRule, mm: MessageForHandling) {
    const parent = game.user.targets.first().actor;
    if (!parent) {
        ui.notifications.info(`Need to select target`);
        return;
    }
    const itemSource = await createItemObjectUuid("Compendium.pf2e.spell-effects.Item.y4y0nusC97R7ZDL5", mm)
    const rule = itemSource.system.rules[0];

    const effect = new CONFIG.Item.documentClass(itemSource, {parent});

    const ele = new game.pf2e.RuleElements.builtin.ChoiceSet(foundry.utils.deepClone(rule), {parent: effect});
    await ele.preCreate({itemSource, ruleSource: rule, tempItems: []});

    createDocumentsParent(parent, [itemSource])
}

async function maskOfTerrorSave(r: HandlerRule, mm: MessageForHandling) {
    let target = mm.targetActor as Actor;
    let effect = target.itemTypes.effect.find(e => e.sourceId === "Compendium.pf2e-automations.effects.Item.Pdq3C29GY18nbVg9")
    if (!effect) {
        return;
    }
    let effectOwner = effect.origin;
    let dc = effectOwner.attributes.spellDC.value;

    actorRollSaveThrow(mm.mainActor, 'will', {dc: {value: dc}, item: effect, origin: effectOwner})
}

async function equalFooting(r: HandlerRule, mm: MessageForHandling) {
    let target = mm.mainActor as Actor;
    let effect = (await fromUuid("Compendium.pf2e.spell-effects.Item.MFvCd82lxTQGZERm")).toObject()
    if (!effect) {
        return;
    }
    effect.system.rules[0].selection = mm.rollOptions.has("outcome:criticalFailure") ? "critical-failure" : "failure"

    addItemToActor(target, effect);
}

async function dutifulChallenge(r: HandlerRule, mm: MessageForHandling) {
    let token = mm.mainToken;
    let target = mm.targetActor;
    if (!target || !token) {
        return;
    }
    let effect = (await fromUuid("Compendium.pf2e.spell-effects.Item.UH2sT6eW5e31Xytd")).toObject()
    if (!effect) {
        return;
    }
    effect.system.rules[0].uuid = token.uuid
    addItemToActor(target, effect);
}

function blazingArmoryDelete(r: HandlerRule, mm: MessageForHandling) {
    let granted = Object.values(mm.item?.getFlag('pf2e', 'itemGrants') || {}).map(r => r.id);
    if (!granted) {
        return;
    }

    granted.forEach((grantedItem) => {
        mm.mainActor.items.get(grantedItem).delete();
    })
}

export const SPELL_FUNCTIONS = {
    'agitateInformation': agitateInformation,
    'forbiddingWard': forbiddingWard,
    'elementalBetrayal': elementalBetrayal,
    'maskOfTerrorSave': maskOfTerrorSave,
    'equalFooting': equalFooting,
    'dutifulChallenge': dutifulChallenge,
    'blazingArmoryDelete': blazingArmoryDelete,
}