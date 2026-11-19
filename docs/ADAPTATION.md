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
- **Running doesn't heal monsters.** Run from a fight and come back, and the monsters have the
  HP you left them on; the dead stay dead.
- **Turn undead**, the newest rulebook rule, is a fight action and a choice in the vault.
- **Spells.** Magicians have the rulebook's whole spell list and a slot at every level. Where a
  spell's effect is open to interpretation, the gamebook settles it:
  - In fights, spells that hit a space hit every monster in the fight. Monsters don't make tests,
    so where a spell asks for a monster's saving throw (Grease, Deluge), it works on a coin toss
    or a d4. Lightning storm only works in fights marked as outdoors. Fireball cast while engaged
    catches you in the blast too.
  - Judgement converts a monster when its 8d8 would have killed it, and otherwise deals the damage.
  - Divine light lights the next four dark places. A consecrated weapon stays magic (+1).
    Conjuration makes a mundane item, which is yours to keep.
  - A divine critical failure always casts the opposite spell at the same target, so a Heal on
    yourself becomes a Harm on yourself. Every divine choice in the book has its own backfire.
  - Spells with no use in a fight or from the adventure sheet are offered where the story gives
    them one. A spell you don't know isn't offered at all, rather than shown locked.

Fights with no way round them were tuned with `tools/duels.mjs` so a fresh level 1 scumbag
wins roughly 9 in 10. The boss and the vault guards are harder, and each has peaceful
alternatives.
- **Survivors carry on.** A scumbag who gets home keeps their level, stats, items and leftover gold
  for the next adventure, with fresh spell slots and full AP. HP carries over: they heal in town,
  at the inn or in a ditch.
- **Mundane items are cheap in town.** Between adventures, mundane items can be swapped and
  restocked for nothing, as the rulebook says they're trivial to acquire. Significant items cost
  gold, and loot sells to the fence.
- **Levels are recommendations.** Adventures are tuned with bots at the lowest recommended level;
  a scumbag carried over from earlier adventures will usually be a level or two ahead.
- **Over-qualified scumbags are paid less.** For each level a scumbag is above the top of an
  adventure's band, they lose half of what's left of their profit from it (on drinks, so that
  Scumbag Town will take them seriously again), and loot picked up there fetches half at the fence.
  Without this, clearing every job in each band before moving on (three per band) roughly doubles
  a scumbag's level by the last band and makes it trivial (`node tools/campaign.mjs`). With it, a
  scumbag who does everything arrives at the last band a level or two ahead, not ten.
