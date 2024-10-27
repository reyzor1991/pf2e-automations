Hooks.on("applyDamageToToken", async (t, r) => {
    if (!isGM()) {
        return
    }
    let token = await fromUuid(t);
    if (!token.actor) {
        return
    }

    let action = token.actor.itemTypes.action.find(a => a.rules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration'))
    if (!action) {
        return
    }
    let rule = action.system.rules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration')
    if (!rule) {
        return
    }
    if (!rule.deactivatedBy?.length) {
        return
    }
    let inst = r.instances.find(i => rule.deactivatedBy.some(v => i.options.flavor.includes(v)));
    if (!inst) {
        return
    }

    let _obj = (await fromUuid(effectUUID('1jyADLe4RLz35Kkn'))).toObject();
    _obj.flags = foundry.utils.mergeObject(_obj.flags ?? {}, {core: {sourceId: effectUUID("1jyADLe4RLz35Kkn")}});
    let cc = game.combat?.turns[game.combat?.current?.turn]
    if (cc) {
        if (game.combat.turns.findIndex(c => c === token.combatant) > game.combat.current.turn) {
            _obj.system.duration.value -= 1;
        }
    }

    await token.actor.createEmbeddedDocuments("Item", [_obj]);
});

Hooks.on("createItem", async (item) => {
    if (!isGM()) {
        return
    }
    if (item.slug !== 'effect-deactivated-regeneration') {
        return
    }

    let action = item.actor.itemTypes.action.find(a => a.rules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration'))
    if (!action) {
        return
    }
    let allRules = foundry.utils.deepClone(action._source.system.rules);
    let rule = allRules.find(r => r.key === 'FastHealing' && !r.ignored && r.type === 'regeneration')
    if (!rule) {
        return
    }

    rule.ignored = true;
    await action.update({'system.rules': allRules});
});

Hooks.on("deleteItem", async (item) => {
    if (!isGM()) {
        return
    }
    if (item.slug !== 'effect-deactivated-regeneration') {
        return
    }

    let action = item.actor.itemTypes.action.find(a => a.rules.find(r => r.key === 'FastHealing' && r.ignored && r.type === 'regeneration'))
    if (!action) {
        return
    }
    let allRules = foundry.utils.deepClone(action._source.system.rules);
    let rule = allRules.find(r => r.key === 'FastHealing' && r.ignored && r.type === 'regeneration')
    if (!rule) {
        return
    }

    rule.ignored = false;
    await action.update({'system.rules': allRules});
});


