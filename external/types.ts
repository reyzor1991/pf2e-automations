import {Socket} from 'socket.io';

export {};

declare global {

    interface String {
        capitalize(): string;
    }

    function loadTemplates(links: string[]): Promise<void>;

    function fromUuid(value?: string): Promise<Item | any>;

    function fromUuidSync(value: string): Item | undefined;

    function renderTemplate(path: string, data?: object): Promise<string>;

    class Hooks {
        static on(event: string, callback: () => void): number;
        static on(event: string, callback: (t: Token, r: object) => void): number;
        static on(event: string, callback: (combat: Combat) => void): number;
        static on(event: string, callback: (combatant: Combatant) => void): number;
        static on(event: string, callback: (t: string, r: object) => void): number;
        static on(event: string, callback: (app: object, html: JQuery<HTMLElement>) => void): number;
        static on(event: string, callback: (app: object, html: JQuery<HTMLElement>, data: object) => void): number;
        static on(event: string, callback: (message: ChatMessage, html: HTMLElement) => void): number;
        static on(event: string, callback: (message: ChatMessage, html: JQuery<HTMLElement>) => void): number;
        static on(event: string, callback: (message: ChatMessage, user: User, options: object, userId: string) => void): number;
        static on(event: string, callback: (message: ChatMessage, data: object, options: object, userId: string) => void): number;
        static on(event: string, callback: (actor: Actor, data: object, options: object) => void): number;
        static on(event: string, callback: (item: Item, data: object, options: object, id: string) => void): number;
        static on(event: string, callback: (item: Item, data: object, userId: string) => void): number;
        static on(event: string, callback: (combatant: Combatant, encounter: Combat, userId: string) => void): number;
    }

    class Roll {
        constructor(value: string);

        name: string;
        total: number;
        terms: {
            rolls: { total: number }[];
            results: { active: boolean, result: number }[];
        }[];
        instances: {
            dice: {
                _evaluated: boolean;
                evaluate: () => Promise<void>;
                _faces: number;
                results: {
                    result: number;
                }[];
            }[];
            _evaluated: boolean;
            evaluate: () => Promise<void>;
        }[]


        _evaluated: boolean;
        evaluate: () => Promise<void>;
        resetFormula: () => Promise<void>;
    }

    class GameSettings {
        register(
            module: string,
            key: string,
            data: object,
        ): void;

        registerMenu(
            module: string,
            key: string,
            data: object,
        ): void;

        set(module: string, key: string, value: any): Promise<void>;

        get(module: string, key: string): any;
    }

    class Collection<T> extends Array<T> {
        get(key: string, opts?: { strict: boolean }): T

        contents: T[];
    }

    class Users extends Collection<User> {
        activeGM: User;
    }

    class Items extends Collection<Item> {
    }

    class Actors extends Collection<Actor> {
    }

    class Messages extends Collection<ChatMessage> {
    }

    class Combatant {
        actor: Actor;
        token: Token;
        name: string;
        initiative: number;
    }

    class Combat {
        active: boolean;
        current: {
            turn: number;
        }
        turns: Combatant[];
    }

    class Module {
        active: boolean;
    }

    class Modules extends Collection<Module> {

    }

    class Game {
        settings: GameSettings;
        users: Users;
        modules: Modules;
        messages: Messages;
        userId: string;
        actors: Actors;
        user: User;
        i18n: {
            localize(value: string): string;
        };
        pf2e: {
            Check: {
                roll: (...args: any[]) => Promise<void>;
            }
            Predicate: {
                test: (predicate: (string | object)[], data: Set<string>) => boolean;
            }
            ConditionManager: {
                getCondition(slug: string, data: {}): Condition | undefined;
                updateConditionValue(id: string, actor: Actor, value: number): Promise<void>;
            }
            system: {
                sluggify: (value: string) => string;
            }
        };
        socket: Socket;
        combat: Combat;
        time: {
            worldTime: number;
        }
    }

    class Config {
        Canvas: {
            polygonBackends: {
                move: {
                    testCollision: (c: object, c1: object, data: object) => boolean;
                }
            }
        }
        Dice: {
            rolls: Roll[];
        };
        Item: {
            documentClass: {
                createDocuments(object: object, data: { parent: any }): Promise<Item[]>;
            }
        }
        PF2E: {
            ancestryTraits: { [key: string]: string; },
            actionTraits: { [key: string]: string; },
            classTraits: { [key: string]: string; },
            effectTraits: { [key: string]: string; },
            timeUnits: { [key: string]: string; },
            resistanceTypes: { [key: string]: string; },
        }
    }

    class UINotifications {
        info(message: string): void;

        warn(message: string): void;

        error(message: string): void;
    }

    class UI {
        notifications: UINotifications;
        chat: {
            element: JQuery<HTMLElement>;
        }
    }

    class FoundryUtils {
        parseHTML(value: string): HTMLElement;

        deepClone<T>(any: T): T;
        deepClone<T>(any: T, data: { strict: boolean }): T;

        timeSince(any: object): string;

        getProperty(obj: object, val: string): string;

        debounce(fn: (args: any[]) => any, time: number): any;

        mergeObject(
            original: object,
            other?: object,
        ): object;

        randomID(): string;
    }

    class Foundry {
        utils: FoundryUtils;
        applications: {
            api: {
                HandlebarsApplicationMixin: Function;
                ApplicationV2: Function;
                DialogV2: {
                    confirm: (a: string) => Promise<boolean | undefined>;
                };
            }
        }
    }

    class FoundryObject {
        canUserModify: (user: User, action: string) => boolean;

        update(data: object): Promise<void>;

        id: string;

        getFlag: (core: string, name: string) => any;
    }

    class Scene {
        tokens: Token[];
    }

    class Token {
        uuid: string;
        actor?: Actor;
        scene: Scene;
        texture: {
            src: string;
        };
        center: { x: number, y: number };
    }

    class StatisticRollParams {
        dc: { value: number | undefined, label?: string };
        item?: Item;
        origin?: Actor;
        extraRollOptions?: string[];
    }

    class Statistic {
        roll: (roll: StatisticRollParams) => Promise<{ degreeOfSuccess: number }>
    }

    class Party extends Actor {
        members: Actor[];
    }

    class Effect extends Item {
        decrease: () => void;
        increase: () => void;
        badge: { [key: string]: string } & { value: number };
    }

    class Actor extends FoundryObject {

        isOfType(type: string): boolean;

        deleteEmbeddedDocuments(type: string, data: string[]): Promise<void>;

        uuid: string;
        name: string;
        alliance: string;
        hitPoints: {
            value: number;
            max: number;
        };
        level: number;
        items: Items;

        signature: string;

        getRollOptions(): string[]

        toggleRollOption(domain: string, value: string): Promise<void>;

        rollOptions: {
            all: { [key: string]: string };
        };

        getSelfRollOptions(prefix: string): string[]

        abilities: { [key: string]: { mod: number } };
        attributes: { classDC: { value: number } };

        createEmbeddedDocuments: (type: string, data: object[]) => Promise<object[]>;

        getCondition: (name: string) => Condition | undefined;
        decreaseCondition: (slug: string, data?: { forceRemove?: boolean }) => Promise<object>;
        increaseCondition: (slug: string, data: { max?: number, value?: number }) => Promise<object>;


        saves: { [key: string]: Statistic }
        itemTypes: { [key: string]: Items } & { condition: Condition[], effect: Effect[], feat: Items, armor: Collection<Armor> }

        parties: Set<Party> & { map<U>(callbackfn: (value: Party, index: number, array: Party[]) => U, thisArg?: any): U[] }

        isEnemyOf(actor: Actor): boolean;

        isAllyOf(actor: Actor): boolean;

        system: {
            exploration: string[];
        }

        combatant: Combatant;
    }

    class User {
        id: string;
        uuid: string;
        name: string;
        targets: Set<Token> & { first(): Token };
        isGM: boolean;
    }

    class Weapon extends Item {
        system: ItemSystem & {
            runes: {
                property: string[];
            }
        };
    }

    class ItemSystem {
        exploration: string[];
        context?: {
            origin?: {
                item?: string
                actor?: string
            };
        };
    }

    class Condition extends Item {
        value: number;
        isLocked: boolean;
        active: boolean;
    }


    class Armor extends Item {
        isEquipped: boolean;
        isInvested: boolean;

        system: ItemSystem & { runes: { property: string[] } };
    }

    class Item extends FoundryObject {
        getRollOptions(): string[];

        getOriginData(): {
            rollOptions: string[];
        };

        type: string;

        origin?: Actor;
        actor?: Actor;

        sourceId: string;
        uuid: string;
        name: string;
        level: number;
        slug: string;
        spellcasting: { tradition: string, attribute: string }

        system: ItemSystem;

        isHeld: boolean;

        delete: () => Promise<void>;

        rules: { key: string, ignored: boolean, type?: string, uuid?: string, }[];
        toObject: () => { [key: string]: any };
    }

    class ChatMessage extends FoundryObject {
        content: string;
        isAuthor: boolean;
        isCheckRoll: boolean;
        speaker: any;
        target?: {
            actor: Actor;
            token: Token;
        }
        rolls: Roll[];
        actor?: Actor;
        token?: Token;
        item: Item;
        flags: {
            pf2e?: {
                casting?: {}
                appliedDamage?: {
                    isHealing: boolean
                }
                origin?: {
                    actor?: Actor;
                    type?: string;
                    sourceId?: string;
                    rollOptions?: string[];
                }
                context?: {
                    dc?: {
                        label: string
                    },
                    options?: string[]
                    domains?: string[]
                    type?: string;
                    outcome?: string;
                };
            }
        }

        static create(data: object, options?: object): Promise<ChatMessage>;

        static getWhisperRecipients(type: string): Users;
    }

    type SocketRequest = {};

    class Macro {
        constructor(data: object);

        ownership: {
            default: number;
        };
        execute: () => Promise<void>;
    }

    class FormDataExtended extends FormData {
        constructor(form: HTMLElement);

        readonly object: Record<string, unknown>;
    }

    class Canvas {
        ready: boolean;
        ping: (center: object) => void;
    }

    namespace globalThis {
        let SocketInterface: {
            dispatch(eventName: string, request: SocketRequest): Promise<any>;
        };
        let foundry: Foundry;
        let ui: UI;
        let game: Game;
        let CONFIG: Config;
        let canvas: Canvas;
        let SettingsConfig: {
            reloadConfirm(opts: {}): void;
        };
    }
}