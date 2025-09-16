import {moduleName} from "../const";
import {SubSettings} from "./subSettingForm";

export class RollSettings extends SubSettings {

    static _namespace = "rollSettingsMenu";

    static get settings() {
        return {
            avoidNoticeRoll: {
                name: `${moduleName}.SETTINGS.avoidNoticeRoll.name`,
                hint: `${moduleName}.SETTINGS.avoidNoticeRoll.hint`,
                default: false,
                type: Boolean,
            },
            avoidNoticeRollSecret: {
                name: `${moduleName}.SETTINGS.avoidNoticeRollSecret.name`,
                hint: `${moduleName}.SETTINGS.avoidNoticeRollSecret.hint`,
                default: false,
                type: Boolean,
            },
            stealthRollInitiative: {
                name: `${moduleName}.SETTINGS.stealthRollInitiative.name`,
                hint: `${moduleName}.SETTINGS.stealthRollInitiative.hint`,
                default: false,
                type: Boolean,
            },
            flatCheck: {
                name: `${moduleName}.SETTINGS.flatCheck.name`,
                hint: `${moduleName}.SETTINGS.flatCheck.hint`,
                type: String,
                requiresReload: true,
                choices: {
                    'no': 'No',
                    'attack': 'Base flats and attacks',
                    'all': 'Base and all targeting actions',
                },
                default: "no",
            },
            basicActionRoll: {
                name: `${moduleName}.SETTINGS.basicActionRoll.name`,
                hint: `${moduleName}.SETTINGS.basicActionRoll.hint`,
                default: false,
                type: Boolean,
            },
            minMaxDamage: {
                name: `${moduleName}.SETTINGS.minMaxDamage.name`,
                hint: `${moduleName}.SETTINGS.minMaxDamage.hint`,
                default: false,
                type: Boolean,
            },
        };
    }
}

export class HideRollSettings extends SubSettings {

    static _namespace = "hideRollMenu";

    static get settings() {
        return {
            blindRoll: {
                name: `${moduleName}.SETTINGS.blindRoll.name`,
                hint: `${moduleName}.SETTINGS.blindRoll.hint`,
                default: false,
                type: Boolean,
            },
            skipSkillBlindRoll: {
                name: `${moduleName}.SETTINGS.skipSkillBlindRoll.name`,
                hint: `${moduleName}.SETTINGS.skipSkillBlindRoll.hint`,
                default: "",
                type: String,
            },
            onlySkillBlindRoll: {
                name: `${moduleName}.SETTINGS.onlySkillBlindRoll.name`,
                hint: `${moduleName}.SETTINGS.onlySkillBlindRoll.hint`,
                default: "",
                type: String,
            },
            hiddenTokenBlindRoll: {
                name: `${moduleName}.SETTINGS.hiddenTokenBlindRoll.name`,
                hint: `${moduleName}.SETTINGS.hiddenTokenBlindRoll.hint`,
                default: false,
                type: Boolean,
            },
            hidePrivateGMRolls: {
                name: `${moduleName}.SETTINGS.hidePrivateGMRolls.name`,
                hint: `${moduleName}.SETTINGS.hidePrivateGMRolls.hint`,
                default: false,
                type: Boolean,
            },
            hidePrivatePlayerRolls: {
                name: `${moduleName}.SETTINGS.hidePrivatePlayerRolls.name`,
                hint: `${moduleName}.SETTINGS.hidePrivatePlayerRolls.hint`,
                default: false,
                type: Boolean,
            },
        };
    }
}

export class IncapacitationRollSettings extends SubSettings {

    static _namespace = "incapacitationRollMenu";

    static get settings() {
        return {
            incapacitation: {
                name: `${moduleName}.SETTINGS.incapacitation.name`,
                hint: `${moduleName}.SETTINGS.incapacitation.hint`,
                type: String,
                requiresReload: true,
                choices: {
                    'no': 'Standard incapacitation',
                    'r2H': 'Roll twice take the highest',
                    'bloodied': '"Bloodied" rule',
                },
                default: "no",
            },
            incapacitationCondition: {
                name: `Incapacitation Condition. Set sourceId`,
                hint: `Need to set for specific options like "Bloodied" rule`,
                default: "",
                type: String,
            },
        };
    }
}
