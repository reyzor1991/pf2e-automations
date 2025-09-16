import {RenderApplicationHook} from "./index";
import {moduleName} from "../const";
import {investigateRoll, searchRoll, stealthRoll} from "../global-f";
import {getSetting, isActiveGM} from "../helpers";

export class ConditionDC implements RenderApplicationHook {
    listen(app: object, _html: HTMLElement, data: object): void {
        if (!getSetting("conditionDC") || !isActiveGM() || !data.conditions) {
            return
        }
        let html = $(_html)

        data.conditions.map(d => d.effect).filter(a => a.flags[moduleName]?.dc).forEach((c) => {
            const byId = html.find(`[data-item-id="${c.id}"]`);

            if (byId.find(".icon").find(".value-dc").length === 0) {
                byId
                    .find(".icon")
                    .append(
                        `<div class="value-dc"><div class="value"><strong style="display: inline;">DC: ${
                            c.getFlag(moduleName, "dc") ?? ""
                        }</strong></div></div>`
                    );
            }
        });
    }
}

export class RollApplication implements RenderApplicationHook {
    listen(app: object, _html: HTMLElement, data: object): void {
        if (app.id !== "effects-panel") {
            return;
        }
        if (!data.actor || !data?.actor?.isOfType("character")) {
            return;
        }
        if (data.effects.length === 0) {
            return;
        }
        let html = $(_html)

        const activities = data.effects.filter(
            (a) => a.effect?.getFlag(moduleName, "roll") || ["action-effect-investigate"].includes(a.effect?.slug)
        ).map(a => a.effect);

        activities.forEach((search) => {
            const byId = html.find(`[data-item-id="${search.id}"]`);
            byId.attr("data-badge-type", "formula");

            if (game.user.isGM) {
                if (byId.find(".icon").find(".value-wrapper").length === 0) {
                    byId
                        .find(".icon")
                        .append(
                            `<div class="value-wrapper"><div class="value"><strong style="display: inline;">${
                                search.getFlag(moduleName, "roll") ?? ""
                            }</strong></div></div>`
                        );
                }
            }

            if (search.slug === "action-effect-avoid-notice") {
                byId.find(".icon").click(async (event) => {
                    stealthRoll(data.actor, search);
                });
            } else if (search.slug === "action-effect-search") {
                byId.find(".icon").click(async (event) => {
                    searchRoll(data.actor, search);
                });
            } else if (search.slug === "action-effect-investigate") {
                byId.find(".icon").click(async (event) => {
                    investigateRoll(data.actor, search);
                });
            }
        });
    }

}