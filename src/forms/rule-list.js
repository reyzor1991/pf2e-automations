class RuleListForm extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(settingName) {
        super();
        this.settingName = settingName;
        this.rules = {}
        this.refreshRules();
    }

    refreshRules() {
        const _e = foundry.utils.deepClone(getSetting(this.settingName));
        if (_e) {
            this.rules = _e
                .map((a) => a?.type === 'complex' ? ComplexRule.fromObj(a) : Rule.fromObj(a))
                .reduce((obj, value) => {
                    obj[value.uuid] = value;
                    return obj;
                }, {});
        }
    }

    tabGroups = {
        base: "attack-roll",
    };

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: `${moduleName}-list-rules-form`,
        classes: [moduleName, "settings-menu"],
        window: {title: "Rules", resizable: true},
        position: {width: 1000, height: 450},
        actions: {},
        form: {
            handler: this.formHandler,
            closeOnSubmit: true
        },
    };

    static async formHandler(event, form, formData) {
        let data = formData.object;

        for (const key of Object.keys(data)) {
            this.rules[key].isActive = data[key];
        }
        await game.settings.set(moduleName,
            this.settingName,
            Object.values(this.rules).map(el => el.rawValue()));
        updateActiveRulesForAll()
    }

    static PARTS = {
        hbs: {
            template: `modules/${moduleName}/templates/rule-list.hbs`
        }
    };

    _attachPartListeners(partId, htmlElement, options) {
        super._attachPartListeners(partId, htmlElement, options);
        let html = $(htmlElement)

        let parentForm = this;

        const sName = this.settingName;

        const header = html.parent().parent().find(".window-header");
        this.downloadBtn(html, header, sName, parentForm)

        html.find(".add-rule").click(async (event) => {
            new RuleForm(this.settingName, new Rule(), this).render(true)
        });

        html.find(".edit-rule").click(async (event) => {
            let rule = this.rules[$(event.currentTarget).data().idx]
            if (rule) {
                new RuleForm(this.settingName, rule, this).render(true)
            }
        });

        html.find(".remove-rule").click(async (event) => {
            delete this.rules[$(event.currentTarget).data().idx];
            this.render();
        });

        this.filterListeners(html)

        html.find(".apply-suggestions").click(async (event) => {
            let activeItems = game.actors.map(a=>a.items.contents).flat().map(i=>i.sourceId).filter(b=>b)

            let withSource = Object.values(this.rules).filter(r=>r.source && r.source.length);

            let allNotActive = withSource.filter(r=>!r.isActive)
            let allActive = withSource.filter(r=>r.isActive)

            let needToActivate = allNotActive.filter(r=>r.source.some(s=>activeItems.includes(s)))
            let needToDeactivate = allActive.filter(r=>!r.source.some(s=>activeItems.includes(s)))

            if (!needToActivate.length && !needToDeactivate.length) {
                ui.notifications.info("There are no suggestions for current configuration")
                return
            }

            let d = needToDeactivate.map(r=>`<p> - ${r.name}</p>`)
            let a = needToActivate.map(r=>`<p> - ${r.name}</p>`)

            let res = await foundry.applications.api.DialogV2.confirm({
                content: `<div class="dialog-scroll"><p>Do you want to apply changes?<p>${!a.length?'':'<p><strong>Activate:</strong></p>'+a.join("")}${!d.length?'':'<br/><p><strong>Deactivate:</strong></p>'+d.join("")}</div>`
            });
            if (res) {
                needToActivate.forEach(r=>{
                    this.rules[r.uuid].isActive = true
                })
                needToDeactivate.forEach(r=>{
                    this.rules[r.uuid].isActive = false
                })
                this.render()
            }
        });
    }

    downloadBtn(html, header, sName, parentForm) {
        if (header.length > 0 && header.find(`.${moduleName}-btn-download`).length === 0) {
            let btn = document.createElement("a");
            btn.classList.add("control", `${moduleName}-btn-download`);
            btn.innerHTML = `<i class="fas fa-file-export"></i>Export`;
            btn.onclick = function () {
                const a = document.createElement("a");
                const file = new Blob([JSON.stringify(getSetting(sName))], {type: "text/plain"});
                a.href = URL.createObjectURL(file);
                a.download = "rules.json";
                a.click();

                ui.notifications.info(`Rules were exported`);
            };

            let importBtn = document.createElement("a");
            importBtn.classList.add("control", `${moduleName}-btn-import`);
            importBtn.innerHTML = `<i class="fas fa-file-import"></i>Import`;
            importBtn.onclick = function () {
                renderImportForm(sName, () => {
                    parentForm.refreshRules();
                    parentForm.render();
                });
            };

            header.find(`[data-action="close"]`).before(importBtn);
            header.find(`[data-action="close"]`).before(btn);
        }

        html.find(".export-rule").click(async (event) => {
            let idx = $(event.currentTarget).data().idx;
            const rule = this.rules[idx];

            const a = document.createElement("a");
            const file = new Blob([JSON.stringify(rule.rawValue())], {type: "text/plain"});
            a.href = URL.createObjectURL(file);
            a.download = `${rule.name || 'rule'}.json`;
            a.click();

            ui.notifications.info(`Rules were exported`);
        });
    }

    filterListeners(html) {
        html.on("input propertychange paste change", ".FilterSearch", function () {
            filterHtmlRules(html, $(this).val().toLowerCase(), html.find('#filter-label').val())
        });

        html.on("change", "#filter-label", function () {
            filterHtmlRules(html, html.find('.FilterSearch').val().toLowerCase(), $(this).val())
        });
        //
        //
        //
        html.find(".check-filtered-rule").click(async (event) => {
            this.setActiveToRule(html, true)
        });
        html.find(".minus-filtered-rule").click(async (event) => {
            this.setActiveToRule(html, false)
        });
        ///
        //
        //
        html.find(".check-all-rule").click(async (event) => {
            for (const key of Object.keys(this.rules)) {
                this.rules[key].isActive = true;
            }
            ui.notifications.info(`All rules were activated`);
            this.render();
        });
        html.find(".minus-all-rule").click(async (event) => {
            for (const key of Object.keys(this.rules)) {
                this.rules[key].isActive = false;
            }
            ui.notifications.info(`All rules were deactivated`);
            this.render();
        });
        html.find(".delete-all-rules").click(async (event) => {
            this.rules = {}
            this.render();
        });
    }

    setActiveToRule(html, active) {
        const $ul = html.find(`section[data-tab="${this.tabGroups.base}"]`);
        const $li = $ul.find("li:visible");
        let parent = this;
        $li.each(function () {
            parent.rules[$(this).data('uuid')].isActive = active
        });
        this.render();
    }

    async _prepareContext(_options) {
        let context = await super._prepareContext(_options);

        let allRules = Object.values(this.rules)
            .reduce((obj, value) => {
                obj[value.triggerType] ??= [];
                obj[value.triggerType].push(value);
                return obj;
            }, {});

        let attacks = (allRules['attack-roll'] || [])
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        let damage = [...(allRules['damage-roll'] || []), ...(allRules['damage-taken'] || [])]
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        let skills = [...(allRules['skill-check'] || []), ...(allRules['perception-check'] || [])]
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        let spells = (allRules['spell-cast'] || [])
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        let saving = (allRules['saving-throw'] || [])
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        let other = [...(allRules['postInfo'] || []), ...(allRules[undefined] || [])]
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

        return {
            ...context,
            tabGroups: this.tabGroups,
            labels: FORM_LABELS,
            rules: {
                attacks,
                damage,
                skills,
                spells,
                saving,
                other,
            }
        };
    }
}

