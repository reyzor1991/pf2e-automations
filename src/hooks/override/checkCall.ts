import {getFeatBySourceId, getSetting} from "../../helpers";
import {getRollMode} from "../../global-f";


export function checkCall(wrapped: Function, ...args: any[]) {
    const context = args[1];
    const check = args[0];
    if (!context) return wrapped(...args);
    const options = context?.options instanceof Set ? context.options : new Set();


    if (context.rollMode !== "gmroll" && context.rollMode !== "blindroll") {
        if (getSetting("blindRoll")) {
            if (["skill-check", "perception-check"].includes(context.type)) {
                const onlySkills = getSetting("onlySkillBlindRoll")
                    ?.split(',')
                    .map(a => a.trim().toLowerCase())
                    .filter(s => !!s);

                if (onlySkills.length > 0) {
                    if (context?.domains?.some(a => onlySkills.includes(a))) {
                        context.rollMode = getRollMode();
                    }
                } else {
                    const skills = getSetting("skipSkillBlindRoll")
                        ?.split(',')
                        .map(a => a.trim().toLowerCase())
                        .filter(s => !!s);

                    if (skills.length === 0 || !context?.domains?.some(a => skills.includes(a))) {
                        context.rollMode = getRollMode();
                    }
                }
            }
        }

        if (getSetting("hiddenTokenBlindRoll") && context?.token?.hidden) {
            context.rollMode = getRollMode();
        }
    }

    if (options.has("action:demoralize")) {
        if (context.actor && context.target?.actor) {
            const hasIntimidatingGlare = getFeatBySourceId(context.actor, "Compendium.pf2e.feats-srd.Item.xQMz6eDgX75WX2ce"); // Intimidating Glare
            if (
                !hasIntimidatingGlare &&
                (
                    !context.target?.actor.system.traits.languages?.value.some((lang) => context.actor.system.traits.languages?.value.includes(lang))
                    && !context.target?.actor.system.details.languages?.value.some((lang) => context.actor.system.details.languages?.value.includes(lang))
                )
            ) {
                if (check.modifiers.find((a) => a.slug === "unintelligible")) {
                    check.modifiers.find((a) => a.slug === "unintelligible").enabled = true;
                    options.add("action:demoralize:unintelligible");
                } else {
                    check._modifiers.push(
                        new game.pf2e.Modifier({
                            label: "Unintelligible",
                            modifier: -4,
                            type: "circumstance",
                            slug: "unintelligible",
                            enabled: true,
                        })
                    );
                }
            }
        }
    }

    if (context.item?.slug === "wilding-word") {
        if (options.has("self:trait:animal") || options.has("self:trait:fungus") || options.has("self:trait:plant")) {
            check._modifiers.push(
                new game.pf2e.Modifier({
                    label: "Wilding Word Vulnerability",
                    modifier: -1,
                    type: "circumstance",
                    slug: "wilding-word-vulnerability",
                    enabled: true,
                })
            );
        }
    }

    if (options.has("self:trait:dragon") && context.origin?.actor) {
        if (context.origin.actor.getRollOptions().includes("feat:irresistible-magic")) {
            if (check._modifiers.find(m => m.type === "status" && m.predicate.includes('item:magical'))) {
                check._modifiers.push(
                    new game.pf2e.Modifier({
                        label: "Irresistible Magic",
                        modifier: -1,
                        type: "status",
                        slug: "irresistible-magic",
                        enabled: true,
                    })
                );
            }
        }
    }

    if (getSetting("incapacitation") !== "no"
        && (options.has("incapacitation") || options.has("item:trait:incapacitation") || options.has("origin:action:trait:incapacitation"))) {
        changeIncap(check, context);
    }

    //@ts-ignore
    return wrapped.call(this, ...args);
}

function changeIncap(check: any, context: any) {
    removeIncapacitationFromAdjustments(context);

    if (getSetting("incapacitation") === "r2H") {
        context.rollTwice = "keep-higher";
    } else if (getSetting("incapacitation") === "bloodied") {
        context.rollTwice = "keep-higher";
        let find = context.actor?.items?.find(i => i.sourceId === getSetting("incapacitationCondition"));
        if (!find) {
            context.dosAdjustments.push({
                adjustments: {criticalFailure: {amount: 1, label: "PF2E.TraitIncapacitation"}},
                predicate: new game.pf2e.Predicate([])
            });
        }
    }
}

function removeIncapacitationFromAdjustments(context) {
    const index =
        context.dosAdjustments?.findIndex(a => a?.adjustments?.all?.label === "PF2E.TraitIncapacitation") ?? -1;
    if (index >= 0) {
        context.dosAdjustments.splice(index, 1);
    }
}