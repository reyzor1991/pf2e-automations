import {BaseRule, ComplexRule, RuleGenerator, RuleGroup} from "../rule";
import {RuleListForm} from "./index";
import {GlobalNamespace, moduleName, ruleSettingName} from "../const";
import {TargetType} from "../rule/ruleTypes";

export class BaseRuleForm extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(rules: BaseRule[], parentForm: RuleGroupForm) {
        super();
        this.rules = rules
        this.parentForm = parentForm
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${moduleName}-baseRule-form`,
        classes: [moduleName, "settings-menu"],
        window: {title: "Base Rule Form", resizable: true},
        position: {width: 500, height: 400},
        actions: {},
        form: {
            handler: this.formHandler,
            closeOnSubmit: true
        },
    };

    static PARTS = {
        hbs: {
            template: `modules/${moduleName}/templates/baseRules.hbs`
        },
        footer: {
            template: `modules/${moduleName}/templates/partials/save.hbs`,
            scrollable: [''],
        },
    };

    static async formHandler(event: SubmitEvent | Event, form: HTMLFormElement, formData: FormData & { object: Record<string, unknown> }) {
        const data = formData.object as { [key: string]: boolean; };

        for (const key in data) {
            this.updateValue(key, data[key]);
        }
        this?.parentForm.render(true)
        ui.notifications.info("Base rules were updated")
    }

    updateValue(key: string, value: any) {
        const qq = key.split(".");
        let index = Number(qq[0])
        let path = qq[1]

        if (path === "predicate") {
            let parsedValue = this.parseJson(value)
            if (parsedValue) {
                this.rules[index].predicate = parsedValue;
            } else {
                ui.notifications.warn(`Predicate is not valid json`)
            }
            return
        }

        this.rules[index][path] = value;
    }

    async _prepareContext(options: { parts: string[] }) {
        let context = await super._prepareContext(options);
        context.rules = this.rules.map((r: BaseRule) => r.rawValue());
        context.targets = Object.entries(TargetType).map(a => {
            return {
                value: a[0],
                label: game.i18n.localize(`${moduleName}.targetType.${a[0]}`)
            }
        })

        return {
            ...context
        };
    }

    parseJson(value: string) {
        try {
            let parsed = JSON.parse(value);
            if (parsed instanceof Array) {
                return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    _attachPartListeners(partId: string, htmlElement: HTMLElement, options: object) {
        const html = $(htmlElement);

        html.find(".remove-base-rule").click(async (event) => {
            const key = $(event.currentTarget).data().idx;

            this.rules.splice(key, 1);

            this.render()
        });
    }
}

export class ComplexRuleForm extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(rules: ComplexRule[], parentForm: RuleGroupForm) {
        super();
        this.rules = rules
        this.parentForm = parentForm
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${moduleName}-baseRule-form`,
        classes: [moduleName, "settings-menu"],
        window: {title: "Complex Rule Form", resizable: true},
        position: {width: 500, height: 400},
        actions: {},
        form: {
            handler: this.formHandler,
            closeOnSubmit: true
        },
    };

    static PARTS = {
        hbs: {
            template: `modules/${moduleName}/templates/complexRules.hbs`
        },
        footer: {
            template: `modules/${moduleName}/templates/partials/save.hbs`,
            scrollable: [''],
        },
    };

    static async formHandler(event: SubmitEvent | Event, form: HTMLFormElement, formData: FormData & { object: Record<string, unknown> }) {
        const data = formData.object as { [key: string]: boolean; };

        for (const key in data) {
            this.updateValue(key, data[key]);
        }
        this?.parentForm.render(true)
        ui.notifications.info("Complex rules were updated")
    }

    updateValue(key: string, value: any) {
        const qq = key.split(".");
        let index = Number(qq[0])
        let path = qq[1]

        if (path === "predicate") {
            let parsedValue = this.parseJson(value)
            if (parsedValue) {
                this.rules[index].predicate = parsedValue;
            } else {
                ui.notifications.warn(`Predicate is not valid json`)
            }
            return
        } else if (path === "values") {
            let parsedValue = this.parseJsonValues(value)
            if (parsedValue) {
                this.rules[index].values = parsedValue;
            } else {
                ui.notifications.warn(`Predicate is not valid json`)
            }
            return
        }

        this.rules[index][path] = value;
    }

    async _prepareContext(options: { parts: string[] }) {
        let context = await super._prepareContext(options);
        context.rules = this.rules.map((r: BaseRule) => r.rawValue());
        context.targets = Object.entries(TargetType).map(a => {
            return {
                value: a[0],
                label: game.i18n.localize(`${moduleName}.targetType.${a[0]}`)
            }
        })

        return {
            ...context
        };
    }

    parseJson(value: string) {
        try {
            let parsed = JSON.parse(value);
            if (parsed instanceof Array) {
                return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    parseJsonValues(value: string) {
        try {
            let parsed = JSON.parse(value);
            if (parsed instanceof Array) {
                return parsed.map(r => RuleGenerator.fromObj(r));
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    _attachPartListeners(partId: string, htmlElement: HTMLElement, options: object) {
        const html = $(htmlElement);

        html.find(".remove-complex-rule").click(async (event) => {
            const key = $(event.currentTarget).data().idx;

            this.rules.splice(key, 1);

            this.render()
        });
    }
}

export class RuleGroupForm extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(ruleGroup: RuleGroup, parentForm: RuleListForm) {
        super();
        this.ruleGroup = ruleGroup
        this.parentForm = parentForm
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${moduleName}-ruleGroup-form`,
        classes: [moduleName, "settings-menu"],
        window: {title: "Rule Group Form", resizable: true},
        position: {width: 500, height: 400},
        actions: {},
        form: {
            handler: this.formHandler,
            closeOnSubmit: false
        },
    };

    static PARTS = {
        hbs: {
            template: `modules/${moduleName}/templates/rules.hbs`
        },
        footer: {
            template: `modules/${moduleName}/templates/partials/save.hbs`,
            scrollable: [''],
        },
    };

    updateRule(formData: FormData & { object: Record<string, unknown> }) {
        const data = formData.object as { [key: string]: boolean; };

        for (const key of Object.keys(data)) {
            this.ruleGroup[key] = data[key];
        }
    }

    static async formHandler(event: SubmitEvent | Event, form: HTMLFormElement, formData: FormData & { object: Record<string, unknown> }) {
        this.updateRule(formData);

        let rawValue = this.ruleGroup.rawValue();

        let dataForSave = game.settings.get(moduleName, ruleSettingName);
        dataForSave[rawValue.uuid] = rawValue;
        await game.settings.set(moduleName, `${ruleSettingName}`, dataForSave);
        ui.notifications.info("Rule was saved")

        this.parentForm?.reloadSettings()
        this.parentForm?.render()
    }

    _attachPartListeners(partId: string, htmlElement: HTMLElement, options: object) {
        const html = $(htmlElement);
        const form = this;

        if (partId === "hbs") {
            html.find(".remove-source").click(async (event) => {
                const key = $(event.currentTarget).data().key;
                this.ruleGroup.source.splice(key, 1);
                this.render()
            });


            html.find(".rule-source-ip").keyup(async (event) => {
                let code = event.keyCode ? event.keyCode : event.which;
                if (code !== 13) {
                    return
                }
                let val = $(event.target).val()?.trim();

                let cond = fromUuidSync(val);
                if (!cond) {
                    ui.notifications.warn(`Source not exists`);
                    return;
                }
                this.ruleGroup.source.push(val);

                this.render()
            });

            html.find(".edit-base-rules").click(async (event) => {
                let data = new FormDataExtended(form.element);
                form.updateRule(data)
                new BaseRuleForm(this.ruleGroup.baseRules, this).render(true)
            })

            html.find(".add-base-rules").click(async (event) => {
                let data = new FormDataExtended(form.element);
                form.updateRule(data)
                this.ruleGroup.baseRules.push(new BaseRule());
                new BaseRuleForm(this.ruleGroup.baseRules, this).render(true)
            })

            html.find(".edit-complex-rules").click(async (event) => {
                let data = new FormDataExtended(form.element);
                form.updateRule(data)
                new ComplexRuleForm(this.ruleGroup.complexRules, this).render(true)
            })

            html.find(".add-complex-rules").click(async (event) => {
                let data = new FormDataExtended(form.element);
                form.updateRule(data)
                this.ruleGroup.complexRules.push(new ComplexRule());
                new ComplexRuleForm(this.ruleGroup.complexRules, this).render(true)
            })
        }
    }

    async _prepareContext(options: { parts: string[] }) {
        let context = await super._prepareContext(options);

        context.group = this.ruleGroup.group;
        context.name = this.ruleGroup.name;
        context.allLabels = GlobalNamespace.FORM_LABELS;
        context.labels = this.ruleGroup.labels;
        context.source = this.ruleGroup.source.map(s => fromUuidSync(s)?.name || s);
        context.baseRuleCount = this.ruleGroup.baseRules?.length || 0;
        context.complexRuleCount = this.ruleGroup.complexRules?.length || 0;
        context.handlerRuleCount = this.ruleGroup.handlerRules?.length || 0;

        return {
            ...context,
        };
    }
}