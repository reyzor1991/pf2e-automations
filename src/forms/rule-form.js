class RuleForm extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(settingName, rule, parent) {
        super();
        this.settingName = settingName;
        this.rule = rule
        this.parent = parent

        this.editRequirement = false;
        this.editTrigger = false;
        this.editComplex = false;
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${moduleName}-rule-form`,
        classes: [moduleName, "settings-menu"],
        window: {title: "Rule", resizable: true},
        position: {width: 1000, height: 450},
        actions: {},
        form: {
            closeOnSubmit: false
        },
    };

    static PARTS = {
        hbs: {
            template: `modules/${moduleName}/templates/rules.hbs`
        }
    };

    _attachPartListeners(partId, htmlElement, options) {
        super._attachPartListeners(partId, htmlElement, options);

        let html = $(htmlElement)

        html.find(".add-rule-trigger-sub").click(async (event) => {
            this.updateForm(event);

            const key = $(event.currentTarget).data().key;
            const qq = key.split(".");

            if (qq.length === 4) {
                this.rule[qq[1]][qq[2]][qq[3]].push(new RuleTrigger());
            } else if (qq.length > 4) {
                let _temp = this.rule;
                qq.slice(1).forEach((i) => {
                    _temp = _temp[i];
                });
                _temp.push(new RuleTrigger());
            }

            this.render();
        });

        html.find(".add-rule-trigger-sub-group").click(async (event) => {
            this.updateForm(event);

            const key = $(event.currentTarget).data().key;
            const qq = key.split(".");

            if (qq.length === 4) {
                this.rule[qq[1]][qq[2]][qq[3]].push(new RuleTriggerGroup());
            } else if (qq.length > 4) {
                let _temp = this.rule;
                qq.slice(1).forEach((i) => {
                    _temp = _temp[i];
                });
                _temp.push(new RuleTriggerGroup());
            }

            this.render();
        });

        html.find(".remove-rule-trigger-sub").click(async (event) => {
            this.updateForm(event);

            const key = $(event.currentTarget).data().key;
            const qq = key.split(".");

            let _temp = this.rule;
            qq.slice(1, -1).forEach((i) => {
                _temp = _temp[i];
            });
            _temp.splice(qq.slice(-1)[0], 1);

            this.render();
        });

        html.find(".add-rule-requirement-sub").click(async (event) => {
            this.updateForm(event);
            this.rule.requirements[$(event.currentTarget).data().idx].values.push(new RuleRequirement());
            this.render();
        });

        html.find(".remove-rule-requirement-sub").click(async (event) => {
            this.updateForm(event);
            this.rule.requirements[$(event.currentTarget).data().tidx].values.splice($(event.currentTarget).data().vidx, 1);
            this.render();
        });

        html.find(".add-rule-trigger").click(async (event) => {
            this.updateForm(event);
            this.rule.triggers.push(new RuleTriggerGroup());
            this.render();
        });

        html.find(".edit-rule-trigger").click(async (event) => {
            this.updateForm(event);
            this.editTrigger = true;
            this.render();
        });

        html.find(".remove-rule-trigger").click(async (event) => {
            this.updateForm(event);

            const key = $(event.currentTarget).data().key;
            const qq = key.split(".");

            if (this.rule && qq.length === 3) {
                this.rule[qq[1]].splice(qq[2], 1);
            }
            if (this.rule && qq.length > 3) {
                let _temp = this.rule;
                qq.slice(1, -1).forEach((i) => {
                    _temp = _temp[i];
                });
                _temp.splice(qq.slice(-1)[0], 1);
            }
            this.render();
        });

        html.find(".add-rule-requirement").click(async (event) => {
            this.updateForm(event);
            this.rule.requirements.push(new RuleRequirementGroup());
            this.render();
        });

        html.find(".edit-rule-requirement").click(async (event) => {
            this.updateForm(event);
            this.editRequirement = true;
            this.render();
        });

        html.find(".remove-rule-requirement").click(async (event) => {
            this.updateForm(event);
            this.rule.requirements.splice($(event.currentTarget).data().idx, 1);
            this.render();
        });

        html.find(".add-generated-rule").click(async (event) => {
            this.updateForm(event);
            this.rule.values.push(new RuleGenerator());
            this.render();
        });

        html.find(".edit-generated-rule").click(async (event) => {
            this.updateForm(event);
            this.editComplex = true;
            this.render();
        });

        html.find(".remove-generated-rule").click(async (event) => {
            this.updateForm(event);
            this.rule.values.splice($(event.currentTarget).data().idx, 1);
            this.render();
        });

        html.find("button[data-action=close]")?.click(async () => {
            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;
            this.render();
        });

        html.find("button[data-action=apply]")?.click(async (event) => {
            this.updateForm(event);

            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;

            if (!this.rule.uuid) {
                this.rule.uuid = foundry.utils.randomID();
                const rules = getSetting(this.settingName) ?? [];
                rules.push(this.rule.rawValue())
                await setSetting(this.settingName, rules);
            } else {
                const rules = getSetting(this.settingName) ?? [];
                let idx = rules.findIndex((a) => a.uuid === this.rule.uuid)
                rules[idx] = this.rule.rawValue();
                await setSetting(this.settingName, rules);
            }

            updateActiveRulesForAll()

            this.render();
        });

        html.find("button[data-action=close-sub]")?.click(async () => {
            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;
            this.render();
        });

        html.find("button[data-action=apply-sub]")?.click(async (event) => {
            await this.updateForm(event);

            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;

            this.render();
        });

        html.find(".remove-condition,.remove-effect").click(async (event) => {
            const qq = $(event.currentTarget).data().key.split(".");
            let _temp = this.rule;
            qq.slice(1, -1).forEach((i) => {
                _temp = _temp[i];
            });

            _temp.splice(qq[4], 1);

            this.render()
        });

        html.find(".rule-condition-ip").keyup(async (event) => {
            let code = event.keyCode ? event.keyCode : event.which;
            if (code !== 13) {
                return
            }
            let val = $(event.target).val().trim();
            let cond = createCondition(val);
            if (!cond) {
                return
            }

            const qq = $(event.target).data().key.split(".");
            let _temp = this.rule;
            qq.slice(1).forEach((i) => {
                _temp = _temp[i];
            });

            if (!_temp.includes(val)) {
                _temp.push(val)
            }

            this.render()
        });

        html.find(".rule-effect-ip").keyup(async (event) => {
            let code = event.keyCode ? event.keyCode : event.which;
            if (code !== 13) {
                return
            }
            let val = $(event.target).val().trim();

            let cond = fromUuidSync(val);
            if (!cond) {
                ui.notifications.warn(`Effect not exists`);
                return;
            }

            const qq = $(event.target).data().key.split(".");
            let _temp = this.rule;
            qq.slice(1).forEach((i) => {
                _temp = _temp[i];
            });

            if (!_temp.includes(val)) {
                _temp.push(val)
            }

            this.render()
        });
    }

    async _prepareContext(_options) {
        let context = await super._prepareContext(_options);

        let effObj = undefined;

        let editTemplate = "<p>FAIL TEMPLATE</p>";
        if (this.editTrigger) {
            const form = new TriggerForm(this.editIndex, this.rule.name, this.rule.triggers);
            editTemplate = await form.render();
        } else if (this.editRequirement) {
            const form = new RequirementForm(this.editIndex, this.rule.name, this.rule.requirements);
            editTemplate = await form.render();
        } else if (this.editComplex) {
            const form = new ComplexForm(this.editIndex, this.rule.name, this.rule.values);
            editTemplate = await form.render();
        } else if (!this.rule.type) {
            effObj = await parseEffect(this.rule.value);
        }

        return {
            ...context,

            subEdit: this.editTrigger || this.editRequirement || this.editComplex,
            editTemplate,
            rule: {
                ...this.rule,

                triggerCount: this.rule.triggers.map((a) => a.values).flat().length,
                requirementCount: this.rule.requirements.map((a) => a.values).flat().length,
                generatedRuleCount: this.rule.values?.map((a) => a.values)?.flat()?.length,

                effObj,
            },
            targetChoices: TargetType,
            complexTargetChoices: ComplexTargetType,
            labels: FORM_LABELS,
            selectedLabels: this.rule.labels
        };
    }

    updateValue(key, value) {
        if (value === "null") {
            value = null
        }
        if (value === "false") {
            value = false
        }
        if (value === "true") {
            value = true
        }
        const qq = key.split(".");
        if (qq[1] === "predicate") {
            let parsedValue = this.parseJson(value)
            if (parsedValue) {
                this.rule.predicate = parsedValue;
            } else {
                ui.notifications.warn(`Predicate is not valid json, field is not updated for ${this.rule.name}`)
                if (!this.rule.predicate) {
                    this.rule.predicate = []
                }
            }
            return
        }

        if (this.rule && qq.length === 2) {
            this.rule[qq[1]] = value;
        } else if (this.rule && qq.length > 2) {
            let _temp = this.rule;
            qq.slice(1, -1).forEach((i) => {
                _temp = _temp[i];
            });
            _temp[qq.slice(-1)[0]] = value;
        }
    }

    parseJson(value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return null;
        }
    }

    updateForm(event) {
        const f = new FormDataExtended($(event.currentTarget).closest("form")[0], {editors: {}}).object;
        for (const key in f) {
            this.updateValue(key, f[key]);
        }
    }

    async close(options) {
        this.parent.refreshRules();
        this.parent.render();
        return super.close(options);
    }
}