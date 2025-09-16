import {BaseRule, HandlerRule, MessageForHandling} from "../rule";
import {EMPTY_EFFECT, GlobalNamespace, moduleName} from "../const";
import {
    distanceIsCorrect,
    effectUUID,
    executeMacro,
    getAllEffectBySourceIdAndOwner,
    getEffectBySourceId,
    getFeatBySourceId,
    showName,
    triggerType
} from "../helpers";
import {
    actorRollSaveThrow,
    addConditionForActor,
    addItemToActor,
    changeCarryTypeToWorn,
    createDocumentsParent,
    deleteItem,
    sendGMNotification
} from "../global-f";
import {createItemObjectUuid} from "../hooks/functions";

export async function explorationEffectIcon(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.data?.system?.exploration) {
        return;
    }
    const data = mm.data as { system: { exploration: string[] } };
    const actor = mm.mainActor as Actor;

    const currentActivities = data.system.exploration.map(id => actor.items.get(id)?.slug) as string[];

    // delete unselected effects
    const effects = actor.itemTypes.effect.filter(e => GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS_SWAP[e.sourceId]);
    for (const e of effects) {
        if (!currentActivities.includes(GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS[e.sourceId])) {
            e.delete()
            if (e.sourceId === effectUUID("XiVLHjg5lQVMX8Fj")) {
                const pack = game.packs.get("perceptive.perceptive");
                if (pack) {
                    const tok = actor.getActiveTokens()[0];
                    if (tok) {
                        tok.control({releaseOthers: true})
                        executeMacro((await pack.getDocuments()).find((i) => i.name === 'Remove lingering AP selected')?.toObject())
                        tok.release()
                    }
                }
            }
        }
    }

    for (const activity of currentActivities) {
        const effectUuid = GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS[activity];
        if (effectUuid) {
            addItemToActor(actor, await createItemObjectUuid(effectUuid, mm))
        }
    }

    const foll = getEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3");
    if (!currentActivities.includes("follow-the-expert") && foll) {
        foll.delete();
    }
    if (!foll && currentActivities.includes("follow-the-expert")) {
        addItemToActor(actor, await createItemObjectUuid("Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3", mm))
    }

    const scout = getEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF");
    if (!currentActivities.includes("scout") && scout?.system?.context?.origin?.actor === actor.uuid) {
        scout.delete();
    }
    if (!scout && currentActivities.includes("scout")) {
        addItemToActor(actor, await createItemObjectUuid("Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF", mm))
    }

    const partyMembers = [...actor.parties.map(p => p.members)].flat().filter(a => a.uuid !== actor.uuid);
    if (partyMembers.length > 0) {
        const is = mm.rollOptions.has("feat:incredible-scout");
        const ded = mm.rollOptions.has("feat:scout-dedication");

        if (currentActivities.includes("scout")) {
            for (const pm of partyMembers) {
                addItemToActor(pm, await createItemObjectUuid(
                    ded ? effectUUID('U7tuKcRePhSu2C2P') : is ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF",
                    mm
                ))
            }
        } else {
            for (const tt of partyMembers) {
                const _ef = getEffectBySourceId(tt, ded ? effectUUID('U7tuKcRePhSu2C2P') : is ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
                if (_ef && _ef?.system?.context?.origin?.actor === actor.uuid) {
                    deleteItem(_ef)
                }
            }
        }
    }
}

export async function notifyExplorationActivity(rule: BaseRule, mm: MessageForHandling) {
    const data = mm.data as { system: { exploration: string[] } };
    const actor = mm.mainActor as Actor;

    if (!data?.system?.exploration) {
        return;
    }
    if (!actor.system.exploration) {
        return;
    }

    const newActivity = data.system.exploration.map(a => actor.items.get(a).name) as string[];
    const oldActivity = foundry.utils.deepClone(actor.system.exploration).map(a => actor.items.get(a).name);

    const messages = []

    const stop = oldActivity.filter(x => !newActivity.includes(x)) as string[];
    let stopWord: string | undefined;
    if (stop.length === 0) {
        stopWord = ""
    } else if (stop.length === 1) {
        stopWord = stop[0] + ' exploration activity'
    } else {
        stopWord = stop.join(', ') + ' exploration activities'
    }

    let newActivityWord: string | undefined;
    if (newActivity.length === 0) {
        newActivityWord = ""
    } else if (newActivity.length === 1) {
        newActivityWord = newActivity[0] + ' exploration activity'
    } else {
        newActivityWord = newActivity.join(', ') + ' exploration activities'
    }

    if (newActivityWord) {
        messages.push(`${actor.name} is now using ${newActivityWord}.`)
    }

    if (stopWord) {
        messages.push(`${actor.name} has stopped using ${stopWord}.`)
    }

    if (messages.length) {
        ChatMessage.create({
            flags: {
                [moduleName]: {}
            },
            whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: messages.join(' ')
        });
    }
}

export async function conjureBullet(rule: BaseRule, mm: MessageForHandling) {
    const res = await foundry.applications.api.DialogV2.wait({
        content: "Select type of ammon",
        buttons: [{action: "bullet", label: "Bullet"}, {action: "bolt", label: "Bolt"}]
    });
    if (!res) {
        return
    }

    const uuid = res === "bullet"
        ? "Compendium.pf2e.equipment-srd.Item.MKSeXwUm56c15MZa"
        : "Compendium.pf2e.equipment-srd.Item.AITVZmakiu3RgfKo"
    const obj = (await fromUuid(uuid)).toObject()
    obj.system.quantity = 1
    obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {[moduleName]: {tempEndTurn: true}});

    addItemToActor(mm.mainActor, obj)
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
];

export async function rollInitiative(rule: BaseRule, mm: MessageForHandling) {
    const actor = mm.mainActor as Actor;
    const items = actor?.items.filter(a => RollInitiativeItems.includes(a.sourceId));

    for (const item of items) {
        if (await Dialog.confirm({title: item.name, content: "Do you want use free action?",})) {
            item.toMessage();
            return
        }
    }

    const quickTempered = getFeatBySourceId(mm.mainActor, 'Compendium.pf2e.classfeatures.Item.04lXNnt73rF3RNc4');
    if (quickTempered) {
        const armor = mm.mainActor?.itemTypes.armor.find(a => a.isEquipped && a.system.category === 'heavy');
        if (!mm.rollOptions.has('self:condition:encumbered') && !armor) {
            if (await Dialog.confirm({title: "Quick-Tempered", content: "Do you want use free action?",})) {
                quickTempered.toMessage();
                addItemToActor(mm.mainActor, await createItemObjectUuid('Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr', mm))
            }
        }
    }
}

export async function rageImmunity(rule: BaseRule, mm: MessageForHandling) {
    addItemToActor(mm.mainActor, await createItemObjectUuid('Compendium.pf2e.feat-effects.Item.MaepXeSHiMoWDm7u', mm))
}

export async function criticalSpecializationSpear(rule: BaseRule, mm: MessageForHandling) {
    addItemToActor(mm.targetActor, await createItemObjectUuid(effectUUID('lsICo0LAyrWy2cDm'), mm))
}

export async function criticalSpecializationSword(rule: BaseRule, mm: MessageForHandling) {
    addItemToActor(mm.targetActor, await createItemObjectUuid(effectUUID('YsNqG4OocHoErbc9'), mm))
}

export async function criticalSpecializationBow(rule: BaseRule, mm: MessageForHandling) {
    if (mm.targetToken?.elevation === 0) {
        addConditionForActor(mm.targetActor, "immobilized")
    }
}

export async function criticalSpecializationAxe(rule: BaseRule, mm: MessageForHandling) {
    let lastAttack = game.messages.contents
        .slice(-10).reverse()
        .find(m => triggerType(m) === "attack-roll" && m.item === mm.item)
    if (!lastAttack || !mm.targetToken) {
        return
    }
    lastAttack = Number(lastAttack.content)
    if (isNaN(lastAttack)) {
        return
    }

    const targets = mm.targetToken.scene.tokens.contents
        .filter(a => distanceIsCorrect(a, mm.targetToken, 5))
        .filter(t => !t.hidden)
        .filter(t => t.actor !== mm.mainActor)
        .filter(t => t.actor !== mm.targetActor)
        .filter(t => !t.actor.itemTypes.condition.find(c => c.slug === 'undetected'))
        .filter(t => !t.actor.itemTypes.condition.find(c => c.slug === 'invisible'))
        .filter(t => t.actor.isEnemyOf(mm.mainActor))
        .filter(t => distanceIsCorrect(t, mm.mainToken, mm.mainActor.attributes.reach.base + (mm.item.traits.has('reach') ? 5 : 0)))

    const damageType = mm.roll?.terms[0]?.rolls[0]?.options?.flavor;
    const diceTotal = mm.roll?.terms[0]?.dice[0]?.total ?? 0;

    if (targets.length === 1) {
        handleAddDamage(mm, targets[0], lastAttack, diceTotal, damageType)
    } else if (targets.length > 1) {
        const selects = targets.map(w => `<option value=${w.uuid}>${showName(w) ? w.name : 'Unknown token'}</option>`).join('');

        const {uuid} = await Dialog.wait({
            title: "Select target",
            content: ` <select id="map">     ${selects} </select>  `,
            buttons: {
                ok: {
                    label: "Attack", icon: "<i class='fa-solid fa-hand-fist'></i>", callback: (html) => {
                        return {uuid: html[0].querySelector("#map").value}
                    }
                }, cancel: {label: "Cancel", icon: "<i class='fa-solid fa-ban'></i>",}
            },
            default: "ok"
        });
        if (!uuid) {
            return
        }
        handleAddDamage(mm, targets.find(a => a.uuid === uuid), lastAttack, diceTotal, damageType)
    } else {
        ChatMessage.create({
            flags: {
                [moduleName]: {}
            },
            user: game.user.id,
            content: `No targets for Critical Specialization Axe`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        });
    }
}

async function handleAddDamage(mm: MessageForHandling, target, lastAttack, totalDamage, damageType) {
    const newDc = target.actor.getStatistic("armor").dc.value

    if (newDc > lastAttack) {
        ChatMessage.create({
            flags: {
                [moduleName]: {}
            },
            user: game.user.id,
            content: `Target of Critical Specialization has bigger DC than attack roll`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        });
    } else {
        const roll = new GlobalNamespace.DamageRoll(`${totalDamage}[${damageType}]`);
        await roll.evaluate({async: true});

        roll.toMessage(
            {
                speaker: mm.speaker,
                flags: {
                    "pf2e-toolbelt.targetHelper.targets": [target.uuid],
                    pf2e: {
                        target: {actor: target.actor.uuid, token: target.uuid},
                        context: {target: {actor: target.actor.uuid, token: target.uuid}}
                    },
                },
            }
        );
    }
}

export async function criticalSpecializationFortitudeRollSavingThrow(rule: BaseRule, mm: MessageForHandling) {
    actorRollSaveThrow(mm.targetActor, 'fortitude', {
            dc: {
                value: mm.mainActor.attributes.classDC.value
            },
            item: mm.item,
            origin: mm.mainActor,
            extraRollOptions: ["critical-specialization", `critical-specialization-${mm.item?.group || 'brawling'}`]
        },
    )
}

export async function criticalSpecializationReflexRollSavingThrow(rule: BaseRule, mm: MessageForHandling) {
    actorRollSaveThrow(mm.targetActor, 'reflex', {
            dc: {
                value: mm.mainActor.attributes.classDC.value
            },
            item: mm.item,
            origin: mm.mainActor,
            extraRollOptions: ["critical-specialization", `critical-specialization-${mm.item.group}`]
        },
    )
}

export async function disarm(rule: BaseRule, mm: MessageForHandling) {
    const targetActor = mm.targetActor as Actor;
    if (targetActor?.isOfType('character')) {
        const availableWeapons = targetActor.system.actions.filter(a => a.ready && !a.item.parentItem && !a.item.traits?.has("unarmed")).map(a => a.item)
        if (availableWeapons.length === 0) {
            ui.notifications.info(`Target can not be disarmed`);
            return
        } else {
            let w;
            if (availableWeapons.length === 1) {
                w = availableWeapons[0]
            } else {
                const weaponOptions = availableWeapons.map(w => `<option value=${w.id}>${w.name}</option>`).join('');
                const {currentWeapon} = await foundry.applications.api.DialogV2.wait({
                    window: {title: 'Select target'},
                    content: ` <select id="fob1" autofocus>     ${weaponOptions} </select>  `,
                    buttons: [{
                        action: "ok",
                        label: "Select",
                        icon: "<i class='fa-solid fa-hand-fist'></i>",
                        callback: (event, button, form) => {
                            return {currentWeapon: $(form).find("#fob1").val(),}
                        }
                    }, {action: "cancel", label: "Cancel", icon: "<i class='fa-solid fa-ban'></i>",}],
                    default: "ok"
                });
                if (!currentWeapon) {
                    return
                }
                w = availableWeapons.find(a => a.id === currentWeapon);
            }
            changeCarryTypeToWorn(w)
        }
    }
    if (targetActor?.isOfType('npc')) {
        const availableWeapons = targetActor.system.actions.filter(a => a.item?.getFlag("pf2e", "linkedWeapon"));
        if (!availableWeapons.length) {
            ui.notifications.info(`Target can not be disarmed`);
            return
        } else {
            if (!targetActor.items.find(a => a.name === "Fist")) {
                const meleeWeapon = targetActor.items.find(a => a.type === 'melee')
                const linkedWeapon = targetActor.items.get(meleeWeapon?.getFlag("pf2e", "linkedWeapon"))

                addItemToActor(targetActor, {
                    "img": "icons/svg/sword.svg",
                    "name": "Fist",
                    "system": {
                        "attack": {"value": ""},
                        "attackEffects": {"value": []},
                        "bonus": {"value": Math.round(1.5 * targetActor.level + 7) - 2 - (linkedWeapon?.system?.runes?.potency ?? 0)},
                        "damageRolls": {
                            "i5fbgj11zgotcbbvldhv": {
                                "damage": `1d4+${targetActor.system.abilities.str.mod}`,
                                "damageType": "bludgeoning"
                            }
                        },
                        "description": {"value": ""},
                        "rules": [],
                        "slug": null,
                        "traits": {"rarity": "common", "value": ["agile", "finesse", "nonlethal", "unarmed"]},
                        "weaponType": {"value": "melee"}
                    },
                    "type": "melee"
                })
            }
        }
    }

    ui.notifications.info(`${mm.mainActor.name} disarmed target`);
}

export async function huntPrey(rule: BaseRule, mm: MessageForHandling) {
    const size = mm.tokenTargets.size;
    const doublePrey = mm.rollOptions.has("feat:double-prey");
    if (size !== 1 && !doublePrey) {
        ui.notifications.info(`${mm.mainActor.name} needs to choose target for Hunt Prey`);
        return;
    }
    if ((size !== 1 && size !== 2) && doublePrey) {
        ui.notifications.info(`${mm.mainActor.name} needs to choose 1 ot 2 targets for Hunt Prey`);
        return;
    }

    const tokens = mm.mainToken.scene.tokens as Token[];
    tokens.map(token => token.actor)
        .filter(a => !!a)
        .flatMap(a => {
            return getAllEffectBySourceIdAndOwner(a, effectUUID('a51AN6VfpW9b4ttm'), mm.mainActor.uuid)
        })
        .forEach(effect => deleteItem(effect));

    const aEffect = (await fromUuid(effectUUID('a51AN6VfpW9b4ttm'))).toObject();
    aEffect.name = aEffect.name.replace("Actor", mm.mainActor.name)
    aEffect.img = mm.mainToken?.texture?.src
    aEffect.system.context = foundry.utils.mergeObject(aEffect.system.context ?? {}, {
        "origin": {
            "actor": mm.mainActor?.uuid,
            "item": mm?.item?.uuid,
            "token": mm.mainToken?.uuid
        }
    });

    for (const t of game.user.targets) {
        addItemToActor(t.actor, aEffect);
    }

    if (!mm.mainActor?.rollOptions.all['hunted-prey']) {
        mm.mainActor?.toggleRollOption("all", "hunted-prey")
    }
}

export function treatWoundsAction(rule: BaseRule, mm: MessageForHandling) {
    if (!game.combat?.started) {
        if (!(mm.roll instanceof GlobalNamespace.CheckRoll)) {
            return
        }
        if (mm.tokenTargets.size === 1) {
            const [first] = mm.tokenTargets;
            treatWounds(mm, first.actor);
        } else if (mm.rollOptions.has("feat:ward-medic")) {
            game.user.targets.forEach(a => {
                treatWounds(mm, a.actor);
            });
        } else {
            ui.notifications.info(`Need to select 1 token as target`);
        }
    }
}

export async function battleMedicineAction(rule: BaseRule, mm: MessageForHandling) {
    if (game.combat?.started) {
        if (!(mm.roll instanceof GlobalNamespace.CheckRoll)) {
            return
        }
        if (!mm.rollOptions.has("feat:battle-medicine")) {
            ui.notifications.info(`${mm.mainActor.name} hasn't Battle Medicine Feat`);
            return;
        }

        if (game.user.targets.size === 1) {
            const [first] = game.user.targets;

            const immuns = [
                ...getAllEffectBySourceIdAndOwner(first.actor, "Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", mm.mainActor.uuid),
            ]
            let applyTreatWoundsImmunity = true;

            if (immuns.length > 0) {
                if (mm.rollOptions.has("feat:medic-dedication")) {
                    if (immuns.length > 1) {
                        applyTreatWoundsImmunity = false;
                        if (mm.mainActor.system.skills.med.rank >= 3) {
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
                let itemData = await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", mm);
                if (mm.mainToken) {
                    itemData.img = mm.mainToken.texture.src;
                }
                if (isActorHeldEquipment(mm.mainActor, "battle-medics-baton")
                    || mm.rollOptions.has("feature:forensic-medicine-methodology")
                    || first.actor?.rollOptions.all["feat:robust-health"]
                ) {
                    itemData.system.duration.unit = "hours";
                    addItemToActor(first.actor, itemData)
                } else {
                    addItemToActor(first.actor, itemData)
                }
            } else {
                ui.notifications.info(`${first.actor.name} has Battle Medicine Immunity`);
            }
        }
    }
}

function isActorHeldEquipment(actor: Actor, item: string) {
    return actor?.itemTypes?.equipment?.find(a => a.isHeld && a.slug === item)
}

async function treatWounds(mm: MessageForHandling, target: Actor) {
    if (!target.rollOptions?.all['self:effect:treat-wounds-immunity']) {
        let itemData = await createItemObjectUuid("Compendium.pf2e.feat-effects.Lb4q2bBAgxamtix5", mm);
        if (mm.mainToken) {
            itemData.img = mm.mainToken.texture.src;
        }
        if (mm.rollOptions.has("feat:continual-recovery")) {
            itemData.system.duration.unit = "minutes";
            itemData.system.duration.value = 10;
        }
        addItemToActor(target, itemData)
    } else {
        ui.notifications.info(`${target.name} has Treat Wounds Immunity`);
    }
}

export async function feintCriticalFailure(rule: BaseRule, mm: MessageForHandling) {
    await setFeintEffect(mm, true, true)
}

export async function feint(rule: BaseRule, mm: MessageForHandling) {
    const scoundrel = mm.rollOptions.has("feature:scoundrel");

    if (mm.rollOptions.has("goading-feint")) {
        let eff = await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.rflbFzV44Fd6aBLE", mm);
        let cSet = eff.system.rules.filter(r=>r.key==="ChoiceSet");
        if (cSet.length === 1) {
            cSet[0].selection = mm.rollOptions.has("outcome:criticalSuccess") ? "critical-success" : "success";
        }
        addItemToActor(mm.targetActor, eff, mm?.messageId)
    } else  if (mm.rollOptions.has("outcome:criticalSuccess") && scoundrel) {
        addItemToActor(mm.targetActor, await createItemObjectUuid("Compendium.pf2e-automations-patreon.effects.Item.YsNqG4OocHoErbc9", mm), mm?.messageId)
    } else if (mm.rollOptions.has("outcome:criticalSuccess") || scoundrel) {
        await setFeintEffect(mm, true)
    } else {
        await setFeintEffect(mm, false)
    }
    if (mm.rollOptions.has("feat:distracting-feint")) {
        addItemToActor(mm.targetActor, await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.7hRgBo0fRQBxMK7g", mm), mm?.messageId)
    }
    if (mm.rollOptions.has("feat:devrins-dazzling-diversion")) {
        const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
        newEffect._id = foundry.utils.randomID()
        newEffect.system.rules.push({
            "key": "GrantItem",
            "onDeleteActions": {"grantee": "restrict"},
            "uuid": "Compendium.pf2e.conditionitems.Item.TkIyaNPgTZFBCCuh"
        })
        newEffect.system.context = {
            "origin": {
                "actor": mm.mainActor?.uuid,
                "item": mm.item?.uuid,
                "token": mm.mainToken?.uuid
            }
        };
        newEffect.name += "Devrin's Dazzling Diversion";
        if (mm.rollOptions.has("outcome:criticalSuccess")) {
            newEffect.system.duration.unit = "rounds";
            newEffect.system.duration.value = 1;
        } else {
            newEffect.system.duration.expiry = "turn-end";
            newEffect.system.duration.unit = "rounds";
            newEffect.system.duration.value = 0;
        }
        addItemToActor(mm.targetActor, newEffect);
    }
}

export async function deleteFeintEffects(rule: BaseRule, mm: MessageForHandling) {
    const aef = mm.mainActor?.itemTypes.effect.find(e => e.slug === `effect-feint-success-${mm.mainActor?.id}-${mm?.targetActor?.id}`)
    const tef = mm.targetActor?.itemTypes.effect.find(e => e.slug === `effect-feint-success-${mm.mainActor?.id}`)
    if (aef && tef) {
        deleteItem(aef)
        deleteItem(tef)
    }
}

async function setFeintEffect(mm: MessageForHandling, isCrit = false, isCritFail = false) {
    const actor = isCritFail ? mm.targetActor : mm.mainActor;
    const target = isCritFail ? mm.mainActor : mm.targetActor;

    const effect = (await fromUuid(isCrit ? effectUUID('lwcyhD03jVchmPGm') : effectUUID('P6DGk2h38xE8O0pw'))).toObject();
    let actorId = actor.id.toLowerCase();
    let targetId = target.id.toLowerCase();

    effect.system.slug = effect.system.slug.replace("attacker", actorId)
    effect.name += ` ${actor.name}`
    effect.system.context = foundry.utils.mergeObject(effect.system.context ?? {}, {
        "origin": {
            "actor": mm.mainActor?.uuid,
            "item": mm?.item?.uuid,
            "token": mm.mainToken?.uuid
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

    addItemToActor(actor, aEffect);
    addItemToActor(target, effect);

    if (isCrit) {
        let qq = getEffectBySourceId(actor, effectUUID("VQlbBXSi4o6xZ9XM"))
        if (qq) {
            deleteItem(qq);

            qq = qq.toObject()
            qq.system.duration.unit = "rounds"
            qq.system.duration.value = 1;

            addItemToActor(actor, qq);
        }
    }
}

export async function demoralize(rule: BaseRule, mm: MessageForHandling) {
    const targetActor = mm.targetActor as Actor;
    const dd = getAllEffectBySourceIdAndOwner(targetActor, effectUUID("DFLW2gzu0PGeX6zu"), mm.mainActor.uuid)
    if (dd.length === 0) {
        const i = (mm?.targetActor?.attributes?.immunities?.map(a => a.type) ?? []) as string[];
        if (i.some(d => ["mental", "fear-effects", "emotion"].includes(d))) {
            sendGMNotification(`${targetActor.name} has Immunity to Demoralize action. Has mental, fear or emotion immunity`);
        } else {
            const decryThief = mm.rollOptions.has("feat:decry-thief");
            if (mm.rollOptions.has("outcome:success")) {
                addConditionForActor(targetActor, "frightened 1");
                if (decryThief) {
                    addItemToActor(targetActor, await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.FyaekbWsazkJhJda", mm))
                }
            } else if (mm.rollOptions.has("outcome:criticalSuccess")) {
                addConditionForActor(targetActor, "frightened 2");
                if (decryThief) {
                    addItemToActor(targetActor, await createItemObjectUuid("Compendium.pf2e.feat-effects.Item.kAgUld9PcI4XkHbq", mm))
                }
            }
        }
        let itemData = await createItemObjectUuid(effectUUID('DFLW2gzu0PGeX6zu'), mm);
        itemData.img = mm.mainToken.texture.src;
        itemData.name += `  (${mm.mainActor.name})`
        addItemToActor(targetActor, itemData)
    }
}

export function escape(rule: BaseRule, mm: MessageForHandling) {
    [...getAllEffectBySourceIdAndOwner(mm.mainActor, effectUUID("zol83j7l2cBSmY3a"), mm.targetActor.uuid),
        ...getAllEffectBySourceIdAndOwner(mm.mainActor, effectUUID("5MNn6cmXxbORB8x8"), mm.targetActor.uuid)
    ]
        .forEach(e => {
            deleteItem(e)
        })
}

export function trueShapeBomb(rule: BaseRule, mm: MessageForHandling) {
    ui.notifications.info(`${mm.mainActor.name} fails saving-throw. Need to delete morph/polymorph effects from actor`);
}


export async function masterStrike(rule: BaseRule, mm: MessageForHandling) {
    const target = mm.targetActor;
    if (!target) {
        return
    }
    addItemToActor(target, await createItemObjectUuid(effectUUID('gVd4wmPDvwpD7hsC'), mm))
}

export async function handleMasterStrikeResult(rule: BaseRule, mm: MessageForHandling) {
    if (mm.rollOptions.has("outcome:criticalFailure")) {
        ChatMessage.create({
            flags: {
                [moduleName]: {}
            },
            type: CONST.CHAT_MESSAGE_TYPES.OOC,
            content: `The ${mm.mainToken?.name} is paralyzed for 4 rounds, knocked @UUID[Compendium.pf2e.conditionitems.Item.fBnFDH2MTzgFijKf]{Unconscious} for 2 hours, or killed (your choice).`
        });
    } else if (mm.rollOptions.has("outcome:failure")) {
        addItemToActor(mm.mainActor, await createItemObjectUuid(effectUUID('5Mk3CmmLDTLVf8l5'), mm))
    } else if (mm.rollOptions.has("outcome:success")) {
        const originActor = mm.messageFlags?.pf2e?.origin?.actor ?? mm.messageFlags?.pf2e?.context?.origin?.actor;
        if (originActor) {
            const o = (await fromUuid(effectUUID('KLd1H370WVyj1uih'))).toObject();
            o.system.context = {
                "origin": {
                    "actor": originActor,
                    "item": mm.item?.uuid,
                    "rollOptions": mm.item?.getRollOptions(),
                }
            };

            addItemToActor(mm.mainActor, o)
        }
    }
}

export async function debilitatingStrikeAttack(rule: BaseRule, mm: MessageForHandling) {
    if (mm.rollOptions.has("outcome:criticalSuccess")) {
        if (mm.rollOptions.has('second-debilitation:critical') || mm.rollOptions.has('debilitation:critical')) {
            mm.mainActor.itemTypes.feat.find(a => 'Compendium.pf2e.feats-srd.Item.lPTcPIshChHWz4J6' === a.sourceId)?.toMessage()
        }
    }

    const eff = 'Compendium.pf2e.feat-effects.Item.yBTASi3FvnReAwHy'
    const effDamage = 'Compendium.pf2e.feat-effects.Item.ZZXIUvZqqIxkMfYa'
    if (mm.rollOptions.has('second-debilitation:off-guard')
        || mm.rollOptions.has('second-debilitation:enfeebled')
        || mm.rollOptions.has('second-debilitation:speed-penalty')
        || mm.rollOptions.has('second-debilitation:precision-damage')
        || mm.rollOptions.has('second-debilitation:reduce-cover')
        || mm.rollOptions.has('second-debilitation:prevent-flanking')
        || mm.rollOptions.has('debilitation:off-guard')
        || mm.rollOptions.has('debilitation:enfeebled')
        || mm.rollOptions.has('debilitation:speed-penalty')
        || mm.rollOptions.has('debilitation:precision-damage')
        || mm.rollOptions.has('debilitation:reduce-cover')
        || mm.rollOptions.has('debilitation:prevent-flanking')
    ) {
        const exist = [
            ...getAllEffectBySourceIdAndOwner(mm.targetActor, eff, mm.mainActor.uuid),
            ...getAllEffectBySourceIdAndOwner(mm.targetActor, effDamage, mm.mainActor.uuid)
        ];
        for (const i of exist) {
            deleteItem(i)
        }

        deleteItem(getEffectBySourceId(mm.mainActor, effDamage));

        if (mm.rollOptions.has('second-debilitation:precision-damage') || mm.rollOptions.has('debilitation:precision-damage')) {
            addItemToActor(mm.mainActor, await createItemObjectUuid(effDamage, mm))
        }
    }
}

export async function debilitatingStrike(rule: BaseRule, mm: MessageForHandling) {
    const rules = []

    if (mm.rollOptions.has('second-debilitation:enfeebled') || mm.rollOptions.has('debilitation:enfeebled')) {
        rules.push({
            "key": "GrantItem",
            "onDeleteActions": {"grantee": "restrict"},
            "uuid": "Compendium.pf2e.conditionitems.Item.MIRkyAjyBeXivMa7"
        })
    }

    if (mm.rollOptions.has('second-debilitation:speed-penalty') || mm.rollOptions.has('debilitation:speed-penalty')) {
        rules.push({
            "key": "FlatModifier", "selector": "speed", "slug": "second-debilitation-speeds", "type": "circumstance", "value": -10
        })
    }

    if (mm.rollOptions.has('second-debilitation:reduce-cover') || mm.rollOptions.has('debilitation:reduce-cover')) {
        rules.push({
            "key": "AdjustModifier", "mode": "add", "selector": "ac", "slug": "cover", "value": -2
        });
        rules.push({
            "key": "AdjustModifier", "mode": "upgrade", "selector": "ac", "slug": "cover", "value": 0
        });
    }

    if (mm.rollOptions.has('second-debilitation:off-guard') || mm.rollOptions.has('debilitation:off-guard')) {
        rules.push({
            "key": "GrantItem",
            "onDeleteActions": {"grantee": "restrict"},
            "uuid": "Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg"
        })
    }

    if (mm.rollOptions.has('second-debilitation:prevent-flanking') || mm.rollOptions.has('debilitation:prevent-flanking')) {
        rules.push({
            "key": "ActiveEffectLike", "mode": "override", "path": "system.attributes.flanking.canFlank", "value": false
        });
    }

    if (rules.length === 0) {
        return
    }

    const eff = await createItemObjectUuid('Compendium.pf2e.feat-effects.Item.yBTASi3FvnReAwHy', mm)
    eff.system.rules = rules;
    addItemToActor(mm.targetActor, eff);
}

export async function grab(rule: BaseRule, mm: MessageForHandling) {
    if (mm.item?.system?.attackEffects?.value?.includes('grab')) {
        confirmGrapple(mm, "Do you want to spend action to grapple target?");
    }
}

export async function grabImproved(rule: BaseRule, mm: MessageForHandling) {
    if (mm.item?.system?.attackEffects?.value?.includes('improved-grab')) {
        confirmGrapple(mm, "Do you want to grapple target?");
    }
}

export async function grapple(rule: BaseRule, mm: MessageForHandling) {
    if (mm.item?.system?.attackEffects?.value?.includes('grapple')) {
        confirmGrapple(mm, "Do you want to spend action to grapple target?");
    }
}

async function confirmGrapple(mm: MessageForHandling, text: string) {
    const confirm = await Dialog.confirm({
        title: "Grapple Action", content: text,
    });
    if (!confirm) {
        return
    }

    game.pf2e.actions.grapple({actors: [mm.mainActor]})
}

export async function push(rule: BaseRule, mm: MessageForHandling) {
    if (mm.item?.system?.attackEffects?.value?.includes('push')) {
        const confirm = await Dialog.confirm({
            title: "Push Action", content: "Do you want to push target?",
        });
        if (!confirm) {
            return
        }
        game.pf2e.actions.shove({actors: [mm.mainActor]})
    }
}


export async function knockdown(rule: BaseRule, mm: MessageForHandling) {
    if (mm.item?.system?.attackEffects?.value?.includes('knockdown')
        || mm.item?.system?.attackEffects?.value?.includes('improved-knockdown')
    ) {
        const confirm = await Dialog.confirm({
            title: mm.item?.system?.attackEffects?.value?.includes('improved-knockdown') ? "Improved Knockdown free action" : "Knockdown action",
            content: "Do you want to knockdown target?",
        });
        if (!confirm) {
            return
        }

        game.pf2e.actions.trip({actors: [mm.mainActor]})
    }
}

export async function tamper(rule: BaseRule, mm: MessageForHandling) {
    const parent = mm.targetActor;
    if (!parent) {
        return
    }

    const confirm = await Dialog.confirm({
        title: "Target of Tamper",
        content: `Select target</br></br><select id="map"> <option value="armor">Armor</option> <option value="weapon">Weapon</option>  </select></br></br>`,
        yes: (html) => html.find("#map").val()
    });
    if (!confirm) {
        return
    }

    if (confirm === 'armor') {
        const itemSource = (await fromUuid(
            mm.rollOptions.has("outcome:criticalSuccess") ? 'Compendium.pf2e.feat-effects.Item.rzcpTJU9MvW1x1gz' : 'Compendium.pf2e.feat-effects.Item.IfRkgjyh0JzGalIy'
        ))?.toObject();
        itemSource.system.context = {
            "origin": {
                "actor": mm.mainActor.uuid,
                "item": mm.item?.uuid,
                "rollOptions": foundry.utils.deepClone(mm.messageFlags.pf2e.context.options),
                "spellcasting": null,
                "token": mm.mainToken.uuid
            }
        };

        createDocumentsParent(parent, [itemSource])
    } else {
        let itemSource = (await fromUuid(
            mm.rollOptions.has("outcome:criticalSuccess") ? 'Compendium.pf2e.feat-effects.Item.o7qm13OmaYOMwgib' : 'Compendium.pf2e.feat-effects.Item.4QWayYR3JSL9bk2T'
        ))?.toObject();
        itemSource.system.context = {
            "origin": {
                "actor": mm.mainActor.uuid,
                "item": mm.item?.uuid,
                "rollOptions": foundry.utils.deepClone(mm.messageFlags.pf2e.context.options),
                "spellcasting": null,
                "token": mm.mainToken.uuid
            }
        };
        itemSource = foundry.utils.deepClone(itemSource);
        const rule = itemSource.system.rules[0];

        const effect = new CONFIG.Item.documentClass(itemSource, {parent});

        const ele = new game.pf2e.RuleElements.builtin.ChoiceSet(foundry.utils.deepClone(rule), {parent: effect});
        await ele.preCreate({itemSource, ruleSource: rule, tempItems: []});

        createDocumentsParent(parent, [itemSource])
    }
}

function rollWeaponRune(target: Actor, label: string, value: number, weapon: Item, origin: Actor) {
    actorRollSaveThrow(target, "fortitude", {
        dc: {label: label, value},
        item: weapon,
        origin
    });
}

export async function deleteHoldingBreath(rule: BaseRule, mm: MessageForHandling) {
    if (!mm.mainActor) {
        return
    }
    let actor = mm.mainActor;

    let suffocating = foundry.utils.deepClone(EMPTY_EFFECT);
    suffocating._id = foundry.utils.randomID()
    suffocating.name = `Effect: Suffocating`
    suffocating.system.rules.push({
        "key": "GrantItem",
        "onDeleteActions": {"grantee": "restrict"},
        "uuid": "Compendium.pf2e.conditionitems.Item.fBnFDH2MTzgFijKf"
    })
    suffocating.system.slug = 'effect-suffocating'
    suffocating.system.badge = {type: 'counter', value: 1}

    addItemToActor(actor, suffocating)
}

export async function suffocatingEndTurn(rule: BaseRule, mm: MessageForHandling) {
    const actor = mm.mainActor;
    let ef = actor?.itemTypes.effect.find(e => e.slug === "effect-suffocating")
    if (!ef) {
        return
    }
    let damageCount = ef.badge.value;
    let dc = 20 + (ef.badge.value - 1) * 5;

    let result = await ef.actor.saves.fortitude.roll({
        dc,
        extraRollOptions: ["suffocating"]
    })

    if (result?.degreeOfSuccess === 0) {
        ChatMessage.create({
            flags: {
                [moduleName]: {}
            },
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: `${ef.actor.name} is dead`
        });
        ef.delete();
    } else if (result?.degreeOfSuccess === 1) {
        const roll = new GlobalNamespace.DamageRoll(`${damageCount}d10`);
        await roll.evaluate();
        roll.toMessage({
            speaker: {
                alias: actor.name
            },
            flags: {
                pf2e: {
                    target: {actor: actor.uuid, token: mm.mainToken?.uuid},
                    context: {target: {actor: actor.uuid, token: mm.mainToken?.uuid}}
                },
            },
        });
    }
    ef.increase()
}

const RUNES_DC = {
    'thundering': {label: 'Thundering Rune DC', value: 24},
    'brilliant': {label: 'Brilliant Rune DC', value: 29},
    'frost': {label: 'Frost Rune DC', value: 24},
    'greater-thundering': {label: 'Greater Thundering Rune DC', value: 34},
    'greater-brilliant': {label: 'Greater Brilliant Rune DC', value: 41},
    'greater-frost': {label: 'Greater Frost Rune DC', value: 34},
} as { [key: string]: { label: string; value: number } | undefined };

async function weaponRunes(rule: BaseRule, mm: MessageForHandling) {
    const target = mm.targetActor;
    const mainActor = mm.mainActor;
    if (!target || !mainActor) {
        return;
    }
    const options = [...mm.rollOptions];

    options
        .filter(r => r.startsWith("item:rune:property:"))
        .map(r => r.replace("item:rune:property:", ""))
        .map(r => RUNES_DC[r])
        .filter(r => !!r)
        .forEach(a => {
            rollWeaponRune(target, a.label, a.value, mm.item, mainActor)
        });

    let item1Uuid = options.find(s => s.startsWith("crit-item-1:signature:"))?.replace("crit-item-1:signature:", "");
    let item1 = mainActor.system.actions.find(a => a.item.uuid === item1Uuid)?.item

    let item2Uuid = options.find(s => s.startsWith("crit-item-2:signature:"))?.replace("crit-item-2:signature:", "");
    let item2 = mainActor?.system.actions.find(a => a.item.uuid === item2Uuid)?.item

    options
        .filter(r => r.startsWith("crit-item-1:rune:property:"))
        .map(r => r.replace("crit-item-1:rune:property:", ""))
        .map(r => RUNES_DC[r])
        .filter(r => !!r)
        .forEach(a => {
            rollWeaponRune(target, a.label, a.value, item1, mainActor)
        });

    options
        .filter(r => r.startsWith("crit-item-2:rune:property:"))
        .map(r => r.replace("crit-item-2:rune:property:", ""))
        .map(r => RUNES_DC[r])
        .filter(r => !!r)
        .forEach(a => {
            rollWeaponRune(target, a.label, a.value, item2, mainActor)
        });
}

async function weaponShockRune(rule: HandlerRule, mm: MessageForHandling) {
    if (!mm.targetToken) {
        return;
    }
    let electrDamage = mm?.roll?.instances?.find(i => i?.options?.flavor === 'electricity')?.total
    if (!electrDamage) {
        return;
    }

    let tokens = mm.targetToken.scene.tokens.contents
        .filter(a => distanceIsCorrect(a, mm.targetToken, 10))
        .filter(t => t !== mm.targetToken);
    if (!tokens.length) {
        return
    }

    let tokensMap = tokens
        .reduce(function (obj, t) {
            obj[t.uuid] = t;
            return obj;
        }, {})

    const options = tokens
        .map(t => `<option value="${t.uuid}">${t.name} (${t.combatant?.initiative || '-'})</option>`)
        .join("")

    const {data} = await foundry.applications.api.DialogV2.wait({
        window: {title: 'Select up to 2 targets for Shock rune damage'},
        content: `
                    <select id="fob1" autofocus multiple style="height: 150px; max-width: 100%">
                        ${options}
                    </select>
                `,
        buttons: [{
            action: "ok", label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
            callback: (event, button, form) => {
                return {
                    data: $(form).find("#fob1").val(),
                }
            }
        }, {
            action: "cancel",
            label: "Cancel",
            icon: "<i class='fa-solid fa-ban'></i>",
        }],
        default: "ok"
    });
    if (!data) {
        return
    }
    let shockTargets = data.map(t => tokensMap[t]);

    shockTargets.forEach(target => targetDamageRoll(foundry.utils.deepClone(mm.speaker), target, `${electrDamage}[electricity]`))
}

async function targetDamageRoll(speakerData, token: Token, formula: string) {
    const roll = new GlobalNamespace.DamageRoll(formula);
    await roll.evaluate();

    roll.toMessage(
        {
            speaker: speakerData,
            flags: {
                pf2e: {
                    context: {
                        type: "damage-roll",
                        actor: token.actor?.id,
                        token: token?.id,
                        domains: ["damage"],
                        target: {actor: token.actor.uuid, token: token.uuid},
                    },
                    target: {actor: token.actor.uuid, token: token.uuid},
                }
            },
        }
    );
}

export const ACTION_FUNCTIONS = {
    'weaponRunes': weaponRunes,
    'weaponShockRune': weaponShockRune,
}