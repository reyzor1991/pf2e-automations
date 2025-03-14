class RuleRequirement {
    constructor() {
        this.requirement = RequirementType.None;
        this.objType = "item";
        this.value = "";
    }

    static fromObj(obj) {
        return Object.assign(new RuleRequirement(), obj);
    }
}

class RuleRequirementGroup {
    constructor() {
        this.operator = Operator.AND;
        this.objType = "group";
        this.values = [new RuleRequirement()];
    }

    static fromObj(obj) {
        const rg = new RuleRequirementGroup();
        Object.assign(rg, obj);
        rg.values = rg.values.map((a) => RuleRequirement.fromObj(a));
        return rg;
    }
}

class RuleTrigger {
    constructor() {
        this.trigger = TriggerType.None;
        this.objType = "item";
        this.encounter = false;
        this.messageType = "";
        this.value = "";
    }

    static fromObj(obj) {
        return Object.assign(new RuleTrigger(), obj);
    }
}

class RuleTriggerGroup {
    constructor() {
        this.operator = Operator.AND;
        this.objType = "group";
        this.values = [new RuleTrigger()];
    }

    static fromObj(obj) {
        const rg = new RuleTriggerGroup();
        Object.assign(rg, obj);
        rg.values = rg.values.map((a) => {
            if (a.objType === "group") {
                return RuleTriggerGroup.fromObj(a);
            }
            return RuleTrigger.fromObj(a);
        });
        return rg;
    }
}

class Rule {
    constructor() {
        this.uuid = undefined;
        this.labels = [];
        this.name = "";
        this.range = 0;
        this.value = "";
        this.isActive = false;
        this.target = TargetType.None;
        this.triggers = [new RuleTriggerGroup()];
        this.requirements = [];
        this.predicate = [];
    }

    static fromObj(obj) {
        const r = new Rule();
        Object.assign(r, obj);
        r.triggers = r.triggers.map((a) => RuleTriggerGroup.fromObj(a));
        r.requirements = r.requirements.map((a) => RuleRequirementGroup.fromObj(a));
        r.predicate ??= []
        return r;
    }

    rawValue() {
        return JSON.parse(JSON.stringify(this))
    }
}

class RuleGenerator {
    constructor() {
        this.conditions = [];
        this.effects = [];
        this.duration = {
            expiry: null,
            sustained: null,
            unit: null,
            value: null
        };
    }

    static fromObj(obj) {
        return Object.assign(new RuleGenerator(), obj);
    }
}

class ComplexRule {
    constructor() {
        this.type = "complex";
        this.uuid = undefined;
        this.labels = [];
        this.name = "";
        this.range = 0;
        this.values = [];
        this.isActive = false;
        this.target = TargetType.None;
        this.triggers = [new RuleTriggerGroup()];
        this.requirements = [];
        this.predicate = [];
    }

    static fromObj(obj) {
        const r = new ComplexRule();
        Object.assign(r, obj);
        r.values = r.values.map((a) => RuleGenerator.fromObj(a));
        r.triggers = r.triggers.map((a) => RuleTriggerGroup.fromObj(a));
        r.requirements = r.requirements.map((a) => RuleRequirementGroup.fromObj(a));
        r.predicate ??= []
        return r;
    }

    rawValue() {
        return JSON.parse(JSON.stringify(this))
    }
}