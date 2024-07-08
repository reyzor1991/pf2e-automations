async function parseEffect(effect) {
    let effObj = (await fromUuid(effect)) ?? null;
    if (!effObj) {
        const ob = parseCondition(effect);
        if (ob) {
            effObj = game.pf2e.ConditionManager.getCondition(ob.name);
        }
    }
    return effObj;
};

function parseCondition(effect) {
    if (!effect) { return undefined; }
    let result = [...effect.matchAll(/([a-z-]{1,})( [0-9]{1,})?/g)];
    if (result?.length > 0) {
        return { name: result[0][1], value: Number(result[0][2]?.trim()) || 1 };
    }
    return undefined;
};

class RuleSettings extends FormApplication {
    rules = [];

    editRequirement = false;
    editTrigger = false;
    editComplex = false;
    editIndex = null;

    constructor() {
        super();
        this.refreshRules();
    }

    refreshRules() {
        const _e = foundry.utils.deepClone(getSetting("rules"));
        if (_e) {
            this.rules = _e.map((a) => a?.type === 'complex' ? ComplexRule.fromObj(a) : Rule.fromObj(a));
        }
    }

    findByUUID(uuid) {
        return this.rules.find((a) => a.uuid === uuid);
    }

    async updateValue(key, value) {
        if (value === "null") {value = null}
        if (value === "false") {value = false}
        if (value === "true") {value = true}
        const qq = key.split(".");

        const r = this.findByUUID(qq[0]);
        if (r && qq.length === 2) {
            r[qq[1]] = value;
        } else if (r && qq.length > 2) {
            let _temp = r;
            qq.slice(1, -1).forEach((i) => {
            _temp = _temp[i];
            });
            _temp[qq.slice(-1)[0]] = value;
        }
    }

    async _updateObject(_event, data) {
        for (const key of Object.keys(data)) {
            this.updateValue(key, data[key]);
        }

        await game.settings.set(moduleName, "rules", this.rawValue());
        Hooks.callAll("automations.updateRules");

        this.close()
    }

    updateForm(event) {
        const f = new FormDataExtended($(event.currentTarget).closest("form")[0], { editors: {} }).object;
        for (const key in f) {
            this.updateValue(key, f[key]);
        }
    }

    rawValue() {
        const res = [];
        for (let i = 0; i < this.rules.length; i++) {
            res.push(this.rules[i].rawValue());
        }
        return res;
    }

    activateListeners(html) {
        super.activateListeners(html);
        const parentForm = this;

        const header = html.parent().parent().find(".window-header");
        if (header.length > 0 && header.find(`.${moduleName}-btn-download`).length === 0) {
            let btn = document.createElement("a");
            btn.classList.add("control", `${moduleName}-btn-download`);
            btn.innerHTML = `<i class="fas fa-file-export"></i>Export`;
            btn.onclick = function () {
                const a = document.createElement("a");
                const file = new Blob([JSON.stringify(getSetting("rules"))], { type: "text/plain" });
                a.href = URL.createObjectURL(file);
                a.download = "rules.json";
                a.click();

                ui.notifications.info(`Rules were exported`);
            };

            let importBtn = document.createElement("a");
            importBtn.classList.add("control", `${moduleName}-btn-import`);
            importBtn.innerHTML = `<i class="fas fa-file-import"></i>Import`;
            importBtn.onclick = function () {
                renderImportForm(() => {
                    parentForm.refreshRules();
                    parentForm.render();
                });
            };

            header.find(".close").before(importBtn);
            header.find(".close").before(btn);
        }

        html.find(".add-rule").click(async (event) => {
            this.updateForm(event);

            const newRule = new Rule();
            this.rules.push(newRule);

            this.editIndex = newRule.uuid;

            this.render();
        });
        html.find(".edit-rule").click(async (event) => {
            this.updateForm(event);
            this.editIndex = $(event.currentTarget).data().idx;
            this.render();
        });
        html.find(".remove-rule").click(async (event) => {
            this.updateForm(event);

            this.rules.splice(
                this.rules.findIndex((item) => item.uuid === $(event.currentTarget).data().idx),
                1
            );
            this.render();
        });

        html.find(".add-rule-trigger-sub").click(async (event) => {
            this.updateForm(event);

            const key = $(event.currentTarget).data().key;
            const qq = key.split(".");
            const r = this.findByUUID(qq[0]);

            if (r && qq.length === 4) {
                r[qq[1]][qq[2]][qq[3]].push(new RuleTrigger());
            } else if (r && qq.length > 4) {
                let _temp = r;
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
            const r = this.findByUUID(qq[0]);

            if (r && qq.length === 4) {
                r[qq[1]][qq[2]][qq[3]].push(new RuleTriggerGroup());
            } else if (r && qq.length > 4) {
                let _temp = r;
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
            const r = this.findByUUID(qq[0]);

            if (r) {
                let _temp = r;
                qq.slice(1, -1).forEach((i) => {
                    _temp = _temp[i];
                });
                _temp.splice(qq.slice(-1)[0], 1);
            }
            this.render();
        });

        html.find(".add-rule-requirement-sub").click(async (event) => {
            this.updateForm(event);

            const r = this.findByUUID($(event.currentTarget).data().parent);
            if (r) {
                r.requirements[$(event.currentTarget).data().idx].values.push(new RuleRequirement());
            }
            this.render();
        });

        html.find(".remove-rule-requirement-sub").click(async (event) => {
            this.updateForm(event);

            const r = this.findByUUID($(event.currentTarget).data().parent);
            if (r) {
                r.requirements[$(event.currentTarget).data().tidx].values.splice($(event.currentTarget).data().vidx, 1);
            }
            this.render();
        });

        html.find(".add-rule-trigger").click(async (event) => {
            this.updateForm(event);

            const r = this.findByUUID($(event.currentTarget).data().idx);
            if (r) {
                r.triggers.push(new RuleTriggerGroup());
            }

            this.render();
        });

        html.find(".edit-rule-trigger").click(async (event) => {
            this.updateForm(event);
            this.editIndex = $(event.currentTarget).data().idx;
            this.editTrigger = true;
            this.render();
        });

        html.find(".remove-rule-trigger").click(async (event) => {
            this.updateForm(event);

            const key = $(event.currentTarget).data().key;
            const qq = key.split(".");
            const r = this.findByUUID(qq[0]);

            if (r && qq.length === 3) {
                r[qq[1]].splice(qq[2], 1);
            }
            if (r && qq.length > 3) {
                let _temp = r;
                qq.slice(1, -1).forEach((i) => {
                    _temp = _temp[i];
                });
                _temp.splice(qq.slice(-1)[0], 1);
            }
            this.render();
        });

        html.find(".add-rule-requirement").click(async (event) => {
            this.updateForm(event);

            const r = this.findByUUID($(event.currentTarget).data().idx);
            if (r) {
                r.requirements.push(new RuleRequirementGroup());
            }
            this.render();
        });

        html.find(".edit-rule-requirement").click(async (event) => {
            this.updateForm(event);
            this.editIndex = $(event.currentTarget).data().idx;
            this.editRequirement = true;
            this.render();
        });

        html.find(".remove-rule-requirement").click(async (event) => {
            this.updateForm(event);

            const r = this.findByUUID($(event.currentTarget).data().parent);
            if (r) {
                r.requirements.splice($(event.currentTarget).data().idx, 1);
            }

            this.render();
        });

        html.find(".add-generated-rule").click(async (event) => {
            this.updateForm(event);

            const r = this.findByUUID($(event.currentTarget).data().idx);
            if (r) {
                r.values.push(new RuleGenerator());
            }
            this.render();
        });

        html.find(".edit-generated-rule").click(async (event) => {
            this.updateForm(event);
            this.editIndex = $(event.currentTarget).data().idx;
            this.editComplex = true;
            this.render();
        });

        html.find(".remove-generated-rule").click(async (event) => {
            this.updateForm(event);

            const r = this.findByUUID($(event.currentTarget).data().parent);
            if (r) {
                r.values.splice($(event.currentTarget).data().idx, 1);
            }

            this.render();
        });

        html.find("button[data-action=close]")?.click(async (event) => {
            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;
            this.editIndex = null;
            this.render();
        });

        html.find("button[data-action=apply]")?.click(async (event) => {
            this.updateForm(event);
            await game.settings.set(moduleName, "rules", this.rawValue());
            Hooks.callAll("automations.updateRules");

            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;
            this.editIndex = null;
            this.render();
        });

        html.find("button[data-action=close-sub]")?.click(async (event) => {
            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;
            this.render();
        });

        html.find("button[data-action=apply-sub]")?.click(async (event) => {
            this.updateForm(event);
            await game.settings.set(moduleName, "rules", this.rawValue());
            Hooks.callAll("automations.updateRules");

            this.editRequirement = false;
            this.editTrigger = false;
            this.editComplex = false;
            this.render();
        });

        $(html).on("input propertychange paste change", ".FilterSearch", function (e) {
            const value = $(this).val().toLowerCase();
            const $ul = $(html).find("#rule-list");
            const $li = $ul.find("li");
            $li.hide();

            $li
            .filter(function () {
                const text = $(this).text().toLowerCase();
                return text.indexOf(value) >= 0;
            })
            .show();
        });

        html.find(".remove-condition").click(async (event) => {
            const qq = $(event.currentTarget).data().key.split(".");
            const r = this.findByUUID(qq[0]);

            let _temp = r;
            qq.slice(1, -1).forEach((i) => {
                _temp = _temp[i];
            });

            _temp.splice(qq[4], 1);

            this.render()
        });

        html.find(".remove-effect").click(async (event) => {
            const qq = $(event.currentTarget).data().key.split(".");
            const r = this.findByUUID(qq[0]);

            let _temp = r;
            qq.slice(1, -1).forEach((i) => {
                _temp = _temp[i];
            });

            _temp.splice(qq[4], 1);

            this.render()
        });

        html.find(".rule-condition-ip").keyup(async (event) => {
            let code = event.keyCode ? event.keyCode : event.which;
            if (code != 13) {return}
            let val = $(event.target).val().trim();
            let cond = parseCondition(val);
            if (!cond) {return}

            if (!CONFIG.PF2E.conditionTypes[cond.name]) {
                ui.notifications.warn(`Try to add not exists condition`);
                return
            }

            const qq = $(event.target).data().key.split(".");
            const r = this.findByUUID(qq[0]);

            let _temp = r;
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
            if (code != 13) {return}
            let val = $(event.target).val().trim();

            let cond = fromUuidSync(val);
            if (!cond) {
                ui.notifications.warn(`Effect not exists`);
                return;
            }

            const qq = $(event.target).data().key.split(".");
            const r = this.findByUUID(qq[0]);

            let _temp = r;
            qq.slice(1).forEach((i) => {
                _temp = _temp[i];
            });

            if (!_temp.includes(val)) {
                _temp.push(val)
            }

            this.render()
        });
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "Settings",
            id: `${moduleName}-settings`,
            classes: ["settings-menu"],
            template: `modules/${moduleName}/templates/rules.hbs`,
            width: 1000,
            height: "auto",
            closeOnSubmit: false,
            resizable: true,
        });
    }

    static init() {
        game.settings.registerMenu(moduleName, "rulesSettings", {
            name: "Rule Settings",
            label: "Manage Rule Settings",
            icon: "fas fa-hand",
            type: this,
            restricted: true,
        });

        game.settings.register(moduleName, "rules", {
            name: "Rules",
            scope: "world",
            default: [],
            type: Array,
            config: false,
        });

        game.settings.register(moduleName, "ruleVersion", {
            name: "Rule Version",
            scope: "world",
            config: false,
            default: 0,
            type: Number,
        });
    }

    async getData() {
        if (this.editIndex != null) {
            const a = this.findByUUID(this.editIndex);
            let effObj = undefined;

            let editTemplate = "<p>FAIL TEMPLATE</p>";
            if (this.editTrigger) {
                const form = new TriggerForm(this.editIndex, a.name, a.triggers);
                editTemplate = await form.render();
            } else if (this.editRequirement) {
                const form = new RequirementForm(this.editIndex, a.name, a.requirements);
                editTemplate = await form.render();
            }  else if (this.editComplex) {
                const form = new ComplexForm(this.editIndex, a.name, a.values);
                editTemplate = await form.render();
            } else if (!a.type) {
                effObj = await parseEffect(a.value);
            }

            return foundry.utils.mergeObject(super.getData(), {
                subEdit: this.editTrigger || this.editRequirement || this.editComplex,
                editGroup: true,
                editTemplate,
                rule: {
                    type: a.type,
                    uuid: a.uuid,
                    value: a.value,
                    isActive: a.isActive,
                    name: a.name,
                    target: a.target,

                    triggerCount: a.triggers.map((a) => a.values).flat().length,
                    requirementCount: a.requirements.map((a) => a.values).flat().length,
                    generatedRuleCount: a.values?.map((a) => a.values)?.flat()?.length,

                    effObj,
                },
                targetChoices: TargetType,
                complexTargetChoices: ComplexTargetType,
            });
        } else {
            return foundry.utils.mergeObject(super.getData(), await this.getMainData());
        }
    }

    async getMainData() {
        return {
            rules: await Promise.all(
                this.rules.map(async (a) => {
                    return {
                        uuid: a.uuid,
                        isActive: a.isActive,
                        name: a.name,
                    };
                })
            ),
            subEdit: false,
        };
    }

    async close(options) {
        this.editRequirement = false;
        this.editTrigger = false;
        this.editIndex = null;
        return super.close(options);
    }
};