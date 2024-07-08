let ACTIVE_RULES = []
let socketlibSocket = undefined;
let DamageRoll = undefined;

const setupSocket = () => {
    if (globalThis.socketlib) {
        socketlibSocket = globalThis.socketlib.registerModule(moduleName);
        socketlibSocket.register("setEffectToActorId", setEffectToActorId);
        socketlibSocket.register("increaseConditionForActorId", increaseConditionForActorId);
        socketlibSocket.register("decreaseConditionForActorId", decreaseConditionForActorId);
        socketlibSocket.register("removeConditionFromActorId", removeConditionFromActorId);
        socketlibSocket.register("applyDamageById", applyDamageById);
        socketlibSocket.register("removeEffectFromActorId", removeEffectFromActorId);
        socketlibSocket.register("deleteItemById", deleteItemById);
        socketlibSocket.register("addItemToActorId", addItemToActorId);
        socketlibSocket.register("deleteEffectFromActorId", deleteEffectFromActorId);
        socketlibSocket.register("updateItemById", updateItemById);

    	socketlibSocket.register("createDocumentsParent", createDocumentsParent);

    	socketlibSocket.register("updateActiveRules", updateActiveRules);
    }
    return !!globalThis.socketlib;
};

Hooks.once("setup", function () {
    if (!setupSocket()) console.error("Error: Unable to set up socket lib");
});

Hooks.on("init", () => {
    DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll");
    updateActiveRules()
});

Hooks.on("automations.updateRules", () => {
    socketlibSocket.executeForEveryone("updateActiveRules", game.user.name);
});

function updateActiveRules() {
    ACTIVE_RULES = game.settings
        .get(moduleName, "rules")
        .filter((a) => a.isActive && a.target != "None" && (a.value?.length > 0 || a.values?.length > 0));
};

Hooks.once("ready", () => {
    const cur = getSetting("ruleVersion") ?? 0;

    fetch(`modules/${moduleName}/rules/rules.json`)
    .then(async (response) => {
        if (response.ok) {
            return await response.json();
        } else {
            ui.notifications.info(`Sync file not found`);
            throw new Error("Sync file not found");
        }
    })
    .then(async (json) => {
        if ((json.version ?? 0) > cur && isGM()) {
            ui.notifications.warn(`Module ${game.modules.get(moduleName).title} has new rules, please sync it`);
        }
    });
});

Hooks.on("createChatMessage", async (message, options, userId) => {
    if (game.userId != userId) { return }
    if (hasOption(message, "skip-handling-message")) return;
    let item = message.item
        ?? await fromUuid(message?.flags?.pf2e?.origin?.sourceId)
        ?? await fromUuid(message?.flags?.pf2e?.origin?.uuid);

    setTimeout(
        () => {
            handleCreateChatMessage(message, item);
        },
        message.isReroll ? 500 : 0
    );
});

async function handleCreateChatMessage(message, _obj) {
    try {
        await Promise.all(
            ACTIVE_RULES.map(async (rule) => {
                await handleMessages(rule, message, _obj);
            })
        );

        let activeHandlers = (getSetting("messageCreateHandlers") ?? []).filter((a) => a.isActive);

        await Promise.all(
            activeHandlers.map(async (handler) => {
                await registeredMessageCreateHandler[handler.name]?.call(this, message);
            })
        );
    } catch (error) {
        console.log(error);
    } finally {
        setTimeout(() => {
            Hooks.callAll("pf2e-automations.rulesHandled", message);
        }, 100);
    }
};

async function handleMessages(rule, message, _obj = undefined) {
    if (!rule.requirements.every((a) => handleRequirementGroup(a, message, _obj))) {
        return;
    }
    if (rule.triggers.some((a) => handleTriggerGroup(a, message, _obj))) {
        rule?.type === 'complex' ? handleComplexRuleTarget(rule, message, _obj) : handleTarget(rule, message, _obj);
    }
};

function handleRequirementGroup(group, message, _obj) {
    if (group.operator === "AND") {
        return group.values.every((a) => handleRequirement(a, message, _obj));
    } else if (group.operator === "OR") {
        return group.values.some((a) => handleRequirement(a, message, _obj));
    } else if (group.operator === "NOT") {
        return !group.values.some((a) => handleRequirement(a, message, _obj));
    }
    return false;
};

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
        if (game.user.targets.size != 1 && !message.target) {
            return false;
        }
        if (message.target) {
            return hasEffectBySourceId(message.target.actor, req.value);
        } else {
            return hasEffectBySourceId(game.user.targets.first().actor, req.value);
        }
    } else if (req.requirement === "TargetHasCondition") {
        if (game.user.targets.size != 1 && !message.target) {
            return false;
        }
        if (message.target) {
            return hasCondition(message.target.actor, req.value);
        } else {
            return hasCondition(game.user.targets.first().actor, req.value);
        }
    } else if (req.requirement === "TargetHasTrait") {
        if (game.user.targets.size != 1 && !message.target) {
            return false;
        }
        if (message.target) {
            return message?.target?.actor?.traits?.has(req.value);
        } else {
            return game.user.targets.first().actor?.traits?.has(req.value);
        }
    } else if (req.requirement === "ItemHasTrait") {
        if (!message.item) { return false; }
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
    }
    return false;
};

function handleTriggerGroup(group, message, _obj) {
    if (group.operator === "AND") {
        return group.values.every((a) => handleTrigger(a, message, _obj));
    } else if (group.operator === "OR") {
        return group.values.some((a) => handleTrigger(a, message, _obj));
    } else if (group.operator === "NOT") {
        return !group.values.some((a) => handleTrigger(a, message, _obj));
    }
    return false;
};

function handleTrigger(t, message, _obj) {
    if (t.objType === "group") {
        return handleTriggerGroup(t, message, _obj);
    }

    if (t.encounter && !game?.combats?.active) {
        return false;
    }
    if (t.trigger === "EqualsSlug" && _obj?.slug != t.value) {
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
    if (t.trigger === "EqualsSourceId" && _obj?.sourceId != t.value) {
        return false;
    }
    if (t.messageType && !isCorrectMessageType(message, t.messageType)) {
        return false;
    }
    return true;
};

function durationIsValid(duration) {
    return duration.expiry != null || duration.sustained != null || duration.unit != null || duration.value != null
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
        "rules": [
        ],
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
        default:
            break;
    }

    if (!targetActor) {return}
    if (!durationIsValid(value.duration)) {
        for (let condition of value.conditions) {
            let result = parseCondition(condition);
            if (result) {
                await increaseConditionForActor(targetActor, result.name, result.value);
            }
        }
        for (let effect of value.effects) {
            await setEffectToActor(targetActor, effect, _obj?.level, preparedOptionalData(message));
        }
    } else {
        if (value.conditions.length) {
            let newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
            newEffect._id = foundry.utils.randomID()
            newEffect.system.duration.expiry = value.duration.expiry || "turn-start";
            newEffect.system.duration.sustained = value.duration.sustained || false;
            newEffect.system.duration.unit = value.duration.unit || "unlimited";
            newEffect.system.duration.value = value.duration.value ?? -1;

            for (let condition of value.conditions) {
                let result = parseCondition(condition);
                if (result) {
                    let cond = game.pf2e.ConditionManager.getCondition(result.name)
                    let newRule = {
                        "key": "GrantItem",
                        "onDeleteActions": { "grantee": "restrict" },
                        "uuid": cond.sourceId
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
    if (rule.target === "SelfEffect") {
        await setEffectToActor(message.actor, rule.value, _obj?.level, preparedOptionalData(message));
    } else if (rule.target === "TargetEffect") {
        await setEffectToTarget(message, rule.value, _obj?.level, preparedOptionalData(message));
    } else if (rule.target === "TargetEffectActorNextTurn") {
        await setEffectToTargetActorNextTurn(message, rule.value);
    } else if (rule.target === "SelfEffectActorNextTurn") {
        await setEffectToSelfActorNextTurn(message, rule);
    } else if (rule.target === "SelfOrTargetEffect") {
        await setEffectToActorOrTarget(message, rule.value, preparedOptionalData(message));
    } else if (rule.target === "TargetsEffect") {
        game.user.targets.forEach(async (tt) => {
            await setEffectToActor(tt.actor, rule.value, _obj?.level, preparedOptionalData(message));

        });
    } else if (rule.target === "SelfOrTargetsEffect") {
        if (game.user.targets.size === 0) {
            await setEffectToActor(message.actor, rule.value, _obj?.level, preparedOptionalData(message));
        } else {
            game.user.targets.forEach(async (tt) => {
                await setEffectToActor(tt.actor, rule.value, _obj?.level, preparedOptionalData(message));
            });
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
        let result = parseCondition(rule.value);
        if (result) {
            await increaseConditionForActor(message.actor, result.name, result.value);
        }
    } else if (rule.target === "SelfDecreaseCondition") {
        let result = parseCondition(rule.value);
        if (result) {
            await decreaseConditionForActor(message.actor, result.name, result.value);
        }
    } else if (rule.target === "TargetAddCondition") {
        let result = parseCondition(rule.value);
        if (result) {
            if (message.target) {
                await increaseConditionForActor(message.target.actor, result.name, result.value);
            } else if (game.user.targets.size === 1) {
                await increaseConditionForActor(game.user.targets.first().actor, result.name, result.value);
            }
        }
    } else if (rule.target === "RunMacro") {
        (await fromUuid(rule.value))?.execute();
    } else if (rule.target === "PartyEffect") {
        let members = [...message.actor.parties.map(p=>p.members)].flat();
        for (let m of members) {
            await setEffectToActor(m, rule.value, _obj?.level, preparedOptionalData(message));
        }
    }
};