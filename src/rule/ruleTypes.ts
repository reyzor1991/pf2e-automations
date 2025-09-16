export enum TargetType {
    None = "None",
    SelfEffect = "SelfEffect",
    TargetEffect = "TargetEffect",
    SelfOrTargetEffect = "SelfOrTargetEffect",
    TargetsEffect = "TargetsEffect",
    SelfOrTargetsEffect = "SelfOrTargetsEffect",
    TargetRemoveCondition = "TargetRemoveCondition",
    TargetRemoveEffect = "TargetRemoveEffect",
    SelfRemoveCondition = "SelfRemoveCondition",
    SelfRemoveEffect = "SelfRemoveEffect",
    SelfAddCondition = "SelfAddCondition",
    TargetAddCondition = "TargetAddCondition",
    PartyEffect = "PartyEffect",
    TurnOnOption = "TurnOnOption",
    TurnOffOption = "TurnOffOption",
    SelfDamage = "SelfDamage",
    TargetDamage = "TargetDamage",
    RunMacro = "RunMacro",
    TargetAllyWithinRange = "TargetAllyWithinRange",
    OnlyAllyWithinRange = "OnlyAllyWithinRange",
    IncreaseBadgeEffect = "IncreaseBadgeEffect",
    DecreaseBadgeEffect = "DecreaseBadgeEffect",
    ImmunitySelfEffect = "ImmunitySelfEffect",
    TargetIncreaseBadgeEffect = "TargetIncreaseBadgeEffect",
    TargetDecreaseBadgeEffect = "TargetDecreaseBadgeEffect",
    IncreaseConditionByStep = "IncreaseConditionByStep",
    IncreaseTargetConditionByStep = "IncreaseTargetConditionByStep",
    SelfAddPersistentDamage = "SelfAddPersistentDamage",
    TargetAddPersistentDamage = "TargetAddPersistentDamage",
    OriginEffect = "OriginEffect",
}

export type AttackTriggerType = "attack-roll" | "impulse-attack-roll"
export type DamageTriggerType = "damage-roll" | "damage-taken" | "healing-taken"
export type SkillTriggerType = "skill-check" | "perception-check"
export type ItemTriggerType = "use" | "postInfo" | "create-item" | "delete-item" | "pre-delete-item" | "pre-update-item"
export type TurnTriggerType = "start-turn" | "end-turn"

export type TriggerType =
    AttackTriggerType
    | DamageTriggerType
    | SkillTriggerType
    | ItemTriggerType
    | TurnTriggerType
    | "spell-cast"
    | "saving-throw"
    | "self-effect";

export type GroupType = 'action'
    | 'feat'
    | 'spell'
    | 'equipment'
    | 'npc'
    | 'other';