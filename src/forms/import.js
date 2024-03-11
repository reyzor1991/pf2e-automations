function renderImportForm(callback) {
  new Dialog({
    title: "Import",
    content: `<form class="editable" autocomplete="off" onsubmit="event.preventDefault();"><input type="file" accept="json" id="rule-file" name='data' multiple="multiple"/></form>`,
    buttons: {
      add: {
        icon: '<i class="fas fa-plus"></i>',
        label: "Add rules",
        callback: async (html) => {
          const form = html.find("form")[0];
          if (form && form.data.files[0]) {
            let files = Array.from(form.data.files).map((file) => {
              let reader = new FileReader();
              return new Promise((resolve) => {
                reader.onload = () => resolve(JSON.parse(reader.result));
                reader.readAsText(file);
              });
            });
            const res = await Promise.all(files);

            const newData = [...getSetting("rules"), ...res.flat()];
            await game.settings.set(moduleName, "rules", newData);
            Hooks.callAll("automations.updateRules");
            callback.call(this);
          }
        },
      },
      overwrite: {
        icon: '<i class="far fa-edit"></i>',
        label: "Overwrite rules",
        callback: async (html) => {
          const form = html.find("form")[0];
          if (form && form.data.files[0]) {
            let files = Array.from(form.data.files).map((file) => {
              let reader = new FileReader();
              return new Promise((resolve) => {
                reader.onload = () => resolve(JSON.parse(reader.result));
                reader.readAsText(file);
              });
            });
            const res = await Promise.all(files);
            const data = res.flat();

            const cRules = getSetting("rules").filter((a) => !data.find((b) => b.uuid === a.uuid));
            const newData = [...cRules, ...data];
            await game.settings.set(moduleName, "rules", newData);
            Hooks.callAll("automations.updateRules");

            callback.call(this);
          }
        },
      },
      rewrite: {
        icon: '<i class="far fa-edit"></i>',
        label: "Use file as new rules",
        callback: async (html) => {
          const form = html.find("form")[0];
          if (form && form.data.files[0]) {
            let files = Array.from(form.data.files).map((file) => {
              let reader = new FileReader();
              return new Promise((resolve) => {
                reader.onload = () => resolve(JSON.parse(reader.result));
                reader.readAsText(file);
              });
            });
            const res = await Promise.all(files);
            await game.settings.set(moduleName, "rules", res.flat());
            Hooks.callAll("automations.updateRules");
            callback.call(this);
          }
        },
      },
    },
    default: "add",
  }).render(true);
};
