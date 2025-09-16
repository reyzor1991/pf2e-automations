export function castSpell(wrapped: Function, ...args: any[]) {
    const spell = args[0];
    const data = args[1];
    if (spell?.type === "spell" && ["extend-boost", "fortissimo-composition", "lingering-composition"].includes(spell?.slug)) {
        data.consume = false;
    }

    //@ts-ignore
    return wrapped.call(this, ...args);
}