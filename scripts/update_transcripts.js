const fs = require('fs/promises');
const path = require('path');

async function main() {
  const packsPath = path.join(__dirname, '../public/data/packs.json');
  const scenariosPath = path.join(__dirname, '../public/data/scenarios.json');

  let packs = JSON.parse(await fs.readFile(packsPath, 'utf8'));
  let scenarios = JSON.parse(await fs.readFile(scenariosPath, 'utf8'));

  // Remove old malek packs and scenarios
  packs = packs.filter(p => p.id !== "malek-brain-1");
  scenarios = scenarios.filter(s => !s.id.startsWith("malek-brain-s"));

  const newPackId = "advanced-vision-1";
  
  const newPack = {
    id: newPackId,
    name: "Advanced Game Vision",
    theme: "decision",
    subtitle: "Advanced game vision concepts, weak/strong side and map control.",
    description: "Learn how to cut the map in half, numerically identify the weak side, optimize defensive setups at the extremities, understand the advantage of open vs closed zones, and manage your alert and comfort zones.",
    tier: 2,
    difficulty: "advanced",
    scenarios: 5,
    price: "Free",
    imageUrl: "/images/packs/pgl-major-2025.jpg",
    scenarioIds: [
      "adv-vision-s1",
      "adv-vision-s2",
      "adv-vision-s3",
      "adv-vision-s4",
      "adv-vision-s5"
    ]
  };

  const newScenarios = [
    {
      id: "adv-vision-s1",
      packId: newPackId,
      theme: "decision",
      subcategory: "Game Vision - Weak/Strong Side",
      map: "Dust2",
      title: "CT 2B, 1 Mid, 2A - Terrorist announces 3 Mid. What is your map analysis?",
      description: "You are CT on Dust2 with a 2B, 1 Mid, 2A setup. Your AWPer at Mid gets the info that 3 terrorists went Mid. How do you analyze the numerical weakness of your defense?",
      image: "",
      video: "",
      macro: {
        title: "Concept: Cutting the map in half",
        description: "You must divide the map in half from the CT spawn. Numerically analyze the forces present on the right and left."
      },
      micro: {
        title: "Numerical Principle",
        description: "If 3 Ts are Mid (left/middle), the right side of the map (Bombsite A) becomes the weak side, regardless of the exact placement of the remaining 2 players."
      },
      communication: {
        title: "Team cue",
        description: "Immediate call: 'Weak side on A, be ready to support or fall back'."
      },
      options: [
        {
          id: 1,
          text: "I cut the map: they are 3 on the left/Mid, so the right side (A) is numerically the weak point. All offensive T calls towards A will be effective.",
          quality: "perfect",
          feedback: "Excellent analysis. By cutting the map, you immediately identify that the right side (A) is outnumbered and vulnerable."
        },
        {
          id: 2,
          text: "I ask the B player to rotate immediately to A.",
          quality: "good",
          feedback: "It's a logical reaction, but without understanding why, you risk overreacting. Analyzing the weak side should come before a blind rotation."
        },
        {
          id: 3,
          text: "I remain static on my position, the Mid info doesn't directly concern me.",
          quality: "blunder",
          feedback: "Global information is crucial. Ignoring the numerical imbalance means exposing yourself to a superior attack on the weak side."
        },
        {
          id: 4,
          text: "I push aggressively alone on my Bombsite to surprise the remaining 2 Ts.",
          quality: "blunder",
          feedback: "Playing the hero without precise info on a potentially weak or strong side is a bad risk (negative EV)."
        }
      ]
    },
    {
      id: "adv-vision-s2",
      packId: newPackId,
      theme: "decision",
      subcategory: "Defense - Extremity Setups",
      map: "Dust2",
      title: "Bombsite B Defense - Optimal positioning for 3 players",
      description: "You decide to defend Bombsite B with 3 players on Dust2. Where should you position yourselves to maximize your chances against a T rush?",
      image: "",
      video: "",
      macro: {
        title: "Defense Setup",
        description: "Positioning on the left of the map (closest to the T exit) is a grave mistake. You must seek the right extremity of the Bombsite."
      },
      micro: {
        title: "Crossfire and Bait",
        description: "Use the map's extremity (Fence, Plateau) and have one 'bait' player to draw attention."
      },
      communication: {
        title: "Team cue",
        description: "'I am baiting from door, you take the kills from the back of the Bombsite.'"
      },
      options: [
        {
          id: 1,
          text: "One hidden Fence, one hidden Plateau (right extremity of the Bombsite), and a more advanced player acting as bait.",
          quality: "perfect",
          feedback: "The perfect setup. The bait draws attention and dies, but players at the strong extremities take the revenge kills and destroy the attack."
        },
        {
          id: 2,
          text: "All 3 players stick close to the B doors/window (left side of the map).",
          quality: "blunder",
          feedback: "Positioning on the weak/left side of the map exposes you to being prefired or flashed without any possibility of falling back or effective revenge."
        },
        {
          id: 3,
          text: "One player B, one window, one door, all ready to duel at the same time.",
          quality: "good",
          feedback: "It's a standard setup but lacks depth. Without a defined bait player, duels are 50/50."
        },
        {
          id: 4,
          text: "All 3 stack into a boost in a corner to surprise.",
          quality: "blunder",
          feedback: "Too vulnerable to grenades. If the boost falls, the Bombsite is lost instantly."
        }
      ]
    },
    {
      id: "adv-vision-s3",
      packId: newPackId,
      theme: "decision",
      subcategory: "Map control - Open vs Closed Zones",
      map: "Any",
      title: "Retake/Attack Choice: Open Zone (A) or Closed Zone (B)?",
      description: "You are 5 Ts against 2 remaining CTs. One is spotted in B (very closed zone) and the other in A (very open zone). Which Bombsite do you attack?",
      image: "",
      video: "",
      macro: {
        title: "Nature of zones",
        description: "Closed zones (often B Bombsites) favor defense (broken angles, easy utility). Open zones favor attack (aim, numbers advantage)."
      },
      micro: {
        title: "Exploiting numbers advantage",
        description: "In a 5v1 on a Bombsite, the open zone prevents the CT from getting successive kills by hiding."
      },
      communication: {
        title: "Team cue",
        description: "'We go A, it's open, we play the aim duels, he won't be able to hide.'"
      },
      options: [
        {
          id: 1,
          text: "We attack Bombsite A (open zone). The numerical advantage and aim will make the difference without him being able to hide and stall.",
          quality: "perfect",
          feedback: "The optimal choice. An open zone prevents the CT from playing with broken angles to isolate successive 1v1s."
        },
        {
          id: 2,
          text: "We attack Bombsite B (closed zone) because it's faster to reach.",
          quality: "blunder",
          feedback: "In a closed zone, a single well-placed CT can get 2 or 3 kills with a broken angle and good utility. It's giving the opponent a chance."
        },
        {
          id: 3,
          text: "We split: 3 to A and 2 to B to be safe.",
          quality: "blunder",
          feedback: "You divide your numerical superiority and offer more balanced duels to isolated CTs."
        },
        {
          id: 4,
          text: "We wait for a CT to push to get extra information.",
          quality: "good",
          feedback: "Cautious, but you waste time. When you know where the advantage is (open zone vs 1 CT), you must execute."
        }
      ]
    },
    {
      id: "adv-vision-s4",
      packId: newPackId,
      theme: "decision",
      subcategory: "Backup and Rotation - Focus on the core of the attack",
      map: "Dust2",
      title: "T split on A (4 Short, 1 Long) - CT reaction on Long",
      description: "The terrorists launch an A split: 4 through Short and only 1 through Long. You are the CT assigned to Long. What do you do?",
      image: "",
      video: "",
      macro: {
        title: "The core of the attack",
        description: "The main attack (4 players) is the most dangerous. Do not get baited by an isolated player (the lurker/bait)."
      },
      micro: {
        title: "Immediate repositioning",
        description: "Drop the risky Long angle to fall back to the end of Bombsite A and help your allies on the main Short attack."
      },
      communication: {
        title: "Team cue",
        description: "'I'm dropping Long, focus Short, don't show your heads to Long!'"
      },
      options: [
        {
          id: 1,
          text: "I fall back immediately to the right extremity of the Bombsite to help my allies against the 4 Short players, ignoring the isolated Long player.",
          quality: "perfect",
          feedback: "The best decision. The Long player is a bait. The real danger is on Short. By falling back, you help the critical point and gain precious backup seconds."
        },
        {
          id: 2,
          text: "I hold my Long angle to kill the isolated player before helping.",
          quality: "blunder",
          feedback: "You get baited. While you look for this low-impact kill, your allies get crushed in a 4v1 or 4v2 on the real front of the attack."
        },
        {
          id: 3,
          text: "I push Long aggressively to get the kill quickly.",
          quality: "blunder",
          feedback: "Same problem, but worse. If you die, you leave your team to defend 4v5 with a huge breach."
        },
        {
          id: 4,
          text: "I throw a smoke Long and focus on Short.",
          quality: "good",
          feedback: "Very good adaptation with utility, but a complete physical fallback remains the top priority in the analytical method."
        }
      ]
    },
    {
      id: "adv-vision-s5",
      packId: newPackId,
      theme: "decision",
      subcategory: "Time Management - Comfort vs Alert Zone",
      map: "Any",
      title: "Start of CT round - Managing the first seconds",
      description: "The round starts, you are at the CT spawn heading towards your Bombsite. How do you manage this phase according to the comfort and alert zones?",
      image: "",
      video: "",
      macro: {
        title: "Notion of comfort",
        description: "A comfort zone is a space/time where the enemy cannot physically reach you. Use this time for macro-management."
      },
      micro: {
        title: "Exploiting free time",
        description: "During the ~13 seconds of comfort zone, look at the minimap, analyze the economy, discuss the plan, instead of running with your weapon out without thinking."
      },
      communication: {
        title: "Team cue",
        description: "'We have 10s safe, check the economy, let's go for a standard 2-1-2 setup.'"
      },
      options: [
        {
          id: 1,
          text: "I take advantage of the ~10-13s of comfort zone with my knife out to look at the minimap, the economy, and confirm the strategy with the team before entering the alert zone.",
          quality: "perfect",
          feedback: "The perfect high-level attitude. Optimizing the time where you are 100% safe to gather information and formulate strategy."
        },
        {
          id: 2,
          text: "I pull out my weapon right from the spawn in case a T 'rushes' unpredictably.",
          quality: "blunder",
          feedback: "Useless paranoia. Mathematically (movement speed), it is impossible to encounter a T in the first few seconds at the CT spawn. You lose movement speed (knife vs weapon)."
        },
        {
          id: 3,
          text: "I walk silently the whole way to not give any info.",
          quality: "blunder",
          feedback: "Walking/shifting in a comfort zone wastes precious time to take crucial advanced positions."
        },
        {
          id: 4,
          text: "I run quickly towards my angle without looking at the radar or speaking.",
          quality: "good",
          feedback: "It's mechanical and effective, but you waste a strategic window of opportunity (analysis, communication) that differentiates good players from excellent ones."
        }
      ]
    }
  ];

  packs.push(newPack);
  scenarios.push(...newScenarios);

  await fs.writeFile(packsPath, JSON.stringify(packs, null, 2));
  await fs.writeFile(scenariosPath, JSON.stringify(scenarios, null, 2));
  console.log("English pack updated.");
}

main().catch(console.error);