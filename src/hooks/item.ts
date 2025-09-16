import {CreateItemHook, DeleteItemHook, PreDeleteItemHook, PreUpdateItemHook} from "./index";
import {BaseRule, ComplexRule, HandlerRule, MessageForHandling} from "../rule";
import {effectUUID, getFilteredRules, isActiveGM} from "../helpers";
import {GlobalNamespace, moduleName} from "../const";
import {handleBaseRule, handleComplexRule} from "./message";

export class RuleCreateItemHook implements CreateItemHook {
    listen(item: Item, data: object, userId: string) {
        if (game.userId === userId) {
            const options = item.getRollOptions()
            options.push(...(item.origin?.getRollOptions() || []))
            options.push(...(item.actor?.getSelfRollOptions("target") || []))
            const mm = new MessageForHandling(undefined, undefined, new Set(options))
            mm.mainActor = item.origin;
            mm.mainToken = item.origin?.getActiveTokens()?.[0];
            mm.targetActor = item.actor;
            mm.item = item;

            const filteredRules = getFilteredRules("create-item", mm);

            filteredRules.forEach(rule => {
                if (rule instanceof BaseRule) {
                    handleBaseRule(rule, mm)
                } else if (rule instanceof ComplexRule) {
                    handleComplexRule(rule, mm)
                } else if (rule instanceof HandlerRule) {
                    GlobalNamespace.ALL_FUNCTIONS[rule.value]?.(rule, mm);
                }
            })
        }

        if (isActiveGM() && item.sourceId === effectUUID('1jyADLe4RLz35Kkn')) {
            const action = item.actor?.itemTypes.action.find(a => a.rules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration'))
            if (action) {
                const allRules = foundry.utils.deepClone(action._source.system.rules);
                const rule = allRules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration')
                if (rule) {
                    rule.ignored = true;
                    action.update({'system.rules': allRules});
                }
            }
        }
    }
}

export class RuleDeleteItemHook implements DeleteItemHook {
    listen(item: Item, _options: object, userId: string) {
        if (game.userId === userId) {
            const options = item.getRollOptions()
            options.push(...(item.actor?.getRollOptions() || []))
            const mm = new MessageForHandling(undefined, undefined, new Set(options))
            mm.mainActor = item.actor;
            mm.mainToken = item.actor?.getActiveTokens()?.[0];
            mm.item = item;
            const filteredRules = getFilteredRules("delete-item", mm);

            filteredRules.forEach(rule => {
                if (rule instanceof BaseRule) {
                    handleBaseRule(rule, mm)
                } else if (rule instanceof ComplexRule) {
                    handleComplexRule(rule, mm)
                } else if (rule instanceof HandlerRule) {
                    GlobalNamespace.ALL_FUNCTIONS[rule.value]?.(rule, mm);
                }
            })
        }
        if (isActiveGM() && item.sourceId === effectUUID('1jyADLe4RLz35Kkn')) {
            const action = item.actor?.itemTypes.action.find(a => a.rules.find(r => r.key === 'FastHealing' && r.ignored && r.type === 'regeneration'))
            if (action) {
                const allRules = foundry.utils.deepClone(action._source.system.rules);
                const rule = allRules.find(r => r.key === 'FastHealing' && r.ignored && r.type === 'regeneration')
                if (rule) {
                    rule.ignored = false;
                    action.update({'system.rules': allRules});
                }
            }
        }
        if (isActiveGM() && item.slug === 'effect-delay-consequences') {
            let damage = item.getFlag(moduleName, 'delayDamage');
            if (damage) {
                ui.notifications.info("Delayed damage was triggered")
                ChatMessage.create(damage)
            }
        }
    }
}

export class RulePreDeleteItemHook implements PreDeleteItemHook {
    listen(item: Item, _options: object, userId: string) {
        if (game.userId === userId) {
            const options = item.getRollOptions()
            options.push(...(item.actor?.getRollOptions() || []))
            const mm = new MessageForHandling(undefined, undefined, new Set(options))
            mm.mainActor = item.actor;
            mm.mainToken = item.actor?.getActiveTokens()?.[0];
            mm.item = item;
            const filteredRules = getFilteredRules("pre-delete-item", mm);

            filteredRules.forEach(rule => {
                if (rule instanceof BaseRule) {
                    handleBaseRule(rule, mm)
                } else if (rule instanceof ComplexRule) {
                    handleComplexRule(rule, mm)
                } else if (rule instanceof HandlerRule) {
                    GlobalNamespace.ALL_FUNCTIONS[rule.value]?.(rule, mm);
                }
            })
        }
    }
}

export class RulePreUpdateItemHook implements PreUpdateItemHook {
    listen(item: Item, data: object, o: object, id: string) {
        const options = item.getRollOptions()
        options.push(...(item.actor?.getRollOptions() || []))
        const mm = new MessageForHandling(undefined, item, new Set(options), {itemChanges: foundry.utils.deepClone(data)})
        mm.mainActor = item.actor;
        mm.mainToken = item.actor?.getActiveTokens()?.[0];
        const filteredRules = getFilteredRules("pre-update-item", mm);

        filteredRules.forEach(rule => {
            if (rule instanceof BaseRule) {
                handleBaseRule(rule, mm)
            } else if (rule instanceof ComplexRule) {
                handleComplexRule(rule, mm)
            } else if (rule instanceof HandlerRule) {
                GlobalNamespace.ALL_FUNCTIONS[rule.value]?.(rule, mm);
            }
        })
    }
}