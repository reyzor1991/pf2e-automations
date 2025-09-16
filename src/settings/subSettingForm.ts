import {moduleName} from "../const";

export abstract class SubSettings extends FormApplication {

    static _namespace;

    static get namespace() {
        return this.constructor._namespace
    };

    static get settings() {
        return {}
    }

    static init() {
        const settings = this.settings;
        for (const setting of Object.keys(settings)) {
            game.settings.register(moduleName, setting, {
                scope: "world",
                config: false,
                ...settings[setting],
            });
        }
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes.push("settings-menu", "sheet");

        return {
            ...options,
            title: `${moduleName}.SETTINGS.Menu.${this._namespace}.Name`,
            id: `${this.namespace}-settings`,
            template: `modules/${moduleName}/templates/settings.hbs`,
            width: 550,
            height: "auto",
            tabs: [{navSelector: ".sheet-tabs", contentSelector: "form"}],
            closeOnSubmit: true,
            submitOnChange: false,
        };
    }

    async getData() {
        const data = Object.entries(this.constructor.settings).reduce(function (obj, [key, setting]) {
            obj[key] = {
                ...setting,
                key,
                value: game.settings.get(moduleName, key),
                isSelect: !!setting.choices,
                isNumber: setting.type === Number,
                isString: setting.type === String,
                isCheckbox: setting.type === Boolean,
            };
            return obj;
        }, {});

        return {
            settings: data,
        };
    }

    async _updateObject(event, formData) {
        for (const k in formData) {
            await game.settings.set(moduleName, k, formData[k]);
        }

    }
}