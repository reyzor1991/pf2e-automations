import {PreUpdateActorHook} from "./index";
import {getFilteredRules} from "../helpers";
import {BaseRule, ComplexRule, HandlerRule, MessageForHandling} from "../rule";
import {GlobalNamespace} from "../const";
import {handleBaseRule, handleComplexRule} from "./message";

export class RulePreUpdateActorHook implements PreUpdateActorHook {
    listen(actor: Actor, data: object, o: object) {
        const options = actor.getRollOptions()
        const mm = new MessageForHandling(undefined, undefined, new Set(options), {
            origin: {
                actor: actor?.uuid,
            }
        })
        mm.mainActor = actor;
        mm.data = foundry.utils.deepClone(data);

        const filteredRules = getFilteredRules("pre-update-actor", mm);

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