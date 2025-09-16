import {SubSettings} from "./subSettingForm";
import {moduleName} from "../const";

export class PlayerSettings extends SubSettings {

    static _namespace = "playerSettingsMenu";

    static get settings() {
        return {
            allSpellsAuditory: {
                name: `${moduleName}.SETTINGS.allSpellsAuditory.name`,
                hint: `${moduleName}.SETTINGS.allSpellsAuditory.hint`,
                default: false,
                type: Boolean,
            },
            pingMessage: {
                name: `${moduleName}.SETTINGS.pingMessage.name`,
                hint: `${moduleName}.SETTINGS.pingMessage.hint`,
                default: false,
                type: Boolean,
            },
            fastHealingTime: {
                name: `${moduleName}.SETTINGS.fastHealingTime.name`,
                hint: `${moduleName}.SETTINGS.fastHealingTime.hint`,
                default: false,
                type: Boolean,
                requiresReload: true,
            },
            useAutomationThaumaturge: {
                name: `${moduleName}.SETTINGS.useAutomationThaumaturge.name`,
                hint: `${moduleName}.SETTINGS.useAutomationThaumaturge.hint`,
                default: true,
                type: Boolean,
            },
            removeExplorationActivity: {
                name: `${moduleName}.SETTINGS.removeExplorationActivity.name`,
                hint: `${moduleName}.SETTINGS.removeExplorationActivity.hint`,
                default: false,
                type: Boolean,
            },
            conditionDC: {
                name: `${moduleName}.SETTINGS.conditionDC.name`,
                hint: `${moduleName}.SETTINGS.conditionDC.hint`,
                default: false,
                type: Boolean,
            },
            partyVision: {
                name: `${moduleName}.SETTINGS.partyVision.name`,
                hint: `${moduleName}.SETTINGS.partyVision.hint`,
                default: false,
                type: Boolean,
            },
            highlightSpells: {
                name: `${moduleName}.SETTINGS.highlightSpells.name`,
                hint: `${moduleName}.SETTINGS.highlightSpells.hint`,
                default: false,
                type: Boolean,
            },
        };
    }
}
