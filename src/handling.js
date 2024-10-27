let ALL_ACTIVE_RULES = {}
let DamageRoll = undefined;


function sendGMNotification(content) {
    if (game.user.isGM) {
        ui.notifications.info(content);
    } else {
        executeAsGM("sendGMNotification", content);
    }
}


let FORM_LABELS = {}

Hooks.on("init", () => {
    DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll");
    updateActiveRules()

    let unsorted = {
        ...CONFIG.PF2E.ancestryTraits,
        ...CONFIG.PF2E.actionTraits,
        ...CONFIG.PF2E.classTraits,
        ...CONFIG.PF2E.effectTraits
    };
    FORM_LABELS = Object.keys(unsorted).sort().reduce(
        (obj, key) => {
            obj[key] = unsorted[key];
            return obj;
        },
        {}
    );
});

function updateActiveRulesForAll() {
    updateActiveRules()
    executeForAll("updateActiveRules")
}

function mapRule(a) {
    return {
        name: a.name,
        type: a.type,
        triggerType: a.triggerType,
        target: a.target,
        range: a.range,
        predicate: a.predicate,
        requirements: a.requirements,
        triggers: a.triggers,
        value: a.value,
        values: a.values,
    }
}

function updateActiveRules() {
    let pf2e = game.settings
        .get(moduleName, "rules")
        .filter((a) => a.isActive && a.target !== "None" && (a.value?.length > 0 || a.values?.length > 0))
        .map(a => mapRule(a));
    let sf2e = game.settings
        .get(moduleName, "rules-sf2e")
        .filter((a) => a.isActive && a.target !== "None" && (a.value?.length > 0 || a.values?.length > 0))
        .map(a => mapRule(a));

    ALL_ACTIVE_RULES = [...pf2e, ...sf2e].reduce((obj, value) => {
        obj[value.triggerType] ??= [];
        obj[value.triggerType].push(value);
        return obj;
    }, {});
}

const VERSION = {
    'rules': 'ruleVersion',
    'sf2e': 'ruleVersion-sf2e',
}

const SETTING = {
    'rules': 'rules',
    'sf2e': 'rules-sf2e',
}

const SOCKET_NAME = "module.pf2e-automations";

function executeAsGM(request, data) {
    game.socket.emit(SOCKET_NAME, {request, data});
}

function executeForAll(request, data) {
    game.socket.emit(SOCKET_NAME, {request, data, users: game.users.map((u) => u.uuid)});
}

function socketListener() {
    game.socket.on(SOCKET_NAME, async (...[message, userId]) => {
        const sender = game.users.get(userId, {strict: true});
        console.log(`${sender.name} send message`)
        console.log(message)
        switch (message.request) {
            case "updateActiveRules":
                updateActiveRules()
                break;
            case "createDocumentsParent":
                if (game.user === game.users.activeGM) {
                    await createDocumentsParentId(message.data.data, message.data.parent)
                }
                break;
            case "sendGMNotification":
                if (game.user === game.users.activeGM) {
                    await sendGMNotification(message.data)
                }
                break;
            case "setEffectToActor":
                if (game.user === game.users.activeGM) {
                    let {actorId, effUuid, level, optionalData} = message.data
                    await setEffectToActorId(actorId, effUuid, level, optionalData)
                }
                break;
            case "updateItem":
                if (game.user === game.users.activeGM) {
                    let {uuid, data} = message.data
                    await updateItemById(uuid, data)
                }
                break;
            case "deleteEffectFromActor":
                if (game.user === game.users.activeGM) {
                    let {uuid, slug} = message.data
                    await deleteEffectFromActorId(uuid, slug)
                }
                break;
            case "increaseConditionForActor":
                if (game.user === game.users.activeGM) {
                    let {uuid, condition, value} = message.data
                    await increaseConditionForActorId(uuid, condition, value)
                }
                break;
            case "decreaseConditionForActor":
                if (game.user === game.users.activeGM) {
                    let {uuid, condition, value} = message.data
                    await decreaseConditionForActorId(uuid, condition, value)
                }
                break;
            case "removeConditionFromActor":
                if (game.user === game.users.activeGM) {
                    let {uuid, condition, forceRemove} = message.data
                    await removeConditionFromActorId(uuid, condition, forceRemove)
                }
                break;
            case "applyDamage":
                if (game.user === game.users.activeGM) {
                    let {actorUUID, tokenUUID, formula} = message.data
                    await applyDamageById(actorUUID, tokenUUID, formula)
                }
                break;
            case "removeEffectFromActor":
                if (game.user === game.users.activeGM) {
                    let {uuid, effect} = message.data
                    await removeEffectFromActorId(uuid, effect)
                }
                break;
            case "deleteItem":
                if (game.user === game.users.activeGM) {
                    let {uuid} = message.data
                    await deleteItemById(uuid)
                }
                break;
            case "addItemToActor":
                if (game.user === game.users.activeGM) {
                    let {uuid, item} = message.data
                    await addItemToActorId(uuid, item)
                }
                break;
            case "actorRollSaveThrow":
                if (game.user === game.users.activeGM) {
                    let {target, save, dc, item, origin} = message.data
                    await actorRollSaveThrow(await fromUuid(target), save, dc, await fromUuid(item), await fromUuid(origin))
                }
                break;
            default:
                ui.notifications.error("Unknown message request:" + message.request);
        }
    });
}

Hooks.once("ready", async () => {
    if (!isGM()) {
        return
    }

    let aa = await Promise.all(
        ['rules', 'sf2e'].map(name => {
            return fetch(`modules/${moduleName}/rules/${name}.json`)
                .then(async (response) => {
                    if (response.ok) {
                        return await response.json();
                    } else {
                        ui.notifications.info(`Sync file not found`);
                        throw new Error("Sync file not found");
                    }
                })
                .then(async (json) => {
                    let cur = getSetting(VERSION[name]) ?? 0;
                    return (json.version ?? 0) > cur ? name : undefined
                })
        })
    );
    aa = aa.filter(a => !!a);

    if (aa.length) {
        ui.notifications.warn(`Module ${game.modules.get(moduleName).title} has new rules, please sync it`);

        await ChatMessage.create({
            content: `
                    <p>Module ${game.modules.get(moduleName).title} has new rules, please sync it.</p>
                    <button class="sync-rules" data-names="${aa.join(",")}">Sync</button>
                `,
            whisper: game.users.filter((u) => u.isGM).map((u) => u.id)
        });
    }
});

Hooks.on('renderChatMessage', (m, h) => {
    h.find('.sync-rules').on('click', async (event) => {

        let rules = $(event.target).data().names.split(',');

        rules = rules.map(name => {
            return {
                settingName: SETTING[name],
                versionSettingName: VERSION[name],
                jsonName: name
            }
        });

        await syncAllRules(rules, () => {
            m.delete()
        })
    })
});

Hooks.on('pf2e-automations.handle', async m => {
    console.log('pf2e-automations.handle')
    await prepareHandledMessage(m)
})

Hooks.on("createChatMessage", async (message, options, userId) => {
    if (game.userId !== userId) {
        return
    }
    if (hasOption(message, "skip-handling-message")) return;
    await prepareHandledMessage(message)
});

async function prepareHandledMessage(message) {
    let item = message.item
        ?? await fromUuid(message?.flags?.pf2e?.origin?.sourceId)
        ?? await fromUuid(message?.flags?.pf2e?.origin?.uuid);

    setTimeout(
        () => {
            handleCreateChatMessage(message, item);
        },
        message.isReroll ? 500 : 0
    );
}

async function handleCreateChatMessage(message, _obj) {
    const startTime = performance.now()
    let type = triggerType(message);
    let rollOptions = await getRollOptions(message);
    try {
        [...(ALL_ACTIVE_RULES[type] || []), ...(ALL_ACTIVE_RULES[undefined] || [])]
            .filter(r => isValidRule(r, message, _obj, rollOptions))
            .forEach(rule => {
                rule?.type === 'complex' ?
                    handleComplexRuleTarget(rule, message, _obj) :
                    handleTarget(rule, message, _obj);
            })

        let activeHandlers = (getSetting("messageCreateHandlers") ?? []).filter((a) => a.isActive);

        for (let handler of activeHandlers) {
            registeredMessageCreateHandler[handler.name]?.call(this, message);
        }
    } catch (error) {
        console.log(error);
    } finally {
        setTimeout(() => {
            Hooks.callAll("pf2e-automations.rulesHandled", message);
        }, 100);
    }

    const endTime = performance.now()
    console.log(`Call rules ${endTime - startTime} milliseconds`)
}

function isValidRule(rule, message, _obj = undefined, rollOptions) {
    if (rule?.predicate?.length > 0) {
        return checkPredicate(rule?.predicate, rollOptions, {
            actor: message.actor,
            target: message.target?.actor || game.user.targets.first()?.actor
        })
    }
    if (!rule?.predicate?.length && !rule?.requirements?.length && !rule?.triggers?.length) {
        return true
    }
    if (!rule.requirements.every((a) => handleRequirementGroup(a, message, _obj))) {
        return false;
    }
    if (rule.triggers.some((a) => handleTriggerGroup(a, message, _obj))) {
        return true
    }
}

function handleRequirementGroup(group, message, _obj) {
    if (group.operator === "AND") {
        return group.values.every((a) => handleRequirement(a, message, _obj));
    } else if (group.operator === "OR") {
        return group.values.some((a) => handleRequirement(a, message, _obj));
    } else if (group.operator === "NOT") {
        return !group.values.some((a) => handleRequirement(a, message, _obj));
    }
    return false;
}

function handleRequirement(req, message, _obj) {
    if (req.objType === "group") {
        return handleRequirementGroup(req, message, _obj);
    }

    if (req.requirement === "None") {
        return true;
    } else if (req.requirement === "Success") {
        return successMessageOutcome(message);
    } else if (req.requirement === "CriticalSuccess") {
        return criticalSuccessMessageOutcome(message);
    } else if (req.requirement === "AnySuccess") {
        return anySuccessMessageOutcome(message);
    } else if (req.requirement === "Failure") {
        return failureMessageOutcome(message);
    } else if (req.requirement === "CriticalFailure") {
        return criticalFailureMessageOutcome(message);
    } else if (req.requirement === "AnyFailure") {
        return anyFailureMessageOutcome(message);
    } else if (req.requirement === "SelfOrTargetHasEffect") {
        if (game.user.targets.size === 0 && !message.target) {
            return hasEffectBySourceId(message?.actor, req.value);
        } else if (message.target) {
            return hasEffectBySourceId(message.target.actor, req.value);
        } else if (game.user.targets.size === 1) {
            return hasEffectBySourceId(game.user.targets.first().actor, req.value);
        }
    } else if (req.requirement === "ActorHasEffect") {
        return hasEffectBySourceId(message?.actor, req.value);
    } else if (req.requirement === "ActorHasEffectBySlug") {
        return hasEffect(message?.actor, req.value);
    } else if (req.requirement === "ActorHasFeat") {
        return hasFeatBySourceId(message?.actor, req.value);
    } else if (req.requirement === "ActorHasCondition") {
        return hasCondition(message?.actor, req.value);
    } else if (req.requirement === "TargetHasEffect") {
        if (game.user.targets.size !== 1 && !message.target) {
            return false;
        }
        if (message.target) {
            return hasEffectBySourceId(message.target.actor, req.value);
        } else {
            return hasEffectBySourceId(game.user.targets.first().actor, req.value);
        }
    } else if (req.requirement === "TargetHasCondition") {
        if (game.user.targets.size !== 1 && !message.target) {
            return false;
        }
        if (message.target) {
            return hasCondition(message.target.actor, req.value);
        } else {
            return hasCondition(game.user.targets.first().actor, req.value);
        }
    } else if (req.requirement === "TargetHasTrait") {
        if (game.user.targets.size !== 1 && !message.target) {
            return false;
        }
        if (message.target) {
            return message?.target?.actor?.traits?.has(req.value);
        } else {
            return game.user.targets.first().actor?.traits?.has(req.value);
        }
    } else if (req.requirement === "ItemHasTrait") {
        if (!message.item) {
            return false;
        }
        let v = message.item.system?.traits?.value ?? [];
        let o = message.item.system?.traits?.otherTags ?? [];
        return [...v, ...o].includes(req.value)
    } else if (req.requirement === "LvlLess") {
        return message?.item?.level < req.value;
    } else if (req.requirement === "LvlGte") {
        return message?.item?.level >= req.value;
    } else if (req.requirement === "TargetsNumber") {
        return game.user.targets.size <= req.value;
    } else if (req.requirement === "UseEquipment") {
        return !!message?.flags?.pf2e?.origin?.sourceId;
    } else if (req.requirement === "WieldLoadedOneHandedRanged") {
        return !!message?.actor?.itemTypes?.weapon?.find((a) => a.isRanged && a.handsHeld === 1 && a.hands === "1")?.ammo;
    } else if (req.requirement === "ActorName") {
        return message.actor.name === req.value;
    } else if (req.requirement === "MessageDCLabel") {
        return messageDCLabelHas(message, req.value);
    } else if (req.requirement === "TargetIsAnother") {
        return message.actor?.uuid !== (message.target?.uuid || game.user.targets.first()?.actor?.uuid);
    }
    return false;
}

function handleTriggerGroup(group, message, _obj) {
    if (group.operator === "AND") {
        return group.values.every((a) => handleTrigger(a, message, _obj));
    } else if (group.operator === "OR") {
        return group.values.some((a) => handleTrigger(a, message, _obj));
    } else if (group.operator === "NOT") {
        return !group.values.some((a) => handleTrigger(a, message, _obj));
    }
    return false;
}

function handleTrigger(t, message, _obj) {
    if (t.objType === "group") {
        return handleTriggerGroup(t, message, _obj);
    }

    if (t.encounter && !game?.combats?.active) {
        return false;
    }
    if (t.trigger === "EqualsSlug" && _obj?.slug !== t.value) {
        return false;
    }
    if (t.trigger === "HasOption" && !hasOption(message, t.value)) {
        return false;
    }
    if (t.trigger === "HasDomain" && !hasDomain(message, t.value)) {
        return false;
    }
    if (t.trigger === "HasRune" && !message.item?.system?.runes?.property?.includes(t.value)) {
        return false;
    }
    if (t.trigger === "EqualsSourceId" && _obj?.sourceId !== t.value) {
        return false;
    }
    return !(t.messageType && !isCorrectMessageType(message, t.messageType));

}

function durationIsValid(duration) {
    return duration?.expiry != null || duration?.sustained != null || duration?.unit != null || duration?.value != null
}

async function handleComplexRuleTarget(rule, message, _obj = undefined) {
    for (const value of rule.values) {
        await handleComplexRuleTargetValue(rule, value, message, _obj)
    }
}

const EMPTY_EFFECT = {
    "_id": "",
    "img": "systems/pf2e/icons/effects/critical-effect.webp",
    "name": "Generated effect - ",
    "system": {
        "description": {
            "value": ""
        },
        "duration": {
            "expiry": "turn-start",
            "sustained": false,
            "unit": "unlimited",
            "value": -1
        },
        "level": {
            "value": 1
        },
        "rules": [],
        "source": {
            "value": ""
        },
        "start": {
            "initiative": null,
            "value": 0
        },
        "target": null,
        "tokenIcon": {
            "show": true
        },
        "traits": {
            "rarity": "common",
            "value": []
        },
        "slug": ""
    },
    "type": "effect"
}

async function handleComplexRuleTargetValue(rule, value, message, _obj = undefined) {
    let targetActor = undefined;
    let originData = undefined;
    switch (rule.target) {
        case 'SelfEffect':
            targetActor = message.actor
            break;
        case 'SelfEffectActorNextTurn':
            targetActor = message.actor

            originData = {
                origin: {
                    actor: message?.flags?.pf2e?.origin?.actor ?? message?.flags?.pf2e?.context?.origin?.actor,
                    item: _obj?.uuid
                }
            }
            break;
        case 'TargetEffect':
            targetActor = message.target?.actor || game.user.targets.first()?.actor
            break;
        case 'TargetEffectActorNextTurn':
            targetActor = message.target?.actor || game.user.targets.first()?.actor

            originData = {
                origin: {
                    actor: message?.flags?.pf2e?.origin?.actor ?? message?.flags?.pf2e?.context?.origin?.actor,
                    item: _obj?.uuid
                }
            }
            break;
        case 'SelfOrTargetEffect':
            targetActor = message.target?.actor || game.user.targets.first()?.actor || message.actor
            break;
        default:
            break;
    }

    if (!targetActor) {
        return
    }
    if (!durationIsValid(value.duration)) {
        for (let condition of (value.conditions || [])) {
            let result = createCondition(condition);
            if (result) {
                await increaseConditionForActor(targetActor, result.slug, result.value);
            }
        }
        for (let effect of (value.effects || [])) {
            await setEffectToActor(targetActor, effect, _obj?.level, preparedOptionalData(message));
        }
    } else {
        if (value.conditions?.length) {
            let newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
            newEffect._id = foundry.utils.randomID()
            newEffect.system.duration.expiry = value.duration.expiry || "turn-start";
            newEffect.system.duration.sustained = value.duration.sustained || false;
            newEffect.system.duration.unit = value.duration.unit || "unlimited";
            newEffect.system.duration.value = value.duration.value ?? -1;

            for (let condition of value.conditions) {
                let result = createCondition(condition);
                if (result) {
                    let newRule = {
                        "key": "GrantItem",
                        "onDeleteActions": {"grantee": "restrict"},
                        "uuid": result.sourceId
                    };
                    if (result.value > 1) {
                        newRule["alterations"] = [{
                            "mode": "override",
                            "property": "badge-value",
                            "value": 2
                        }];
                    }
                    newEffect.name = rule.name
                    newEffect.system.rules.push(newRule)
                }
            }

            if (originData) {
                newEffect.system.context = foundry.utils.mergeObject(newEffect.system.context ?? {}, {
                    origin: originData.origin,
                });
            }

            await addItemToActor(targetActor, newEffect);
        }
        for (let effect of value.effects) {
            let newEffect = (await fromUuid(effect))?.toObject();
            if (newEffect) {
                newEffect.name = `${rule.name}`;
                newEffect.system.description.value = `Generated effect for ${rule.name}`;
                if (value.duration.expiry != null) {
                    newEffect.system.duration.expiry = value.duration.expiry;
                }
                if (value.duration.sustained != null) {
                    newEffect.system.duration.sustained = value.duration.sustained;
                }
                if (value.duration.unit != null) {
                    newEffect.system.duration.unit = value.duration.unit;
                }
                if (value.duration.value != null) {
                    newEffect.system.duration.value = value.duration.value;
                }
            }
            if (originData) {
                newEffect.system.context = foundry.utils.mergeObject(newEffect.system.context ?? {}, {
                    origin: originData.origin,
                });
            }
            await addItemToActor(targetActor, newEffect);
        }
    }
}

async function handleTarget(rule, message, _obj = undefined) {
    let optionalData = preparedOptionalData(message);

    if (rule.target === "SelfEffect") {
        await setEffectToActor(message.actor, rule.value, _obj?.level, optionalData);
    } else if (rule.target === "TargetEffect") {
        await setEffectToTarget(message, rule.value, _obj?.level, optionalData);
    } else if (rule.target === "TargetEffectActorNextTurn") {
        await setEffectToTargetActorNextTurn(message, rule.value);
    } else if (rule.target === "SelfEffectActorNextTurn") {
        await setEffectToSelfActorNextTurn(message, rule);
    } else if (rule.target === "SelfOrTargetEffect") {
        await setEffectToActorOrTarget(message, rule.value, optionalData);
    } else if (rule.target === "TargetsEffect") {
        for (const tt of game.user.targets) {
            await setEffectToActor(tt.actor, rule.value, _obj?.level, optionalData);
        }
    } else if (rule.target === "SelfOrTargetsEffect") {
        if (game.user.targets.size === 0) {
            await setEffectToActor(message.actor, rule.value, _obj?.level, optionalData);
        } else {
            for (const tt of game.user.targets) {
                await setEffectToActor(tt.actor, rule.value, _obj?.level, optionalData);
            }
        }
    } else if (rule.target === "TargetRemoveCondition") {
        if (game.user.targets.size === 1) {
            await removeConditionFromActor(game.user.targets.first().actor, rule.value, true);
        }
    } else if (rule.target === "SelfRemoveCondition") {
        await removeConditionFromActor(message.actor, rule.value, true);
    } else if (rule.target === "SelfRemoveEffect") {
        await removeEffectFromActor(message.actor, rule.value);
    } else if (rule.target === "TargetRemoveEffect") {
        await removeEffectFromActor(message.target?.actor ?? game.user.targets.first()?.actor, rule.value);
    } else if (rule.target === "SelfDamage") {
        await applyDamage(message.actor, message.token, rule.value);
    } else if (rule.target === "TargetDamage") {
        if (message.target) {
            await applyDamage(message.target.actor, message.target.token, rule.value);
        } else if (game.user.targets.size === 1) {
            await applyDamage(game.user.targets.first().actor, game.user.targets.first(), rule.value);
        }
    } else if (rule.target === "SelfAddCondition") {
        let result = createCondition(rule.value);
        if (result) {
            await increaseConditionForActor(message.actor, result.slug, result.value);
        }
    } else if (rule.target === "SelfDecreaseCondition") {
        let result = createCondition(rule.value);
        if (result) {
            await decreaseConditionForActor(message.actor, result.slug, result.value);
        }
    } else if (rule.target === "TargetAddCondition") {
        let result = createCondition(rule.value);
        if (result) {
            if (message.target) {
                await increaseConditionForActor(message.target.actor, result.slug, result.value);
            } else if (game.user.targets.size === 1) {
                await increaseConditionForActor(game.user.targets.first().actor, result.slug, result.value);
            }
        }
    } else if (rule.target === "RunMacro") {
        (await fromUuid(rule.value))?.execute();
    } else if (rule.target === "PartyEffect") {
        let members = [...message.actor.parties.map(p => p.members)].flat();
        for (let m of members) {
            await setEffectToActor(m, rule.value, _obj?.level, optionalData);
        }
    } else if (rule.target === "TurnOnOption") {
        if (!message.actor?.rollOptions.all[rule.value]) {
            await message.actor.toggleRollOption("all", rule.value)
        }
    } else if (rule.target === "TargetAllyWithinRange") {
        if (message.token) {
            let targets = message.token.scene.tokens
                .filter(t => message.actor.isAllyOf(t.actor))
                .filter(t => distanceIsCorrect(message.token, t, rule.range))
                .map(t => t.actor)
                .filter(a => !!a);
            targets.push(message.actor)

            targets.forEach(a => {
                setEffectToActor(
                    a, rule.value, message.item?.level,
                    {
                        origin: {
                            actor: message?.actor?.uuid,
                            item: message?.item?.uuid,
                            token: message?.token?.uuid
                        },
                    }
                )
            })


        }

    } else if (rule.target === "DecreaseDamageBadgeEffect") {
        await decreaseDamageBadgeEffect(message.actor, rule.value)
    }
}