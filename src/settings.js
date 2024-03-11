Hooks.on("init", () => {
    RuleSettings.init();
    MessageHandlers.init();
    UpdateActorHandlers.init();
    DeleteItemHandlers.init();
    CreateItemHandlers.init();
    UpdateItemHandlers.init();
});

Hooks.on("renderApplication", (setting, html) => {
    html
        .find(`[data-category="${moduleName}"]`)
        .find(`[data-setting-id="${moduleName}.ruleVersion"]`)
        .hide();
});

Hooks.on("renderSettingsConfig", (app, html) => {
    const target = html.find(`[data-category="${moduleName}"]`);

    if (target.find(`.${moduleName}-btn-sync`).length === 0) {
        let syncBtn = document.createElement("div");
        syncBtn.classList.add("form-group", "submenu", `${moduleName}-btn-sync`);
        syncBtn.innerHTML = `<button type="button"> <i class="	fas fa-sync"></i> <label>Sync Rules</label> </button>`;
        syncBtn.onclick = function () {
            fetch(`modules/${moduleName}/rules/rules.json`)
                .then(async (response) => {
                    if (response.ok) {
                        return await response.json();
                    } else {
                        ui.notifications.info(`Sync file not found`);
                        throw new Error("Sync file not found");
                    }
                })
                .then(async (json) => {
                    const curRules = getSetting("rules").filter((a) => !json.forceUpdate.includes(a.uuid));
                    const cur = getSetting("ruleVersion") ?? 0;
                    if (cur >= json.version && curRules.length != 0) {
                        ui.notifications.info(`There are no updates`);
                        return;
                    }
                    console.log("Update to ", json.version);

                    const newData = [...json.rules].filter(
                        (a) => !curRules.find((b) => b.uuid === a.uuid)
                    );
                    const afterRemove = curRules.filter((a) => !json.removeIds.includes(a.uuid));

                    await game.settings.set(moduleName, "rules", [...newData, ...afterRemove]);
                    await game.settings.set(moduleName, "ruleVersion", json.version);

                    ui.notifications.info(`Rules were synced`);

                    Hooks.callAll("automations.updateRules");

                    app.close()
                })
                .catch((error) => {
                    console.error("Sync rules error:", error);
                });
        };
        target.find(".form-group").first().before(syncBtn);
    }
});