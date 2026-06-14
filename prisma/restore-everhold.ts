// One-off, non-destructive restore of the Everhold demo world.
// Run with: npx tsx prisma/restore-everhold.ts
import { restoreEverhold } from './seed';

restoreEverhold()
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
