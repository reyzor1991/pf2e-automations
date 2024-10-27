const moduleName = "pf2e-automations";

function getSrc(message) {
    return message.token?.texture?.src
        || message.actor?.getActiveTokens(true, true)[0]?.texture?.src
        || message.actor?.img;
}

function isGM() {
    return game.user === game.users.activeGM
}

function showName(obj) {
    return game.settings.get("pf2e", "metagame_tokenSetsNameVisibility") ? (obj.playersCanSeeName || game.user.isGM) : true
}

function translate(value) {
    return game.i18n.localize(`${moduleName}.${value}`)
}

function hasOption(message, opt) {
    return message?.flags?.pf2e?.context?.options?.includes(opt)
        || message?.flags?.pf2e?.origin?.rollOptions?.includes(opt);
}

function triggerType(message) {
    const type = message?.flags?.pf2e?.context?.type;
    if (type) {
        return type;
    } else if (Object.keys(message.flags.pf2e).length === 1 && message.flags.pf2e.origin) {
        return "postInfo"
    } else if (Object.keys(message.flags.pf2e).length === 2) {
        if (message.flags.pf2e.origin && message.flags.pf2e.casting && message.flags.pf2e.origin.type === 'spell') {
            return 'spell-cast'
        }
    }
    return undefined;
}

async function getRollOptions(message) {
    let data = [
        ...(message?.flags?.pf2e?.context?.options || []),
        ...(message?.flags?.pf2e?.origin?.rollOptions || []),
    ]

    const outcome = message?.flags?.pf2e?.context?.outcome;
    if (outcome) {
        data.push(`outcome:${message?.flags?.pf2e?.context?.outcome}`);
    }

    if (message?.flags?.pf2e?.origin?.sourceId) {
        data.push('useEquipment')
        data.push(...((message.item || await fromUuid(message?.flags?.pf2e?.origin?.sourceId))?.getRollOptions() || []))
    }
    if (message.flags?.pf2e?.context?.dc?.label) {
        data.push(message.flags.pf2e.context.dc.label)
    }
    if (!message.target?.actor && game.user.targets.first()?.actor) {
        data.push(...game.user.targets.first()?.actor.getSelfRollOptions('target'))
    }
    if (message.actor) {
        data.push(...message.actor.getRollOptions())
    }

    return new Set(data)
}

function hasDomain(message, opt) {
    return message?.flags?.pf2e?.context?.domains?.includes(opt);
}

function hasCondition(actor, con) {
    return actor?.itemTypes?.condition?.find((c) => con === c.slug);
}

function hasEffect(actor, eff) {
    return actor?.itemTypes?.effect?.find((c) => eff === c.slug);
}

function getSetting(name) {
    return game.settings.get(moduleName, name);
}

async function setSetting(name, value) {
    return game.settings.set(moduleName, name, value);
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

const PREDICATE_REGEXP = new RegExp(String.raw`{(actor|target)\|(.*?)}`, "g");

function prepareCorrectPredicate(predicate, replaceData) {
    if (!replaceData) return predicate;

    if (Array.isArray(predicate)) {
        for (let i = 0; i < predicate.length; i++) {
            predicate[i] = prepareCorrectPredicate(predicate[i], replaceData);
        }
    } else if (typeof predicate === "string") {
        return predicate.replace(PREDICATE_REGEXP, (_match, key, prop) => {
            return foundry.utils.getProperty(replaceData[key] || {}, prop);
        })
    } else if (typeof predicate === "object") {
        for (const [key, value] of Object.entries(predicate)) {
            predicate[key] = prepareCorrectPredicate(value, replaceData);
        }
    }

    return predicate;
}

function checkPredicate(predicate, options, replaceData) {
    let correctPredicate = prepareCorrectPredicate(foundry.utils.deepClone(predicate), replaceData);
    return game.pf2e.Predicate.test(correctPredicate, options)
}

function hasEffectBySourceId(actor, eff) {
    return actor?.itemTypes?.effect?.find((c) => eff === c.sourceId);
}

function getEffectBySourceId(actor, eff) {
    return actor?.itemTypes?.effect?.find((c) => eff === c.sourceId);
}

function hasFeatBySourceId(actor, eff) {
    return actor?.rollOptions?.all[eff];
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
    optionalData = {name: undefined, icon: undefined, origin: undefined, duplication: false}
) {
    if (!actor.canUserModify(game.user, "update")) {
        executeAsGM("setEffectToActor", {actorId: actor.uuid, effUuid, level, optionalData});
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
        source.flags = foundry.utils.mergeObject(source.flags ?? {}, {core: {sourceId: effUuid}});
        if (level) {
            source.system.level = {value: level};
        }
        if (optionalData?.origin) {
            source.system.context = foundry.utils.mergeObject(source.system.context ?? {}, {
                origin: optionalData?.origin,
            });
        }
        actor.createEmbeddedDocuments("Item", [source]);
    }
}

async function setEffectToTarget(message, effectUUID, level, optionalData) {
    if (!message.target && game.user.targets.size !== 1) {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
        return;
    }

    const targetActor = message.target?.actor ?? game.user.targets.first()?.actor;

    await setEffectToActor(targetActor, effectUUID, level, optionalData);
}

async function setEffectToTargetActorNextTurn(message, effectUUID) {
    if (!message.target && game.user.targets.size !== 1) {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
        return;
    }

    const targetActor = message.target?.actor ?? game.user.targets.first()?.actor;

    await setEffectToActor(targetActor, effectUUID, message?.item?.level, {
        origin: {actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid},
    });
}

async function setEffectToSelfActorNextTurn(message, rule) {
    let effectUUID = rule.value;
    let originActor = message?.flags?.pf2e?.origin?.actor ?? message?.flags?.pf2e?.context?.origin?.actor;
    const _obj = message?.flags?.pf2e?.origin?.uuid ?? message?.flags?.pf2e?.context?.origin?.uuid;
    if (originActor) {
        await setEffectToActor(message.actor, effectUUID, message?.item?.level, {
            origin: {actor: originActor, item: _obj},
            duplication: !!rule?.allowDuplicate,
        });
    } else if (!originActor && _obj) {
        let data = _obj.split(".");
        if (data.length === 4) {
            await setEffectToActor(message.actor, effectUUID, message?.item?.level, {
                origin: {actor: (await fromUuid(data[0] + "." + data[1]))?.uuid, item: _obj},
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
    if (!actor.canUserModify(game.user, "update")) {
        executeAsGM("addItemToActor", {uuid: actor.uuid, item});
        return;
    }
    await actor.createEmbeddedDocuments("Item", [item]);
}

async function addItem(actorUuid, item) {
    await addItemToActor(await fromUuid(actorUuid), item);
}

async function deleteEffectFromActorId(actorId, slug) {
    await deleteEffectFromActor(await fromUuid(actorId), slug);
}

async function deleteEffectFromActor(actor, slug) {
    const effect = actor.itemTypes.effect.find((c) => slug === c.slug);
    if (!effect) {
        return;
    }
    if (actor.canUserModify(game.user, "update")) {
        await actor.deleteEmbeddedDocuments("Item", [effect._id]);
    } else {
        executeAsGM("deleteEffectFromActor", {uuid: actor.uuid, slug});
    }
}

async function updateItemById(uuid, data) {
    await updateItem(await fromUuid(uuid), data);
}

async function updateItem(item, data) {
    if (!item.canUserModify(game.user, "update")) {
        executeAsGM("updateItem", {uuid: item.uuid, data});
        return
    }

    item.update(data);
}

async function deleteItemById(itemUuid) {
    await deleteItem(await fromUuid(itemUuid));
}

async function deleteItem(item) {
    if (!item) {
        return;
    }
    if (!item.canUserModify(game.user, "delete")) {
        executeAsGM("deleteItem", {uuid: item.uuid});
    } else {
        await item.delete();
    }
}

async function removeConditionFromActorId(actorId, condition, forceRemove = false) {
    await removeConditionFromActor(await fromUuid(actorId), condition, forceRemove);
}

async function removeConditionFromActor(actor, condition, forceRemove = false) {
    if (!actor.canUserModify(game.user, "update")) {
        executeAsGM("removeConditionFromActor", {uuid: actor.uuid, condition, forceRemove});
        return;
    }

    await actor.decreaseCondition(condition, {forceRemove: forceRemove});
}

async function removeEffectFromActorId(actor, effect) {
    await removeEffectFromActor(await fromUuid(actorId), effect);
}

async function removeEffectFromActor(actor, effect) {
    if (!actor) {
        return
    }
    if (!actor.canUserModify(game.user, "update")) {
        executeAsGM("removeEffectFromActor", {uuid: actor.uuid, effect});
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
    if (!actor.canUserModify(game.user, "update")) {
        executeAsGM("applyDamage", {actorUUID: actor.uuid, tokenUUID: token.uuid, formula});
        return;
    }

    const roll = new DamageRoll(parseFormula(actor, formula));
    await roll.evaluate();
    await actor.applyDamage({damage: roll, token});
    await roll.toMessage({speaker: {alias: actor.name}});
}

async function increaseConditionForActorId(actorId, condition, value = undefined) {
    await increaseConditionForActor(await fromUuid(actorId), condition, value);
}

async function increaseConditionForActor(actor, condition, value = undefined) {
    if (!actor.canUserModify(game.user, "update")) {
        executeAsGM("increaseConditionForActor", {uuid: actor.uuid, condition, value});
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
    if (!actor.canUserModify(game.user, "update")) {
        executeAsGM("decreaseConditionForActor", {uuid: actor.uuid, condition, value});
        return;
    }

    if (!hasCondition(actor, condition)) {
        return;
    }

    for (let i = 0; i < value; i++) {
        await actor.decreaseCondition(condition);
    }
}

async function createDocumentsParentId(data, parentUuid) {
    let parent = await fromUuid(parentUuid);
    await createDocumentsParent(data, parent)
}

async function createDocumentsParent(data, parent) {
    if (!parent) {
        return
    }

    await CONFIG.Item.documentClass.createDocuments(data, {parent})
}

function preparedOptionalData(message) {
    if (message?.item?.type === "spell") {
        const {tradition, attribute} = message.item?.spellcasting;
        const {mod} = message.actor?.abilities?.[attribute];
        const spellcasting = {tradition, attribute: {type: attribute, mod}};

        return {
            origin: {actor: message?.actor?.uuid, item: message?.item?.uuid, token: message?.token?.uuid, spellcasting},
        };
    }
    return undefined;
}

function lastMessages(n = 20) {
    return game.messages.contents.slice(-1 * n).reverse();
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

function getEffectsBySlug(actor, eff) {
    return actor?.itemTypes?.effect?.filter((c) => eff === c.slug);
}

function distanceIsCorrect(firstT, secondT, distance) {
    return (
        (firstT instanceof Token ? firstT : firstT.object).distanceTo(
            secondT instanceof Token ? secondT : secondT.object
        ) <= distance
    );
}

async function parseEffect(effect) {
    return (await fromUuid(effect)) || createCondition(effect);
}

function createCondition(value) {
    let data = value.split(" ")
    return game.pf2e.ConditionManager.getCondition(data[0], {"system.value.value": data[1]})
}

function decreaseDamageBadgeEffect(actor, source) {
    actor.itemTypes.effect.find(e => e.sourceId === source)
        ?.decrease();
}