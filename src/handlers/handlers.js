const registeredMessageCreateHandler = {};

async function registerMessageCreateHandler(name, callback, description) {
    registeredMessageCreateHandler[name] = callback;

    const cur = getSetting("messageCreateHandlers") ?? [];
    if (!cur.find((a) => a.name === name)) {
        cur.push({ isActive: true, name, description });
    }
    await game.settings.set(moduleName, "messageCreateHandlers", cur);
}

//--------
//--------
//--------

const registeredUpdateActorHandler = {};

async function registerUpdateActorHandler(name, callback, description) {
    registeredUpdateActorHandler[name] = callback;

    const cur = getSetting("updateActorHandlers") ?? [];
    if (!cur.find((a) => a.name === name)) {
        cur.push({ isActive: true, name, description });
    }
    await game.settings.set(moduleName, "updateActorHandlers", cur);
}

Hooks.on("preUpdateActor", async (actor, data) => {
    (getSetting("updateActorHandlers") ?? [])
        .filter((a) => a.isActive)
        .forEach((handler) => {
            registeredUpdateActorHandler[handler.name]?.call(this, actor, data);
        });
});

//--------
//--------
//--------

const registeredDeleteItemHandler = {};

async function registerDeleteItemHandler(name, callback, description) {
    registeredDeleteItemHandler[name] = callback;

    const cur = getSetting("deleteItemHandlers") ?? [];
    if (!cur.find((a) => a.name === name)) {
        cur.push({ isActive: true, name, description });
    }
    await game.settings.set(moduleName, "deleteItemHandlers", cur);
}

Hooks.on("deleteItem", async (effect, data, id) => {
    if (game.userId !== id) {
        return;
    }

    (getSetting("deleteItemHandlers") ?? [])
        .filter((a) => a.isActive)
        .forEach((handler) => {
            registeredDeleteItemHandler[handler.name]?.call(this, effect, data, id);
        });
});


//--------
//--------
//--------

const registeredCreateItemHandler = {};

async function registerCreateItemHandler(name, callback, description) {
    registeredCreateItemHandler[name] = callback;

    const cur = getSetting("createItemHandlers") ?? [];
    if (!cur.find((a) => a.name === name)) {
        cur.push({ isActive: true, name, description });
    }
    await game.settings.set(moduleName, "createItemHandlers", cur);
}

Hooks.on("createItem", async (effect, data, id) => {
    if (game.userId !== id) {
        return;
    }

    (getSetting("createItemHandlers") ?? [])
        .filter((a) => a.isActive)
        .forEach((handler) => {
            registeredCreateItemHandler[handler.name]?.call(this, effect, data, id);
        });
});

//--------
//--------
//--------

const registeredUpdateItemHandler = {};

async function registerUpdateItemHandler(name, callback, description) {
    registeredUpdateItemHandler[name] = callback;

    const cur = getSetting("updateItemHandlers") ?? [];
    if (!cur.find((a) => a.name === name)) {
        cur.push({ isActive: true, name, description });
    }
    await game.settings.set(moduleName, "updateItemHandlers", cur);
}


Hooks.on("preUpdateItem",  (item, data, options, id) => {
    (getSetting("updateItemHandlers") ?? [])
        .filter((a) => a.isActive)
        .forEach((handler) => {
            registeredUpdateItemHandler[handler.name]?.call(this, item, data, options, id);
        });
});

Hooks.on("init", () => {
    game.pf2eautomations = foundry.utils.mergeObject(game.pf2eautomations ?? {}, {
        registerMessageCreateHandler: registerMessageCreateHandler,
        registerUpdateActorHandler: registerUpdateActorHandler,
        registerDeleteItemHandler: registerDeleteItemHandler,
        registerCreateItemHandler: registerCreateItemHandler,
        registerUpdateItemHandler: registerUpdateItemHandler,
    });
});