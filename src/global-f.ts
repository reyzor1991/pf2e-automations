import {
    ACTOR_ROLL_SOCKET_TYPE,
    ADD_CONDITION_SOCKET_TYPE,
    ADD_ITEM_SOCKET_TYPE,
    ADD_ITEMS_SOCKET_TYPE,
    CHANGE_CARRY_TYPE_TO_WORN_SOCKET_TYPE,
    CREATE_DOCUMENTS_PARENT_SOCKET_TYPE,
    DECREASE_CONDITION_SOCKET_TYPE,
    DECREASE_EFFECT_SOCKET_TYPE,
    DELETE_ITEM_SOCKET_TYPE,
    executeAsGM,
    INCREASE_CONDITION_SOCKET_TYPE,
    REMOVE_CONDITION_SOCKET_TYPE,
    REMOVE_EFFECT_SOCKET_TYPE,
    UPDATE_ITEM_SOCKET_TYPE,
    UPDATE_MESSAGE_CONTENT_SOCKET_TYPE
} from "./socket";
import {GlobalNamespace, moduleName} from "./const";
import {executeMacro, getSetting, isActiveGM} from "./helpers";

export async function addItemToActor(
    actor: Actor | undefined,
    itemData: object,
    messageId?: string
): Promise<void> {
    if (!actor || !itemData) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(ADD_ITEM_SOCKET_TYPE, {actorId: actor.uuid, itemData});
        return;
    }

    let res = await actor.createEmbeddedDocuments("Item", [itemData]);
    if (res && messageId) {
        let mes = game.messages.get(messageId);
        let oldData = mes.getFlag("pf2e", "moduleName")?.addedItems || [];

        updateMessageFlags(game.messages.get(messageId), {
            "pf2e": {
                [moduleName]: {
                    addedItems: oldData.concat(res.map((item) => item.id)),
                }
            }
        })
    }
}

export function addItemsToActor(
    actor: Actor | undefined,
    itemData: object[],
): void {
    if (!actor || !itemData) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(ADD_ITEMS_SOCKET_TYPE, {actorId: actor.uuid, itemData});
        return;
    }

    actor.createEmbeddedDocuments("Item", itemData);
}

export function deleteEffectFromActor(
    actor: Actor | undefined,
    effect: string,
): void {
    if (!actor) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(REMOVE_EFFECT_SOCKET_TYPE, {actorId: actor.uuid, effect});
        return;
    }

    actor.itemTypes.effect.find(e => e.sourceId === effect)?.delete();
}

export function removeConditionFromActor(
    actor: Actor | undefined,
    condition: string,
): void {
    if (!actor) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(REMOVE_CONDITION_SOCKET_TYPE, {actorId: actor.uuid, condition});
        return;
    }

    actor.decreaseCondition(condition, {forceRemove: true});
}

export function addConditionForActor(actor: Actor | undefined, condition: string, messageId: string): void {
    if (!actor) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(ADD_CONDITION_SOCKET_TYPE, {actorId: actor.uuid, condition, messageId});
        return;
    }
    const cond = createCondition(condition);
    if (!cond) {
        return
    }

    let ex = cond.value
        ? actor.itemTypes.condition.find(c => c.slug === cond.slug && !c.isLocked)
        : actor.itemTypes.condition.find(c => c.slug === cond.slug && c.active)

    if (ex && !ex.value) {
        return;
    } else if (ex && ex.value) {
        if (ex.value < cond.value) {
            actor.increaseCondition(cond.slug, {max: cond.value, value: cond.value})

            updateMessageFlags(game.messages.get(messageId), {
                "pf2e": {
                    [moduleName]: {
                        updateConditions: [
                            {id: ex.id, value: ex.value},
                        ]
                    }
                }
            })
        }
    } else {
        let obj = cond.toObject()
        obj.flags = foundry.utils.mergeObject(obj.flags ?? {}, {
            "pf2e-condition-converter": {
                skip: true
            }
        });
        addItemToActor(actor, obj, messageId)
    }
}

export function decreaseBadgeEffect(actor: Actor | undefined, effect: string): void {
    if (!actor) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(DECREASE_EFFECT_SOCKET_TYPE, {actorId: actor.uuid, effect});
        return;
    }

    actor.itemTypes.effect.find(e => e.sourceId === effect)?.decrease();
}

export function increaseBadgeEffect(actor: Actor | undefined, effect: string): void {
    if (!actor) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(DECREASE_EFFECT_SOCKET_TYPE, {actorId: actor.uuid, effect});
        return;
    }

    actor.itemTypes.effect.find(e => e.sourceId === effect)?.increase();
}

export function increaseConditionByStepForActor(actor: Actor | undefined, condition: string): void {
    if (!actor) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(INCREASE_CONDITION_SOCKET_TYPE, {actorId: actor.uuid, condition});
        return;
    }
    const c = createCondition(condition);
    if (!c) {
        return
    }
    actor.increaseCondition(c.slug, {value: c.value})
}

export async function decreaseConditionByStepForActor(actor: Actor | undefined, condition: string): Promise<void> {
    if (!actor) {
        return
    }
    if (!actor?.canUserModify(game.user, "update")) {
        executeAsGM(DECREASE_CONDITION_SOCKET_TYPE, {actorId: actor.uuid, condition});
        return;
    }
    const c = createCondition(condition);
    if (!c) {
        return
    }


    for (let i = 0; i < c.value; i++) {
        await actor.decreaseCondition(c.slug)
    }

}

export function createCondition(value: string) {
    const data = value.split(" ")
    let c = game.pf2e.ConditionManager.getCondition(data[0])
    if (c && c.system.value.isValued && Number.isNumeric(data[1])) {
        c.updateSource({"system.value.value": Number(data[1])})
    }
    return c
}

export async function actorRollSaveThrowAsync(
    data: {
        targetUuid: string,
        save: string,
        params: StatisticRollParams
    }
): Promise<void | { degreeOfSuccess: number }> {
    return actorRollSaveThrow(await fromUuid(data.targetUuid), data.save, data.params)
}

export async function actorRollSaveThrow(
    target: Actor | undefined,
    save: string,
    params: StatisticRollParams
): Promise<void | { degreeOfSuccess: number }> {
    if (!target) {
        return;
    }
    let targetActiveUser = Object.keys(target.ownership)
        .map(id => game.users.get(id))
        .filter(u => !!u)
        .find(u => !u.isGM && u.active);

    if (targetActiveUser && targetActiveUser !== game.user) {
        return targetActiveUser.query(
            ACTOR_ROLL_SOCKET_TYPE,
            {targetUuid: target.uuid, save, params},
            {timeout: 30 * 1000});
    }

    if (!target.canUserModify(game.user, "update")) {
        executeAsGM(ACTOR_ROLL_SOCKET_TYPE, {
            target: target.uuid,
            save,
            params: {
                dc: params.dc,
                item: params.item?.uuid,
                origin: params.origin?.uuid,
                extraRollOptions: params.extraRollOptions
            }
        });
        return;
    }
    return target.saves[save].roll(params)
}

export async function rollDamage(actor: Actor | undefined, token: Token | undefined, formula: string): Promise<void> {
    if (!actor) {
        return
    }
    const roll = new GlobalNamespace.DamageRoll(parseFormula(formula, actor, item));
    await roll.evaluate();
    roll.toMessage({speaker: {alias: actor.name}});
}

export function parseFormula(formula: string, actor: Actor, item?: Item) {
    let result = formula;
    if (actor) {
        result = `${result.replace("@actor.level", actor.level)}`;
    }
    if (item) {
        result = `${result.replace("@item.rank", item.rank)}`;
    }
    return result;
}


export function createDocumentsParent(parent: Actor, data: object): void {
    if (!parent) {
        return
    }
    if (!parent.canUserModify(game.user, "update")) {
        executeAsGM(CREATE_DOCUMENTS_PARENT_SOCKET_TYPE, {data, parent: parent.uuid})
        return
    }

    CONFIG.Item.documentClass.createDocuments(data, {parent})
}

export function sendGMNotification(content: string): void {
    if (isActiveGM()) {
        ui.notifications.info(content);
    } else {
        executeAsGM("sendGMNotification", content);
    }
}

export function updateItem(item: Item, data: object): void {
    if (!item.canUserModify(game.user, "update")) {
        executeAsGM(UPDATE_ITEM_SOCKET_TYPE, {itemId: item.uuid, data});
        return
    }

    item.update(data);
}

export function deleteItem(item: Item | undefined): void {
    if (!item) {
        return
    }
    if (!item.canUserModify(game.user, "delete")) {
        executeAsGM(DELETE_ITEM_SOCKET_TYPE, {itemId: item.uuid});
        return
    }

    item.delete();
}

export function changeCarryTypeToWorn(item: Item): void {
    if (!item.actor?.canUserModify(game.user, "update")) {
        executeAsGM(CHANGE_CARRY_TYPE_TO_WORN_SOCKET_TYPE, {itemId: item.uuid});
        return
    }

    item.actor.changeCarryType(item, {carryType: 'worn'})
}

export function updateMessageContent(message: ChatMessage, content: string): void {
    if (!isActiveGM()) {
        executeAsGM(UPDATE_MESSAGE_CONTENT_SOCKET_TYPE, {messageId: message.id, content: content});
        return
    }

    message.update({content: content});
}


export function updateMessageFlags(message: ChatMessage, flags: object): void {
    if (!message) {
        return
    }
    if (!isActiveGM()) {
        executeAsGM(UPDATE_MESSAGE_CONTENT_SOCKET_TYPE, {messageId: message.id, flags});
        return
    }

    message.update({flags});
}

export async function stealthRoll(actor: Actor, effect: Item): Promise<void> {
    const updateStealthEffect = function (roll, outcome, msg, evt) {
        const list = msg?.flags?.pf2e?.modifiers.filter(a => a.enabled) ?? [];

        const map = list.reduce(function (map, obj) {
            map[obj.type] = obj.modifier;
            return map;
        }, {});

        effect?.setFlag(moduleName, "roll", roll.total);
        effect?.setFlag(moduleName, "rollMap", map);
    }

    const context = getSetting("avoidNoticeRollSecret") ? {rollMode: getRollMode()} : {};
    context.callback = updateStealthEffect;
    context.callbackEffect = effect;
    await actor.skills.stealth.roll(context);
}


export function searchRoll(actor: Actor, effect: Item): void {
    game.pf2e.actions.seek({
        actors: [actor],
        callback: async (params) => {
            effect?.setFlag(moduleName, "roll", params.roll.total);
        },
    });
}

export async function investigateRoll(actor: Actor, effect: Item): Promise<void> {
    // if (game?.hud?.actions?.rollRecallKnowledge) {
    //     game?.hud?.actions?.rollRecallKnowledge(actor);
    // } else {
    const pack = game.packs.get("xdy-pf2e-workbench.asymonous-benefactor-macros-internal");
    if (pack) {
        executeMacro((await pack.getDocuments()).find((i) => i.name === "XDY DO_NOT_IMPORT Recall_Knowledge")?.toObject());
    }
    // }
}

export function lastMessages(n = 20): ChatMessage[] {
    return game.messages.contents.slice(-1 * n).reverse();
}

export function getRollMode() {
    return game.user.isGM ? "gmroll" : "blindroll";
}

export function eventToRollParams(event: KeyboardEvent, rollType: { type: string }): { skipDialog: boolean, params?: string } {
    const key = rollType.type === "check" ? "showCheckDialogs" : "showDamageDialogs";
    const skipDefault = !game.user.settings[key];
    if (!isRelevantEvent(event)) return {skipDialog: skipDefault};

    const params = {skipDialog: event.shiftKey ? !skipDefault : skipDefault};
    if (event.ctrlKey || event.metaKey) {
        params.rollMode = getRollMode();
    }

    return params;
}

function isRelevantEvent(event: KeyboardEvent): boolean {
    return !!event && "ctrlKey" in event && "metaKey" in event && "shiftKey" in event;
}

export async function baseMapForm(title: string) {
    return await foundry.applications.api.DialogV2.wait({
        window: {title},
        content: `
            ${getHtmlMap()}
        `,
        buttons: [{
            action: "ok", label: "Attack", icon: "<i class='fa-solid fa-hand-fist'></i>",
            callback: (event, button, form) => {
                return {
                    map: parseInt($(form).find("#map").val()),
                }
            }
        }, {
            action: "cancel",
            label: "Cancel",
            icon: "<i class='fa-solid fa-ban'></i>",
        }],
        default: "ok"
    });
}

export function getHtmlMap() {
    return `<label>Multiple Attack Penalty</label>
                <select id="map">
                <option value=0>No MAP</option>
                <option value=1>MAP -5</option>
                <option value=2>MAP -10</option>
            </select><br/>`
}

export function until(checkFn: Function, timeout = 10000, interval = 100) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const timer = setInterval(() => {
            if (checkFn()) {
                clearInterval(timer);
                resolve(true);
            } else if (Date.now() - start >= timeout) {
                clearInterval(timer);
                reject(new Error('Timeout error'))
            }
        }, interval);
    });
}