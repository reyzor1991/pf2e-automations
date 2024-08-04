const moduleName = "pf2e-automations";

function hasPermissions(item) {
  return 3 === item?.ownership[game.user.id] || isGM();
}

function isGM() {
    return game.user.isGM;
}

function translate(value) {
    return game.i18n.localize(`${moduleName}.${value}`)
}

function hasOption(message, opt) {
    return message?.flags?.pf2e?.context?.options?.includes(opt);
}

function hasDomain(message, opt) {
    return message?.flags?.pf2e?.context?.domains?.includes(opt);
}

function hasCondition(actor, con) {
    return actor?.itemTypes?.condition?.find((c) => con === c.slug);
}

function getSetting(name) {
    return game.settings.get(moduleName, name);
}

function failureMessageOutcome(message) {
    return "failure" === message?.flags?.pf2e?.context?.outcome;
}

function criticalFailureMessageOutcome(message) {
    return "criticalFailure" === message?.flags?.pf2e?.context?.outcome;
}

function successMessageOutcome(message) {
    return "success" === message?.flags?.pf2e?.context?.outcome;
}

function criticalSuccessMessageOutcome(message) {
    return "criticalSuccess" === message?.flags?.pf2e?.context?.outcome;
}

function anyFailureMessageOutcome(message) {
    return failureMessageOutcome(message) || criticalFailureMessageOutcome(message);
}

function anySuccessMessageOutcome(message) {
    return successMessageOutcome(message) || criticalSuccessMessageOutcome(message);
}

function hasEffectBySourceId(actor, eff) {
    return actor?.itemTypes?.effect?.find((c) => eff === c.sourceId);
}

function hasFeatBySourceId(actor, eff) {
    return actor?.itemTypes?.feat?.find((c) => eff === c.sourceId);
}

function messageDCLabelHas(message, l) {
    return message?.flags?.pf2e?.context?.dc?.label?.includes(l);
}

function isCorrectMessageType(message, type) {
    if (type === "undefined") {
        return undefined === message?.flags?.pf2e?.context?.type;
    }
    return type === message?.flags?.pf2e?.context?.type;
}

//----------------------
//----------------------
//----------------------

async function setEffectToActorId(actorId, effUuid, level = undefined, optionalData) {
    await setEffectToActor(await fromUuid(actorId), effUuid, level, optionalData);
}

async function setEffectToActor(
    actor,
    effUuid,
    level = undefined,
    optionalData = { name: undefined, icon: undefined, origin: undefined, duplication: false }
) {
    if (!hasPermissions(actor)) {
        socketlibSocket._sendRequest("setEffectToActorId", [actor.uuid, effUuid, level, optionalData], 0);
        return;
    }

    let source = await fromUuid(effUuid);
    let withBa = hasEffectBySourceId(actor, effUuid);
    if (withBa && withBa.system.badge) {
        withBa.update({
            "system.badge.value": (withBa.system.badge.value += 1),
        });
    } else if (!withBa || optionalData?.duplication) {
        source = source.toObject();
        if (optionalData?.name) {
            source.name = optionalData.name;
        }
        if (optionalData?.icon) {
            source.img = optionalData.icon;
        }
        source.flags = foundry.utils.mergeObject(source.flags ?? {}, { core: { sourceId: effUuid } });
        if (level) {
            source.system.level = { value: level };
        }
        if (optionalData?.origin) {
            source.system.context = foundry.utils.mergeObject(source.system.context ?? {}, {
                origin: optionalData?.origin,
            });
        }
        await actor.createEmbeddedDocuments("Item", [source]);
    }
}

async function setEffectToTarget(message, effectUUID) {
    if (!message.target && game.user.targets.size !== 1) {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
        return;
    }

    const targetActor = message.target?.actor ?? game.user.targets.first()?.actor;

    await setEffectToActor(targetActor, effectUUID, message?.item?.level);
}

async function setEffectToTargetActorNextTurn(message, effectUUID) {
    if (!message.target && game.user.targets.size !== 1) {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
        return;
    }

    const targetActor = message.target?.actor ?? game.user.targets.first()?.actor;

    await setEffectToActor(targetActor, effectUUID, message?.item?.level, {
        origin: { actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid },
    });
}

async function setEffectToSelfActorNextTurn(message, rule) {
    let effectUUID = rule.value;
    const _obj = await fromUuid(message?.flags?.pf2e?.origin?.uuid);
    if (_obj) {
        await setEffectToActor(message.actor, effectUUID, message?.item?.level, {
            origin: { actor: _obj.actor?.uuid, item: _obj?.uuid },
            duplication: !!rule?.allowDuplicate,
        });
    } else if (!_obj && message?.flags?.pf2e?.origin?.uuid) {
        let data = message.flags.pf2e.origin.uuid.split(".");
        if (data.length === 4) {
            await setEffectToActor(message.actor, effectUUID, message?.item?.level, {
                origin: { actor: (await fromUuid(data[0] + "." + data[1]))?.uuid, item: undefined },
                duplication: !!rule?.allowDuplicate,
            });
        }
    }
}



async function setEffectToActorOrTarget(message, effectUUID) {
    if (game.user.targets.size === 0 && !message.target) {
        await setEffectToActor(message.actor, effectUUID, message?.item?.level);
    } else if (message.target) {
        await setEffectToActor(message.target.actor, effectUUID, message?.item?.level);
    } else if (game.user.targets.size === 1) {
        await setEffectToActor(game.user.targets.first().actor, effectUUID, message?.item?.level);
    } else {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
    }
}

async function addItemToActorId(actorUuid, item) {
    await addItemToActor(await fromUuid(actorUuid), item);
}

async function addItemToActor(actor, item) {
    if (!hasPermissions(actor)) {
        socketlibSocket._sendRequest("addItemToActorId", [actor.uuid, item], 0);
        return;
    }
    await actor.createEmbeddedDocuments("Item", [item]);
}

async function deleteItemById(itemUuid) {
    await deleteItem(await fromUuid(itemUuid));
}

async function deleteItem(item) {
    if (!item) { return; }
    if (!hasPermissions(item)) {
        socketlibSocket._sendRequest("deleteItemById", [item.uuid], 0);
    } else {
        await item.delete();
    }
}

async function removeConditionFromActorId(actorId, condition, forceRemove = false) {
    await removeConditionFromActor(await fromUuid(actorId), condition, forceRemove);
}

async function removeConditionFromActor(actor, condition, forceRemove = false) {
    if (!hasPermissions(actor)) {
        socketlibSocket._sendRequest("removeConditionFromActorId", [actor.uuid, condition, forceRemove], 0);
        return;
    }

    await actor.decreaseCondition(condition, { forceRemove: forceRemove });
}

async function removeEffectFromActorId(actor, effect) {
    await removeEffectFromActor(await fromUuid(actorId), effect);
}

async function removeEffectFromActor(actor, effect) {
    if (!actor) { return }
    if (!hasPermissions(actor)) {
        socketlibSocket._sendRequest("removeEffectFromActorId", [actor.uuid, effect], 0);
        return;
    }

    actor.itemTypes.effect.find((a) => a.flags?.core?.sourceId === effect)?.delete();
}

function parseFormula(actor, formula) {
    return `${formula.replace("@actor.level", actor.level)}`;
}

async function applyDamageById(actorUUID, tokenUUID, formula) {
    await applyDamage(await fromUuid(actorUUID), await fromUuid(tokenUUID), formula);
}

async function applyDamage(actor, token, formula) {
    if (!hasPermissions(actor)) {
        socketlibSocket._sendRequest("applyDamageById", [actor.uuid, token.uuid, formula], 0);
        return;
    }

    const roll = new DamageRoll(parseFormula(actor, formula));
    await roll.evaluate({ async: true });
    actor.applyDamage({ damage: roll, token });
    roll.toMessage({ speaker: { alias: actor.name } });
}

async function increaseConditionForActorId(actorId, condition, value = undefined) {
    await increaseConditionForActor(await fromUuid(actorId), condition, value);
}

async function increaseConditionForActor(actor, condition, value = undefined) {
    if (!hasPermissions(actor)) {
        socketlibSocket._sendRequest("increaseConditionForActorId", [actor.uuid, condition, value], 0);
        return;
    }

    let activeCondition = undefined;
    const valueObj = {};
    if (value) {
        activeCondition = hasCondition(actor, condition);
        if (activeCondition && activeCondition?.value >= value) {
            return;
        } else if (activeCondition) {
            valueObj["value"] = value - activeCondition.value;
        } else {
            valueObj["value"] = value;
        }
    }

    await actor.increaseCondition(condition, valueObj);
}

async function decreaseConditionForActorId(actorId, condition, value = undefined) {
    await decreaseConditionForActor(await fromUuid(actorId), condition, value);
}

async function decreaseConditionForActor(actor, condition, value = undefined) {
    if (!hasPermissions(actor)) {
        socketlibSocket._sendRequest("decreaseConditionForActorId", [actor.uuid, condition, value], 0);
        return;
    }

    let activeCondition = hasCondition(actor, condition);
    if (!activeCondition) {
        return;
    }

    for (let i = 0; i < value; i++) {
        await actor.decreaseCondition(condition);
    }
}

function preparedOptionalData(message) {
    if (message?.item?.type === "spell") {
        const { tradition, attribute } = message.item?.spellcasting;
        const { mod } = message.actor?.abilities?.[attribute];
        const spellcasting = { tradition, attribute: { type: attribute, mod } };

        return {
            origin: {actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid, spellcasting},
        };
    }
    return undefined;
}

function effectUUID(id) {
    return `Compendium.${moduleName}.effects.Item.${id}`
}

function actionUUID(id) {
    return `Compendium.${moduleName}.actions.Item.${id}`
}

function equipmentUUID(id) {
    return `Compendium.${moduleName}.equipment.Item.${id}`
}

function hasEffect(actor, eff) {
    return actor?.itemTypes?.effect?.find((c) => eff === c.slug);
}

async function createDocumentsParent(data, parentUuid) {
     let parent = await fromUuid(parentUuid);
     if (!parent) {return}

     await CONFIG.Item.documentClass.createDocuments(data, {parent})
}

async function deleteEffectFromActorId(actorId, slug) {
  await deleteEffectFromActor(await fromUuid(actorId), slug);
}

async function deleteEffectFromActor(actor, slug) {
    const effect = actor.itemTypes.effect.find((c) => slug === c.slug);
    if (!effect) { return; }
    if (hasPermissions(actor)) {
        await actor.deleteEmbeddedDocuments("Item", [effect._id]);
    } else {
        socketlibSocket._sendRequest("deleteEffectFromActorId", [actor.uuid, slug], 0);
    }
}

async function updateItemById(uuid, data) {
  await updateItem(await fromUuid(uuid), data);
}

async function updateItem(item, data) {
    if (!hasPermissions(item)) {
        socketlibSocket._sendRequest("updateItemById", [item.uuid, data], 0);
        return
    }

    item.update(data);
}