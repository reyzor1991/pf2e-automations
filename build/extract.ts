import {extractPack} from "@foundryvtt/foundryvtt-cli";

// Extract a NeDB compendium pack.
let documentType = "Item"
await extractPack("packs/db/effects.db", "packs/src/", {nedb: true, documentType});
