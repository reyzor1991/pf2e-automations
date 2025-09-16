import {MessageHook} from "./index";
import {
    distanceIsCorrect,
    executeMacro,
    getAllEffectBySourceIdAndOwner,
    getFilteredRules,
    getRollOptions,
    hasOption,
    preparedOptionalData,
    triggerType
} from "../helpers";
import {BaseRule, ComplexRule, HandlerRule, MessageForHandling, RuleGenerator} from "../rule";
import {EMPTY_EFFECT, GlobalNamespace, moduleName} from "../const";
import {
    addConditionForActor,
    addItemToActor,
    createCondition,
    decreaseBadgeEffect,
    decreaseConditionByStepForActor,
    deleteEffectFromActor,
    increaseBadgeEffect,
    increaseConditionByStepForActor, parseFormula,
    removeConditionFromActor,
    rollDamage,
    updateItem
} from "../global-f";
import {createItemObject} from "./functions";
import {TargetType} from "../rule/ruleTypes";

export class HandleRuleMessage implements MessageHook {
    async listen(message: ChatMessage) {
        if (!message.isAuthor || hasOption(message, "skip-handling-message"))
            return;

        const item: Item = message.item || await fromUuid(message?.flags?.pf2e?.origin?.sourceId)
        const type = triggerType(message);
        const rollOptions = await getRollOptions(message, item);
        const optionalData = preparedOptionalData(message, item);

        const mm = new MessageForHandling(message, item, rollOptions, optionalData)

        if (message.isReroll) {
            let added = message.getFlag("pf2e", `${moduleName}.addedItems`) || [];
            let conds = message.getFlag("pf2e", `${moduleName}.updateConditions`) || [];
            for (const itemId of added) {
                await message.actor?.items.get(itemId)?.delete();
            }
            for (const c of conds) {
                await message.actor?.items.get(c.id)?.update({"system.value.value": c.value});
            }
        }

        const filteredRules = getFilteredRules(type, mm);
        filteredRules.forEach(rule => {
            if (rule instanceof BaseRule) {
                handleBaseRule(rule, mm);
            } else if (rule instanceof ComplexRule) {
                handleComplexRule(rule, mm);
            } else if (rule instanceof HandlerRule) {
                handleHandlerRule(rule, mm);
            }
        })
    }
}

const BASE_RULE_TARGET_HANDLERS = {
    "SelfEffect": handleSelfEffect,
    "SelfOrTargetEffect": handleSelfOrTargetEffect,
    "TargetEffect": handleTargetEffect,
    "TargetsEffect": handleTargetsEffect,
    "SelfOrTargetsEffect": handleSelfOrTargetsEffect,
    "SelfRemoveEffect": handleSelfRemoveEffect,
    "TargetRemoveEffect": handleTargetRemoveEffect,
    "SelfAddCondition": handleSelfAddCondition,
    "TargetAddCondition": handleTargetAddCondition,
    "SelfRemoveCondition": handleSelfRemoveCondition,
    "TargetRemoveCondition": handleTargetRemoveCondition,
    "RunMacro": handleRunMacro,
    "SelfDamage": handleSelfDamage,
    "TargetDamage": handleTargetDamage,
    "IncreaseConditionByStep": handleIncreaseConditionByStep,
    "IncreaseTargetConditionByStep": handleIncreaseTargetConditionByStep,
    "SelfAddPersistentDamage": handleSelfAddPersistentDamage,
    "TargetAddPersistentDamage": handleTargetAddPersistentDamage,
    "SelfDecreaseCondition": handleSelfDecreaseCondition,
    "PartyEffect": handlePartyEffect,
    "TurnOnOption": handleTurnOnOption,
    "TurnOffOption": handleTurnOffOption,
    "TargetAllyWithinRange": handleTargetAllyWithinRange,
    "OnlyAllyWithinRange": handleOnlyAllyWithinRange,
    "DecreaseBadgeEffect": handleDecreaseBadgeEffect,
    "IncreaseBadgeEffect": handleIncreaseBadgeEffect,
    "TargetDecreaseBadgeEffect": handleTargetDecreaseBadgeEffect,
    "TargetIncreaseBadgeEffect": handleTargetIncreaseBadgeEffect,
    "OriginEffect": handleOriginEffect,
} as { [key: string]: (mm: MessageForHandling, rule: BaseRule) => void };

export function handleBaseRule(rule: BaseRule, mm: MessageForHandling) {
    BASE_RULE_TARGET_HANDLERS[rule.target]?.(mm, rule);
}

async function handleComplexRuleValue(rule: ComplexRule, mm: MessageForHandling, value: RuleGenerator) {
    let targetActor = undefined;
    switch (rule.target) {
        case TargetType.SelfEffect:
            targetActor = mm.mainActor
            break;
        case TargetType.TargetEffect:
            targetActor = mm.targetActor
            break;
        case TargetType.SelfOrTargetEffect:
            targetActor = mm.targetActor || mm.mainActor
            break;
        case TargetType.ImmunitySelfEffect:
            targetActor = mm.mainActor
            break;
        default:
            break;
    }

    if (!targetActor) {
        return
    }

    if (!durationIsValid(value.duration)) {
        for (const condition of (value.conditions || [])) {
            addConditionForActor(targetActor, condition, mm.messageId);
        }
        for (const effect of (value.effects || [])) {
            const r = rule.rawValue();
            r.value = effect;
            const item = await createItemObject(r, mm);
            addItemToActor(targetActor, item)
        }

        for (const i of value.immunities) {
            const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
            newEffect._id = foundry.utils.randomID()
            if (rule.name) {
                newEffect.name = rule.name;
            }
            newEffect.system.slug = `${i}-immunity`;
            addItemToActor(targetActor, newEffect);
        }
    } else {
        if (value.conditions?.length) {
            const newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
            newEffect._id = foundry.utils.randomID()
            newEffect.name = value?.name || rule.name || newEffect.name
            newEffect.system.duration.expiry = value.duration.expiry || "turn-start";
            newEffect.system.duration.sustained = value.duration.sustained || false;
            newEffect.system.duration.unit = value.duration.unit || "unlimited";
            newEffect.system.duration.value = value.duration.value ?? -1;
            if (value?.slug) {
                newEffect.system.slug = value.slug;
            }

            for (const condition of value.conditions) {
                const result = createCondition(condition);
                if (result) {
                    const newRule = {
                        "key": "GrantItem",
                        "onDeleteActions": {"grantee": "restrict"},
                        "uuid": result.sourceId
                    } as { [key: string]: any };
                    if (result.value > 1) {
                        newRule["alterations"] = [{
                            "mode": "override",
                            "property": "badge-value",
                            "value": result.value
                        }];
                    }
                    newEffect.system.rules.push(newRule)
                }
            }

            if (mm.optionalData?.origin) {
                newEffect.system.context = foundry.utils.mergeObject(newEffect.system.context ?? {}, {
                    origin: mm.optionalData?.origin,
                });
            }

            await addItemToActor(targetActor, newEffect);
        }
        for (const effect of value.effects) {
            const r = rule.rawValue();
            r.value = effect;
            let newEffect = await createItemObject(r, mm);
            if (newEffect) {
                newEffect = setDurationEffect(newEffect, value)
            }
            addItemToActor(targetActor, newEffect);
        }

        for (const i of value.immunities) {
            let newEffect = foundry.utils.deepClone(EMPTY_EFFECT);
            newEffect._id = foundry.utils.randomID()
            if (rule.name) {
                newEffect.name = rule.name;
            }
            newEffect.system.slug = `${i}-immunity`;
            newEffect = setDurationEffect(newEffect, value)
            addItemToActor(targetActor, newEffect);
        }
    }
}

function setDurationEffect(newEffect, value) {
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
    return newEffect;
}

function durationIsValid(duration: { expiry?: any, sustained?: boolean, unit?: string, value?: any }): boolean {
    return duration?.expiry != null || duration?.sustained != null || duration?.unit != null || duration?.value != null
}

export function handleComplexRule(rule: ComplexRule, mm: MessageForHandling) {
    for (const value of rule.values) {
        handleComplexRuleValue(rule, mm, value)
    }
}

function handleHandlerRule(rule: HandlerRule, mm: MessageForHandling) {
    GlobalNamespace.ALL_FUNCTIONS[rule.value]?.(rule, mm);
}

async function handleSelfEffect(mm: MessageForHandling, rule: BaseRule) {
    const obj = await createItemObject(rule, mm);
    addItemToActor(mm.mainActor, obj);
}

async function handleSelfOrTargetEffect(mm: MessageForHandling, rule: BaseRule) {
    const obj = await createItemObject(rule, mm);
    addItemToActor(mm.targetActor || mm.mainActor, obj);
}

async function handleTargetEffect(mm: MessageForHandling, rule: BaseRule) {
    if (rule.extend) {
        const existingEffects = getAllEffectBySourceIdAndOwner(mm.targetActor, rule.value, mm.mainActor.uuid);
        if (existingEffects.length > 0) {
            existingEffects.forEach(effect => {
                updateItem(effect, {"system.start.value": game.time.worldTime})
            })
            return
        }
    }

    if (!distanceIsCorrect(mm.mainToken, mm.targetToken, rule.range)) {
        return;
    }

    const obj = await createItemObject(rule, mm);
    addItemToActor(mm.targetActor, obj);
}

async function handleTargetsEffect(mm: MessageForHandling, rule: BaseRule) {
    const obj = await createItemObject(rule, mm);
    for (const t of mm.tokenTargets) {
        if (distanceIsCorrect(mm.mainToken, t, rule.range)) {
            addItemToActor(t?.actor, obj);
        }
    }
}

async function handleSelfOrTargetsEffect(mm: MessageForHandling, rule: BaseRule) {
    const obj = await createItemObject(rule, mm);

    if (mm.tokenTargets.size) {
        for (const t of mm.tokenTargets) {
            addItemToActor(t?.actor, obj);
        }
    } else {
        addItemToActor(mm.mainActor, obj);
    }
}

function handleSelfRemoveCondition(mm: MessageForHandling, rule: BaseRule) {
    removeConditionFromActor(mm.mainActor, rule.value);
}

function handleTargetRemoveCondition(mm: MessageForHandling, rule: BaseRule) {
    removeConditionFromActor(mm.targetActor, rule.value);
}

function handleSelfRemoveEffect(mm: MessageForHandling, rule: BaseRule) {
    deleteEffectFromActor(mm.mainActor, rule.value);
}

function handleTargetRemoveEffect(mm: MessageForHandling, rule: BaseRule) {
    deleteEffectFromActor(mm.targetActor, rule.value);
}

function handleSelfAddCondition(mm: MessageForHandling, rule: BaseRule) {
    addConditionForActor(mm.mainActor, rule.value, mm.messageId);
}

function handleTargetAddCondition(mm: MessageForHandling, rule: BaseRule) {
    addConditionForActor(mm.targetActor, rule.value, mm.messageId);
}

async function handleRunMacro(mm: MessageForHandling, rule: BaseRule) {
    executeMacro((await fromUuid(rule.value))?.toObject());
}

function handleSelfDamage(mm: MessageForHandling, rule: BaseRule) {
    rollDamage(mm.mainActor, mm.mainToken, rule.value);
}

function handleTargetDamage(mm: MessageForHandling, rule: BaseRule) {
    rollDamage(mm.targetActor, mm.targetToken, rule.value);
}

function handleIncreaseConditionByStep(mm: MessageForHandling, rule: BaseRule) {
    increaseConditionByStepForActor(mm.mainActor, rule.value);
}

function handleIncreaseTargetConditionByStep(mm: MessageForHandling, rule: BaseRule) {
    increaseConditionByStepForActor(mm.targetActor, rule.value);
}

function handleSelfDecreaseCondition(mm: MessageForHandling, rule: BaseRule) {
    decreaseConditionByStepForActor(mm.targetActor, rule.value);
}

function handleSelfAddPersistentDamage(mm: MessageForHandling, rule: BaseRule) {
    handleApplyActorPersistentDamage(mm.mainActor, mm.item, rule.value, mm.messageId);
}

function handleTargetAddPersistentDamage(mm: MessageForHandling, rule: BaseRule) {
    handleApplyActorPersistentDamage(mm.targetActor, mm.item, rule.value, mm.messageId);
}

async function handleOriginEffect(mm: MessageForHandling, rule: BaseRule) {
    const obj = await createItemObject(rule, mm);
    addItemToActor(mm.item?.actor, obj);
}

function handleApplyActorPersistentDamage(actor: Actor, item: Item, ruleValue: string, messageId?: string) {
    let split = ruleValue.split(" ");
    if (split.length != 3) {
        return;
    }
    let formula = parseFormula(split[1], actor, item);
    let damageType = split[2];
    let dc = Number(split[0]);
    if (!formula || !damageType || !dc) {
        return;
    }

    const condition = game.pf2e.ConditionManager.getCondition("persistent-damage").toObject();
    condition.system.persistent = {
        formula,
        damageType,
        dc,
        criticalHit: false
    };

    addItemToActor(actor, condition, messageId);
}

async function handlePartyEffect(mm: MessageForHandling, rule: BaseRule) {
    const members = [...(mm.mainActor?.parties.map(p => p.members) || [])].flat();
    const obj = await createItemObject(rule, mm);

    for (const m of members) {
        addItemToActor(m, obj);
    }
}

function handleTurnOnOption(mm: MessageForHandling, rule: BaseRule) {
    if (!mm.mainActor?.rollOptions.all[rule.value]) {
        mm.mainActor?.toggleRollOption("all", rule.value)
    }
}

function handleTurnOffOption(mm: MessageForHandling, rule: BaseRule) {
    if (mm.mainActor?.rollOptions.all[rule.value]) {
        mm.mainActor?.toggleRollOption("all", rule.value)
    }
}

function handleTargetAllyWithinRange(mm: MessageForHandling, rule: BaseRule) {
    if (!mm.mainToken) {
        return
    }

    handleOnlyAllyWithinRange(mm, rule)
    handleSelfEffect(mm, rule)
}

async function handleOnlyAllyWithinRange(mm: MessageForHandling, rule: BaseRule) {
    if (!mm.mainToken) {
        return
    }
    const obj = await createItemObject(rule, mm);
    const targets = allyInRadius(mm.mainToken, mm.mainActor as Actor, rule.range);
    for (const a of targets) {
        addItemToActor(a, obj);
    }
}

function allyInRadius(mainToken: Token, mainActor: Actor, range: number): Actor[] {
    return mainToken.scene.tokens
        .filter(t => t.actor && mainActor.isAllyOf(t.actor))
        .filter(t => distanceIsCorrect(mainToken, t, range))
        .filter(t => !CONFIG.Canvas.polygonBackends.move.testCollision(t.center, mainToken.center, {type: 'move', mode: 'any'}))
        .map(t => t.actor)
        .filter(a => !!a);
}

function handleDecreaseBadgeEffect(mm: MessageForHandling, rule: BaseRule) {
    decreaseBadgeEffect(mm.mainActor, rule.value)
}

function handleIncreaseBadgeEffect(mm: MessageForHandling, rule: BaseRule) {
    increaseBadgeEffect(mm.mainActor, rule.value)
}

function handleTargetDecreaseBadgeEffect(mm: MessageForHandling, rule: BaseRule) {
    decreaseBadgeEffect(mm.targetActor, rule.value)
}

function handleTargetIncreaseBadgeEffect(mm: MessageForHandling, rule: BaseRule) {
    increaseBadgeEffect(mm.targetActor, rule.value)
}