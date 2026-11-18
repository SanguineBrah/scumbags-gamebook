# Adapting Scumbags! to a solo gamebook

The rules are the rulebook's, with these changes for a hero who adventures alone.

- **+10 HP for a lone hero** (`HERO_HP_BONUS`). The rulebook's d6+5 assumes a party sharing
  the monsters' attention. Without it, a level 1 fighter lost about a third of even fights
  against level 1–2 monsters in the bot duels.
- **One starting significant item** (healing potion, alchemist's fire, clotting salve or vial
  of acid), like the potion choice at the start of a classic gamebook. Casters in
  particular are poor in melee and need something for their first fight.
- **Ranged scumbags keep a dagger**, so they aren't stuck shooting at d20 while engaged.
- **Darkness** raises every test to at least a d12, following the rulebook's dim-lighting example.
- **Distance** is tracked in bands (engaged, short, medium…). Moving one band and acting in the
  same turn is allowed, so a ranged scumbag can fall back and shoot.
- **Relentless** monsters (animated legs) get back up two rounds after being dropped unless the
  killing blow was fire or a critical hit; attacking them while they're down pulps them.
- **Clotting salve** stops you bleeding out and puts you back on 1 HP, since nobody else is
  there to revive you.
- **Ten minutes' rest** after each fight restores AP.
- **Turn undead**, the newest rulebook rule, is a fight action and a choice in the vault.

Fights with no way round them were tuned with `tools/duels.mjs` so a fresh level 1 scumbag
wins roughly 9 in 10. The boss and the vault guards are harder, and each has peaceful
alternatives.
- **Survivors carry on.** A scumbag who gets home keeps their level, stats, items and leftover gold
  for the next adventure, starting it rested with full HP and fresh spell slots.
- **Levels are recommendations.** Adventures are tuned with bots at the lowest recommended level;
  a scumbag carried over from earlier adventures will usually be a level or two ahead.
