let TargetType = {};
let ComplexTargetType = {};
let RequirementType = {};
let TriggerType = {};
let Operator = {};

const PHYSICAL_DAMAGE_TYPES = ["bleed", "bludgeoning", "piercing", "slashing"];

Hooks.on("ready", () => {
    TargetType = {
        None: translate('targetType.None'),
        SelfEffect: translate('targetType.SelfEffect'),
        SelfEffectActorNextTurn: translate('targetType.SelfEffectActorNextTurn'),
        TargetEffect: translate('targetType.TargetEffect'),
        TargetEffectActorNextTurn: translate('targetType.TargetEffectActorNextTurn'),
        SelfOrTargetEffect: translate('targetType.SelfOrTargetEffect'),
        TargetsEffect: translate('targetType.TargetsEffect'),
        SelfOrTargetsEffect: translate('targetType.SelfOrTargetsEffect'),
        TargetRemoveCondition: translate('targetType.TargetRemoveCondition'),
        TargetRemoveEffect: translate('targetType.TargetRemoveEffect'),
        SelfRemoveCondition: translate('targetType.SelfRemoveCondition'),
        SelfRemoveEffect: translate('targetType.SelfRemoveEffect'),
        SelfAddCondition: translate('targetType.SelfAddCondition'),
        TargetAddCondition: translate('targetType.TargetAddCondition'),
        PartyEffect: translate('targetType.PartyEffect'),
        SelfDamage: translate('targetType.SelfDamage'),
        TargetDamage: translate('targetType.TargetDamage'),
        RunMacro: translate('targetType.RunMacro'),
    };
    ComplexTargetType = {
        None: translate('targetType.None'),
        SelfEffect: translate('targetType.SelfEffect'),
        SelfEffectActorNextTurn: translate('targetType.SelfEffectActorNextTurn'),
        TargetEffect: translate('targetType.TargetEffect'),
        TargetEffectActorNextTurn: translate('targetType.TargetEffectActorNextTurn'),
    };

    RequirementType = {
        None: translate('requirementType.None'),
        Success: translate('requirementType.Success'),
        CriticalSuccess: translate('requirementType.CriticalSuccess'),
        AnySuccess: translate('requirementType.AnySuccess'),
        Failure: translate('requirementType.Failure'),
        CriticalFailure: translate('requirementType.CriticalFailure'),
        AnyFailure: translate('requirementType.AnyFailure'),
        ActorHasEffect: translate('requirementType.ActorHasEffect'),
        ActorHasEffectBySlug: translate('requirementType.ActorHasEffectBySlug'),
        ActorHasFeat: translate('requirementType.ActorHasFeat'),
        TargetIsAnother: translate('requirementType.TargetIsAnother'),
        ActorHasCondition: translate('requirementType.ActorHasCondition'),
        TargetHasEffect: translate('requirementType.TargetHasEffect'),
        TargetHasCondition: translate('requirementType.TargetHasCondition'),
        TargetHasTrait: translate('requirementType.TargetHasTrait'),
        ItemHasTrait: translate('requirementType.ItemHasTrait'),
        ActorName: translate('requirementType.ActorName'),
        LvlGte: translate('requirementType.LvlGte'),
        LvlLess: translate('requirementType.LvlLess'),
        TargetsNumber: translate('requirementType.TargetsNumber'),
        UseEquipment: translate('requirementType.UseEquipment'),
        MessageDCLabel: translate('requirementType.MessageDCLabel'),
        WieldLoadedOneHandedRanged: translate('requirementType.WieldLoadedOneHandedRanged'),
    };

    TriggerType = {
        None: translate('triggerType.None'),
        EqualsSlug: translate('triggerType.EqualsSlug'),
        HasOption: translate('triggerType.HasOption'),
        HasDomain: translate('triggerType.HasDomain'),
        HasRune: translate('triggerType.HasRune'),
        EqualsSourceId: translate('triggerType.EqualsSourceId'),
    };

    Operator = {
        AND: translate('operator.AND'),
        OR: translate('operator.OR'),
        NOT: translate('operator.NOT'),
    };
});