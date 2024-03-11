class AbstractHandlers extends FormApplication {
    static settingName;

    items = [];

    constructor() {
        super();
        this.items = getSetting(this.settingName) ?? [];
    }

    get settingName() {
        return this.constructor.settingName;
    }

    async _updateObject(_event, data) {
        if (!data) {
            return;
        }
        if (typeof data.isActive === "boolean") {
            this.items[0].isActive = data.isActive;
        } else if (typeof data.isActive === "object") {
            for (let i = 0; i < data.isActive.length; i++) {
                this.items[i].isActive = data.isActive[i];
            }
        }

        await game.settings.set(moduleName, this.settingName, this.items);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: `${moduleName}.SETTINGS.${this.settingName}.name`,
            id: `${moduleName}-${this.settingName}`,
            classes: ["settings-menu"],
            width: 350,
            template: `modules/${moduleName}/templates/handlers.hbs`,
            height: "auto",
            closeOnSubmit: true,
            resizable: true,
        });
    }

    static get settings() {
        return {};
    }

    static registerSettings() {
        const settings = this.settings;
        for (const setting of Object.keys(settings)) {
            game.settings.register(moduleName, setting, {
                ...settings[setting],
                config: false,
                scope: "world",
            });
        }
    }

    static init(icon, restricted = true) {
        game.settings.registerMenu(moduleName, `${this.settingName}-menu`, {
            name: `${moduleName}.SETTINGS.${this.settingName}.name`,
            label: `${moduleName}.SETTINGS.${this.settingName}.label`,
            hint: `${moduleName}.SETTINGS.${this.settingName}.hint`,
            icon: icon,
            type: this,
            restricted: restricted,
        });
        this.registerSettings();
    }

    async getData() {
        return mergeObject(super.getData(), {
            handlers: this.items,
        });
    }

    activateListeners(html) {
        html.find(".remove-handler").click(async (event) => {
            this.items.splice($(event.currentTarget).data().idx, 1);
            this.render();
        });
    }
};

class MessageHandlers extends AbstractHandlers {
    static settingName = "messageCreateHandlers";

    static get settings() {
        return {
            messageCreateHandlers: {
                name: `${moduleName}.SETTINGS.messageCreateHandlers.name`,
                default: [],
                type: Array,
            }
        }
    }
};

class UpdateActorHandlers extends AbstractHandlers {
    static settingName = "updateActorHandlers";

    static get settings() {
        return {
            updateActorHandlers: {
                name: `${moduleName}.SETTINGS.updateActorHandlers.name`,
                default: [],
                type: Array,
            }
        }
    }
};

class DeleteItemHandlers extends AbstractHandlers {
    static settingName = "deleteItemHandlers";

    static get settings() {
        return {
            deleteItemHandlers: {
                name: `${moduleName}.SETTINGS.deleteItemHandlers.name`,
                default: [],
                type: Array,
            }
        }
    }
};

class CreateItemHandlers extends AbstractHandlers {
    static settingName = "createItemHandlers";

    static get settings() {
        return {
            createItemHandlers: {
                name: `${moduleName}.SETTINGS.createItemHandlers.name`,
                default: [],
                type: Array,
            }
        }
    }
};

class UpdateItemHandlers extends AbstractHandlers {
    static settingName = "updateItemHandlers";

    static get settings() {
        return {
            updateItemHandlers: {
                name: `${moduleName}.SETTINGS.updateItemHandlers.name`,
                default: [],
                type: Array,
            }
        }
    }
};