class ComplexForm {
    template = `modules/${moduleName}/templates/complex.hbs`;

    ruleIndex;
    name;
    values;

    constructor(ruleIndex, name, values) {
        this.ruleIndex = ruleIndex;
        this.name = name;
        this.values = values;
    }

    async getData() {
        return {
            ruleIndex: this.ruleIndex,
            name: this.name,
            values: JSON.parse(JSON.stringify(this.values)).map(e=> {
                e.effects = e.effects.map(ee=> {
                    let so = fromUuidSync(ee);
                    return so ? so.name : ee;
                })
                return e;
            }),
            timeunits: foundry.utils.mergeObject({"null": 'No'}, Object.entries(CONFIG.PF2E.timeUnits).reduce(function(map, obj) { map[obj[0]] = game.i18n.localize(obj[1]); return map; }, {})),
            expirys: {
                "null": 'No',
                "turn-start": game.i18n.localize("PF2E.Item.Effect.Expiry.StartOfTurn"),
                "turn-end": game.i18n.localize("PF2E.Item.Effect.Expiry.EndOfTurn"),
                "round-end": game.i18n.localize("PF2E.Item.Effect.Expiry.EndOfRound"),
            },
            sustainState: [
                {value: null, label: 'No'},
                {value: true, label: 'True'},
                {value: false, label: 'False'},
            ]
        };
    }

    async render() {
        return renderTemplate(this.template, await this.getData());
    }
};
