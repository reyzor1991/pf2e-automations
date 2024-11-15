Hooks.on("init", () => {
    Pf2eRuleSettings.init();
    Sf2eRuleSettings.init();
    MessageHandlers.init();
    UpdateActorHandlers.init();
    DeleteItemHandlers.init();
    CreateItemHandlers.init();
    UpdateItemHandlers.init();

    loadTemplates([
        `modules/${moduleName}/templates/partials/list.hbs`,
    ]);
});

async function syncAllRules(rulesObj, callback = undefined) {
    await Promise.all(rulesObj.map(r => {
        syncRulesFn(r.settingName, r.versionSettingName, r.jsonName);
    }));
    if (callback) {
        callback?.call(this);
    }
}

async function syncRulesFn(settingName, versionSettingName, jsonName, callback = undefined) {
    await fetch(`modules/${moduleName}/rules/${jsonName}.json`)
        .then(async (response) => {
            if (response.ok) {
                return await response.json();
            } else {
                ui.notifications.info(`Sync file not found`);
                throw new Error("Sync file not found");
            }
        })
        .then(async (json) => {
            let settingsData = foundry.utils.deepClone(getSetting(settingName));
            const curRules = settingsData.filter((a) => !json.forceUpdate.includes(a.uuid));
            const forced = settingsData.filter((a) => json.forceUpdate.includes(a.uuid));
            const cur = getSetting(versionSettingName) ?? 0;
            if (cur >= json.version && curRules.length !== 0) {
                ui.notifications.info(`There are no updates`);
                callback?.call(this);
                return;
            }

            if (json.forceAll) {
                const saveOwnRule = curRules
                    .filter((a) => !json.removeIds.includes(a.uuid))
                    .filter(a => !json.rules.find((b) => b.uuid === a.uuid));

                await game.settings.set(moduleName, settingName, [...saveOwnRule, ...json.rules]);
                await game.settings.set(moduleName, versionSettingName, json.version);
            } else {
                const newData = [...json.rules].filter(
                    (a) => !curRules.find((b) => b.uuid === a.uuid)
                );
                const afterRemove = curRules.filter((a) => !json.removeIds.includes(a.uuid));
                let dataForSave = [...newData, ...afterRemove];
                forced.forEach((a) => {
                    let qq = dataForSave.find(b=>b.uuid === a.uuid)
                    if (qq) {
                        qq.isActive = a.isActive;
                    }
                })

                await game.settings.set(moduleName, settingName, dataForSave);
                await game.settings.set(moduleName, versionSettingName, json.version);
            }

            ui.notifications.info(`Rules were synced`);
            console.log("Update to ", json.version);

            updateActiveRulesForAll()
            callback?.call(this);
        })
        .catch((error) => {
            console.error("Sync rules error:", error);
        });
}

Hooks.on("renderSettingsConfig", (app, html) => {
    const target = html.find(`[data-category="${moduleName}"]`);


    let syncBtn = document.createElement("div");
    syncBtn.classList.add("form-group", "submenu", `${moduleName}-btn-sync`);
    syncBtn.innerHTML = `<button type="button"> <i class="	fas fa-sync"></i> <label>Sync Rules</label> </button>`;
    syncBtn.onclick = async () => {
        await syncRulesFn("rules", "ruleVersion", "rules")
    };

    let syncBtn2 = document.createElement("div");
    syncBtn2.classList.add("form-group", "submenu", `${moduleName}-btn-sync-sf2e`);
    syncBtn2.innerHTML = `<button type="button"> <i class="	fas fa-sync"></i> <label>Sync SF2e Rules</label> </button>`;
    syncBtn2.onclick = async () => {
        await syncRulesFn("rules-sf2e", "ruleVersion-sf2e", "sf2e")
    };

    let all = document.createElement("div");
    all.classList.add("rules-sync-row");
    all.append(syncBtn, syncBtn2);

    target.find(".form-group").first().before(all);
});