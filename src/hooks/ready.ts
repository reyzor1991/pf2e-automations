import {VoidModuleHook} from "./index";
import {effectUUID, getSetting, getVersionRuleGroups, isActiveGM, syncRulesFn, updateActiveRules} from "../helpers";
import {GlobalNamespace, moduleName} from "../const";
import {socketListener} from "../socket";
import {applySelfEffect} from "./functions";
import {
    ACTION_FUNCTIONS,
    battleMedicineAction,
    conjureBullet,
    criticalSpecializationAxe,
    criticalSpecializationBow,
    criticalSpecializationFortitudeRollSavingThrow,
    criticalSpecializationReflexRollSavingThrow,
    criticalSpecializationSpear,
    criticalSpecializationSword,
    debilitatingStrike,
    debilitatingStrikeAttack,
    deleteFeintEffects,
    deleteHoldingBreath,
    demoralize,
    disarm,
    escape,
    explorationEffectIcon,
    feint,
    feintCriticalFailure,
    grab,
    grabImproved,
    grapple,
    handleMasterStrikeResult,
    huntPrey,
    knockdown,
    masterStrike,
    notifyExplorationActivity,
    push,
    rageImmunity,
    rollInitiative,
    suffocatingEndTurn,
    tamper,
    treatWoundsAction,
    trueShapeBomb,
} from "../handlers/actions";
import {FEAT_FUNCTIONS,} from "../handlers/feats";
import {
    addShieldEffect,
    applyBaneImmunity,
    blessingOfDefiance,
    buzzingBites,
    dehydrateEffect,
    deleteSelfishShield,
    deleteShieldEffect,
    deleteShieldEffectAmp,
    entropicWheel,
    extendBoost,
    fortissimoComposition,
    frostbiteAmped,
    guidanceHandler,
    lingeringComposition,
    petrifyEffect,
    rollSavingThrowVsBane,
    shieldsOfTheSpiritDamage,
    SPELL_FUNCTIONS,
    synesthesia
} from "../handlers/spells";
import {causticBelch, furiousAnatomy} from "../handlers/external";
import {
    bagOfDevouring,
    bagOfDevouringDelete,
    bagOfWeasels,
    bagOfWeaselsDelete,
    doublingRings,
    refocus,
    removeEffectsWhenUnconscious
} from "../handlers/items";
import {bloodlines, effectHagBloodMagic} from "../handlers/bloodline";
import {checkCall} from "./override/checkCall";
import {drawAdditionalLine} from "./override/drawAdditionalLine";
import {castSpell} from "./override/castSpell";
import {
    armorInEarth,
    createSpikeSkin,
    deleteArmorInEarth,
    deleteHardwoodArmor,
    deleteHardwoodArmorShield,
    deleteMetalCarapace,
    deleteMetalCarapaceShield,
    hardwoodArmor,
    hardwoodArmorShield,
    metalCarapace,
    metalCarapaceShield,
    spikeSkin,
    spikeSkinDamage
} from "../handlers/kineticist";

class ReadyGlobalVariablesHook implements VoidModuleHook {
    listen() {
        updateActiveRules()

        GlobalNamespace.ALL_FUNCTIONS = {
            'applySelfEffect': applySelfEffect,
            'applyBaneImmunity': applyBaneImmunity,
            'rollSavingThrowVsBane': rollSavingThrowVsBane,
            'furiousAnatomy': furiousAnatomy,
            'causticBelch': causticBelch,
            'explorationEffectIcon': explorationEffectIcon,
            'notifyExplorationActivity': notifyExplorationActivity,
            'lingeringComposition': lingeringComposition,
            'fortissimoComposition': fortissimoComposition,
            'extendBoost': extendBoost,
            'guidanceHandler': guidanceHandler,
            'addShieldEffect': addShieldEffect,
            'deleteShieldEffect': deleteShieldEffect,
            'deleteSelfishShield': deleteSelfishShield,
            'deleteShieldEffectAmp': deleteShieldEffectAmp,
            'effectHagBloodMagic': effectHagBloodMagic,
            'bloodlines': bloodlines,
            'conjureBullet': conjureBullet,
            'rollInitiative': rollInitiative,
            'rageImmunity': rageImmunity,
            'doublingRings': doublingRings,
            'shieldsOfTheSpiritDamage': shieldsOfTheSpiritDamage,
            'criticalSpecializationBow': criticalSpecializationBow,
            'criticalSpecializationAxe': criticalSpecializationAxe,
            'criticalSpecializationSpear': criticalSpecializationSpear,
            'criticalSpecializationSword': criticalSpecializationSword,
            'criticalSpecializationFortitudeRollSavingThrow': criticalSpecializationFortitudeRollSavingThrow,
            'criticalSpecializationReflexRollSavingThrow': criticalSpecializationReflexRollSavingThrow,
            'disarm': disarm,
            'huntPrey': huntPrey,
            'frostbiteAmped': frostbiteAmped,
            'entropicWheel': entropicWheel,
            'buzzingBites': buzzingBites,
            'synesthesia': synesthesia,
            'blessingOfDefiance': blessingOfDefiance,
            'battleMedicineAction': battleMedicineAction,
            'treatWoundsAction': treatWoundsAction,
            'deleteFeintEffects': deleteFeintEffects,
            'feint': feint,
            'feintCriticalFailure': feintCriticalFailure,
            'demoralize': demoralize,
            'escape': escape,
            'trueShapeBomb': trueShapeBomb,
            'masterStrike': masterStrike,
            'handleMasterStrikeResult': handleMasterStrikeResult,
            'debilitatingStrike': debilitatingStrike,
            'debilitatingStrikeAttack': debilitatingStrikeAttack,
            'grapple': grapple,
            'grabImproved': grabImproved,
            'push': push,
            'knockdown': knockdown,
            'tamper': tamper,
            'grab': grab,
            'deleteHoldingBreath': deleteHoldingBreath,
            'suffocatingEndTurn': suffocatingEndTurn,
            'petrifyEffect': petrifyEffect,
            'dehydrateEffect': dehydrateEffect,
            'bagOfDevouring': bagOfDevouring,
            'bagOfDevouringDelete': bagOfDevouringDelete,
            'bagOfWeasels': bagOfWeasels,
            'bagOfWeaselsDelete': bagOfWeaselsDelete,
            'removeEffectsWhenUnconscious': removeEffectsWhenUnconscious,
            'refocus': refocus,
            'armorInEarth': armorInEarth,
            'hardwoodArmor': hardwoodArmor,
            'metalCarapace': metalCarapace,
            'deleteArmorInEarth': deleteArmorInEarth,
            'deleteMetalCarapace': deleteMetalCarapace,
            'deleteHardwoodArmor': deleteHardwoodArmor,
            'metalCarapaceShield': metalCarapaceShield,
            'hardwoodArmorShield': hardwoodArmorShield,
            'deleteMetalCarapaceShield': deleteMetalCarapaceShield,
            'deleteHardwoodArmorShield': deleteHardwoodArmorShield,
            'createSpikeSkin': createSpikeSkin,
            'spikeSkin': spikeSkin,
            'spikeSkinDamage': spikeSkinDamage,
            ...FEAT_FUNCTIONS,
            ...ACTION_FUNCTIONS,
            ...SPELL_FUNCTIONS,
        }

        GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS = {
            'avoid-notice': effectUUID('N8vpuGy4TzU10y8E'),
            'cover-tracks': effectUUID('F6vJYLZTWDpnrnCZ'),
            'defend': effectUUID('GYOyFj4ziZX060rZ'),
            'detect-magic': effectUUID('OjRHL0B4WAUUQc13'),
            'follow-the-expert': effectUUID('V347nnVBGDrVWh7k'),
            'hustle': effectUUID('vNUrKvoOSvEnqzhM'),
            'investigate': effectUUID('tDsgl8YmhZbx2May'),
            'repeat-a-spell': effectUUID('kh1QdKkvbNZ0qBsQ'),
            'scout': effectUUID('mGFBHM1lvHNZ9BsH'),
            'search': effectUUID('XiVLHjg5lQVMX8Fj'),
            'track': effectUUID('OcCXjJab7rSR3mDf'),
            'travel-mount': effectUUID('SggYzuL9NtYoktUR'),
            'refocus': effectUUID('ThF8UIN5093xtCaq'),
        };

        GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS_SWAP = Object.keys(GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS).reduce((ret, key) => {
            ret[GlobalNamespace.ACTIVITY_EXPLORATION_EFFECTS[key]] = key;
            return ret;
        }, {} as { [key: string]: string });


        const unsorted = {
            ...CONFIG.PF2E.ancestryTraits,
            ...CONFIG.PF2E.actionTraits,
            ...CONFIG.PF2E.classTraits,
            ...CONFIG.PF2E.effectTraits
        };
        GlobalNamespace.FORM_LABELS = Object.keys(unsorted).sort().reduce(
            (obj, key) => {
                obj[key] = unsorted[key];
                return obj;
            },
            {} as { [key: string]: string; }
        );
        GlobalNamespace.LOCALIZED_RESISTANCES = Object.entries(CONFIG.PF2E.resistanceTypes)
            .reduce((o, v) => {
                o[game.i18n.localize(v[1])] = v[0];
                return o
            }, {} as { [key: string]: string })
    }
}

function overrideFunctions() {
    if (game.modules.get("lib-wrapper")?.active) {
        // @ts-ignore
        libWrapper.register(moduleName, "CONFIG.PF2E.Item.documentClasses.spellcastingEntry.prototype.cast", castSpell, "WRAPPER");
        // @ts-ignore
        libWrapper.register(moduleName, "game.pf2e.Check.roll", checkCall, "WRAPPER");
        if (getSetting("showEffectRelationship") === 'press') {
            // @ts-ignore
            libWrapper.register(moduleName, "CONFIG.Token.objectClass.prototype._refreshVisibility", drawAdditionalLine, "WRAPPER");
        }

    } else {
        const or = CONFIG.PF2E.Item.documentClasses.spellcastingEntry.prototype.cast;
        CONFIG.PF2E.Item.documentClasses.spellcastingEntry.prototype.cast = function (...args: any[]) {
            return castSpell.call(this, or, ...args);
        }

        const rollOr = game.pf2e.Check.roll;
        game.pf2e.Check.roll = async function (...args: any[]) {
            return checkCall.call(this, rollOr, ...args);
        }

        const orVis = CONFIG.Token.objectClass.prototype._refreshVisibility
        CONFIG.Token.objectClass.prototype._refreshVisibility = function (...args: any[]) {
            return drawAdditionalLine.call(this, orVis, ...args);
        }
    }
}

class ReadyHook implements VoidModuleHook {
    async listen() {
        socketListener()
        if (isActiveGM()) {

            fetch(`modules/${moduleName}/rules/version.json`)
                .then(async (response) => {
                    if (response.ok) {
                        return await response.json();
                    } else {
                        ui.notifications.info(`Sync file not found`);
                        throw new Error("Sync file not found");
                    }
                })
                .then(async (json) => {
                    const cur = getVersionRuleGroups() ?? 0;
                    if ((json.version ?? 0) > cur) {
                        syncRulesFn();
                    }
                });
        }
        overrideFunctions()
    }
}

export {
    ReadyGlobalVariablesHook,
    ReadyHook,
}