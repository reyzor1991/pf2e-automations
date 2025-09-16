import {BaseSetup, InitGlobalVariable, InitSettings} from "./init";
import {ReadyGlobalVariablesHook, ReadyHook} from "./ready";
import {HandleRuleMessage} from "./message";
import {RuleCreateItemHook, RuleDeleteItemHook, RulePreDeleteItemHook, RulePreUpdateItemHook} from "./item";
import {RegenApplyDamageToTokenHook} from "./damage";
import {RulePreUpdateActorHook} from "./actor";
import {BasicActionRollHook} from "./basicActionRoll";
import {LifeLinkMessageHook} from "./lifeLink";
import {DelayConsequencesHook, HighlightHeightenedSpellsHook} from "./highlight";
import {DrawRefreshTokenHook} from "./token";
import {
    HideRollMessageHook,
    LifeLinkRenderMessageHook,
    MinMaxDamageRenderMessageHook,
    PingRenderMessageHook,
    SustainRenderMessageHook
} from "./renderMessage";
import {ThaumaturgeHook} from "./thaum";
import {ConditionDC, RollApplication} from "./app";
import {AvoidNoticeRollCreateCombatantHook, AvoidNoticeRollPreCreateCombatantHook, AvoidNoticeRollPreCreateItemHook} from "./stealth";
import {FailFlatRenderMessageHook, FlatAllTargetsHook, FlatAttackHook, FlatHook, PartialFailFlatRenderMessageHook} from "./flat";
import {EndTurnHook, StartTurnHook} from "./combatant";
import {ProtectorTreeMessageHook} from "./tree";

export interface VoidModuleHook {
    listen(): void;
}

export interface RenderApplicationHook {
    listen(app: object, html: HTMLElement, data: object): void;
}

export interface MessageHook {
    listen(message: ChatMessage): void;
}

export interface RenderMessageHook {
    listen(message: ChatMessage, html: HTMLElement): void;
}

export interface PreCreateMessageHook {
    listen(message: ChatMessage, data: object, options: object, userId: string): boolean|void;
}

export interface PreCreateItemHook {
    listen(item: Item): void;
}

export interface CreateItemHook {
    listen(item: Item, data: object, userId: string): void;
}

export interface DeleteItemHook {
    listen(item: Item, options: object, userId: string): void;
}

export interface PreDeleteItemHook {
    listen(item: Item, options: object, userId: string): void;
}

export interface PreUpdateActorHook {
    listen(actor: Actor, data: object, options: object): void;
}

export interface PreUpdateItemHook {
    listen(actor: Item, data: object, options: object, id: string): void;
}

export interface ApplyDamageToTokenHook {
    listen(t: string, r: object): void;
}

export interface RefreshTokenHook {
    listen(t: Token, r: object): void;
}

export interface PreCreateCombatantHook {
    listen(combatant: Combatant): void;
}

export interface CreateCombatantHook {
    listen(combatant: Combatant): void;
}

export interface TurnHook {
    listen(combatant: Combatant, encounter: Combat): void;
}

export interface ModuleHooks {

    init: VoidModuleHook[];
    setup: VoidModuleHook[];
    ready: VoidModuleHook[];
    renderApplication: RenderApplicationHook[];
    preUpdateActor: PreUpdateActorHook[];
    preCreateItem: PreCreateItemHook[];
    createItem: CreateItemHook[];
    preUpdateItem: PreUpdateItemHook[];
    deleteItem: DeleteItemHook[];
    preDeleteItem: PreDeleteItemHook[];
    createChatMessage: MessageHook[];
    preCreateChatMessage: PreCreateMessageHook[];
    renderChatMessage: RenderMessageHook[];
    applyDamageToToken: ApplyDamageToTokenHook[];
    refreshToken: RefreshTokenHook[];
    preCreateCombatant: PreCreateCombatantHook[];
    createCombatant: CreateCombatantHook[];
    startTurnHook: TurnHook[];
    endTurnHook: TurnHook[];
}

export function createModuleHooks(): ModuleHooks {
    return {
        init: [
            new InitGlobalVariable(),
            new InitSettings(),
        ],
        setup: [
            new BaseSetup()
        ],
        ready: [
            new ReadyGlobalVariablesHook(),
            new ReadyHook(),
        ],
        renderApplication: [
            new RollApplication(),
            new ConditionDC()
        ],
        preUpdateActor: [
            new RulePreUpdateActorHook()
        ],
        preCreateItem: [
        ],
        createItem: [
            new RuleCreateItemHook(),
            new AvoidNoticeRollPreCreateItemHook()
        ],
        preUpdateItem: [
            new RulePreUpdateItemHook()
        ],
        deleteItem: [
            new RuleDeleteItemHook()
        ],
        preDeleteItem: [
            new RulePreDeleteItemHook()
        ],
        preCreateChatMessage: [
            new DelayConsequencesHook(),
            new HighlightHeightenedSpellsHook(),
            new ThaumaturgeHook(),
            new FlatHook(),
            new FlatAllTargetsHook(),
            new FlatAttackHook()
        ],
        createChatMessage: [
            new HandleRuleMessage(),
            new BasicActionRollHook(),
            new LifeLinkMessageHook(),
            new ProtectorTreeMessageHook()
        ],
        renderChatMessage: [
            new PingRenderMessageHook(),
            new MinMaxDamageRenderMessageHook(),
            new FailFlatRenderMessageHook(),
            new PartialFailFlatRenderMessageHook(),
            new SustainRenderMessageHook(),
            new LifeLinkRenderMessageHook(),
            new HideRollMessageHook(),
        ],
        applyDamageToToken: [
            new RegenApplyDamageToTokenHook()
        ],
        refreshToken: [
            new DrawRefreshTokenHook()
        ],
        preCreateCombatant: [
            new AvoidNoticeRollPreCreateCombatantHook()
        ],
        createCombatant: [
            new AvoidNoticeRollCreateCombatantHook()
        ],
        startTurnHook: [
            new StartTurnHook()
        ],
        endTurnHook: [
            new EndTurnHook()
        ],
    }
}