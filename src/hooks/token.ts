import {RefreshTokenHook} from "./index";
import {refreshEffects, refreshPosition, refreshPositionOwner} from "./override/drawAdditionalLine";

export class DrawRefreshTokenHook implements RefreshTokenHook {
    async listen(token: Token, flags: object): Promise<void> {
        await refreshPosition(token, flags);
        await refreshPositionOwner(token, flags);
        await refreshEffects(token, flags);
    }
}