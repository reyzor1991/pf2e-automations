import {VoidModuleHook} from "./index";
import {GlobalNamespace, moduleName} from "../const";
import {Pf2eRuleSettings} from "../settings";
import {AdditionalSettings} from "../settings/additional";
import {getSetting, isActiveGM} from "../helpers";
import {ACTOR_ROLL_SOCKET_TYPE} from "../socket";
import {actorRollSaveThrowAsync} from "../global-f";

class InitSettings implements VoidModuleHook {
    listen() {
        Pf2eRuleSettings.init();

        game.settings.register(moduleName, "decreaseFrightened", {
            config: true,
            scope: "world",
            name: `Decrease Frightened at end of turn`,
            hint: ``,
            default: false,
            type: Boolean,
        });

        AdditionalSettings.init();

        foundry.applications.handlebars.loadTemplates([
            `modules/${moduleName}/templates/partials/filter.hbs`,
            `modules/${moduleName}/templates/partials/list.hbs`,
            `modules/${moduleName}/templates/partials/save.hbs`,
        ]);
    }
}

class InitGlobalVariable implements VoidModuleHook {
    listen() {
        GlobalNamespace.DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll");
        GlobalNamespace.CheckRoll = CONFIG.Dice.rolls.find((r) => r.name === "CheckRoll");

        CONFIG.queries[ACTOR_ROLL_SOCKET_TYPE] = actorRollSaveThrowAsync;
    }
}

class BaseSetup implements VoidModuleHook {
    listen() {
        // overrideAdvance();
    }
}

function uniq<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

Hooks.on('updateWorldTime', (_newTime: number, seconds: number, _options: object, _userId: string) => {
    if (!isActiveGM()) {
        return;
    }
    if (getSetting("fastHealingTime")) {
        handleFastHealingTime(seconds);
    }
    handleDecrementWithTime();
})

function handleDecrementWithTime() {
    let effects = game.actors.map(a => a.itemTypes.effect)
        .flat()
        .filter(i => i.getFlag(moduleName, "decrementPeriod"));
    effects.forEach(async effect => {
        let flag = effect.getFlag(moduleName, "decrementPeriod") as number;
        if (flag) {
            let number = game.time.worldTime - effect.system.start.value;
            if (number >= flag) {
                await effect.update({"system.start.value": game.time.worldTime})
                effect.decrease()
            }
        }
    })
}

async function handleFastHealingTime(seconds: number) {
    const multiplier = seconds / 6;

    const filter = game.actors.filter(a => a.isOfType('party')) as Party[];
    const actors = uniq(filter.map(p => p.members).flat());
    const hRulesByActor = actors.reduce((o, v) => {
        o[v.id] = v.items.contents.flat().map(i => i.rules).flat().filter(a => a.constructor.name === 'FastHealingRuleElement').filter(a => a.test()).filter(a => a.test()).filter(h => {
            const value = h.resolveValue(h.value);
            return typeof value === "number" || typeof value === "string"
        });
        return o
    }, {});

    for (const id in hRulesByActor) {
        let healValue = 0;
        const aa = game.actors.get(id);
        if (!aa || !aa?.system?.attributes?.hp?.max) {
            continue
        }
        if (aa.system.attributes.hp.value === aa.system.attributes.hp.max) {
            continue
        }

        for (const q of hRulesByActor[id]) {
            const roll = await new GlobalNamespace.DamageRoll(`{(${q.resolveValue(q.value)})[healing]}`).evaluate()
            healValue += Math.ceil(roll.total * multiplier)
        }
        if (!healValue) {
            continue
        }

        const newValue = aa.system.attributes.hp.value + healValue;
        if (newValue < aa.system.attributes.hp.max) {
            aa.update({"system.attributes.hp.value": newValue})
        } else {
            aa.update({"system.attributes.hp.value": aa.system.attributes.hp.max})
        }
    }
}

export {
    InitGlobalVariable,
    InitSettings,
    BaseSetup
};
