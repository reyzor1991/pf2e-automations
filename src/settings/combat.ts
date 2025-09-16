import {SubSettings} from "./subSettingForm";
import {moduleName} from "../const";

export class CombatSettings extends SubSettings {

    static _namespace = "combatSettingsMenu";

    static get settings() {
        return {
            deleteExploration: {
                name: `${moduleName}.SETTINGS.deleteExploration.name`,
                hint: `${moduleName}.SETTINGS.deleteExploration.hint`,
                default: false,
                type: Boolean,
            },
            sustainedSpells: {
                name: `${moduleName}.SETTINGS.sustainedSpells.name`,
                hint: `${moduleName}.SETTINGS.sustainedSpells.hint`,
                default: false,
                type: Boolean,
            },
            openNpcSheet: {
                name: `${moduleName}.SETTINGS.openNpcSheet.name`,
                hint: `${moduleName}.SETTINGS.openNpcSheet.hint`,
                default: false,
                type: Boolean,
            },
        };
    }
}
