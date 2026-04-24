import {moduleName} from "../const";

type SettingsDefinition = Record<string, {
    choices?: Record<string, string>;
    type?: BooleanConstructor | NumberConstructor | StringConstructor;
    [key: string]: unknown;
}>;

export abstract class SubSettings extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    static _namespace: string;

    static get namespace() {
        return this._namespace;
    }

    static get settings(): SettingsDefinition {
        return {};
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

    static DEFAULT_OPTIONS = {
        tag: "form",
        window: {
            resizable: true,
        },
        classes: ["settings-menu", "sheet", "pf2e-automations-settings-menu"],
        position: {
            width: 550,
            height: "auto",
        },
        form: {
            handler: this.formHandler,
            closeOnSubmit: true,
            submitOnChange: false,
        },
    };

    static PARTS = {
        settings: {
            template: `modules/${moduleName}/templates/settings.hbs`,
        },
        footer: {
            template: `modules/${moduleName}/templates/partials/save.hbs`,
            scrollable: [''],
        },
    };

    static async formHandler(
        _event: SubmitEvent | Event,
        _form: HTMLFormElement,
        formData: FormData & { object: Record<string, unknown> },
    ) {
        for (const [key, value] of Object.entries(formData.object)) {
            await game.settings.set(moduleName, key, value);
        }
    }

    _initializeApplicationOptions(options: object) {
        const applicationOptions = super._initializeApplicationOptions(options);
        const cls = this.constructor as typeof SubSettings;

        applicationOptions.id = `${moduleName}-${cls.namespace}-settings`;
        applicationOptions.window = foundry.utils.mergeObject(applicationOptions.window ?? {}, {
            title: `${moduleName}.SETTINGS.Menu.${cls.namespace}.Name`,
        });

        return applicationOptions;
    }

    async _prepareContext(_options: { parts: string[] }) {
        const settings = (this.constructor as typeof SubSettings).settings;
        const data = Object.entries(settings).reduce((obj, [key, setting]) => {
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
        }, {} as Record<string, unknown>);

        return {
            settings: data,
        };
    }
}
