class RequirementForm {
  template = `modules/${moduleName}/templates/requirementGroup.hbs`;

  ruleIndex;
  name;
  requirements;

  constructor(ruleIndex, name, requirements) {
    this.ruleIndex = ruleIndex;
    this.name = name;
    this.requirements = requirements;
  }

  async getData() {
    return {
      operatorChoices: Operator,
      requirementChoices: RequirementType,
      ruleIndex: this.ruleIndex,
      name: this.name,
      requirements: await Promise.all(
        this.requirements.map(async (a) => {
          a.values = await Promise.all(
            a.values.map(async (b) => {
              b.effObj = await parseEffect(b.value);
              return b;
            })
          );
          return a;
        })
      ),
    };
  }

  activateListeners(html) {}

  async render() {
    return renderTemplate(this.template, await this.getData());
  }
}
