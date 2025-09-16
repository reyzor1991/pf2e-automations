import {GroupType, TargetType, TriggerType} from "./ruleTypes";

export interface ActiveRuleGroup {
    name: string;
    baseRules: BaseRule[];
    complexRules: ComplexRule[];
    handlerRules: HandlerRule[];
}

export class RuleGroup implements ActiveRuleGroup {
    uuid: string = "";
    group: string = "other" as GroupType;
    name: string = "";
    labels: string[] = [];
    source: string[] = [];
    isActive: boolean = false;
    baseRules: BaseRule[] = [];
    complexRules: ComplexRule[] = [];
    handlerRules: HandlerRule[] = [];

    rawValue() {
        let obj = Object.assign({}, this);
        obj.baseRules = (obj.baseRules || []).map(r => r.rawValue());
        obj.complexRules = (obj.complexRules || []).map(r => r.rawValue());
        obj.handlerRules = (obj.handlerRules || []).map(r => r.rawValue());
        return obj;
    }

    static fromObj(obj: { baseRules?: [], complexRules?: [], handlerRules?: [] }): RuleGroup {
        const r = new RuleGroup();
        Object.assign(r, obj);
        r.baseRules = (obj.baseRules || []).map((a) => BaseRule.fromObj(a));
        r.complexRules = (obj.complexRules || []).map((a) => ComplexRule.fromObj(a));
        r.handlerRules = (obj.handlerRules || []).map((a) => HandlerRule.fromObj(a));
        return r;
    }

    clone() {
        return RuleGroup.fromObj(this.rawValue());
    }
}

export interface Rule {
    type: string;
    triggerType: TriggerType;
    range: number | undefined;
    extend: boolean | undefined;
    skipOrigin: boolean | undefined;
    choiceSetSelection: string | undefined;
    target: TargetType;
    predicate: (object | string)[];
    values?: RuleGenerator[];
    value?: string;
}

export abstract class AbsRule implements Rule {
    triggerType = "none" as TriggerType;
    range = undefined;
    extend: boolean | undefined = undefined;
    choiceSetSelection: string | undefined = undefined;

    predicate: (object | string)[] = [];
    target: TargetType = TargetType.None;
    type: string = "none";
    value: string = "";
    values: RuleGenerator[] = [];

    rawValue() {
        let obj = Object.assign({}, this);
        obj.values = (obj.values || []).map(r => r.rawValue());
        return obj;
    }
}

export class BaseRule extends AbsRule {
    type = "base";
    value = "";

    constructor() {
        super();
    }

    static fromObj(obj: object): BaseRule {
        const r = new BaseRule();
        Object.assign(r, obj);
        return r;
    }
}

export class ComplexRule extends AbsRule {
    name?: string;
    type = "complex";
    values: RuleGenerator[] = [];

    constructor() {
        super();
    }

    static fromObj(obj: { values: object[] } | Rule): ComplexRule {
        const r = new ComplexRule();
        Object.assign(r, obj);
        const values = obj.values as RuleGenerator[];
        r.values = values.map((a) => RuleGenerator.fromObj(a));
        return r;
    }
}

export class HandlerRule extends AbsRule {

    type = "handler";

    constructor() {
        super();
    }

    static fromObj(obj: object): HandlerRule {
        const r = new HandlerRule();
        Object.assign(r, obj);
        return r;
    }
}

export class RuleGenerator {

    immunities: string[] = [];
    conditions: string[] = [];
    effects: string[] = [];
    duration = {
        expiry: null,
        sustained: null,
        unit: null,
        value: null
    }

    constructor() {
    }

    rawValue(): object {
        return Object.assign({}, this);
    }

    static fromObj(obj: object): RuleGenerator {
        return Object.assign(new RuleGenerator(), obj);
    }
}


export class MessageForHandling {
    tokenTargets;
    targetActor;
    targetToken;
    mainActor;
    mainToken;
    itemLvl;
    itemUuid;
    optionalData;
    rollOptions;
    messageFlags;
    messageId;
    item;
    strike: object | undefined;

    data: any;
    speaker: any;
    roll: Roll|undefined;

    constructor(message: ChatMessage | undefined, item: Item | undefined, rollOptions: Set<string>, optionalData?: {
        origin?: {},
        stOrigin?: {},
        itemChanges?: any
    }) {
        this.tokenTargets = game.user.targets || new Set();
        this.targetActor = message?.target?.actor || game.user.targets.first()?.actor;
        this.targetToken = message?.target?.token || game.user.targets.first()?.document as Token;
        this.mainActor = message?.actor;
        this.mainToken = message?.token;
        this.itemLvl = item?.level;
        this.itemUuid = item?.uuid;
        this.optionalData = optionalData;
        this.rollOptions = rollOptions;
        this.messageFlags = message?.flags;
        this.messageId = message?.id;
        this.speaker = message?.speaker;
        this.item = item;
        this.roll = message?.rolls?.[0];
        this.strike = message?._strike;
    }
}