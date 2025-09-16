import {moduleName, ruleSettingName, ruleVersionSettingName} from "../const";
import {getSetting, getSettingRuleGroups, setSettingRuleGroups} from "../helpers";
import {RuleGroup} from "../rule";
import {GroupType} from "../rule/ruleTypes";
import {RuleGroupForm} from "./form";

class Tab {
    cssClass: string;
    group: string;
    id: string;
    icon: string;
    label: string;
    data: object;

    constructor(group: string) {
        this.cssClass = "";
        this.group = group;
        this.id = "";
        this.icon = "";
        this.label = "";
        this.data = {};
    }
}

class RuleGroupFormData {
    uuid: string = "";
    name: string = "";
    labels: string[] = [];
    isActive: boolean = false;

    constructor(r: RuleGroup) {
        this.uuid = r.uuid;
        this.name = r.name;
        this.labels = r.labels;
        this.isActive = r.isActive;
    }
}

const TAB_IDS = ['action', 'feat', 'spell', 'equipment', 'npc', 'other'] as GroupType[];

export class RuleListForm extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    byId: { [key: string]: RuleGroup };
    data: { [key: string]: RuleGroupFormData[] } = {};
    filter = {
        sort: "ASC",
        text: ""
    }

    constructor() {
        super();
        // for saving
        this.reloadSettings();
    }

    reloadSettings() {
        this.byId = getSettingRuleGroups();
        this.updateData();
    }

    updateData() {
        this.data = {};
        Object.keys(this.byId).forEach((key) => {
            const group = this.byId[key].group;
            const arr = this.data[group] || [];
            arr.push(new RuleGroupFormData(this.byId[key]));
            this.data[group] = arr;
        })
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${moduleName}-rules-form`,
        classes: [moduleName, "settings-menu"],
        window: {
            title: "Rules",
            resizable: true,
            controls: [
                {
                    icon: 'fa-solid fa-file-export',
                    label: "Export All",
                    action: "export",
                },
                {
                    icon: 'fa-solid fa-file-import',
                    label: "Import",
                    action: "import",
                },
            ]
        },
        position: {
            width: 710,
            height: 450
        },
        actions: {
            export: RuleListForm.#doExport,
            import: RuleListForm.#doImport
        },
        form: {
            handler: this.formHandler,
            closeOnSubmit: true
        },
    };

    static PARTS = {
        tabs: {
            template: 'templates/generic/tab-navigation.hbs',
        },
        filter: {
            template: `modules/${moduleName}/templates/partials/filter.hbs`,
        },
        action: {
            template: `modules/${moduleName}/templates/action.hbs`,
            scrollable: [''],
        },
        feat: {
            template: `modules/${moduleName}/templates/feat.hbs`,
            scrollable: [''],
        },
        spell: {
            template: `modules/${moduleName}/templates/spell.hbs`,
            scrollable: [''],
        },
        equipment: {
            template: `modules/${moduleName}/templates/equipment.hbs`,
            scrollable: [''],
        },
        npc: {
            template: `modules/${moduleName}/templates/npc.hbs`,
            scrollable: [''],
        },
        other: {
            template: `modules/${moduleName}/templates/other.hbs`,
            scrollable: [''],
        },
        footer: {
            template: `modules/${moduleName}/templates/partials/save.hbs`,
            scrollable: [''],
        },
    };

    static async #doExport() {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(getSetting(ruleSettingName))], {type: "text/plain"});
        a.href = URL.createObjectURL(file);
        a.download = "rules.json";
        a.click();

        ui.notifications.info(`Rules were exported`);
    }

    static async #doImport() {
        new foundry.applications.api.DialogV2({
            window: {title: "Import"},
            content: `<form class="editable" autocomplete="off" onsubmit="event.preventDefault();"><input type="file" accept="json" id="rule-file" name='data' multiple="multiple"/></form>`,
            buttons: [
                {
                    default: true,
                    action: "add",
                    icon: '<i class="fas fa-plus"></i>',
                    label: "Add rules",
                    callback: async (event, button, dialog) => {
                        const form = dialog.element.querySelector('form');
                        if (form && form.data.files[0]) {
                            let files = Array.from(form.data.files).map((file) => {
                                let reader = new FileReader();
                                return new Promise((resolve) => {
                                    reader.onload = () => resolve(JSON.parse(reader.result));
                                    reader.readAsText(file);
                                });
                            });
                            const fileRules = (await Promise.all(files)).flat();
                            const current = foundry.utils.deepClone(game.settings.get(moduleName, ruleSettingName));
                            let newOnes = fileRules.filter(r=>!current[r.uuid]).reduce((acc, g) => {
                                acc[g.uuid] = g;
                                return acc;
                            }, {});

                            let d = foundry.utils.mergeObject(current, newOnes);
                            await game.settings.set(moduleName, ruleSettingName, d);

                            this.reloadSettings()
                            this.render();

                            foundry.applications.settings.SettingsConfig.reloadConfirm({world: true});
                        }
                    },
                },
                {
                    action: "overwrite",
                    icon: '<i class="far fa-edit"></i>',
                    label: "Overwrite rules",
                    callback: async (event, button, dialog) => {
                        const form = dialog.element.querySelector('form');
                        if (form && form.data.files[0]) {
                            let files = Array.from(form.data.files).map((file) => {
                                let reader = new FileReader();
                                return new Promise((resolve) => {
                                    reader.onload = () => resolve(JSON.parse(reader.result));
                                    reader.readAsText(file);
                                });
                            });
                            const fileRules = (await Promise.all(files)).flat();
                            const current = foundry.utils.deepClone(game.settings.get(moduleName, ruleSettingName));
                            let newOnes = fileRules.reduce((acc, g) => {
                                acc[g.uuid] = g;
                                return acc;
                            }, {});

                            let d = foundry.utils.mergeObject(current, newOnes);
                            await game.settings.set(moduleName, ruleSettingName, d);

                            this.reloadSettings()
                            this.render();

                            foundry.applications.settings.SettingsConfig.reloadConfirm({world: true});
                        }
                    },
                },
                {
                    action: "rewrite",
                    icon: '<i class="far fa-edit"></i>',
                    label: "Use file as new rules",
                    callback: async (event, button, dialog) => {
                        const form = dialog.element.querySelector('form');
                        if (form && form.data.files[0]) {
                            let files = Array.from(form.data.files).map((file) => {
                                let reader = new FileReader();
                                return new Promise((resolve) => {
                                    reader.onload = () => resolve(JSON.parse(reader.result));
                                    reader.readAsText(file);
                                });
                            });
                            const fileRules = (await Promise.all(files)).flat();
                            let d = fileRules.reduce((acc, g) => {
                                acc[g.uuid] = g;
                                return acc;
                            }, {});
                            await game.settings.get(moduleName, ruleSettingName, {})
                            await game.settings.set(moduleName, ruleSettingName, d);

                            this.reloadSettings()
                            this.render();

                            foundry.applications.settings.SettingsConfig.reloadConfirm({world: true});
                        }
                    },
                }
            ],
        }).render(true);
    }

    static async formHandler(event: SubmitEvent | Event, form: HTMLFormElement, formData: FormData & { object: Record<string, unknown> }) {
        const data = formData.object as { [key: string]: boolean; };

        for (const key of Object.keys(data)) {
            if (this.byId[key]) {
                this.byId[key].isActive = data[key];
            }
        }

        await setSettingRuleGroups(this.byId)
    }

    listHtmlListener(htmlElement: HTMLElement) {
        const html = $(htmlElement);
        const form = this;

        html.on("click", ".edit-row", function (event: Event) {
            event.preventDefault();
            event.stopPropagation();
            let uuid = $(this).closest('li').data()?.uuid;
            if (!uuid) return;
            let ruleGroup = form.byId[uuid]?.clone();
            if (!ruleGroup) return;

            new RuleGroupForm(ruleGroup, form).render(true);
        });

        html.on("click", ".remove-row", async function (event: Event) {
            event.preventDefault();
            event.stopPropagation();
            let uuid = $(this).closest('li').data()?.uuid;
            if (!uuid) return;
            ui.notifications.info("Rule was deleted")
            delete form.byId[uuid];
            form.updateData()
            form.render();
        });

        html.on("click", ".export-rule", async function (event: Event) {
            event.preventDefault();
            event.stopPropagation();
            let uuid = $(this).closest('li').data()?.uuid;
            if (!uuid) return;
            let byIdElement = form.byId[uuid];
            if (!byIdElement) return;

            const a = document.createElement("a");
            const file = new Blob([JSON.stringify(byIdElement.rawValue())], {type: "text/plain"});
            a.href = URL.createObjectURL(file);
            a.download = `${byIdElement.name || 'rule'}.json`;
            a.click();

            ui.notifications.info(`Rule were exported`);
        });
    }

    filterHtmlListener(htmlElement: HTMLElement) {
        const html = $(htmlElement);
        const form = this;
        html.on("click", ".order-direction-button", function () {
            $(this).find('i').toggleClass("fa-arrow-down-a-z fa-arrow-down-z-a");
            if ($(this).find('i').hasClass("fa-arrow-down-a-z")) {
                form.filter.sort = "ASC";
            } else {
                form.filter.sort = "DESC";
            }

            form.rerenderList();
        });

        html.on("input", 'input[type="search"]', function (_e: Event) {
            const target = _e.target as HTMLInputElement;
            form.filter.text = target.value.trim();

            form.rerenderList();
        })

        html.on("click", '.clear-filters', function (_e: Event) {
            form.filter.text = "";
            form.filter.sort = "ASC";

            form.render();
        })

        html.on("click", '.activate-all-rule', function (_e: Event) {
            Object.values(form.byId).forEach(rule => {
                rule.isActive = true;
            })
            form.updateData()

            form.render();
        })

        html.on("click", '.deactivate-all-rule', function (_e: Event) {
            Object.values(form.byId).forEach(rule => {
                rule.isActive = false;
            })
            form.updateData()

            form.render();
        })

        html.on("click", '.suggestion-all-rule', async function (_e: Event) {
            const activeItems = game.actors.map(a => a.items.contents).flat().map(i => i.sourceId).filter(b => b)

            const deactivatedAfterConfirm = Object.values(form.byId)
                .filter(r => r.source.length > 0)
                .filter(rule => rule.source.every(s => !activeItems.includes(s)))
                .map(rule => rule.uuid);

            Object.values(form.byId).forEach(rule => {
                if (deactivatedAfterConfirm.includes(rule.uuid)) {
                    rule.isActive = false;
                } else {
                    rule.isActive = true;
                }
            })

            form.updateData()
            form.render();
        })

        html.on("click", '.activate-category-rule', async function (_e: Event) {
            Object.values(form.byId)
                .filter(r => r.group === form.tabGroups.primary)
                .forEach(rule => {
                    rule.isActive = true;
                })
            form.updateData()

            form.render();
        })

        html.on("click", '.deactivate-category-rule', async function (_e: Event) {
            Object.values(form.byId)
                .filter(r => r.group === form.tabGroups.primary)
                .forEach(rule => {
                    rule.isActive = false;
                })
            form.updateData()

            form.render();
        })


        html.on("click", ".add-rule", async (_e: Event) => {
            let ruleGroup = new RuleGroup();
            ruleGroup.uuid = foundry.utils.randomID()
            new RuleGroupForm(ruleGroup, form).render(true);
        });
    }

    _attachPartListeners(partId: string, htmlElement: HTMLElement, options: object) {
        if (partId === 'filter') {
            this.filterHtmlListener(htmlElement);
        } else if (['action', 'feat', 'spell', 'equipment', 'npc', 'other'].includes(partId)) {
            this.listHtmlListener(htmlElement);
        }
    }

    rerenderList() {
        const form = this;

        const list = $(form.element).find('section.active ul.list-area li')
        for (const l of list) {
            const txtValue = l.innerText;
            if (txtValue.toLowerCase().indexOf(form.filter.text?.toLowerCase()) > -1) {
                l.style.display = "";
            } else {
                l.style.display = "none";
            }
        }

        const listHtml = $(form.element).find('section.active ul.list-area li').get()
        listHtml.sort(function (a, b) {
            const A = a.innerText.toUpperCase();
            const B = b.innerText.toUpperCase();

            if (form.filter.sort === "ASC") {
                return B < A ? 1 : -1;
            } else {
                return A < B ? 1 : -1;
            }
        });
        $.each(listHtml, function (index, row) {
            $(form.element).find('section.active ul.list-area').append(row);
        });
    }

    getOtherDataList() {
        let unknown = Object.keys(this.data)
            .filter(i => !TAB_IDS.includes(i))
            .map(i => this.data[i])
            .flat();

        return [...(this.data['other'] || []), ...unknown];
    }

    getData(partId: string): RuleGroupFormData[] {
        const list = partId === 'other'
            ? this.getOtherDataList()
            : this.data[partId] || [];
        return list
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    }

    async _preparePartContext(partId: GroupType, context: { tab: object, tabs: { [key: string]: object }, data: RuleGroupFormData[] }) {
        if (TAB_IDS.includes(partId)) {
            context.tab = context.tabs[partId];
            context.data = this.getData(partId);
        }

        return context;
    }

    async _prepareContext(options: { parts: string[] }) {
        let context = await super._prepareContext(options);

        context = foundry.utils.mergeObject(context, {
            tabs: this._getTabs(options.parts),
            filter: {
                icon: this.filter.sort === "ASC" ? "fa-arrow-down-a-z" : "fa-arrow-down-z-a",
                text: this.filter.text,
            }
        });

        return context;
    }

    changeTab(tab: string, group: string, options?: object): void {
        super.changeTab(tab, group, options);
        this.rerenderList();
    };

    _getTabs(_parts: string[]) {
        const tabGroup = 'primary';

        if (!this.tabGroups[tabGroup])
            this.tabGroups[tabGroup] = 'action';

        return TAB_IDS.reduce((tabs, partId: string) => {
            const tab = new Tab(tabGroup)

            tab.id = partId;
            tab.label = partId.capitalize() + ` (${this.data[partId]?.length || 0})`;

            if (this.tabGroups[tabGroup] === tab.id)
                tab.cssClass = 'active';
            tabs[partId] = tab;

            return tabs;
        }, {} as { [key: string]: Tab; });
    }
}

export class Pf2eRuleSettings extends RuleListForm {

    constructor() {
        super();
    }

    static init() {
        game.settings.registerMenu(moduleName, "rulesSettings", {
            name: "Rule Settings",
            label: "Manage Rule Settings",
            icon: "fas fa-hand",
            type: this,
            restricted: true,
        });

        game.settings.register(moduleName, ruleSettingName, {
            name: "Rules",
            scope: "world",
            default: {},
            type: Object,
            config: false,
        });

        game.settings.register(moduleName, ruleVersionSettingName, {
            name: "Rule Version",
            scope: "world",
            config: false,
            default: 0,
            type: Number,
        });
    }
}