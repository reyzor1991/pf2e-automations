class TriggerForm {
    template = `modules/${moduleName}/templates/triggerGroup.hbs`;

    ruleIndex;
    name;
    triggers;

    constructor(ruleIndex, name, triggers) {
        this.ruleIndex = ruleIndex;
        this.name = name;
        this.triggers = triggers;
    }

    async getData() {
        return {
            operatorChoices: Operator,
            triggerChoices: TriggerType,
            ruleIndex: this.ruleIndex,
            name: this.name,
            triggers: this.triggers,
        };
    }

    activateListeners(html) {
    }

    async render() {
        return renderTemplate(this.template, await this.getData());
    }
}
