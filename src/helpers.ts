import {GlobalNamespace, moduleName, ruleSettingName, ruleVersionSettingName} from "./const";
import {AbsRule, MessageForHandling, RuleGroup} from "./rule";
import {TriggerType} from "./rule/ruleTypes";

export function effectUUID(id: string) {
    return `Compendium.${moduleName}.effects.Item.${id}`
}

export function actionUUID(id: string) {
    return `Compendium.${moduleName}.actions.Item.${id}`
}

export function equipmentUUID(id: string) {
    return `Compendium.${moduleName}.equipment.Item.${id}`
}

export function isActiveGM() {
    return game.user === game.users.activeGM;
}

export function getSettingRuleGroups(): { [key: string]: RuleGroup } {
    const data = foundry.utils.deepClone(game.settings.get(moduleName, ruleSettingName));

    Object.keys(data).forEach(key => {
        data[key] = RuleGroup.fromObj(data[key]);
    })

    return data;
}

export async function setSettingRuleGroups(data: { [key: string]: RuleGroup }): Promise<void> {
    const d: { [key: string]: object } = {}
    Object.keys(data).forEach(k => {
        d[k] = data[k].rawValue();
    })
    await game.settings.set(moduleName, ruleSettingName, d);
    foundry.applications.settings.SettingsConfig.reloadConfirm({world: true});
}

export function getVersionRuleGroups(): number {
    return foundry.utils.deepClone(game.settings.get(moduleName, ruleVersionSettingName));
}

export function hasOption(message: ChatMessage, opt: string) {
    return message?.flags?.pf2e?.context?.options?.includes(opt)
        || message?.flags?.pf2e?.origin?.rollOptions?.includes(opt);
}

export function hasDomain(message, opt) {
    return message?.flags?.pf2e?.context?.domains?.includes(opt);
}

export function triggerType(message: ChatMessage): TriggerType | "none" {
    const type = message?.flags?.pf2e?.context?.type;
    if (type) {
        if (type === "damage-taken" && message?.flags?.pf2e?.appliedDamage?.isHealing) {
            return "healing-taken";
        }
        return type as TriggerType;
    } else if (Object.keys(message.flags?.pf2e || {}).length === 1 && message.flags.pf2e?.origin) {
        if (message?.flags?.pf2e?.origin?.sourceId) {
            return "use"
        }
        return "postInfo"
    } else if (Object.keys(message.flags.pf2e || {}).length === 2) {
        if (message.flags.pf2e?.origin && message.flags.pf2e?.casting && message.flags.pf2e?.origin?.type === 'spell') {
            return 'spell-cast'
        }
    }
    return "none";
}

export async function getRollOptions(message: ChatMessage, item: Item) {
    const data = [
        ...(message?.flags?.pf2e?.context?.options || []),
        ...(message?.flags?.pf2e?.origin?.rollOptions || []),
    ]

    const outcome = message?.flags?.pf2e?.context?.outcome;
    if (outcome) {
        data.push(`outcome:${outcome}`);
    }
    const domains = message?.flags?.pf2e?.context?.domains;
    if (domains && domains.length > 0) {
        data.push(...domains.map(d=>`domain:${d}`))
    }

    if (message?.flags?.pf2e?.origin?.sourceId) {
        data.push('useEquipment')
        data.push(...(item?.getRollOptions() || []))
    }
    if (item) {
        data.push(`origin:item:sourceId:${item?.sourceId}`)
    }
    if (message.flags?.pf2e?.context?.dc?.label) {
        data.push(message.flags.pf2e.context.dc.label)
    }
    const target = message.target?.actor || game.user.targets.first()?.actor
    if (target) {
        data.push(...target.getSelfRollOptions('target'))
    }
    if (message.actor) {
        data.push(...message.actor.getRollOptions())
    }
    const type = triggerType(message);
    if (type) {
        data.push(`mType:${type}`)
    }
    if (type === "self-effect") {
        data.push(...(item?.getOriginData().rollOptions ?? []))
    }
    if (message?.content.includes("shield") && message?.content.includes("absorb")) {
        data.push(`shield:block`)
    }
    return new Set(data)
}

export function getFilteredRules(type: TriggerType | "none", mm: MessageForHandling) {
    const activeGroup = [
        ...(GlobalNamespace.ALL_ACTIVE_RULES[type] || []),
    ];
    return activeGroup.filter(r => game.pf2e.Predicate.test(
        prepareCorrectPredicate(foundry.utils.deepClone(r.predicate), {
            actor: mm.mainActor,
            target: mm.targetActor,
        }),
        mm.rollOptions));
}

const PREDICATE_REGEXP = new RegExp(String.raw`{(actor|target)\|(.*?)}`, "g");

export function prepareCorrectPredicate(predicate: any, replaceData: { [key: string]: any }) {
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

export function preparedOptionalData(message: ChatMessage, item: Item) {
    const data = {
        origin: {
            spellcasting: null as any,
            item: item?.uuid,
            actor: message.actor?.uuid,
            token: message.token?.uuid,
            rollOptions: item?.getOriginData().rollOptions ?? [],
        },
        stOrigin: {
            spellcasting: null as any,
            item: item?.uuid,
            actor: item?.actor?.uuid,
            rollOptions: item?.getOriginData().rollOptions ?? [],
        }
    };

    if (item?.type === "spell") {
        const {tradition, attribute} = item?.spellcasting;
        const ability = message.actor?.abilities?.[attribute];
        data.origin.spellcasting = {tradition, attribute: {type: attribute, mod: ability?.mod}}

        const mod = item?.actor?.abilities?.[attribute]?.mod;
        data.stOrigin.spellcasting = {tradition, attribute: {type: attribute, mod}}
    }

    return data;
}

interface JsonConfig {
    version: number;
    forceIds: string[];
    removeIds: string[];
    forceAll: boolean;
    groups: RuleGroup[];
}

export async function syncRulesFn() {
    await fetch(`modules/${moduleName}/rules/config.json`)
        .then(async (response) => {
            if (response.ok) {
                return await response.json();
            } else {
                ui.notifications.info(`Sync file not found`);
                throw new Error("Sync file not found");
            }
        })
        .then(async (json: JsonConfig) => {
            const settingsData = getSettingRuleGroups();
            const groups = json.groups
                .reduce((acc, g) => {
                    acc[g.uuid] = g;
                    return acc;
                }, {} as { [key: string]: RuleGroup });

            const curRules = Object.keys(settingsData).filter(key => !json.forceIds.includes(key))
                .reduce((acc, key) => {
                    acc[key] = settingsData[key];
                    return acc;
                }, {} as { [key: string]: RuleGroup });

            const forced = json.forceIds;

            const cur = getVersionRuleGroups() ?? 0;

            if (cur >= json.version && Object.keys(curRules).length !== 0) {
                ui.notifications.info(`There are no updates`);
                return;
            }
            if (cur < 50) {
                json.forceAll = true;
            }

            let dataForSave: { [key: string]: RuleGroup } = {};
            if (json.forceAll) {
                const saveOwnRule = Object.keys(curRules)
                    .filter(key => !json.removeIds.includes(key))
                    .filter(key => !groups[key])
                    .reduce((acc, key) => {
                        acc[key] = settingsData[key];
                        return acc;
                    }, {} as { [key: string]: RuleGroup });

                dataForSave = {
                    ...saveOwnRule,
                    ...groups,
                };
            } else {
                const newData = Object.keys(groups)
                    .filter((a) => !curRules[a])
                    .reduce((acc, key) => {
                        acc[key] = groups[key];
                        return acc;
                    }, {} as { [key: string]: RuleGroup });

                const afterRemove = Object.keys(curRules)
                    .filter(key => !json.removeIds.includes(key))
                    .reduce((acc, key) => {
                        acc[key] = settingsData[key];
                        return acc;
                    }, {} as { [key: string]: RuleGroup });
                dataForSave = {
                    ...newData,
                    ...afterRemove,
                };
            }

            forced.forEach(key => {
                if (dataForSave[key] && settingsData[key]) {
                    dataForSave[key].isActive = settingsData[key].isActive;
                }
            })

            await game.settings.set(moduleName, ruleSettingName, dataForSave);
            await game.settings.set(moduleName, ruleVersionSettingName, json.version);
            ui.notifications.info(`Rules were synced`);
            console.log("Update to ", json.version);
            updateActiveRules()
        })
        .catch((error) => {
            console.error("Sync rules error:", error);
        });
}

export function distanceIsCorrect(firstT: any, secondT: any, distance: number|undefined) {
    if (!Number.isNumeric(distance)) {
        return true;
    }
    return (
        (firstT instanceof foundry.canvas.placeables.Token ? firstT : firstT.object).distanceTo(
            secondT instanceof foundry.canvas.placeables.Token ? secondT : secondT.object
        ) <= distance
    );
}

export function updateActiveRules() {
    const activeRules = Object.values(getSettingRuleGroups())
        .filter(rg => rg.isActive);
    const flat = activeRules.map(ar => [...ar.baseRules, ...ar.complexRules.map(r => {
        r.name = ar.name
        return r;
    }), ...ar.handlerRules]).flat() as AbsRule[];
    GlobalNamespace.ALL_ACTIVE_RULES = flat
        .reduce((acc, val) => {
            const arr = (acc[val.triggerType] || []);
            arr.push(val);
            acc[val.triggerType] = arr;
            return acc;
        }, {} as { [key: string]: AbsRule[] });
}

export function getSetting(name: string) {
    return game.settings.get(moduleName, name);
}

export function getEffectBySourceId(actor: Actor | undefined, eff: string) {
    return actor?.itemTypes?.effect?.find((c) => eff === c.sourceId);
}

export function getAllEffectBySourceId(actor: Actor, eff: string) {
    return actor?.itemTypes?.effect?.filter((c) => eff === c.sourceId);
}

export function getAllEffectBySourceIdAndOwner(actor: Actor, eff: string, ownerUuid: string) {
    return getAllEffectBySourceId(actor, eff)
        .filter((a) => a?.system?.context?.origin?.actor === ownerUuid);
}

export function getFeatBySourceId(actor: Actor, eff: string) {
    return actor?.itemTypes?.feat?.find((c) => eff === c.sourceId);
}

export async function executeMacro(macroData: object) {
    if (!macroData) {
        return
    }
    const macro = new Macro(macroData);
    macro.ownership.default = 3;
    macro.execute();
}

export function showName(obj: { playersCanSeeName: boolean }) {
    return game.settings.get("pf2e", "metagame_tokenSetsNameVisibility") ? (obj.playersCanSeeName || game.user.isGM) : true
}