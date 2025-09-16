import {moduleName} from "./const";
import {
    actorRollSaveThrow,
    addConditionForActor, addItemsToActor,
    addItemToActor,
    changeCarryTypeToWorn,
    createDocumentsParent,
    decreaseBadgeEffect,
    increaseBadgeEffect,
    decreaseConditionByStepForActor,
    deleteEffectFromActor,
    deleteItem,
    increaseConditionByStepForActor,
    removeConditionFromActor,
    sendGMNotification,
    updateItem, updateMessageContent, updateMessageFlags
} from "./global-f";
import {isActiveGM} from "./helpers";

export const SOCKET_NAME = `module.${moduleName}`;
export const ADD_ITEM_SOCKET_TYPE = "addItemToActor";
export const ADD_ITEMS_SOCKET_TYPE = "addItemsToActor";
export const REMOVE_EFFECT_SOCKET_TYPE = "removeEffect";
export const ACTOR_ROLL_SOCKET_TYPE = "actorRollSaveThrow";
export const REMOVE_CONDITION_SOCKET_TYPE = "removeConditionFromActor";
export const ADD_CONDITION_SOCKET_TYPE = "addConditionToActor";
export const INCREASE_CONDITION_SOCKET_TYPE = "increaseConditionToActor";
export const DECREASE_CONDITION_SOCKET_TYPE = "decreaseConditionToActor";
export const DECREASE_EFFECT_SOCKET_TYPE = "decreaseEffectForActor";
export const INCREASE_EFFECT_SOCKET_TYPE = "increaseEffectForActor";
export const CREATE_DOCUMENTS_PARENT_SOCKET_TYPE = "createDocumentsParent";
export const SEND_GM_NOTIFICATION_SOCKET_TYPE = "sendGMNotification";
export const UPDATE_ITEM_SOCKET_TYPE = "updateItem";
export const DELETE_ITEM_SOCKET_TYPE = "deleteItem";
export const CHANGE_CARRY_TYPE_TO_WORN_SOCKET_TYPE = "changeCarryTypeToWorn";
export const UPDATE_MESSAGE_CONTENT_SOCKET_TYPE = "updateMessageContent";
export const UPDATE_MESSAGE_FLAGS_SOCKET_TYPE = "updateMessageFlags";

export function executeAsGM(type: string, payload: any): void {
    game.socket.emit(SOCKET_NAME, {type, payload});
}

export function socketListener() {
    game.socket.on(SOCKET_NAME, async ({type, payload}) => {
        if (!isActiveGM()) {
            return;
        }
        switch (type) {
            case ADD_ITEM_SOCKET_TYPE:
                addItemToActor(await fromUuid(payload.actorId), payload.itemData)
                break
            case ADD_ITEMS_SOCKET_TYPE:
                addItemsToActor(await fromUuid(payload.actorId), payload.itemData)
                break
            case REMOVE_EFFECT_SOCKET_TYPE:
                deleteEffectFromActor(await fromUuid(payload.actorId), payload.effect)
                break
            case REMOVE_CONDITION_SOCKET_TYPE:
                removeConditionFromActor(await fromUuid(payload.actorId), payload.condition)
                break
            case ADD_CONDITION_SOCKET_TYPE:
                addConditionForActor(await fromUuid(payload.actorId), payload.condition, payload.messageId)
                break
            case ACTOR_ROLL_SOCKET_TYPE:
                const {target, save, params} = payload
                await actorRollSaveThrow(await fromUuid(target), save, {
                    dc: params.dc,
                    item: await fromUuid(params.item),
                    origin: await fromUuid(params.origin),
                    extraRollOptions: params.extraRollOptions
                })
                break;
            case INCREASE_CONDITION_SOCKET_TYPE:
                increaseConditionByStepForActor(await fromUuid(payload.actorId), payload.condition)
                break;
            case DECREASE_CONDITION_SOCKET_TYPE:
                decreaseConditionByStepForActor(await fromUuid(payload.actorId), payload.condition)
                break;
            case DECREASE_EFFECT_SOCKET_TYPE:
                decreaseBadgeEffect(await fromUuid(payload.actorId), payload.effect)
                break;
            case INCREASE_EFFECT_SOCKET_TYPE:
                increaseBadgeEffect(await fromUuid(payload.actorId), payload.effect)
                break;
            case CREATE_DOCUMENTS_PARENT_SOCKET_TYPE:
                createDocumentsParent(await fromUuid(payload.parent), payload.data)
                break;
            case SEND_GM_NOTIFICATION_SOCKET_TYPE:
                sendGMNotification(payload)
                break;
            case UPDATE_ITEM_SOCKET_TYPE:
                updateItem(await fromUuid(payload.itemId), payload.data)
                break;
            case DELETE_ITEM_SOCKET_TYPE:
                deleteItem(await fromUuid(payload.itemId))
                break;
            case CHANGE_CARRY_TYPE_TO_WORN_SOCKET_TYPE:
                changeCarryTypeToWorn(await fromUuid(payload.itemId))
                break;
            case UPDATE_MESSAGE_CONTENT_SOCKET_TYPE:
                updateMessageContent(game.messages.get(payload.messageId), payload.content)
                break;
            case UPDATE_MESSAGE_FLAGS_SOCKET_TYPE:
                updateMessageFlags(game.messages.get(payload.messageId), payload.flags)
                break;
            default:
                console.error('Unknown socket message:' + type)
                break;
        }
    })
}