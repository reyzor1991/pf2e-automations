import {TurnHook} from "./index";
import {getFilteredRules} from "../helpers";
import {BaseRule, ComplexRule, HandlerRule, MessageForHandling} from "../rule";
import {GlobalNamespace, moduleName} from "../const";
import {handleBaseRule, handleComplexRule} from "./message";

export class StartTurnHook implements TurnHook {
    listen(combatant: Combatant, encounter: Combat): void {
        const mm = new MessageForHandling(undefined, undefined, new Set(combatant.actor.getRollOptions()))
        mm.mainActor = combatant.actor
        mm.mainToken = combatant.token

        const filteredRules = getFilteredRules("start-turn", mm);
        filteredRules.forEach(rule => {
            if (rule instanceof BaseRule) {
                handleBaseRule(rule, mm)
            } else if (rule instanceof ComplexRule) {
                handleComplexRule(rule, mm)
            } else if (rule instanceof HandlerRule) {
                GlobalNamespace.ALL_FUNCTIONS[rule.value]?.(rule, mm);
            }
        })

        combatant.actor.itemTypes?.effect
            ?.filter(e=>e.flags?.[moduleName]?.damageTrigger === "start-turn")
            ?.forEach(async e=>{
                let formula = e.getFlag(moduleName, "damageFormula");
                if (formula) {
                    const roll = new GlobalNamespace.DamageRoll(`${formula}`);
                    await roll.evaluate({async: true});

                    roll.toMessage(
                        {
                            speaker: mm.speaker,
                            flags: {
                                pf2e: {
                                    target: {actor: combatant.actor.uuid, token: combatant.token.uuid},
                                    context: {target: {actor: combatant.actor.uuid, token: combatant.token.uuid}}
                                },
                            },
                        }
                    );
                }
            })
    }
}

export class EndTurnHook implements TurnHook {
    listen(combatant: Combatant, encounter: Combat): void {
        const mm = new MessageForHandling(undefined, undefined, new Set(combatant.actor.getRollOptions()))
        mm.mainActor = combatant.actor
        mm.mainToken = combatant.token

        const filteredRules = getFilteredRules("end-turn", mm);
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