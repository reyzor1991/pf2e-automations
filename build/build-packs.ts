import { compilePack } from "@foundryvtt/foundryvtt-cli";

// Compile a LevelDB compendium pack.
await compilePack("packs/actions", "dist/packs/actions");
await compilePack("packs/effects", "dist/packs/effects");
await compilePack("packs/equipment", "dist/packs/equipment");
