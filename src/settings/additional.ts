import {moduleName} from "../const";
import {HideRollSettings, IncapacitationRollSettings, RollSettings} from "./roll";
import {CombatSettings} from "./combat";
import {PlayerSettings} from "./player";

export class AdditionalSettings {

    static get settings() {
        return {
            showEffectRelationship: {
                name: `${moduleName}.SETTINGS.showEffectRelationship.name`,
                hint: `${moduleName}.SETTINGS.showEffectRelationship.hint`,
                scope: "client",
                requiresReload: true,
                type: String,
                choices: {
                    'no': game.i18n.localize(`${moduleName}.SETTINGS.showEffectRelationship.choices.no`),
                    'press': game.i18n.localize(`${moduleName}.SETTINGS.showEffectRelationship.choices.press`),
                    'always': game.i18n.localize(`${moduleName}.SETTINGS.showEffectRelationship.choices.always`),
                },
                default: "no",
            },
        };
    }

    static init() {
        game.settings.registerMenu(moduleName, "rollSettingsMenu", {
            name: game.i18n.localize(`${moduleName}.SETTINGS.Menu.rollSettingsMenu.Name`),
            label: game.i18n.localize(`${moduleName}.SETTINGS.Menu.rollSettingsMenu.Name`),
            hint: "",
            icon: "fa-solid fa-dice",
            type: RollSettings,
            restricted: true
        });
        RollSettings.init();

        game.settings.registerMenu(moduleName, "hideRollMenu", {
            name: game.i18n.localize(`${moduleName}.SETTINGS.Menu.hideRollMenu.Name`),
            label: game.i18n.localize(`${moduleName}.SETTINGS.Menu.hideRollMenu.Name`),
            hint: "",
            icon: "fa-solid fa-dice",
            type: HideRollSettings,
            restricted: true
        });
        HideRollSettings.init();

        game.settings.registerMenu(moduleName, "incapacitationRollMenu", {
            name: game.i18n.localize(`${moduleName}.SETTINGS.Menu.incapacitationRollMenu.Name`),
            label: game.i18n.localize(`${moduleName}.SETTINGS.Menu.incapacitationRollMenu.Name`),
            hint: "",
            icon: "fa-solid fa-dice",
            type: IncapacitationRollSettings,
            restricted: true
        });
        IncapacitationRollSettings.init();

        game.settings.registerMenu(moduleName, "combatSettingsMenu", {
            name: game.i18n.localize(`${moduleName}.SETTINGS.Menu.combatSettingsMenu.Name`),
            label: game.i18n.localize(`${moduleName}.SETTINGS.Menu.combatSettingsMenu.Name`),
            hint: "",
            icon: "fa-solid fa-sword",
            type: CombatSettings,
            restricted: true
        });
        CombatSettings.init();

        game.settings.registerMenu(moduleName, "playerSettingsMenu", {
            name: game.i18n.localize(`${moduleName}.SETTINGS.Menu.playerSettingsMenu.Name`),
            label: game.i18n.localize(`${moduleName}.SETTINGS.Menu.playerSettingsMenu.Name`),
            hint: "",
            icon: "fa-solid fa-user",
            type: PlayerSettings,
            restricted: true
        });
        PlayerSettings.init();

        const settings = this.settings as { [key: string]: any };
        for (const setting of Object.keys(settings)) {
            game.settings.register(moduleName, setting, {
                scope: "world",
                config: true,
                ...settings[setting],
            });
        }
    }
}
