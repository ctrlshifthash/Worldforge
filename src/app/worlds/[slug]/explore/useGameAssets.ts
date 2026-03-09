'use client';

import { useEffect, useState } from 'react';
import { ASSET_PATHS, GRASSLAND_PATHS, VILLAGE_PATHS, NPC_PACK_PATHS } from '@/lib/tileAtlas';

export interface GameAssets {
  assets: HTMLImageElement;
  character: HTMLImageElement;
  houses: HTMLImageElement;
  market: HTMLImageElement;
  nature: HTMLImageElement;
  cobblestone: HTMLImageElement;
  cobblestoneGrey: HTMLImageElement;
  oldMan: HTMLImageElement;
  oldWoman: HTMLImageElement;
  youngMan: HTMLImageElement;
  youngWoman: HTMLImageElement;
  merchant: HTMLImageElement;
  merchantGeneral: HTMLImageElement;
  vegetableStall: HTMLImageElement;
  well: HTMLImageElement;
  campfire: HTMLImageElement;
  landingStage: HTMLImageElement;
  waterLily: HTMLImageElement;
  woodenFence: HTMLImageElement;
  bridge: HTMLImageElement;
  marbleFence: HTMLImageElement;
  // Grassland zone — core
  glPineTree: HTMLImageElement;
  glCampfire: HTMLImageElement;
  glShrine: HTMLImageElement;
  glEnemyFlag: HTMLImageElement;
  glDummy: HTMLImageElement;
  glVendor: HTMLImageElement;
  glOrcWarrior: HTMLImageElement;
  glOrcMage: HTMLImageElement;
  // Grassland zone — structures & props
  glCabin: HTMLImageElement;
  glTent1: HTMLImageElement;
  glTent2: HTMLImageElement;
  glThrone: HTMLImageElement;
  glAltar: HTMLImageElement;
  glWatchtower: HTMLImageElement;
  glDragonFossil: HTMLImageElement;
  glBarricade: HTMLImageElement;
  glBoneBig: HTMLImageElement;
  glLampPost: HTMLImageElement;
  glBarrel: HTMLImageElement;
  // Grassland zone — trees & vegetation
  glTree1: HTMLImageElement;
  glDeadTree: HTMLImageElement;
  glBush: HTMLImageElement;
  glVegetation: HTMLImageElement;
  glTrunk1: HTMLImageElement;
  glTrunk2: HTMLImageElement;
  // Grassland zone — rocks
  glRock1: HTMLImageElement;
  glRock2: HTMLImageElement;
  glRockSmall: HTMLImageElement;
  // Grassland zone — camp props
  glCrate: HTMLImageElement;
  glWoodLogBig: HTMLImageElement;
  glWoodLogMed: HTMLImageElement;
  glWeaponRack: HTMLImageElement;
  glCarriage: HTMLImageElement;
  glSpike: HTMLImageElement;
  glWoodenTable: HTMLImageElement;
  glWaterwell: HTMLImageElement;
  // Grassland zone — structures
  glStrongGateL: HTMLImageElement;
  glStrongGateR: HTMLImageElement;
  glStrongWall: HTMLImageElement;
  glCaveEntrance: HTMLImageElement;
  glStoneBridge: HTMLImageElement;
  // Grassland zone — signs & fences
  glSign: HTMLImageElement;
  glFence: HTMLImageElement;
  glFenceGate: HTMLImageElement;
  // Grassland zone — animated
  glButterfly: HTMLImageElement;
  glAnimLamp: HTMLImageElement;
  glChimneySmoke: HTMLImageElement;
  // Grassland zone — small animals
  glBird: HTMLImageElement;
  glDuck: HTMLImageElement;
  glFrog: HTMLImageElement;
  // Grassland zone — additional assets
  glOrcWarrior2: HTMLImageElement;
  glChestOpen: HTMLImageElement;
  glChestClose: HTMLImageElement;
  glCampfireSmoke: HTMLImageElement;
  glFlies: HTMLImageElement;
  glNatureParticles: HTMLImageElement;
  glEnemyFlag2: HTMLImageElement;
  glStrongVertical: HTMLImageElement;
  glFlower1: HTMLImageElement;
  glFlower2: HTMLImageElement;
  glFlower3: HTMLImageElement;
  glFlower4: HTMLImageElement;
  glMushroom1: HTMLImageElement;
  glMushroom2: HTMLImageElement;
  glTree2: HTMLImageElement;
  // Grassland zone — orc combat animations
  glOrcWarriorAtk: HTMLImageElement;
  glOrcWarriorHurt: HTMLImageElement;
  glOrcWarriorDeath: HTMLImageElement;
  glOrcWarrior2Atk: HTMLImageElement;
  glOrcWarrior2Hurt: HTMLImageElement;
  glOrcWarrior2Death: HTMLImageElement;
  glOrcMageAtk: HTMLImageElement;
  glOrcMageHurt: HTMLImageElement;
  glOrcMageDeath: HTMLImageElement;
  // Summer Village zone — new assets
  svVillageAssets: HTMLImageElement;
  svEnvironment: HTMLImageElement;
  svWoodenPath: HTMLImageElement;
  svStoneTiles: HTMLImageElement;
  svWallTiles: HTMLImageElement;
  svWaterDeep: HTMLImageElement;
  svWaterShallow: HTMLImageElement;
  svWaterShallowDirt: HTMLImageElement;
  svWaterfall: HTMLImageElement;
  svRockBrown: HTMLImageElement;
  svRockGrey: HTMLImageElement;
  svWaterLily2: HTMLImageElement;
  svWaterLily3: HTMLImageElement;
  // NPC packs
  npcTilemap: HTMLImageElement;
  sheepWhite: HTMLImageElement;
  sheepBrown: HTMLImageElement;
  warriorRun: HTMLImageElement;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

export function useGameAssets(): { assets: GameAssets | null; loading: boolean; error: string | null } {
  const [assets, setAssets] = useState<GameAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [
          assets, character, houses, market,
          nature, cobblestone, cobblestoneGrey,
          oldMan, oldWoman, youngMan, youngWoman,
          merchant, merchantGeneral, vegetableStall,
          well, campfire, landingStage, waterLily, woodenFence,
          bridge, marbleFence,
          glPineTree, glCampfire, glShrine, glEnemyFlag,
          glDummy, glVendor, glOrcWarrior, glOrcMage,
          glCabin, glTent1, glTent2, glThrone, glAltar,
          glWatchtower, glDragonFossil, glBarricade,
          glBoneBig, glLampPost, glBarrel,
          // New grassland assets
          glTree1, glDeadTree, glBush, glVegetation, glTrunk1, glTrunk2,
          glRock1, glRock2, glRockSmall,
          glCrate, glWoodLogBig, glWoodLogMed, glWeaponRack, glCarriage,
          glSpike, glWoodenTable, glWaterwell,
          glStrongGateL, glStrongGateR, glStrongWall, glCaveEntrance, glStoneBridge,
          glSign, glFence, glFenceGate,
          glButterfly, glAnimLamp, glChimneySmoke,
          glBird, glDuck, glFrog,
          glOrcWarrior2, glChestOpen, glChestClose,
          glCampfireSmoke, glFlies, glNatureParticles,
          glEnemyFlag2, glStrongVertical,
          glFlower1, glFlower2, glFlower3, glFlower4,
          glMushroom1, glMushroom2, glTree2,
          glOrcWarriorAtk, glOrcWarriorHurt, glOrcWarriorDeath,
          glOrcWarrior2Atk, glOrcWarrior2Hurt, glOrcWarrior2Death,
          glOrcMageAtk, glOrcMageHurt, glOrcMageDeath,
          svVillageAssets, svEnvironment, svWoodenPath, svStoneTiles, svWallTiles,
          svWaterDeep, svWaterShallow, svWaterShallowDirt, svWaterfall,
          svRockBrown, svRockGrey, svWaterLily2, svWaterLily3,
          npcTilemap, sheepWhite, sheepBrown, warriorRun,
        ] = await Promise.all([
          loadImage(ASSET_PATHS.assets),
          loadImage(ASSET_PATHS.character),
          loadImage(ASSET_PATHS.houses),
          loadImage(ASSET_PATHS.market),
          loadImage(ASSET_PATHS.nature),
          loadImage(ASSET_PATHS.cobblestone),
          loadImage(ASSET_PATHS.cobblestoneGrey),
          loadImage(ASSET_PATHS.oldMan),
          loadImage(ASSET_PATHS.oldWoman),
          loadImage(ASSET_PATHS.youngMan),
          loadImage(ASSET_PATHS.youngWoman),
          loadImage(ASSET_PATHS.merchant),
          loadImage(ASSET_PATHS.merchantGeneral),
          loadImage(ASSET_PATHS.vegetableStall),
          loadImage(ASSET_PATHS.well),
          loadImage(ASSET_PATHS.campfire),
          loadImage(ASSET_PATHS.landingStage),
          loadImage(ASSET_PATHS.waterLily),
          loadImage(ASSET_PATHS.woodenFence),
          loadImage(ASSET_PATHS.bridge),
          loadImage(ASSET_PATHS.marbleFence),
          loadImage(GRASSLAND_PATHS.pineTree),
          loadImage(GRASSLAND_PATHS.glCampfire),
          loadImage(GRASSLAND_PATHS.shrine),
          loadImage(GRASSLAND_PATHS.enemyFlag),
          loadImage(GRASSLAND_PATHS.trainingDummy),
          loadImage(GRASSLAND_PATHS.vendor),
          loadImage(GRASSLAND_PATHS.orcWarriorIdle),
          loadImage(GRASSLAND_PATHS.orcMageIdle),
          loadImage(GRASSLAND_PATHS.cabin),
          loadImage(GRASSLAND_PATHS.tent1),
          loadImage(GRASSLAND_PATHS.tent2),
          loadImage(GRASSLAND_PATHS.throne),
          loadImage(GRASSLAND_PATHS.altar),
          loadImage(GRASSLAND_PATHS.watchtower),
          loadImage(GRASSLAND_PATHS.dragonFossil),
          loadImage(GRASSLAND_PATHS.barricade),
          loadImage(GRASSLAND_PATHS.boneBig),
          loadImage(GRASSLAND_PATHS.lampPost),
          loadImage(GRASSLAND_PATHS.glBarrel),
          // New grassland assets
          loadImage(GRASSLAND_PATHS.glTree1),
          loadImage(GRASSLAND_PATHS.glDeadTree),
          loadImage(GRASSLAND_PATHS.glBush),
          loadImage(GRASSLAND_PATHS.glVegetation),
          loadImage(GRASSLAND_PATHS.glTrunk1),
          loadImage(GRASSLAND_PATHS.glTrunk2),
          loadImage(GRASSLAND_PATHS.glRock1),
          loadImage(GRASSLAND_PATHS.glRock2),
          loadImage(GRASSLAND_PATHS.glRockSmall),
          loadImage(GRASSLAND_PATHS.glCrate),
          loadImage(GRASSLAND_PATHS.glWoodLogBig),
          loadImage(GRASSLAND_PATHS.glWoodLogMed),
          loadImage(GRASSLAND_PATHS.glWeaponRack),
          loadImage(GRASSLAND_PATHS.glCarriage),
          loadImage(GRASSLAND_PATHS.glSpike),
          loadImage(GRASSLAND_PATHS.glWoodenTable),
          loadImage(GRASSLAND_PATHS.glWaterwell),
          loadImage(GRASSLAND_PATHS.glStrongGateL),
          loadImage(GRASSLAND_PATHS.glStrongGateR),
          loadImage(GRASSLAND_PATHS.glStrongWall),
          loadImage(GRASSLAND_PATHS.glCaveEntrance),
          loadImage(GRASSLAND_PATHS.glStoneBridge),
          loadImage(GRASSLAND_PATHS.glSign),
          loadImage(GRASSLAND_PATHS.glFence),
          loadImage(GRASSLAND_PATHS.glFenceGate),
          loadImage(GRASSLAND_PATHS.glButterfly),
          loadImage(GRASSLAND_PATHS.glAnimLamp),
          loadImage(GRASSLAND_PATHS.glChimneySmoke),
          loadImage(GRASSLAND_PATHS.glBird),
          loadImage(GRASSLAND_PATHS.glDuck),
          loadImage(GRASSLAND_PATHS.glFrog),
          // Additional assets
          loadImage(GRASSLAND_PATHS.glOrcWarrior2),
          loadImage(GRASSLAND_PATHS.glChestOpen),
          loadImage(GRASSLAND_PATHS.glChestClose),
          loadImage(GRASSLAND_PATHS.glCampfireSmoke),
          loadImage(GRASSLAND_PATHS.glFlies),
          loadImage(GRASSLAND_PATHS.glNatureParticles),
          loadImage(GRASSLAND_PATHS.glEnemyFlag2),
          loadImage(GRASSLAND_PATHS.glStrongVertical),
          loadImage(GRASSLAND_PATHS.glFlower1),
          loadImage(GRASSLAND_PATHS.glFlower2),
          loadImage(GRASSLAND_PATHS.glFlower3),
          loadImage(GRASSLAND_PATHS.glFlower4),
          loadImage(GRASSLAND_PATHS.glMushroom1),
          loadImage(GRASSLAND_PATHS.glMushroom2),
          loadImage(GRASSLAND_PATHS.glTree2),
          // Orc combat animations
          loadImage(GRASSLAND_PATHS.glOrcWarriorAtk),
          loadImage(GRASSLAND_PATHS.glOrcWarriorHurt),
          loadImage(GRASSLAND_PATHS.glOrcWarriorDeath),
          loadImage(GRASSLAND_PATHS.glOrcWarrior2Atk),
          loadImage(GRASSLAND_PATHS.glOrcWarrior2Hurt),
          loadImage(GRASSLAND_PATHS.glOrcWarrior2Death),
          loadImage(GRASSLAND_PATHS.glOrcMageAtk),
          loadImage(GRASSLAND_PATHS.glOrcMageHurt),
          loadImage(GRASSLAND_PATHS.glOrcMageDeath),
          // Summer Village zone
          loadImage(VILLAGE_PATHS.villageAssets),
          loadImage(VILLAGE_PATHS.environment),
          loadImage(VILLAGE_PATHS.woodenPath),
          loadImage(VILLAGE_PATHS.stoneTiles),
          loadImage(VILLAGE_PATHS.wallTiles),
          loadImage(VILLAGE_PATHS.waterDeep),
          loadImage(VILLAGE_PATHS.waterShallow),
          loadImage(VILLAGE_PATHS.waterShallowDirt),
          loadImage(VILLAGE_PATHS.waterfall),
          loadImage(VILLAGE_PATHS.rockBrown),
          loadImage(VILLAGE_PATHS.rockGrey),
          loadImage(VILLAGE_PATHS.waterLily2),
          loadImage(VILLAGE_PATHS.waterLily3),
          // NPC packs
          loadImage(NPC_PACK_PATHS.tilemap),
          loadImage(NPC_PACK_PATHS.sheepWhite),
          loadImage(NPC_PACK_PATHS.sheepBrown),
          loadImage(NPC_PACK_PATHS.warriorRun),
        ]);

        if (!cancelled) {
          setAssets({
            assets, character, houses, market, nature, cobblestone,
            cobblestoneGrey, oldMan, oldWoman, youngMan, youngWoman,
            merchant, merchantGeneral, vegetableStall,
            well, campfire, landingStage, waterLily, woodenFence,
            bridge, marbleFence,
            glPineTree, glCampfire, glShrine, glEnemyFlag,
            glDummy, glVendor, glOrcWarrior, glOrcMage,
            glCabin, glTent1, glTent2, glThrone, glAltar,
            glWatchtower, glDragonFossil, glBarricade,
            glBoneBig, glLampPost, glBarrel,
            glTree1, glDeadTree, glBush, glVegetation, glTrunk1, glTrunk2,
            glRock1, glRock2, glRockSmall,
            glCrate, glWoodLogBig, glWoodLogMed, glWeaponRack, glCarriage,
            glSpike, glWoodenTable, glWaterwell,
            glStrongGateL, glStrongGateR, glStrongWall, glCaveEntrance, glStoneBridge,
            glSign, glFence, glFenceGate,
            glButterfly, glAnimLamp, glChimneySmoke,
            glBird, glDuck, glFrog,
            glOrcWarrior2, glChestOpen, glChestClose,
            glCampfireSmoke, glFlies, glNatureParticles,
            glEnemyFlag2, glStrongVertical,
            glFlower1, glFlower2, glFlower3, glFlower4,
            glMushroom1, glMushroom2, glTree2,
            glOrcWarriorAtk, glOrcWarriorHurt, glOrcWarriorDeath,
            glOrcWarrior2Atk, glOrcWarrior2Hurt, glOrcWarrior2Death,
            glOrcMageAtk, glOrcMageHurt, glOrcMageDeath,
            svVillageAssets, svEnvironment, svWoodenPath, svStoneTiles, svWallTiles,
            svWaterDeep, svWaterShallow, svWaterShallowDirt, svWaterfall,
            svRockBrown, svRockGrey, svWaterLily2, svWaterLily3,
            npcTilemap, sheepWhite, sheepBrown, warriorRun,
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load assets');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { assets, loading, error };
}
