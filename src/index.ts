import {createModuleHooks} from './hooks';
import {moduleName} from "./const";
import {distanceIsCorrect, getSetting, isActiveGM} from "./helpers";
import {actorRollSaveThrow} from "./global-f";

const moduleHooks = createModuleHooks();

Hooks.on("init", () => {
    moduleHooks.init.forEach(h => {
        h.listen()
    });
});
Hooks.on("setup", () => {
    moduleHooks.setup.forEach(h => {
        h.listen()
    });
});

Hooks.on("ready", () => {
    moduleHooks.ready.forEach(h => {
        h.listen()
    })
});

Hooks.on("preCreateChatMessage", (message: ChatMessage, data: object, options: object, userId: string) => {
    for (const h of moduleHooks.preCreateChatMessage) {
        if (h.listen(message, data, options, userId) === false) {
            return false
        }
    }
});


async function processMessage(message: ChatMessage) {
    moduleHooks.createChatMessage.forEach(h => {
        h.listen(message)
    })
}

Hooks.on("createChatMessage", processMessage);
Hooks.on(`${moduleName}.processMessage`, processMessage);

Hooks.on("renderChatMessageHTML", async (message: ChatMessage, html: HTMLElement) => {
    moduleHooks.renderChatMessage.forEach(h => {
        h.listen(message, html)
    })
});

Hooks.on("renderCheckModifiersDialog", async (dialog: object, html: JQuery<HTMLElement>, data: object) => {
    if (!getSetting("blindRoll")) {
        return;
    }
    if (dialog?.context?.type === "skill-check" || dialog?.context?.type === "perception-check") {
        const skills = getSetting("skipSkillBlindRoll")?.split(',').map(a => a.trim().toLowerCase()).filter(a => !!a);
        if (skills.length === 0 || !dialog.context?.domains?.some(a => skills.includes(a))) {
            html.find(".roll-mode-panel").hide();
        }
    }
});

Hooks.on("preCreateItem", async (item: Item) => {
    moduleHooks.preCreateItem.forEach(h => {
        h.listen(item)
    })
});

Hooks.on("createItem", async (item: Item, data: object, userId: string) => {
    moduleHooks.createItem.forEach(h => {
        h.listen(item, data, userId)
    })

    if (getSetting("conditionDC") && isActiveGM() && item.slug === "sickened") {
        const value = await foundry.applications.api.DialogV2.prompt({
            window: {title: "Condition DC"},
            content: `Select dc of condition</br></br>
            <input type="number" name="map"/>
        </br></br>`,
            ok: {
                label: "Set value",
                callback: (event, button, dialog) => button.form.elements.map.valueAsNumber
            }
        });

        if (!value) {
            return
        }
        item.setFlag(moduleName, 'dc', value)
    }
});

Hooks.on("applyDamageToToken", async (t: string, r: object) => {
    moduleHooks.applyDamageToToken.forEach(h => {
        h.listen(t, r)
    })
});

Hooks.on("preUpdateActor", async (actor: Actor, data: object, options: object) => {
    moduleHooks.preUpdateActor.forEach(h => {
        h.listen(actor, data, options)
    })
});

Hooks.on("preUpdateItem", (item: Item, data: object, options: object, id: string) => {
    moduleHooks.preUpdateItem.forEach(h => {
        h.listen(item, data, options, id)
    })
});

Hooks.on("deleteItem", async (item: Item, data: object, id: string) => {
    moduleHooks.deleteItem.forEach(h => {
        h.listen(item, data, id)
    })
})

Hooks.on("preDeleteItem", (item: Item, data: object, id: string) => {
    for (const h of moduleHooks.preDeleteItem) {
        h.listen(item, data, id)
    }
})

Hooks.on("pf2e.startTurn", async (combatant: Combatant, encounter: Combat, userId: string) => {
    moduleHooks.startTurnHook.forEach(h => {
        h.listen(combatant, encounter)
    })
    if (getSetting("openNpcSheet") && isActiveGM() && combatant.actor?.isOfType('npc') && !combatant.actor.sheet.rendered) {
        combatant.actor.sheet.render(true)
    }
    startSustainedSpells(combatant, encounter, userId)
});

Hooks.on("pf2e.endTurn", async (combatant: Combatant, encounter: Combat, userId: string) => {
    moduleHooks.endTurnHook.forEach(h => {
        h.listen(combatant, encounter)
    })
    if (game.userId === userId && combatant.actor) {
        const actor = combatant.actor as Actor;
        actor.itemTypes.consumable.filter(i => i.getFlag(moduleName, "tempEndTurn")).forEach(i => {
            i.delete()
        })
    }

    if (getSetting("decreaseFrightened")) {
        decreaseFrightenedValue(combatant, encounter);
    } else {
        console.log(`decreaseFrightenedValue is off`);
    }

    if (getSetting("openNpcSheet") && isActiveGM() && combatant.actor?.isOfType('npc') && combatant.actor.sheet.rendered) {
        combatant.actor.sheet.close()
    }

    if (game.combat || isActiveGM()) {
        const effects = combatant.actor.itemTypes.effect
            .filter((a) => a.flags?.[moduleName]?.rollEffect)
            .filter((a) => a.flags[moduleName].rollEffect.when === 'end')
        if (!effects.length) {
            return
        }

        combatant.token.object.setTarget(true, {releaseOthers: true})

        for (const a1 of effects.map(a => a.flags[moduleName].rollEffect.item)) {
            (await fromUuid(a1))?.toMessage()
        }
    }

});

Hooks.on("preCreateCombatant", (combatant: Combatant) => {
    moduleHooks.preCreateCombatant.forEach(h => {
        h.listen(combatant)
    })
})

Hooks.on("createCombatant", (combatant: Combatant) => {
    moduleHooks.createCombatant.forEach(h => {
        h.listen(combatant)
    })
})

Hooks.on("renderPartySheetPF2e", (partySheet: object, html: JQuery<HTMLElement>) => {
    if (!isActiveGM() && getSetting("avoidNoticeRollSecret")) {
        return;
    }

    html
        .find(".activities")
        .find(".activity-entries")
        .find(".activity")
        .each(async (idx, el) => {
            const item = await fromUuid($(el).data().activityUuid);
            if (!item) {
                return;
            }

            const roll = item.actor.itemTypes.effect
                .find((a) => a.slug === `action-effect-${item?.system?.slug}`)
                ?.getFlag(moduleName, "roll");
            if (roll) {
                $(el).find(".name").append(` (${roll})`);
            }
        });
})

Hooks.on("deleteCombat", async () => {
    if (getSetting("partyVision") && isActiveGM()) {
        setPartyVision(true)
    }

});

Hooks.on("combatStart", async (combat: Combat) => {
    if (getSetting("partyVision") && isActiveGM()) {
        setPartyVision(false)
    }
    if (getSetting("deleteExploration") && isActiveGM()) {
        for (const combatant of combat.turns) {
            await combatant.actor.update({"system.exploration": []});
        }
    }
});

Hooks.on("refreshToken", async (t: Token, r: object) => {
    moduleHooks.refreshToken.forEach(h => {
        h.listen(t, r)
    })
});

Hooks.on("renderEffectsPanel", async (app: object, html: JQuery<HTMLElement>, data: object) => {
    moduleHooks.renderApplication.forEach(h => {
        h.listen(app, html, data)
    })
});


Hooks.on("pf2e.restForTheNight", async (actor: Actor) => {
    if (!getSetting("removeExplorationActivity")) {
        return;
    }

    await actor.update({"system.exploration": []});
});

Hooks.on("renderAbstractSidebarTab", async (enc) => {
    if (enc?.id !== "combat") {
        return
    }
    const clear = foundry.utils.parseHTML(`
        <a class="combat-button combat-control" data-tooltip="Roll With specific skill" role="button">
                <i class="fas fa-user-tag"></i>
            </a>`)
    clear.addEventListener('click', (e) => {
        rollCombatInitiativeWithSkills(enc.viewed)
    })
    enc.element.querySelector('.encounter-controls [data-tooltip="COMBAT.RollNPC"]')?.insertAdjacentElement("afterend", clear)
});


async function rollCombatInitiativeWithSkills(combat: Combat | undefined) {
    if (!combat) {
        return
    }
    const npcs = combat.turns
        .filter(c => c?.actor?.isOfType('npc'));
    if (!npcs.length) {
        ui.notifications.info("No NPCs in combat");
        return
    }

    const options = [`<option value="perception">${game.i18n.localize("PF2E.PerceptionLabel")}</option>`];
    options.push(...Object.entries(CONFIG.PF2E.skills)
        .map((s) => ({value: s[0], label: s[1].label}))
        .map(row => `<option value=${row.value}>${game.i18n.localize(row.label)}</option>`));

    const {data} = await foundry.applications.api.DialogV2.wait({
        window: {title: 'Select skill for NPCs initiative roll'},
        content: `
                    <select id="fob1" autofocus>
                        ${options}
                    </select>
                `,
        buttons: [{
            action: "ok", label: "Select", icon: "<i class='fa-solid fa-hand-fist'></i>",
            callback: (event, button, form) => {
                return {
                    data: form.element.querySelector("#fob1").value,
                }
            }
        }, {
            action: "cancel",
            label: "Cancel",
            icon: "<i class='fa-solid fa-ban'></i>",
        }],
        default: "ok"
    });
    if (!data) {
        return
    }

    await Promise.all(npcs.map(c => {
        return c.actor.update({"system.initiative.statistic": data});
    }));

    // Roll after update
    combat.rollInitiative(npcs.map(c => c.id))
}

async function setPartyVision(value: boolean) {
    const partyVision = await game.settings.set("pf2e", "metagame_partyVision", value)

    ChatMessage.create({
        flags: {
            [moduleName]: {}
        },
        user: game.user._id,
        whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
        speaker: ChatMessage.getSpeaker(),
        content: `<h2>Party Vision is ${partyVision ? 'On' : 'Off'}`
    });
}

async function decreaseFrightenedValue(combatant: Combatant, encounter: Combat) {
    const actor = combatant.actor as Actor;
    const rollOptions = actor.getRollOptions()

    const frightened = actor.getCondition("frightened");
    if (!frightened) {
        console.log('There are no frightened condition')
        return;
    }
    if (frightened.isLocked) {
        console.log('Frightened condition is locked')
        return;
    }
    const value = frightened?.value ?? 0;
    if (!value) {
        console.log('Frightened condition has no value')
        return;
    }
    let boge = actor?.itemTypes?.effect.find(e => e.slug === "effect-bogeyman-breath");
    if (boge && boge?.badge.value > 0) {
        console.log('Frightened condition not decreased - Bogeyman Breath')
        return
    }

    const runes = encounter.turns
        .filter(c => c.actor.isEnemyOf(actor))
        .filter(c => distanceIsCorrect(c.token, combatant.token, 30))
        .filter(c => !CONFIG.Canvas.polygonBackends.move.testCollision(c.token.center, combatant.token.center, {
            type: 'sight',
            mode: 'any'
        }))
        .map(c => c.actor.itemTypes.armor.find(a => a.isEquipped && (a.isInvested || c.actor.isOfType('npc'))))
        .filter(b => !!b)
        .map(a => {
            return {
                les: a.system.runes.property.includes('lesserDread'),
                med: a.system.runes.property.includes('moderateDread'),
                gre: a.system.runes.property.includes('greaterDread')
            }
        })
        .reduce((obj, value) => {
            obj.les = obj.les || value.les;
            obj.med = obj.med || value.med;
            obj.gre = obj.gre || value.gre;
            return obj;
        }, {} as { les: boolean, med: boolean, gre: boolean });

    let maxValueCheck = 0;

    if (runes.gre) {
        const res = await actorRollSaveThrow(combatant.actor, 'will', {
            dc: {
                label: game.i18n.localize("PF2E.ArmorPropertyRuneGreaterDread"),
                value: 38
            }
        })
        if (!res || res.degreeOfSuccess === 0 || res.degreeOfSuccess === 1) {
            console.log('Frightened condition not decreased - gre rune, fail dread rune')
            return
        }
    } else if (runes.med) {
        const res = await actorRollSaveThrow(combatant.actor, 'will', {
            dc: {
                label: game.i18n.localize("PF2E.ArmorPropertyRuneModerateDread"),
                value: 29
            }
        })
        if (!res) {
            console.log('Frightened condition not decreased - med dread rune, skipped roll')
            return
        }
        if (res.degreeOfSuccess === 0 || res.degreeOfSuccess === 1) {
            maxValueCheck = 2;
        }
    } else if (runes.les) {
        const res = await actorRollSaveThrow(combatant.actor, 'will', {
            dc: {
                label: game.i18n.localize("PF2E.ArmorPropertyRuneLesserDread"),
                value: 20
            }
        })
        if (!res) {
            console.log('Frightened condition not decreased - les dread rune, skipped roll')
            return
        }
        if (res.degreeOfSuccess === 0 || res.degreeOfSuccess === 1) {
            maxValueCheck = 1;
        }
    }

    const reduceValue = actor.itemTypes.feat
        .find((feat) => feat.slug === "dwarven-doughtiness")
        ? 2
        : 1;

    const newValue = Math.max(value - reduceValue, maxValueCheck)

    if (
        (rollOptions.includes("self:effect:antagonize")
            || rollOptions.includes("self:effect:spiral-of-horrors")
            || rollOptions.includes("self:effect:remorseless-lash")
            || rollOptions.includes("self:effect:lift-natures-caul-critical-failure"))
        && newValue < 1) {
        console.log('Frightened condition can\'t be reduced value below 1')
        return
    }

    if (newValue >= value) {
        console.log(`Frightened: Old value ${value}, New value ${newValue}`)
        return
    }
    if (!newValue) {
        console.log(`Frightened condition is deleted`)
        await actor.deleteEmbeddedDocuments("Item", [frightened.id])
    } else {
        console.log(`Frightened condition is updated, newValue: ${newValue}`)
        await game.pf2e.ConditionManager.updateConditionValue(frightened.id, actor, newValue)
    }
}


function startSustainedSpells(combatant: Combatant, encounter: Combat, userId: string) {
    if (!getSetting("sustainedSpells") || !isActiveGM() || !game.combat) {
        return;
    }

    const actors = game.combat.turns.map((a) => a.actor).filter(a => a);
    const effects = actors.map((a) => a.itemTypes.effect).flat();
    const effectsByActor = effects.filter(
        (e) => e.system.duration.sustained && e.system?.context?.origin?.actor === combatant.actor.uuid
    );

    if (effectsByActor.length > 0) {
        setTimeout(() => {
            createSustainMessage(combatant, effectsByActor);
        }, 300);
    }
}

function createSustainMessage(combatant: Combatant, effectsByActor: Effect[]) {
    const list = effectsByActor.map((m) => {
        const duration = m.system.expired
            ? game.i18n.localize("PF2E.EffectPanel.Expired")
            : getRemainingDurationLabel(m.remainingDuration.remaining, m.system.start.initiative ?? 0, m.system.duration.expiry)

        return `
            <li data-item-id="${m.uuid}" data-owner-id="${combatant.actor.uuid}" class="spell-message-item">
                <img src="${m.img}">
                <span class="spell-li">
                    <span class="spell-li-text">${m.actor.name} - ${m.name} (${duration})</span>
                </span> &nbsp; &nbsp;
                <div class="spell-message-item-sub">
                    <a class="dismiss-spell-item" title="Dismiss"><i class="fas fa-user-slash"></i>Dismiss</a>
                    <a class="sustain-spell-item" title="Sustain"><i class="fas fa-user"></i>Sustain</a>
                </div>
            </li>`;
    });

    const content = `<div class="spell-message">
        <p>Sustain spells or dismiss</p>
        <ul>${list.join("")}</ul>
    </div>`;

    ChatMessage.create({
        flags: {
            [moduleName]: {}
        },
        user: game.user.id,
        speaker: {alias: `${combatant.name} has sustained spells`},
        content,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    });
}

const DURATION_LABELS = [
    {value: 63_072_000, labelPart: 'MultipleYears', divisor: 31_536_000, key: 'years'},
    {value: 31_536_000, labelPart: 'SingleYear'},
    {value: 1_209_600, labelPart: 'MultipleWeeks', divisor: 604_800, key: 'weeks'},
    {value: 604_800, labelPart: 'SingleWeek'},
    {value: 172_800, labelPart: 'MultipleDays', divisor: 86_400, key: 'days'},
    {value: 7_200, labelPart: 'MultipleHours', divisor: 3_600, hours: 'hours'},
    {value: 120, labelPart: 'MultipleMinutes', divisor: 60, hours: 'minutes'},
    {value: 12, labelPart: 'MultipleRounds', divisor: 6, hours: 'rounds'},
    {value: 6, labelPart: 'SingleRound'},
    {value: 2, labelPart: 'MultipleSeconds', key: 'seconds'},
    {value: 1, labelPart: 'SingleSecond'},
]

function getRemainingDurationLabel(remaining: number, initiative: number, expiry: string) {

    const find = DURATION_LABELS.find(el => remaining >= el.value);
    if (!find) {
        // zero rounds
        const key =
            expiry === "turn-end"
                ? "PF2E.EffectPanel.RemainingDuration.ZeroRoundsExpireTurnEnd"
                : "PF2E.EffectPanel.RemainingDuration.ZeroRoundsExpireTurnStart";
        return game.i18n.format(key, {initiative});
    } else {
        const label = `PF2E.EffectPanel.RemainingDuration.${find.labelPart}`
        if (!find.key) {
            return game.i18n.format(label);
        } else if (!find.divisor) {
            return game.i18n.format(label, {[find.key]: remaining});
        }

        return game.i18n.format(label, {[find.key]: Math.floor(remaining / find.divisor)});
    }
}