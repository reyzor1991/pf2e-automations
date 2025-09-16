import {ApplyDamageToTokenHook} from "./index";
import {effectUUID, isActiveGM} from "../helpers";
import {addItemToActor} from "../global-f";

export class RegenApplyDamageToTokenHook implements ApplyDamageToTokenHook {
    async listen(t: string, r: object) {
        if (!isActiveGM()) {
            return
        }
        const token: Token = await fromUuid(t);
        if (!token.actor) {
            return
        }

        const action = token.actor.itemTypes.action.find(a => a.rules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration'))
        if (!action) {
            return
        }
        const rule = action.system.rules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration')
        if (!rule) {
            return
        }
        if (!rule.deactivatedBy?.length) {
            return
        }
        const inst = r.instances.find(i => rule.deactivatedBy.some(v => i.options.flavor.includes(v)));
        if (!inst) {
            return
        }

        const _obj = (await fromUuid(effectUUID('1jyADLe4RLz35Kkn'))).toObject();
        _obj.flags = foundry.utils.mergeObject(_obj.flags ?? {}, {core: {sourceId: effectUUID("1jyADLe4RLz35Kkn")}});
        const cc = game.combat?.turns[game.combat?.current?.turn]
        if (cc) {
            if (game.combat.turns.findIndex(c => c === token.combatant) > game.combat.current.turn) {
                _obj.system.duration.value -= 1;
            }
        }

        addItemToActor(token.actor, _obj)
    }
}