import {AbsRule, HandlerRule, MessageForHandling} from "./rule";

export const moduleName = "pf2e-automations";
export const ruleSettingName = "rulesV3";
export const ruleVersionSettingName = "ruleVersion3";
export const PHYSICAL_DAMAGE_TYPES = ["bleed", "bludgeoning", "piercing", "slashing"];

//@ts-ignore
export namespace GlobalNamespace {
    export let DamageRoll: Roll;
    export let CheckRoll: Roll;
    export let FORM_LABELS: object = {};
    export let LOCALIZED_RESISTANCES: { [key: string]: string } = {};
    export let ALL_ACTIVE_RULES: { [key: string]: AbsRule[] } = {};
    export let ALL_FUNCTIONS: { [key: string]: (rule: HandlerRule, mm: MessageForHandling) => void } = {};
    export let ACTIVITY_EXPLORATION_EFFECTS: { [key: string]: string } = {};
    export let ACTIVITY_EXPLORATION_EFFECTS_SWAP: { [key: string]: string } = {};
}

export const EMPTY_EFFECT = {
    "_id": "",
    "img": "icons/svg/circle.svg",
    "name": "Generated effect",
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

export function end1MinEffect() {
    const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
    newEffect._id = foundry.utils.randomID()
    newEffect.system.duration.value = 1
    newEffect.system.duration.expiry = 'turn-end'
    newEffect.system.duration.unit = 'minutes'
    return newEffect;
}