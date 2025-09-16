import {getSetting} from "../../helpers";

export async function drawAdditionalLine(wrapped: Function, ...args: any[]) {
    //@ts-ignore
    wrapped.call(this, ...args);

    //@ts-ignore
    this.layer.children.filter(l => l.specialLayer).forEach(l => {
        l?.destroy({children: true})
    });

    if (!canvas.tokens.highlightObjects) {
        return
    }
    //@ts-ignore
    let actor = this.actor as Actor;
    if (!actor) {
        return
    }
    //@ts-ignore
    if (!this.visible) {
        return
    }
    const effects = actor.itemTypes?.effect?.map(e => {
        if (!e.system?.context?.origin?.token) {
            return null
        }
        const rr = e.system.rules.find(r => r.key === 'GrantItem' && Object.keys(CONFIG.PF2E.conditionTypes).includes(r?.flag?.replace(/([a-z])([A-Z])/g, '$1-$2')?.toLowerCase()))
        if (!rr) return null;

        return {name: rr.flag.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), e}
    }).filter(b => !!b).reduce(function (map, obj) {
        map[obj.e.system?.context?.origin?.token] ??= {};
        map[obj.e.system?.context?.origin?.token].names ??= []
        map[obj.e.system?.context?.origin?.token].names.push(obj.name)
        return map;
    }, {});
    if (!Object.keys(effects).length) {
        return
    }

    for (const uuid in effects) {
        const tokenOwnerOfEffect = (await fromUuid(uuid))?.object
        if (!tokenOwnerOfEffect) {
            continue
        }

        //@ts-ignore
        this.layer.addChild(getLayerForEffect(this, tokenOwnerOfEffect, {conditions: effects[uuid].names}));
    }
}


function getLayerForEffect(token: Token, tokenOwnerOfEffect: Token, conditions) {
    const color = 'red';

    const _layer = new PIXI.Graphics();
    _layer.specialLayer = true;

    _layer
        .lineStyle(Math.round(CONFIG.Canvas.objectBorderThickness * 1.5), 0x000000, 0.5)
        .moveTo(token.center.x, token.center.y)
        .lineTo(tokenOwnerOfEffect.center.x, tokenOwnerOfEffect.center.y);
    _layer
        .lineStyle(CONFIG.Canvas.objectBorderThickness, color, 0.5)
        .moveTo(token.center.x, token.center.y)
        .lineTo(tokenOwnerOfEffect.center.x, tokenOwnerOfEffect.center.y);
    _layer
        .beginFill(color)
        .lineStyle(1, 0x000000)
        .drawCircle(token.center.x, token.center.y, CONFIG.Canvas.objectBorderThickness);
    _layer
        .beginFill(color)
        .lineStyle(1, 0x000000)
        .drawCircle(tokenOwnerOfEffect.center.x, tokenOwnerOfEffect.center.y, CONFIG.Canvas.objectBorderThickness);

    _layer.addChild(getTextLayer(token, tokenOwnerOfEffect, color, conditions));
    _layer.addChild(createTriangle(tokenOwnerOfEffect, token));
    return _layer
}


function getTextLayer(token, owner, color, {conditions, label}) {
    const labelText = label ? label : conditions.map(c => game.i18n.localize(CONFIG.PF2E.conditionTypes[c])).join(', ');

    const mid_x = Math.round((token.center.x + owner.center.x) / 2);
    const mid_y = Math.round((token.center.y + owner.center.y) / 2);

    const vect_x = owner.center.x - token.center.x;
    const vect_y = owner.center.y - token.center.y;

    const perp_vect_x = vect_x <= -vect_x ? -vect_y : vect_y;
    const perp_vect_y = vect_x <= -vect_x ? vect_x : -vect_x;

    const offsetScale = 30 / Math.sqrt(perp_vect_x ** 2 + perp_vect_y ** 2);
    const perp_x = mid_x + Math.round(perp_vect_x * offsetScale);
    const perp_y = mid_y + Math.round(perp_vect_y * offsetScale);

    const style = CONFIG.canvasTextStyle.clone();
    const dimensions = canvas.dimensions;
    style.fontSize = dimensions.size >= 200 ? 28 : dimensions.size < 50 ? 20 : 24;
    style.fill = color;
    style.stroke = 0x000000;

    const text = new foundry.canvas.containers.PreciseText(labelText, style);
    text.anchor.set(0.5, 0.5);

    // Rotate text to match line, ensuring it is not upside-down
    let rotation = Math.atan2(vect_y, vect_x);
    if (rotation > Math.PI / 2) {
        rotation = rotation - Math.PI;
    } else if (rotation < -Math.PI / 2) {
        rotation = rotation + Math.PI;
    }
    text.rotation = rotation;

    text.position.set(perp_x, perp_y);

    return text
}


function createTriangle(owner, token) {
    const vect_x = token.center.x - owner.center.x;
    const vect_y = token.center.y - owner.center.y;

    const triangle = new PIXI.Graphics();

    triangle.x = token.center.x;
    triangle.y = token.center.y;

    const triangleWidth = 30;

    // draw triangle
    triangle.beginFill(0xFF0000, 1);
    triangle.lineStyle(0, 0xFF0000, 1);
    triangle.moveTo(0, 0);
    triangle.lineTo(-triangleWidth, triangleWidth / 2);
    triangle.lineTo(-triangleWidth, -triangleWidth / 2);
    triangle.endFill();

    const rotation = Math.atan2(vect_y, vect_x);

    triangle.rotation = rotation;

    const perp_vect_x = vect_x <= -vect_x ? -vect_y : vect_y;
    const perp_vect_y = vect_x <= -vect_x ? vect_x : -vect_x;

    const mid_x = Math.round((token.center.x + owner.center.x) / 2);
    const mid_y = Math.round((token.center.y + owner.center.y) / 2);

    const offsetScale = 0
    const perp_x = mid_x + Math.round(perp_vect_x * offsetScale);
    const perp_y = mid_y + Math.round(perp_vect_y * offsetScale);

    triangle.position.set(perp_x, perp_y);

    return triangle;
}


export async function refreshPosition(token, flags) {
    if (getSetting("showEffectRelationship") !== 'always') {
        return
    }
    if (!token.actor || !token.visible || !flags.refreshPosition) {
        return
    }

    const lll = canvas.interface.children.filter(l => l.tokenId === token.document.uuid)
    if (!lll.length) {
        return
    }

    for (const layer of lll) {
        const tokenOwnerOfEffect = (await fromUuid(layer.tokenOwnerId))?.object
        if (!tokenOwnerOfEffect) {
            continue
        }
        const label = layer.children[0].text;
        layer.clear();
        layer.removeChildren();
        drawConnection(layer, token, tokenOwnerOfEffect, {label});
    }
}

export async function refreshPositionOwner(tokenOwnerOfEffect, flags) {
    if (getSetting("showEffectRelationship") !== 'always') {
        return
    }
    if (!tokenOwnerOfEffect.actor || !tokenOwnerOfEffect.visible || !flags.refreshPosition) {
        return
    }

    const lll = canvas.interface.children.filter(l => l.tokenOwnerId === tokenOwnerOfEffect.document.uuid)
    if (!lll.length) {
        return
    }

    for (const layer of lll) {
        const label = layer.children[0].text;
        layer.clear();
        layer.removeChildren();
        const token = (await fromUuid(layer.tokenId))?.object
        if (!token) {
            continue
        }
        drawConnection(layer, token, tokenOwnerOfEffect, {label});
    }
}

export async function refreshEffects(token, flags) {
    if (getSetting("showEffectRelationship") !== 'always') {
        return
    }
    if (!token.actor || !token.visible || !flags.redrawEffects) {
        return
    }

    const effects = token.actor.itemTypes?.effect?.map(e => {
        if (!e.system?.context?.origin?.token) {
            return null
        }
        const rr = e.system.rules.find(r => r.key === 'GrantItem' && Object.keys(CONFIG.PF2E.conditionTypes).includes(r?.flag?.replace(/([a-z])([A-Z])/g, '$1-$2')?.toLowerCase()))
        if (!rr) return null;

        return {name: rr.flag.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), e}
    }).filter(b => !!b).reduce(function (map, obj) {
        map[obj.e.system?.context?.origin?.token] ??= {};
        map[obj.e.system?.context?.origin?.token].names ??= []
        map[obj.e.system?.context?.origin?.token].names.push(obj.name)
        return map;
    }, {});

    canvas.interface.children.filter(l => l.tokenId === token.document.uuid).forEach(l => {
        l?.destroy({children: true})
    });

    for (const uuid in effects) {
        const tokenOwnerOfEffect = (await fromUuid(uuid))?.object
        if (!tokenOwnerOfEffect) {
            continue
        }

        const _layer = new PIXI.Graphics();
        _layer._zIndex = 300;
        _layer.specialLayer = true;
        _layer.tokenId = token.document.uuid;
        _layer.tokenOwnerId = tokenOwnerOfEffect.document.uuid;

        canvas.interface.addChild(_layer)

        drawConnection(_layer, token, tokenOwnerOfEffect, {conditions: effects[uuid].names});

    }
}

function drawConnection(_layer, token, tokenOwnerOfEffect, {conditions, label}) {
    const color = 'red';

    _layer
        .lineStyle(Math.round(CONFIG.Canvas.objectBorderThickness * 1.5), 0x000000, 0.5)
        .moveTo(token.center.x, token.center.y)
        .lineTo(tokenOwnerOfEffect.center.x, tokenOwnerOfEffect.center.y);
    _layer
        .lineStyle(CONFIG.Canvas.objectBorderThickness, color, 0.5)
        .moveTo(token.center.x, token.center.y)
        .lineTo(tokenOwnerOfEffect.center.x, tokenOwnerOfEffect.center.y);
    _layer
        .beginFill(color)
        .lineStyle(1, 0x000000)
        .drawCircle(token.center.x, token.center.y, CONFIG.Canvas.objectBorderThickness);
    _layer
        .beginFill(color)
        .lineStyle(1, 0x000000)
        .drawCircle(tokenOwnerOfEffect.center.x, tokenOwnerOfEffect.center.y, CONFIG.Canvas.objectBorderThickness);

    _layer.addChild(getTextLayer(token, tokenOwnerOfEffect, color, {conditions, label}));
    _layer.addChild(createTriangle(tokenOwnerOfEffect, token));
}
