import {CreateCombatantHook, CreateItemHook, PreCreateCombatantHook} from "./index";
import {getEffectBySourceId, getSetting, hasDomain, hasOption, isActiveGM, triggerType} from "../helpers";
import {eventToRollParams, investigateRoll, lastMessages, searchRoll, stealthRoll} from "../global-f";
import {GlobalNamespace, moduleName} from "../const";

export class AvoidNoticeRollPreCreateItemHook implements CreateItemHook {
    listen(item: Item, data: object, userId: string) {
        if (game.userId !== userId) {
            return
        }

        const actor = item.actor;
        if (actor && getSetting("avoidNoticeRoll") && actor?.isOfType("character")) {
            if (item.system.slug === "action-effect-avoid-notice") {
                stealthRoll(actor, item);
            } else if (item.system.slug === "action-effect-search") {
                searchRoll(actor, item);
            } else if (item.system.slug === "action-effect-investigate") {
                investigateRoll(actor, item);
            }
        }
    }
}

export class AvoidNoticeRollPreCreateCombatantHook implements PreCreateCombatantHook {
    listen(combatant: Combatant): void {
        const roll = combatant.actor.itemTypes.effect
            .find((a) => a.slug === "action-effect-avoid-notice")
            ?.getFlag(moduleName, "roll");
        if (roll) {
            combatant.actor.update({"system.initiative.statistic": "stealth"});
        }

        const defend = getEffectBySourceId(combatant.actor, GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS['defend'])
        if (defend) {
            game.pf2e.actions.raiseAShield({actors: [combatant.actor]});

            ChatMessage.create({
                flags: {
                    [moduleName]: {}
                },
                user: game.user.id,
                content: `${combatant.name} gain the benefits of @UUID[Compendium.pf2e.actionspf2e.Item.xjGwis0uaC2305pm]{Raising a Shield} before first turn begins.`,
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            });

            defend.delete();
        }
    }
}


export class AvoidNoticeRollCreateCombatantHook implements CreateCombatantHook {
    async listen(combatant: Combatant): Promise<void> {
        if (!getSetting("stealthRollInitiative")) {
            return;
        }

        if (!combatant.hasPlayerOwner) {
            return;
        }
        if (!combatant.players.includes(game.user) && !(isActiveGM() && combatant.players.every((a) => !a.active))) {
            return;
        }

        const buttons = {
            normal: {
                label: "Roll Initiative as Normal",
            },
            stealth: {
                label: "Roll Initiative using Stealth",
            },
            "cover-standard": {
                label: "Roll Initiative using Stealth with Standard Cover",
            },
            "cover-greater": {
                label: "Roll Initiative using Stealth with Greater Cover",
            },
        };

        const rolls = lastMessages(100)
            .filter((m) => m.actor?.uuid === combatant?.actor?.uuid)
            .filter((m) => {
                return (triggerType(m) === "skill-check" &&
                    (hasDomain(m, "stealth") || hasOption(m, "action:hide") || hasOption(m, "action:sneak"))
                );
            });

        const lastRolls = rolls.slice(-3).filter((l) => Math.abs(Date.now() - l.timestamp) / 1000 / 60 < 60);
        for (let i = 1; i < 4; i++) {
            const r = lastRolls.pop();
            if (!r) break;

            const label = hasOption(r, "action:hide") ? "Hide" : hasOption(r, "action:sneak") ? "Sneak" : "Stealth Check";
            buttons[`roll${i}`] = {
                label: `${label}: ${r.rolls[0].total} (${foundry.utils.timeSince(r.timestamp)})`,
                callback: () => {
                    return {val: r.rolls[0].total, label};
                },
            };
        }

        const choice = await Dialog.wait(
            {
                title: `Stealth's Initiative - ${combatant.actor.name}`,
                buttons,
            },
            {id: moduleName, width: 450}
        );

        if (!choice) return;
        if (choice === "stealth" || choice === "cover-standard" || choice === "cover-greater") {
            await combatant.actor.update({"system.initiative.statistic": "stealth"});
            const rollParams = eventToRollParams(event, {type: "check"});

            if (choice === "cover-standard" || choice === "cover-greater") {
                rollParams.modifiers = [
                    new game.pf2e.Modifier({
                        label: "Cover - " + (choice === "cover-standard" ? "Standard" : "Greater"),
                        modifier: choice === "cover-standard" ? 2 : 4,
                        type: "circumstance",
                        slug: choice
                    })
                ]
            }

            combatant.actor.initiative.roll(rollParams);
        } else if (choice === "normal") {
            await combatant.actor.update({"system.initiative.statistic": "perception"});
            combatant.actor.initiative.roll(eventToRollParams(event, {type: "check"}));
        } else if (Number.isNumeric(choice.val)) {
            setTimeout(async () => {
                await combatant.update({initiative: choice.val, "flags.pf2e.initiativeStatistic": "stealth"});
                createMessageInitiative(combatant.name, choice.val, choice.label);
            }, 300);
        }
    }
}

function createMessageInitiative(name: string, roll: string, reason: string) {
    ChatMessage.create({
        flags: {
            [moduleName]: {}
        },
        user: game.user.id,
        content: `${name} used Stealth (${roll}) for Initiative because ${reason}`,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    });
}