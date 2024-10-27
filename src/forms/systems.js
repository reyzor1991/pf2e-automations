class Pf2eRuleSettings extends RuleListForm {

    constructor() {
        super("rules");
    }

    static init() {
        game.settings.registerMenu(moduleName, "rulesSettings", {
            name: "Rule Settings",
            label: "Manage Rule Settings",
            icon: "fas fa-hand",
            type: this,
            restricted: true,
        });

        game.settings.register(moduleName, "rules", {
            name: "Rules",
            scope: "world",
            default: [],
            type: Array,
            config: false,
        });

        game.settings.register(moduleName, "ruleVersion", {
            name: "Rule Version",
            scope: "world",
            config: false,
            default: 0,
            type: Number,
        });
    }
}

class Sf2eRuleSettings extends RuleListForm {

    constructor() {
        super("rules-sf2e");
    }

    static init() {
        game.settings.registerMenu(moduleName, "rulesSettings-sf2e", {
            name: "Rule Settings SF2e",
            label: "Manage Rule Settings",
            icon: "fas fa-hand",
            type: this,
            restricted: true,
        });

        game.settings.register(moduleName, "rules-sf2e", {
            name: "SF2e Rules",
            scope: "world",
            default: [],
            type: Array,
            config: false,
        });

        game.settings.register(moduleName, "ruleVersion-sf2e", {
            name: "SF2e Rule Version",
            scope: "world",
            config: false,
            default: 0,
            type: Number,
        });
    }
}