import {PreCreateMessageHook, RenderMessageHook} from "./index";
import {getSetting, hasOption, triggerType} from "../helpers";
import {GlobalNamespace, moduleName} from "../const";
import {getRollMode} from "../global-f";

export class FlatHook implements PreCreateMessageHook {
    listen(message: ChatMessage, data: object, options: object, userId: string): void {
        if (getSetting("flatCheck") === "no") {
            return;
        }

        flatPreCreateChatMessage(message, data, options, userId);
    }
}


function isSpellCard(message: ChatMessage) {
    return triggerType(message) === "spell-cast";
}

const correctTypes = ['postInfo', 'spell-cast', 'taken-damage'];
function flatPreCreateChatMessage(message, data, options, userId) {
    if (!correctTypes.includes(triggerType(message))) {
        return;
    }

    const user = game.users.get(userId);
    if (isSpellCard(message)) {
        const stupefied = message.actor.getCondition("stupefied");
        if (stupefied) {
            const roll = rollD20();
            const dcValue = 5 + stupefied.value;

            flatMessage(message, roll, game.i18n.localize("PF2E.ConditionTypeStupefied"), dcValue, user);

            if (roll.total < dcValue) {
                skipMessageHandling(message);
            }
            return
        }
    } else if (
        message?.flags?.pf2e?.appliedDamage?.uuid
        && !message?.flags?.pf2e?.appliedDamage?.isReverted
        && !message?.flags?.pf2e?.appliedDamage?.isHealing
    ) {
        if (!message?.item || message?.item?.isOfType('melee', 'ranged', 'weapon', 'spell')) {
            const confused = message.actor.getCondition("confused");
            if (confused) {
                const roll = rollD20();
                const dcValue = 11;

                flatMessage(message, roll, game.i18n.localize("PF2E.ConditionTypeConfused"), dcValue, user);

                if (roll.total >= dcValue) {
                    confused.delete();
                }
            }
            return;
        }
    }

    const deafened = message.actor.getCondition("deafened");
    const grabbed = message.actor.getCondition("grabbed");

    if (
        deafened
        && (
            message.item?.traits?.has("auditory")
            || (isSpellCard(message) && getSetting("allSpellsAuditory") && !message.item?.traits?.has("subtle"))
        )
    ) {
        const roll = rollD20();
        const dcValue = 5;

        flatMessage(message, roll, game.i18n.localize("PF2E.ConditionTypeDeafened"), dcValue, user);
        if (roll.total < dcValue && isSpellCard(message)) {
            skipMessageHandling(message);
        }
    } else if (grabbed && (
        message.item?.traits?.has("manipulate")
        || message.flavor?.includes('data-slug="manipulate"')
        || message.content?.includes('data-slug="manipulate"')
    )) {
        const roll = rollD20();
        const dcValue = 5;

        flatMessage(message, roll, game.i18n.localize("PF2E.ConditionTypeGrabbed"), dcValue, user);

        if (roll.total < dcValue && isSpellCard(message)) {
            skipMessageHandling(message);
        }
    } else if (hasOption(message, "concentrate") && message?.actor?.itemTypes?.effect?.find((a) => a.slug === "spell-effect-synesthesia")) {
        const roll = rollD20();
        const dcValue = 5;

        flatMessage(message, roll, "Synesthesia", dcValue, user);

        if (roll.total < dcValue && isSpellCard(message)) {
            skipMessageHandling(message);
        }
    }
}

function randomInteger(min: number, max: number) {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

function rollD20() {
    if (isV12()) {
        const roll = new GlobalNamespace.CheckRoll(`${randomInteger(1, 20)}`).evaluateSync();
        roll._formula = '1d20';
        return roll;
    }

    return new Roll("d20").evaluate({async: false});
}

function isV12() {
    return game.release.generation > 11
}


function flatMessage(message: ChatMessage, roll: Roll, condition: string, dcValue: number, user: User, target = false, secret = false, isMultiple = false) {
    const isFail = roll.total < dcValue;
    if (isFail && !isMultiple) {
        message.updateSource({
            "flags.pf2e.flatCheck.result": "fail",
        });
    }

    const success = game.i18n.localize(`PF2E.Check.Result.Degree.Check.success`).toUpperCase()
    const failure = game.i18n.localize(`PF2E.Check.Result.Degree.Check.failure`).toUpperCase()

    ChatMessage.create(
        {
            flags: {
                [moduleName]: {}
            },
            whisper: secret ? ChatMessage.getWhisperRecipients("GM").map((u) => u.id) : null,
            blind: secret,
            rolls: [roll],
            content: `
                <div>
                    <b>${target ? "Target" : message.actor.name}</b> is <b>${condition}</b></br>
                    Flat Check DC is <b>${dcValue}</b>.
                </div>
                <div class="dice-roll">
                    <div class="dice-result">
                        <h4 class="dice-total flat-check" style="color:black; background: ${isFail ? "red" : "green"}">${roll.total}</h4>
                        <h4 class="dice-total flat-check" style="color:${isFail ? "red" : "green"}">${isFail ? failure : success}</h4>
                    </div>
                </div>`,
            speaker: ChatMessage.getSpeaker({token: message.token, actor: message.actor, user}),
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        },
        {rollMode: !secret ? "roll" : getRollMode()}
    );
    return isFail;
}

function skipMessageHandling(message: ChatMessage) {
    const opts = message.flags.pf2e?.context?.options ?? [];
    opts.push("skip-handling-message");
    message.updateSource({
        flags: {
            pf2e: {
                context: {
                    options: opts,
                },
            },
        },
    });
}


export class FlatAllTargetsHook implements PreCreateMessageHook {
    listen(message: ChatMessage, data: object, options: object, userId: string): void {
        if (getSetting("flatCheck") !== "all") {
            return;
        }
        if (
            game.modules.get("pf2e-perception")?.active
            && game.settings.get('pf2e-perception', 'flat-check') !== 'none'
        ) {
            return;
        }

        flatAllTargetsPreCreateChatMessage(message, data, options, userId)
    }
}

function flatAllTargetsPreCreateChatMessage(message: ChatMessage, data: object, options: object, userId: string) {
    if (message.actor?.isOfType("hazard")) {
        return
    }

    const opts = message.flags.pf2e?.context?.options;
    const domains = message.flags.pf2e?.context?.domains;
    if (!opts || !domains) {
        return;
    }

    const targets = [];
    if (triggerType(message) === 'attack-roll'
        || (triggerType(message) === 'skill-check' && hasOption(message, "attack"))
    ) {
        if (message.target && message.isCheckRoll) {
            targets.push(message.target.actor);
        }
    } else if (triggerType(message) === 'spell-cast') {
        if (message.item?.system?.target?.value && message.item?.system?.defense?.passive?.statistic !== "ac") {
            targets.push(...game.user.targets.map(t => t.actor))
        }
    }

    if (!targets.length) {
        return;
    }

    const user = game.users.get(userId);
    const results = targets.map(target => {
        return checkActorTargetConditions(message, target, opts, domains, user);
    })

    if (results.length) {
        if (results.every(r => !!r)) {
            message.updateSource({
                "flags.pf2e.flatCheck.result": "fail",
            });
        } else if (results.includes(true)) {
            message.updateSource({
                "flags.pf2e.flatCheck.result": "partial",
            });
        }
    }
}

function checkActorTargetConditions(message: ChatMessage, target: Actor, opts:string[], domains, user, isMultiple = false) {
    const rollOptions = message.flags.pf2e?.context?.options || [];
    const blinded = rollOptions.includes("blinded") || rollOptions.includes("self:condition:blinded");
    const dazzled = rollOptions.includes("dazzled") || rollOptions.includes("self:condition:dazzled");
    const blindFight = rollOptions.includes("feat:blind-fight");
    const liminalFetchling = rollOptions.includes("heritage:liminal-fetchling");
    const whisperElf = rollOptions.includes("heritage:whisper-elf");

    const targetHidden = target.hasCondition("hidden");
    const targetConcealed = target.hasCondition("concealed");
    const targetInvisible = target.hasCondition("invisible");
    const targetUndetected = target.hasCondition("undetected");


    const archersAim = opts.includes("archers-aim") && (
        domains.includes("bow-group-attack-roll")
        || domains.includes("crossbow-group-attack-roll")
    )

    if (blinded || targetHidden) {
        if (!opts.includes("target:condition:hidden")) {
            opts.push("target:condition:hidden");
            message.updateSource({"flags.pf2e.context.options": opts});
        }
    } else if ((dazzled || targetConcealed) && !blindFight) {
        if (opts && !opts.includes("target:condition:concealed")) {
            opts.push("target:condition:concealed");
            message.updateSource({"flags.pf2e.context.options": opts});
        }
    }

    if ((opts.includes("target:condition:invisible") || targetInvisible || targetUndetected) && !opts.includes("target:condition:undetected")) {
        opts.push("target:condition:undetected");
    }

    if (opts.includes("target:condition:hidden")) {
        const roll = rollD20();

        let dcValue = (blindFight || archersAim) ? 5 : (whisperElf ? 9 : 11);
        if (domains.includes("weapon-attack-roll")) {
            if (opts.includes("self:effect:vigilant-eye-weapon")) {
                dcValue = Math.min(dcValue, 10)
            } else if (opts.includes("self:effect:vigilant-eye-greater-weapon")) {
                dcValue = Math.min(dcValue, 9)
            } else if (opts.includes("self:effect:vigilant-eye-major-weapon")) {
                dcValue = Math.min(dcValue, 8)
            }
        }

        return flatMessage(
            message,
            roll,
            blinded ? game.i18n.localize("PF2E.ConditionTypeBlinded") : `${game.i18n.localize("PF2E.ConditionTypeHidden")}`,
            dcValue,
            user,
            true,
            false,
            isMultiple
        );
    } else if (opts.includes("target:condition:undetected")) {
        if (!opts.includes("secret")) {
            opts.push("secret");
        }
        message.updateSource({
            whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
            blind: true,
            "flags.pf2e.context.rollMode": getRollMode(),
            "flags.pf2e.context.options": opts,
            "flags.pf2e.context.secret": true,
        });

        const roll = rollD20();
        let dcValue = 11;
        if (domains.includes("weapon-attack-roll")) {
            if (opts.includes("self:effect:vigilant-eye-weapon")) {
                dcValue = Math.min(dcValue, 10)
            } else if (opts.includes("self:effect:vigilant-eye-greater-weapon")) {
                dcValue = Math.min(dcValue, 9)
            } else if (opts.includes("self:effect:vigilant-eye-major-weapon")) {
                dcValue = Math.min(dcValue, 8)
            }
        }

        return flatMessage(
            message,
            roll,
            `${game.i18n.localize("PF2E.ConditionTypeUndetected")}`,
            dcValue,
            user,
            true,
            true,
            isMultiple
        );
    } else if (opts.includes("target:condition:concealed") && !blindFight && !archersAim) {
        const roll = rollD20();
        let dcValue = (liminalFetchling || whisperElf) ? 3 : 5;
        if (domains.includes("weapon-attack-roll")) {
            if (opts.includes("self:effect:vigilant-eye-weapon")) {
                dcValue = Math.min(dcValue, 4)
            } else if (opts.includes("self:effect:vigilant-eye-greater-weapon")) {
                dcValue = Math.min(dcValue, 3)
            } else if (opts.includes("self:effect:vigilant-eye-major-weapon")) {
                dcValue = Math.min(dcValue, 2)
            }
        }

        return flatMessage(
            message,
            roll,
            dazzled
                ? game.i18n.localize("PF2E.ConditionTypeDazzled")
                : `${game.i18n.localize("PF2E.ConditionTypeConcealed")}`,
            dcValue,
            user,
            true,
            false,
            isMultiple
        );
    }

    return undefined;
}


export class FlatAttackHook implements PreCreateMessageHook {
    listen(message: ChatMessage, data: object, options: object, userId: string): void {
        if (getSetting("flatCheck") !== "attack") {
            return;
        }
        if (
            game.modules.get("pf2e-perception")?.active
            && game.settings.get('pf2e-perception', 'flat-check') !== 'none'
        ) {
            return;
        }

        flatAttackPreCreateChatMessage(message, data, options, userId)
    }
}

function flatAttackPreCreateChatMessage(message: ChatMessage, data: object, options: object, userId: string): void {
    if (message.actor?.isOfType("hazard")) {
        return
    }
    if (triggerType(message) !== 'attack-roll'
        && !(triggerType(message) !== 'skill-check' && hasOption(message, "attack"))
    ) {
        return;
    }
    if (!(message.target && message.isCheckRoll)) {
        return;
    }
    const opts = message.flags.pf2e?.context?.options;
    const domains = message.flags.pf2e?.context?.domains;
    if (!opts || !domains) {
        return;
    }
    const user = game.users.get(userId);
    const target = message.target?.actor ?? game.user.targets.first()?.actor;

    checkActorTargetConditions(message, target, opts, domains, user);
}

export class FailFlatRenderMessageHook implements RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void {
        if (message?.flags?.pf2e?.flatCheck?.result !== "fail") {
            return;
        }
        const hint = foundry.utils.parseHTML(`<i class="flat-check-hint">${message.actor.name} tried to use action and failed the flat check</i>`);

        if (html.querySelector(".message-content .dice-roll")) {
            html.querySelector(".message-content .dice-roll").before(hint);
        } else if (html.querySelector(".card-footer")) {
            html.querySelector(".card-footer").before(hint);
        } else if (html.querySelector(".card-content")) {
            html.querySelector(".card-content").after(hint);
        } else if (html.querySelector(".message-content .action-content")) {
            html.querySelector(".message-content").after(hint);
        }

        html.classList.add('failed-flat-check');
    }
}

export class PartialFailFlatRenderMessageHook implements RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void {
        if (message?.flags?.pf2e?.flatCheck?.result !== "partial") {
            return;
        }
        const hint = foundry.utils.parseHTML(`<i class="partial-check-hint">${message.actor.name} tried to use action and get partial fail</i>`);

        if (html.querySelector(".message-content .dice-roll")) {
            html.querySelector(".message-content .dice-roll").before(hint);
        } else if (html.querySelector(".card-footer")) {
            html.querySelector(".card-footer").before(hint);
        } else if (html.querySelector(".card-content")) {
            html.querySelector(".card-content").after(hint);
        } else if (html.querySelector(".message-content .action-content")) {
            html.querySelector(".message-content").after(hint);
        }

        html.classList.add('partial-flat-check');
    }
}