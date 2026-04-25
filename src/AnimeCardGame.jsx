import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

// ─── AnimeCardGame.jsx ────────────────────────────────────────────────────────
// Full anime card collecting + battle game
// Add to App.jsx and render on page "animecards"

// ── Card Data ─────────────────────────────────────────────────────────────────
const ANIME_CHARACTERS = [
  // [id, name, series, type, atk, def, hp, ability, abilityDesc, rarity, element]
  // ICONIC (1%)
  ["gc01","Goku (Ultra Instinct)","Dragon Ball","Fighter",98,88,200,"Ultra Instinct","Dodge all attacks this turn with 70% chance","Iconic","Fire"],
  ["gc02","Naruto (Baryon Mode)","Naruto","Fighter",97,82,195,"Baryon Burn","Deal 3x damage, lose 15HP after","Iconic","Wind"],
  ["gc03","Saitama","One Punch Man","Fighter",99,70,180,"One Punch","Instantly KO any enemy under 50% HP","Iconic","Lightning"],
  ["gc04","Monkey D. Luffy (Gear 5)","One Piece","Fighter",96,85,200,"Nika Awakening","Double all damage for 2 turns","Iconic","Lightning"],
  ["gc05","Itachi Uchiha","Naruto","Mage",90,80,175,"Tsukuyomi","Skip opponent's next turn, deal 40 damage","Iconic","Shadow"],
  // MYSTIC (3%)
  ["mc01","Vegeta (Super Saiyan Blue)","Dragon Ball","Fighter",92,84,185,"Final Flash","Charge turn, then deal 80 damage","Mystic","Fire"],
  ["mc02","Sasuke Uchiha (Rinnegan)","Naruto","Mage",91,78,175,"Amenotejikara","Switch places with opponent, deal 35 damage","Mystic","Shadow"],
  ["mc03","Levi Ackermann","Attack on Titan","Fighter",88,75,165,"Thunder Slash","Hit 4 times rapidly, 20 damage each","Mystic","Wind"],
  ["mc04","Killua Zoldyck","HxH","Fighter",87,72,160,"Godspeed","Gain +40 speed, auto-dodge next attack","Mystic","Lightning"],
  ["mc05","Erza Scarlet","Fairy Tail","Fighter",89,86,178,"Heaven's Wheel","Deal 60 damage, gain 20 armor","Mystic","Holy"],
  ["mc06","Gojo Satoru","Jujutsu Kaisen","Mage",95,90,185,"Infinity","Block all damage for 1 turn","Mystic","Holy"],
  ["mc07","Ryomen Sukuna","Jujutsu Kaisen","Demon",94,75,180,"Malevolent Shrine","Deal 70 damage to all enemies","Mystic","Shadow"],
  ["mc08","Zoro (Enma)","One Piece","Fighter",90,82,175,"Three Sword Style","Three hits for 25 damage each","Mystic","Wind"],
  ["mc09","Alucard","Hellsing","Demon",92,80,200,"Cromwell Initiation","Drain 30 HP from enemy, heal self","Mystic","Shadow"],
  ["mc10","Madara Uchiha","Naruto","Mage",93,85,185,"Perfect Susanoo","Deal 65 damage, block 30 next turn","Mystic","Shadow"],
  // LEGENDARY (7%)
  ["lc01","Edward Elric","Fullmetal Alchemist","Mage",82,70,155,"Transmutation","Transform terrain, deal 45 damage","Legendary","Earth"],
  ["lc02","Hisoka Morow","HxH","Fighter",85,68,158,"Bungee Gum","Bind enemy for 1 turn, deal 35 damage","Legendary","Shadow"],
  ["lc03","Kakashi Hatake","Naruto","Mage",80,75,160,"Kamui","Remove enemy buff AND deal 30 damage","Legendary","Lightning"],
  ["lc04","Roronoa Zoro","One Piece","Fighter",84,78,165,"Ittoryu","Single devastating hit for 55 damage","Legendary","Wind"],
  ["lc05","Gon Freecss","HxH","Fighter",83,65,162,"Jajanken Rock","Deal 50 damage, chance to stun","Legendary","Earth"],
  ["lc06","Meruem","HxH","Demon",88,80,172,"Photon","Steal 25% of enemy's attack stat","Legendary","Shadow"],
  ["lc07","Ken Kaneki","Tokyo Ghoul","Demon",82,70,168,"Kakuja","Go berserk: +30 ATK, -20 DEF for 3 turns","Legendary","Shadow"],
  ["lc08","Tanjiro Kamado","Demon Slayer","Fighter",80,72,158,"Hinokami Kagura","Sun breathing: 45 damage + burn","Legendary","Fire"],
  ["lc09","Ichigo Kurosaki","Bleach","Fighter",86,74,170,"Bankai","Massively boost ATK for 2 turns","Legendary","Lightning"],
  ["lc10","Mikasa Ackermann","Attack on Titan","Fighter",81,74,160,"Ackermann Clan","Counter-attack: reflect 50% damage","Legendary","Wind"],
  ["lc11","Rimuru Tempest","That Time I Got Reincarnated","Mage",84,76,165,"Predator","Copy enemy's ability for this battle","Legendary","Water"],
  ["lc12","Sung Jin-Woo","Solo Leveling","Fighter",87,78,172,"Shadow Army","Summon shadow minion, deal 40 damage","Legendary","Shadow"],
  ["lc13","Ban","Seven Deadly Sins","Fighter",83,72,165,"Snatch","Steal 20 STR from enemy permanently","Legendary","Earth"],
  ["lc14","Escanor","Seven Deadly Sins","Fighter",86,75,168,"The One","At noon: untouchable, deal 60 damage","Legendary","Fire"],
  ["lc15","Ainz Ooal Gown","Overlord","Mage",85,80,170,"Grasp Heart","50% chance to instant KO","Legendary","Shadow"],
  // EPIC (14%)
  ["ec01","Mob","Mob Psycho 100","Mage",78,65,150,"100%","Unleash psychic power: 40 damage","Epic","Holy"],
  ["ec02","Shoto Todoroki","My Hero Academia","Fighter",76,70,152,"Half Cold Half Hot","Choose: freeze or burn enemy (30 dmg each)","Epic","Fire"],
  ["ec03","Bakugo Katsuki","My Hero Academia","Fighter",80,62,148,"Howitzer Impact","Explosive blast: 45 damage","Epic","Fire"],
  ["ec04","All Might","My Hero Academia","Fighter",82,68,158,"United States of Smash","Massive blow: 50 damage, may stun","Epic","Lightning"],
  ["ec05","Natsu Dragneel","Fairy Tail","Fighter",79,64,152,"Fire Dragon King Mode","Triple fire damage for 1 turn","Epic","Fire"],
  ["ec06","Lucy Heartfilia","Fairy Tail","Mage",72,68,145,"Celestial Spirits","Summon 3 spirits, 15 damage each","Epic","Holy"],
  ["ec07","Nobara Kugisaki","Jujutsu Kaisen","Mage",74,70,148,"Resonance","Link to enemy doll: deal 35 shared damage","Epic","Earth"],
  ["ec08","Yuji Itadori","Jujutsu Kaisen","Fighter",78,72,155,"Divergent Fist","Delay burst punch: 40 damage","Epic","Lightning"],
  ["ec09","Muzan Kibutsuji","Demon Slayer","Demon",80,72,160,"Absorption","Heal 25HP and boost ATK","Epic","Shadow"],
  ["ec10","Akaza","Demon Slayer","Demon",78,68,155,"Destructive Death","Spinning assault: 35 damage","Epic","Wind"],
  ["ec11","Shinobu Kocho","Demon Slayer","Mage",70,66,140,"Insect Breathing","Poison enemy: 8 damage per turn for 4 turns","Epic","Wind"],
  ["ec12","Giyu Tomioka","Demon Slayer","Fighter",76,75,155,"Water Breathing","Flowing counter: reflect 40% incoming damage","Epic","Water"],
  ["ec13","Spike Spiegel","Cowboy Bebop","Fighter",74,65,148,"See You Space Cowboy","Dual guns: 2x25 damage","Epic","Wind"],
  ["ec14","Reigen Arataka","Mob Psycho 100","Fighter",65,60,140,"100% Shot","Borrow Mob's power: 35 damage once","Epic","Holy"],
  ["ec15","Light Yagami","Death Note","Mage",72,68,145,"Death Note","Skip enemy turn with 60% success rate","Epic","Shadow"],
  ["ec16","L Lawliet","Death Note","Mage",70,70,145,"Deduction","Reveal enemy hand, steal their buff","Epic","Holy"],
  ["ec17","Accelerator","A Certain Magical Index","Mage",82,78,162,"Vector Control","Reflect all projectile attacks back","Epic","Lightning"],
  ["ec18","Kaguya Otsutsuki","Naruto","Mage",80,78,165,"All-Killing Ash Bones","Hit ignores all defense","Epic","Shadow"],
  ["ec19","Dio Brando","JoJo","Demon",79,72,158,"ZA WARUDO","Stop time: deal 45 damage uncontested","Epic","Shadow"],
  ["ec20","Jotaro Kujo","JoJo","Fighter",78,74,158,"ORA ORA ORA","11 hit combo: 8 damage per hit","Epic","Lightning"],
  // RARE (22%)
  ["rc01","Deku (Full Cowl)","My Hero Academia","Fighter",72,65,142,"One For All 100%","Smash for 35 damage, recoil 10","Rare","Lightning"],
  ["rc02","Inosuke Hashibira","Demon Slayer","Fighter",70,60,138,"Beast Breathing","Wild slashes: 28 damage","Rare","Wind"],
  ["rc03","Zenitsu Agatsuma","Demon Slayer","Fighter",68,58,136,"Thunderclap Flash","Lightning speed: 32 damage","Rare","Lightning"],
  ["rc04","Shanks","One Piece","Fighter",75,70,150,"Haki Burst","Intimidate: lower enemy ATK by 20","Rare","Wind"],
  ["rc05","Nami","One Piece","Mage",65,62,132,"Clima-Tact","Weather manipulation: 22 damage","Rare","Lightning"],
  ["rc06","Sanji","One Piece","Fighter",73,65,145,"Hell Memories","Flaming kick: 30 damage","Rare","Fire"],
  ["rc07","Brook","One Piece","Mage",68,60,138,"Soul King","Soul music: paralyze enemy 1 turn","Rare","Shadow"],
  ["rc08","Rin Okumura","Blue Exorcist","Fighter",72,64,142,"Blue Flame","Demonic fire: 28 damage + burn","Rare","Fire"],
  ["rc09","Maka Albarn","Soul Eater","Fighter",70,65,140,"Soul Wavelength","Resonance: 30 damage","Rare","Holy"],
  ["rc10","Death the Kid","Soul Eater","Fighter",71,66,141,"Death Cannon","Dual pistols: 2x18 damage","Rare","Shadow"],
  ["rc11","Yor Forger","Spy x Family","Fighter",72,64,140,"Thorn Princess","Hidden blades: 28 damage","Rare","Wind"],
  ["rc12","Loid Forger","Spy x Family","Fighter",70,68,140,"Wise Agent","Tactical strike: 25 damage + stun","Rare","Shadow"],
  ["rc13","Anya Forger","Spy x Family","Mage",55,55,120,"Telepath","Read mind: copy enemy ability once","Rare","Holy"],
  ["rc14","Gintoki Sakata","Gintama","Fighter",73,66,145,"Silver Soul","Lazy slash: 28 damage, chance to crit","Rare","Wind"],
  ["rc15","Taiga Aisaka","Toradora","Fighter",60,55,125,"Palmtop Tiger","Rage mode: +30 ATK when below 40% HP","Rare","Fire"],
  ["rc16","Yato","Noragami","Fighter",71,65,140,"Borderline","Divine slice: 30 damage","Rare","Holy"],
  ["rc17","Ryuko Matoi","Kill la Kill","Fighter",74,67,145,"Scissor Blade","Life fiber: 32 damage","Rare","Fire"],
  ["rc18","Simon","Gurren Lagann","Fighter",75,68,148,"Giga Drill","Spiral power: 35 damage","Rare","Earth"],
  ["rc19","Lelouch vi Britannia","Code Geass","Mage",68,65,138,"Geass","Force enemy to obey: skip their turn","Rare","Shadow"],
  ["rc20","Usagi Tsukino","Sailor Moon","Mage",67,63,135,"Moon Prism Power","Healing + 25 damage beam","Rare","Holy"],
  // UNCOMMON (25%)
  ["uc01","Toga Himiko","My Hero Academia","Demon",62,55,128,"Transform","Mimic: copy appearance and gain 20 HP","Uncommon","Shadow"],
  ["uc02","Denki Kaminari","My Hero Academia","Mage",63,55,128,"Electrification","Shock: 22 damage, may paralyze","Uncommon","Lightning"],
  ["uc03","Momo Yaoyorozu","My Hero Academia","Mage",64,62,130,"Creation","Create shield: block 20 damage","Uncommon","Earth"],
  ["uc04","Ochaco Uraraka","My Hero Academia","Mage",60,58,126,"Zero Gravity","Float enemy, reduce their DEF by 25","Uncommon","Wind"],
  ["uc05","Connie Springer","Attack on Titan","Fighter",60,58,126,"ODM Gear","Swift aerial: 20 damage","Uncommon","Wind"],
  ["uc06","Jean Kirstein","Attack on Titan","Fighter",62,60,130,"Tactical Mind","Team boost: +15 ATK to all cards","Uncommon","Wind"],
  ["uc07","Armin Arlert","Mage",65,60,128,"Colossal Titan","Giant transformation: 30 damage AOE","Uncommon","Earth"],
  ["uc08","Historia Reiss","Attack on Titan","Healer",55,58,125,"Ymir's Blood","Heal 30 HP, restore shield","Uncommon","Holy"],
  ["uc09","Yuno","Black Clover","Mage",65,60,130,"Spirit of Zephyr","Wind magic: 25 damage","Uncommon","Wind"],
  ["uc10","Noelle Silva","Black Clover","Mage",63,62,128,"Valkyrie Armor","Magic armor: block 25 + counter 15","Uncommon","Water"],
  ["uc11","Asta","Black Clover","Fighter",66,62,132,"Anti-Magic Sword","Null all buffs, deal 28 damage","Uncommon","Earth"],
  ["uc12","Yami Sukehiro","Black Clover","Fighter",70,65,138,"Dark Cloaked Dimension Slash","Shadow slice: 30 damage","Uncommon","Shadow"],
  ["uc13","Osamu Dazai","Bungo Stray Dogs","Mage",62,60,130,"No Longer Human","Nullify ability for 2 turns","Uncommon","Shadow"],
  ["uc14","Chuuya Nakahara","Bungo Stray Dogs","Fighter",66,62,132,"Corruption","Gravity manipulation: 30 damage","Uncommon","Earth"],
  ["uc15","Hange Zoe","Attack on Titan","Mage",63,60,128,"Research Frenzy","Titan knowledge: analyze + boost","Uncommon","Earth"],
  // COMMON (28%)
  ["cc01","Usopp","One Piece","Fighter",55,50,115,"Kabuto Slingshot","Snipe: 18 damage from distance","Common","Wind"],
  ["cc02","Chopper","One Piece","Healer",50,55,120,"Rumble Ball","Heal 20 HP, multiple forms","Common","Earth"],
  ["cc03","Robin","One Piece","Mage",58,55,120,"Cien Fleur","Bloom arms: 18 damage","Common","Earth"],
  ["cc04","Franky","One Piece","Fighter",60,58,125,"Coup de Vent","Cannon blast: 22 damage","Common","Earth"],
  ["cc05","Mineta Minoru","My Hero Academia","Mage",45,50,110,"Pop Off","Sticky balls: immobilize 1 turn","Common","Earth"],
  ["cc06","Iida Tenya","My Hero Academia","Fighter",60,58,125,"Recipro Burst","Speed dash: 20 damage","Common","Lightning"],
  ["cc07","Kirishima Eijiro","My Hero Academia","Fighter",62,68,135,"Unbreakable","Harden: take 50% less damage for 1 turn","Common","Earth"],
  ["cc08","Froppy","My Hero Academia","Fighter",55,55,122,"Frog Quirk","Tongue grab: 16 damage + stun","Common","Water"],
  ["cc09","Inuyasha","Inuyasha","Fighter",64,60,130,"Wind Scar","Wave attack: 25 damage","Common","Wind"],
  ["cc10","Kagome Higurashi","Inuyasha","Mage",58,55,120,"Sacred Arrow","Purify: 22 damage vs demons","Common","Holy"],
  ["cc11","Mirko","My Hero Academia","Fighter",66,62,132,"Luna Tijeras","Scissor kick: 26 damage","Common","Lightning"],
  ["cc12","Hawks","My Hero Academia","Fighter",65,60,130,"Fierce Wings","Feather assault: 24 damage","Common","Wind"],
  ["cc13","Hanta Sero","My Hero Academia","Fighter",55,56,118,"Tape Whip","Restrain: 16 damage + reduce enemy speed","Common","Earth"],
  ["cc14","Fumikage Tokoyami","My Hero Academia","Mage",62,60,128,"Dark Shadow","Shadow beast: 24 damage","Common","Shadow"],
  ["cc15","Mina Ashido","My Hero Academia","Mage",58,54,120,"Acid Man","Acid splash: 20 damage + melt armor","Common","Earth"],
];

const RARITY_ORDER = ["Iconic","Mystic","Legendary","Epic","Rare","Uncommon","Common"];
const RARITY_COLORS = {
  Iconic:"#F0E130",Mystic:"#E040FB",Legendary:"#FF6D00",
  Epic:"#AA00FF",Rare:"#2979FF",Uncommon:"#00C853",Common:"#546E7A"
};
const RARITY_RATES = {Iconic:0.01,Mystic:0.03,Legendary:0.07,Epic:0.14,Rare:0.22,Uncommon:0.25,Common:0.28};
const ELEMENT_COLORS = {
  Fire:"#EF5350",Water:"#42A5F5",Wind:"#66BB6A",Lightning:"#FFD600",
  Shadow:"#7B1FA2",Holy:"#FFF176",Earth:"#8D6E63"
};
const ELEMENT_EMOJI = {Fire:"🔥",Water:"💧",Wind:"🌊",Lightning:"⚡",Shadow:"🌑",Holy:"✨",Earth:"🌍"};
const TYPE_COLORS = {Fighter:"#EF4444",Mage:"#7C3AED",Demon:"#1F2937",Healer:"#059669"};

// Pack types
const PACK_TYPES = [
  {id:"standard",name:"Standard Pack",cost:100,cards:5,rates:{Iconic:0.01,Mystic:0.03,Legendary:0.07,Epic:0.14,Rare:0.22,Uncommon:0.25,Common:0.28},color:"#475569",desc:"5 cards, standard rates"},
  {id:"premium",name:"Premium Pack",cost:300,cards:5,rates:{Iconic:0.03,Mystic:0.08,Legendary:0.15,Epic:0.22,Rare:0.25,Uncommon:0.18,Common:0.09},color:"#7C3AED",desc:"5 cards, boosted rare rates"},
  {id:"legendary",name:"Legend Pack",cost:800,cards:5,rates:{Iconic:0.08,Mystic:0.15,Legendary:0.25,Epic:0.28,Rare:0.16,Uncommon:0.06,Common:0.02},color:"#F59E0B",desc:"5 cards — guaranteed Legendary+"},
  {id:"single",name:"Single Pull",cost:50,cards:1,rates:{Iconic:0.01,Mystic:0.03,Legendary:0.07,Epic:0.14,Rare:0.22,Uncommon:0.25,Common:0.28},color:"#64748B",desc:"1 card pull"},
];

// ── Anime Save Helpers ─────────────────────────────────────────────────────────
const ANIME_SAVE_KEY = "nova_anime_cards";
function loadAnimeState(){
  try{const r=localStorage.getItem(ANIME_SAVE_KEY);return r?JSON.parse(r):null;}catch{return null;}
}
function saveAnimeState(s){
  try{localStorage.setItem(ANIME_SAVE_KEY,JSON.stringify(s));}catch(e){}
}
function freshAnimeState(){
  return {coins:500,collection:[],deck:[],battleHistory:[],totalPulls:0,wins:0,losses:0};
}

// ── Card lookup helpers ────────────────────────────────────────────────────────
const CHAR_MAP = Object.fromEntries(ANIME_CHARACTERS.map(c=>([c[0],{id:c[0],name:c[1],series:c[2],type:c[3],atk:c[4],def:c[5],hp:c[6],ability:c[7],abilityDesc:c[8],rarity:c[9],element:c[10]}])));
function getCard(id){return CHAR_MAP[id]||null;}

function pullCard(rates){
  const r=Math.random();let cum=0;
  for(const [rar,rate] of Object.entries(rates)){
    cum+=rate;
    if(r<cum){
      const pool=ANIME_CHARACTERS.filter(c=>c[9]===rar);
      if(pool.length===0)continue;
      const c=pool[Math.floor(Math.random()*pool.length)];
      return{...getCard(c[0]),instanceId:`${c[0]}_${Date.now()}_${Math.random().toString(36).slice(2)}`};
    }
  }
  const fallback=ANIME_CHARACTERS[Math.floor(Math.random()*ANIME_CHARACTERS.length)];
  return{...getCard(fallback[0]),instanceId:`${fallback[0]}_${Date.now()}`};
}

// ── AI Opponent Deck ──────────────────────────────────────────────────────────
function buildAIDeck(){
  const deck=[];
  const rarityPool=["Legendary","Epic","Rare","Uncommon","Common","Epic","Rare","Uncommon"];
  while(deck.length<5){
    const rar=rarityPool[Math.floor(Math.random()*rarityPool.length)];
    const pool=ANIME_CHARACTERS.filter(c=>c[9]===rar);
    if(!pool.length)continue;
    const c=pool[Math.floor(Math.random()*pool.length)];
    deck.push({...getCard(c[0]),instanceId:`ai_${c[0]}_${Math.random().toString(36).slice(2)}`});
  }
  return deck;
}

// ── Battle Engine ─────────────────────────────────────────────────────────────
function applyAbility(caster, target, log){
  const ab=caster.ability;
  let dmg=0,heal=0,skipTurn=false,block=0,dotDmg=0,dotTurns=0;
  if(ab==="Ultra Instinct"){if(Math.random()<0.7){log.push("🌀 Dodge!");return{dmgToTarget:0,healCaster:0,skipTarget:false,block:0};}else dmg=Math.round(caster.atk*0.9);}
  else if(ab==="Baryon Burn"){dmg=Math.round(caster.atk*3.0);heal=-15;}
  else if(ab==="One Punch"){dmg=target.currentHp<target.hp*0.5?target.currentHp:Math.round(caster.atk*1.2);}
  else if(ab==="Nika Awakening"){dmg=Math.round(caster.atk*2.0);caster._powered=2;}
  else if(ab==="Tsukuyomi"){skipTurn=true;dmg=40;}
  else if(ab==="Final Flash"){if(!caster._charging){caster._charging=true;log.push("⚡ Charging Final Flash...");return{dmgToTarget:0,healCaster:0,skipTarget:false,block:0};}else{dmg=80;caster._charging=false;}}
  else if(ab==="Godspeed"){block=40;caster._speed=true;}
  else if(ab==="Infinity"){block=9999;}
  else if(ab==="Malevolent Shrine"){dmg=70;}
  else if(ab==="Three Sword Style"){dmg=25*3;}
  else if(ab==="Predator"){caster._copiedAbility=target.ability;}
  else if(ab==="Shadow Army"){dmg=40;}
  else if(ab==="ZA WARUDO"){dmg=45;skipTurn=true;}
  else if(ab==="ORA ORA ORA"){dmg=8*11;}
  else if(ab==="Insect Breathing"){dotDmg=8;dotTurns=4;}
  else if(ab==="Vector Control"){block=9999;caster._reflect=true;}
  else if(ab==="Death Note"){skipTurn=Math.random()<0.6;}
  else if(ab==="Geass"){skipTurn=true;}
  else if(ab==="Absorption"){heal=25;dmg=Math.round(caster.atk*0.9);caster.atk=Math.round(caster.atk*1.05);}
  else if(ab==="No Longer Human"){target._abilityDisabled=2;}
  else{// Default: ability does 30% more than normal attack
    dmg=Math.round(caster.atk*(0.9+Math.random()*0.5));
  }
  return{dmgToTarget:Math.max(0,dmg),healCaster:heal,skipTarget:skipTurn,block,dotDmg,dotTurns};
}

function battleRound(attacker,defender,useAbility,log){
  let abilRes={dmgToTarget:0,healCaster:0,skipTarget:false,block:0,dotDmg:0,dotTurns:0};
  if(useAbility&&!attacker._abilityUsed&&!attacker._abilityDisabled){
    abilRes=applyAbility(attacker,defender,log);
    attacker._abilityUsed=true;
    if(abilRes.dmgToTarget>0)log.push(`💥 ${attacker.name} uses ${attacker.ability}! ${abilRes.dmgToTarget} damage`);
    if(abilRes.healCaster!==0)log.push(`${abilRes.healCaster<0?'🤕':'💊'} ${attacker.name} ${abilRes.healCaster<0?'loses':'recovers'} ${Math.abs(abilRes.healCaster)} HP`);
    if(abilRes.skipTarget)log.push(`😵 ${defender.name} is stunned! Loses next action`);
  }else{
    const dmg=Math.max(1,Math.round((attacker.atk*(0.8+Math.random()*0.4))-(defender.def*(0.3+Math.random()*0.2))));
    abilRes.dmgToTarget=dmg;
    log.push(`⚔️ ${attacker.name} attacks for ${dmg} damage`);
  }
  // Apply defender's block
  const blocked=Math.min(abilRes.dmgToTarget,defender._block||0);
  const finalDmg=abilRes.dmgToTarget-blocked;
  if(blocked>0)log.push(`🛡 ${defender.name} blocks ${blocked}!`);
  defender.currentHp=Math.max(0,defender.currentHp-finalDmg);
  attacker.currentHp=Math.max(0,Math.min(attacker.hp,attacker.currentHp+(abilRes.healCaster||0)));
  // DOT
  if(abilRes.dotDmg&&abilRes.dotTurns){defender._dot={dmg:abilRes.dotDmg,turns:abilRes.dotTurns};}
  if(defender._dot&&defender._dot.turns>0){
    defender.currentHp=Math.max(0,defender.currentHp-defender._dot.dmg);
    log.push(`☠️ Poison: ${defender.name} takes ${defender._dot.dmg}`);
    defender._dot.turns--;
  }
  // Block fades
  if(abilRes.block)attacker._block=abilRes.block;
  else attacker._block=0;
  if(abilRes.skipTarget)defender._skip=true;
  return defender.currentHp<=0;
}

function simulateBattle(playerDeck,aiDeck){
  const pDeck=playerDeck.map(c=>({...c,currentHp:c.hp,_abilityUsed:false,_block:0,_skip:false}));
  const aDeck=aiDeck.map(c=>({...c,currentHp:c.hp,_abilityUsed:false,_block:0,_skip:false}));
  const allLog=[];let turn=0;
  let pi=0,ai=0;
  while(pi<pDeck.length&&ai<aDeck.length&&turn<200){
    const pc=pDeck[pi],ac=aDeck[ai];turn++;
    const log=[];
    log.push(`--- Turn ${turn} ---`);
    // Player turn
    if(pc._skip){log.push(`😵 ${pc.name} is stunned!`);pc._skip=false;}
    else{const useAb=!pc._abilityUsed&&Math.random()<0.5;if(battleRound(pc,ac,useAb,log)){log.push(`💀 ${ac.name} is defeated!`);ai++;}}
    // AI turn
    if(ai<aDeck.length){
      const ac2=aDeck[ai];
      if(ac2._skip){log.push(`😵 ${ac2.name} is stunned!`);ac2._skip=false;}
      else{const useAb=!ac2._abilityUsed&&Math.random()<0.6;if(battleRound(ac2,pc,useAb,log)){log.push(`💀 ${pc.name} is defeated!`);pi++;}}
    }
    allLog.push(...log);
  }
  return{playerWon:pi<pDeck.length&&ai>=aDeck.length,log:allLog,pDeck,aDeck};
}

// ── AnimeCardGame Component ───────────────────────────────────────────────────
export default function AnimeCardGame({cu,navigate}){
  const mob=useIsMobile();
  const[state,setState]=useState(()=>{
    const saved=loadAnimeState();
    return saved||freshAnimeState();
  });
  const[tab,setTab]=useState("home"); // home|collection|packs|deck|battle|results
  const[openingPack,setOpeningPack]=useState(false);
  const[newCards,setNewCards]=useState([]);
  const[revealIdx,setRevealIdx]=useState(0);
  const[battleState,setBattleState]=useState(null); // null|{log,result,...}
  const[filterRarity,setFilterRarity]=useState("All");
  const[filterSeries,setFilterSeries]=useState("All");
  const[sortBy,setSortBy]=useState("rarity");
  const[searchQ,setSearchQ]=useState("");
  const[deckMsg,setDeckMsg]=useState("");

  const persist=(patch)=>{const ns={...state,...patch};setState(ns);saveAnimeState(ns);};

  const allSeries=[...new Set(ANIME_CHARACTERS.map(c=>c[2]))].sort();

  // ── PACKS ─────────────────────────────────────────────────────────────────
  const openPack=(pack)=>{
    if(state.coins<pack.cost){setDeckMsg(`Need ${pack.cost} coins!`);setTimeout(()=>setDeckMsg(""),2000);return;}
    const pulled=[];
    for(let i=0;i<pack.cards;i++)pulled.push(pullCard(pack.rates));
    const newCol=[...state.collection,...pulled];
    persist({coins:state.coins-pack.cost,collection:newCol,totalPulls:state.totalPulls+pack.cards});
    setNewCards(pulled);setRevealIdx(0);setOpeningPack(true);
  };

  const nextReveal=()=>{
    if(revealIdx<newCards.length-1)setRevealIdx(r=>r+1);
    else{setOpeningPack(false);setNewCards([]);setRevealIdx(0);}
  };

  // ── DECK ──────────────────────────────────────────────────────────────────
  const addToDeck=(card)=>{
    if(state.deck.length>=5){setDeckMsg("Deck is full! (max 5)");setTimeout(()=>setDeckMsg(""),2000);return;}
    if(state.deck.find(c=>c.instanceId===card.instanceId)){setDeckMsg("Already in deck");setTimeout(()=>setDeckMsg(""),2000);return;}
    persist({deck:[...state.deck,card]});
  };
  const removeFromDeck=(iid)=>persist({deck:state.deck.filter(c=>c.instanceId!==iid)});

  // ── BATTLE ────────────────────────────────────────────────────────────────
  const startBattle=()=>{
    if(state.deck.length<3){setDeckMsg("Need at least 3 cards in deck!");setTimeout(()=>setDeckMsg(""),2500);return;}
    const ai=buildAIDeck();
    const res=simulateBattle(state.deck,ai);
    const newWins=res.playerWon?state.wins+1:state.wins;
    const newLosses=res.playerWon?state.losses:state.losses+1;
    const reward=res.playerWon?150:30;
    persist({coins:state.coins+reward,wins:newWins,losses:newLosses,
      battleHistory:[{won:res.playerWon,opponent:ai.map(c=>c.name).join(", "),date:Date.now()},...state.battleHistory.slice(0,9)]});
    setBattleState({...res,aiDeckCards:ai,reward});
    setTab("battle");
  };

  // ── Collection filtering ──────────────────────────────────────────────────
  const filteredCol=state.collection.filter(c=>{
    if(filterRarity!=="All"&&c.rarity!==filterRarity)return false;
    if(filterSeries!=="All"&&c.series!==filterSeries)return false;
    if(searchQ&&!c.name.toLowerCase().includes(searchQ.toLowerCase()))return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="rarity")return RARITY_ORDER.indexOf(a.rarity)-RARITY_ORDER.indexOf(b.rarity);
    if(sortBy==="atk")return b.atk-a.atk;
    if(sortBy==="name")return a.name.localeCompare(b.name);
    return 0;
  });

  const accentColor="#E040FB";

  // ── CARD COMPONENT ────────────────────────────────────────────────────────
  const AnimeCard=({card,size="md",onClick,inDeck,onRemove})=>{
    const rc=RARITY_COLORS[card.rarity]||"#64748B";
    const ec=ELEMENT_COLORS[card.element]||"#64748B";
    const tc=TYPE_COLORS[card.type]||"#64748B";
    const sm=size==="sm";
    return(
      <div onClick={onClick} style={{
        borderRadius:sm?10:14,cursor:onClick?"pointer":"default",
        border:`2px solid ${rc}`,
        background:`linear-gradient(160deg,rgba(0,0,0,.85),${ec}18)`,
        overflow:"hidden",transition:"transform .18s,box-shadow .18s",
        width:sm?120:mob?140:160,flexShrink:0,
        boxShadow:`0 4px 20px ${rc}44`,
        position:"relative",
      }}
        onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 8px 32px ${rc}88`;}}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 4px 20px ${rc}44`;}}>
        {/* Rarity glow bar */}
        <div style={{height:3,background:rc,width:"100%"}}/>
        {/* Card header */}
        <div style={{padding:sm?"6px 8px":"8px 10px",background:`${rc}22`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:sm?7:8,color:rc,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{card.rarity.toUpperCase()}</div>
            <div style={{fontSize:sm?10:13}}>{ELEMENT_EMOJI[card.element]||"⚡"}</div>
          </div>
        </div>
        {/* Character avatar (emoji-based visual) */}
        <div style={{height:sm?60:80,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(180deg,${ec}18,transparent)`,fontSize:sm?32:44}}>
          {card.type==="Fighter"?"🥷":card.type==="Mage"?"🧙":card.type==="Demon"?"😈":"💊"}
        </div>
        {/* Name & series */}
        <div style={{padding:sm?"4px 8px":"6px 10px"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:sm?8:10,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name}</div>
          {!sm&&<div style={{fontSize:8,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.series}</div>}
        </div>
        {/* Stats */}
        <div style={{padding:sm?"0 8px 6px":"0 10px 8px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>
          {[["ATK",card.atk,"#EF4444"],["DEF",card.def,"#3B82F6"],["HP",card.hp,"#22C55E"]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",padding:"2px 0",borderRadius:4,background:"rgba(0,0,0,.3)"}}>
              <div style={{fontSize:sm?6:7,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{l}</div>
              <div style={{fontSize:sm?9:11,color:c,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{v}</div>
            </div>
          ))}
        </div>
        {/* Ability name */}
        {!sm&&(
          <div style={{padding:"0 10px 8px"}}>
            <div style={{fontSize:8,color:rc,fontFamily:"'Orbitron',sans-serif",fontWeight:700,padding:"2px 6px",borderRadius:5,background:`${rc}18`,border:`1px solid ${rc}33`,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.ability}</div>
          </div>
        )}
        {/* Type badge */}
        <div style={{position:"absolute",top:20,right:6,fontSize:7,color:tc,fontFamily:"'Orbitron',sans-serif",fontWeight:700,background:`${tc}22`,padding:"1px 4px",borderRadius:4}}>{card.type}</div>
        {/* In deck badge */}
        {inDeck&&<div style={{position:"absolute",top:20,left:6,fontSize:8,background:"#22C55E",color:"#fff",borderRadius:4,padding:"1px 5px",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✓</div>}
        {/* Remove from deck button */}
        {onRemove&&<button onClick={e=>{e.stopPropagation();onRemove(card.instanceId);}} style={{position:"absolute",bottom:6,right:6,background:"rgba(239,68,68,.8)",border:"none",borderRadius:4,color:"#fff",cursor:"pointer",fontSize:10,padding:"1px 5px"}}>×</button>}
      </div>
    );
  };

  // ── PACK OPENING SCREEN ───────────────────────────────────────────────────
  if(openingPack){
    const card=newCards[revealIdx];
    const rc=RARITY_COLORS[card?.rarity]||"#64748B";
    return(
      <div style={{maxWidth:500,margin:"0 auto",padding:"20px",textAlign:"center"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#475569",marginBottom:4}}>{revealIdx+1} / {newCards.length}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:rc,marginBottom:20,letterSpacing:".08em"}}>{card?.rarity.toUpperCase()}!</div>
        {card&&(
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <AnimeCard card={card} size="lg"/>
          </div>
        )}
        <div style={{fontSize:11,color:"#64748B",marginBottom:16}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{card?.name}</div>
          <div style={{fontSize:10,color:"#94A3B8"}}>{card?.series}</div>
          <div style={{fontSize:10,color:rc,marginTop:4}}>{card?.ability} — {card?.abilityDesc}</div>
        </div>
        <button onClick={nextReveal} style={{padding:"12px 32px",borderRadius:14,background:`linear-gradient(135deg,${rc},${rc}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#fff"}}>
          {revealIdx<newCards.length-1?"NEXT CARD ▶":"DONE ✓"}
        </button>
      </div>
    );
  }

  // ── BATTLE SCREEN ─────────────────────────────────────────────────────────
  if(tab==="battle"&&battleState){
    const won=battleState.playerWon;
    return(
      <div style={{maxWidth:700,margin:"0 auto",padding:mob?"10px":"20px"}}>
        <div style={{textAlign:"center",padding:"20px",borderRadius:18,background:won?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",border:`2px solid ${won?"rgba(34,197,94,.4)":"rgba(239,68,68,.3)"}`,marginBottom:18}}>
          <div style={{fontSize:52,marginBottom:8}}>{won?"🏆":"💀"}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,fontWeight:900,color:won?"#22C55E":"#EF4444"}}>{won?"VICTORY!":"DEFEAT"}</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>+{battleState.reward} coins earned</div>
        </div>
        {/* Battle log */}
        <div style={{maxHeight:300,overflowY:"auto",padding:"12px 14px",borderRadius:12,background:"rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.07)",marginBottom:14,fontFamily:"monospace",fontSize:11,lineHeight:1.8}}>
          {battleState.log.map((l,i)=>(
            <div key={i} style={{color:l.startsWith("---")?"#475569":l.includes("defeated")?"#EF4444":l.includes("heals")||l.includes("recovers")?"#22C55E":"#94A3B8"}}>{l}</div>
          ))}
        </div>
        {/* Card states */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {[["Your Cards",battleState.pDeck,"#22C55E"],["Opponent",battleState.aDeck,"#EF4444"]].map(([label,deck,col])=>(
            <div key={label} style={{padding:"12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${col}33`}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:col,marginBottom:8}}>{label}</div>
              {deck.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.04)",color:c.currentHp<=0?"#EF4444":"#94A3B8"}}>
                  <span>{c.name}</span>
                  <span style={{fontFamily:"'Orbitron',sans-serif",color:c.currentHp<=0?"#EF4444":"#22C55E"}}>{c.currentHp<=0?"KO":`${c.currentHp}HP`}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button onClick={()=>{setBattleState(null);setTab("home");}} style={{width:"100%",padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${accentColor},${accentColor}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:"#fff"}}>← BACK TO HQ</button>
      </div>
    );
  }

  // ── MAIN LAYOUT ───────────────────────────────────────────────────────────
  const tabList=[["home","🏠 Home"],["collection","📦 Collection"],["packs","🎁 Packs"],["deck","⚔️ Deck Builder"],["battle","🥊 Battle"]];

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:mob?"8px 8px 100px":"16px 20px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:24,fontWeight:900,color:accentColor,letterSpacing:".06em"}}>🌸 ANIME CARDS</div>
          <div style={{fontSize:10,color:"#475569"}}>{ANIME_CHARACTERS.length} characters · {state.collection.length} collected</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{padding:"6px 14px",borderRadius:20,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#F59E0B"}}>
            🪙 {state.coins.toLocaleString()}
          </div>
          <div style={{fontSize:10,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>{state.wins}W–{state.losses}L</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {tabList.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:20,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:mob?9:10,fontWeight:700,border:`1px solid ${tab===t?accentColor+"66":"rgba(255,255,255,.08)"}`,background:tab===t?accentColor+"18":"rgba(255,255,255,.03)",color:tab===t?accentColor:"#475569",transition:"all .15s"}}>
            {l}{t==="deck"&&state.deck.length>0?` (${state.deck.length}/5)`:""}
          </button>
        ))}
      </div>

      {deckMsg&&<div style={{marginBottom:12,padding:"8px 14px",borderRadius:10,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",color:"#EF4444",fontSize:12,fontFamily:"'Orbitron',sans-serif"}}>{deckMsg}</div>}

      {/* ── HOME ── */}
      {tab==="home"&&(
        <div>
          {/* Stats banner */}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:20}}>
            {[["Cards Owned",state.collection.length,accentColor],["Total Pulls",state.totalPulls,"#F59E0B"],["Battle W",state.wins,"#22C55E"],["Battle L",state.losses,"#EF4444"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"14px",borderRadius:14,background:"rgba(255,255,255,.04)",border:`1px solid ${c}33`}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{l}</div>
              </div>
            ))}
          </div>
          {/* Quick actions */}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[
              {label:"Open Standard Pack",cost:"100 🪙",col:"#475569",action:()=>{openPack(PACK_TYPES[0]);setTab("packs");}},
              {label:"Open Premium Pack",cost:"300 🪙",col:"#7C3AED",action:()=>{openPack(PACK_TYPES[1]);setTab("packs");}},
              {label:"Go Battle!",cost:state.deck.length>=3?"Ready!":"Need 3+ cards",col:"#EF4444",action:startBattle},
            ].map(({label,cost,col,action})=>(
              <button key={label} onClick={action} style={{padding:"16px",borderRadius:14,cursor:"pointer",border:`2px solid ${col}55`,background:`${col}18`,fontFamily:"'Orbitron',sans-serif",textAlign:"left",transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${col}28`}
                onMouseLeave={e=>e.currentTarget.style.background=`${col}18`}>
                <div style={{fontSize:11,fontWeight:700,color:col,marginBottom:4}}>{label}</div>
                <div style={{fontSize:10,color:"#64748B"}}>{cost}</div>
              </button>
            ))}
          </div>
          {/* Recent cards */}
          {state.collection.length>0&&(
            <div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:10}}>RECENTLY PULLED</div>
              <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                {[...state.collection].reverse().slice(0,8).map((c,i)=>(
                  <AnimeCard key={i} card={c} size="sm"/>
                ))}
              </div>
            </div>
          )}
          {state.collection.length===0&&(
            <div style={{textAlign:"center",padding:"40px",color:"#334155"}}>
              <div style={{fontSize:48,marginBottom:12}}>🌸</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#94A3B8",marginBottom:8}}>No cards yet!</div>
              <div style={{fontSize:11}}>Open a pack to start your collection</div>
            </div>
          )}
        </div>
      )}

      {/* ── COLLECTION ── */}
      {tab==="collection"&&(
        <div>
          {/* Filters */}
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search characters…" style={{flex:1,minWidth:140,padding:"7px 12px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:12}}/>
            <select value={filterRarity} onChange={e=>setFilterRarity(e.target.value)} style={{padding:"6px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
              <option value="All">All Rarities</option>
              {RARITY_ORDER.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filterSeries} onChange={e=>setFilterSeries(e.target.value)} style={{padding:"6px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
              <option value="All">All Series</option>
              {allSeries.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"6px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
              <option value="rarity">Sort: Rarity</option>
              <option value="atk">Sort: ATK</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
          <div style={{fontSize:10,color:"#334155",marginBottom:10}}>{filteredCol.length} cards</div>
          {filteredCol.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#334155",fontSize:12}}>{state.collection.length===0?"No cards yet — open some packs!":"No cards match your filters"}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {filteredCol.map((c,i)=>{
              const inDeck=!!state.deck.find(d=>d.instanceId===c.instanceId);
              return<AnimeCard key={i} card={c} onClick={()=>addToDeck(c)} inDeck={inDeck}/>;
            })}
          </div>
          {filteredCol.length>0&&<div style={{fontSize:10,color:"#334155",marginTop:12,textAlign:"center"}}>Click any card to add to deck</div>}
        </div>
      )}

      {/* ── PACKS ── */}
      {tab==="packs"&&(
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:14}}>CHOOSE A PACK</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {PACK_TYPES.map(pack=>(
              <div key={pack.id} style={{borderRadius:14,border:`2px solid ${pack.color}44`,background:`${pack.color}10`,padding:"16px",cursor:"pointer",transition:"all .2s"}}
                onClick={()=>openPack(pack)}
                onMouseEnter={e=>e.currentTarget.style.background=`${pack.color}20`}
                onMouseLeave={e=>e.currentTarget.style.background=`${pack.color}10`}>
                <div style={{fontSize:32,textAlign:"center",marginBottom:8}}>🎁</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:pack.color,marginBottom:4,textAlign:"center"}}>{pack.name}</div>
                <div style={{fontSize:10,color:"#64748B",textAlign:"center",marginBottom:8}}>{pack.desc}</div>
                <div style={{textAlign:"center",padding:"6px",borderRadius:10,background:`${pack.color}22`,border:`1px solid ${pack.color}44`,fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:pack.color}}>🪙 {pack.cost}</div>
              </div>
            ))}
          </div>
          {/* Drop rates table */}
          <div style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:10}}>DROP RATES — STANDARD PACK</div>
            {RARITY_ORDER.map(r=>(
              <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:11,color:RARITY_COLORS[r],fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{r}</span>
                <span style={{fontSize:11,color:"#94A3B8"}}>{(RARITY_RATES[r]*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DECK BUILDER ── */}
      {tab==="deck"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8"}}>YOUR BATTLE DECK ({state.deck.length}/5)</div>
              <div style={{fontSize:10,color:"#334155"}}>Select 3-5 cards. Click cards in collection to add.</div>
            </div>
            <button onClick={()=>persist({deck:[]})} style={{padding:"6px 14px",borderRadius:10,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:"#EF4444",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>Clear Deck</button>
          </div>
          {state.deck.length===0&&(
            <div style={{textAlign:"center",padding:"40px",color:"#334155"}}>
              <div style={{fontSize:36,marginBottom:8}}>⚔️</div>
              <div style={{fontSize:12}}>Deck is empty — go to Collection and click cards to add them</div>
            </div>
          )}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            {state.deck.map((c,i)=>(
              <AnimeCard key={i} card={c} onRemove={removeFromDeck}/>
            ))}
          </div>
          {state.deck.length>=3&&(
            <button onClick={startBattle} style={{width:"100%",padding:"14px",borderRadius:14,background:`linear-gradient(135deg,#EF4444,#EF4444cc)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#fff"}}>
              ⚔️ BATTLE WITH THIS DECK →
            </button>
          )}
          {state.deck.length>0&&state.deck.length<3&&(
            <div style={{textAlign:"center",padding:"10px",color:"#F59E0B",fontSize:11,fontFamily:"'Orbitron',sans-serif"}}>Add {3-state.deck.length} more card{3-state.deck.length!==1?"s":""} to battle</div>
          )}
        </div>
      )}

      {/* ── BATTLE HOME ── */}
      {tab==="battle"&&!battleState&&(
        <div>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:48,marginBottom:8}}>⚔️</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#EF4444",marginBottom:8}}>BATTLE ARENA</div>
            <div style={{fontSize:12,color:"#64748B"}}>Your deck vs a random AI opponent</div>
          </div>
          {state.deck.length>=3?(
            <>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:10}}>YOUR BATTLE DECK</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
                {state.deck.map((c,i)=><AnimeCard key={i} card={c} size="sm"/>)}
              </div>
              <button onClick={startBattle} style={{width:"100%",padding:"16px",borderRadius:14,background:"linear-gradient(135deg,#EF4444,#7C3AED)",border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#fff",letterSpacing:".06em"}}>
                ⚔️ START BATTLE →
              </button>
            </>
          ):(
            <div style={{textAlign:"center",padding:"30px",color:"#334155"}}>
              <div style={{fontSize:12,marginBottom:12}}>You need at least 3 cards in your deck</div>
              <button onClick={()=>setTab("deck")} style={{padding:"10px 24px",borderRadius:12,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",color:"#EF4444",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700}}>Build Deck →</button>
            </div>
          )}
          {/* Battle history */}
          {state.battleHistory.length>0&&(
            <div style={{marginTop:20}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:10}}>RECENT BATTLES</div>
              {state.battleHistory.slice(0,5).map((b,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:`1px solid ${b.won?"rgba(34,197,94,.2)":"rgba(239,68,68,.15)"}`,marginBottom:5}}>
                  <span style={{fontSize:11,color:b.won?"#22C55E":"#EF4444",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{b.won?"WIN":"LOSS"}</span>
                  <span style={{fontSize:10,color:"#64748B"}}>vs {b.opponent.split(",")[0]}…</span>
                  <span style={{fontSize:9,color:"#334155"}}>{new Date(b.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}






