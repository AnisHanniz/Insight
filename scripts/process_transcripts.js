const fs = require('fs/promises');
const path = require('path');

async function main() {
  const packsPath = path.join(__dirname, '../public/data/packs.json');
  const scenariosPath = path.join(__dirname, '../public/data/scenarios.json');

  const packs = JSON.parse(await fs.readFile(packsPath, 'utf8'));
  const scenarios = JSON.parse(await fs.readFile(scenariosPath, 'utf8'));

  const newPackId = "malek-brain-1";
  
  const newPack = {
    id: newPackId,
    name: "Malek's Brain: Vision de Jeu",
    theme: "decision",
    subtitle: "Les concepts avancés de vision de jeu, côté faible/fort et gestion de map.",
    description: "Issu des fameux tutoriels de Malek. Apprenez à couper la map en deux, identifier le côté faible numériquement, optimiser vos setups défensifs aux extrémités, comprendre l'avantage des zones ouvertes vs fermées, et gérer vos zones d'alerte et de confort.",
    tier: 2,
    difficulty: "advanced",
    scenarios: 5,
    price: "Free",
    imageUrl: "/images/packs/pgl-major-2025.jpg",
    scenarioIds: [
      "malek-brain-s1",
      "malek-brain-s2",
      "malek-brain-s3",
      "malek-brain-s4",
      "malek-brain-s5"
    ]
  };

  const newScenarios = [
    {
      id: "malek-brain-s1",
      packId: newPackId,
      theme: "decision",
      subcategory: "Vision de jeu - Côté faible/fort",
      map: "Dust2",
      title: "CT 2B, 1 Mid, 2A - Un terro annonce 3 Mid. Quelle est votre analyse de la map ?",
      description: "Vous êtes CT sur Dust2 avec un setup 2B, 1 Mid, 2A. Votre sniper au Mid prend l'information que 3 terroristes sont passés Mid. Comment analysez-vous la faiblesse numérique de votre défense ?",
      image: "",
      video: "",
      macro: {
        title: "Concept: Couper la map en deux",
        description: "Il faut diviser la map en deux depuis le spawn CT. Analysez numériquement les forces en présence à droite et à gauche."
      },
      micro: {
        title: "Principe Numérique",
        description: "Si 3 T sont Mid (gauche/milieu), la droite de la map (le BP A) devient le côté faible, quel que soit le placement exact des 2 joueurs restants."
      },
      communication: {
        title: "Team cue",
        description: "Call immédiat : 'Côté faible en A, préparez-vous à soutenir ou à reculer'."
      },
      options: [
        {
          id: 1,
          text: "Je coupe la map : ils sont 3 à gauche/Mid, donc le côté droit (A) est le point faible numériquement. Tous les calls offensifs terros vers A seront bons.",
          quality: "perfect",
          feedback: "Excellente analyse. En coupant la map, vous identifiez immédiatement que la droite (le A) est en sous-nombre et vulnérable."
        },
        {
          id: 2,
          text: "Je demande au joueur B de rotate immédiatement en A.",
          quality: "good",
          feedback: "C'est une réaction logique, mais sans comprendre pourquoi, vous risquez de sur-réagir. L'analyse du côté faible doit primer avant la rotation aveugle."
        },
        {
          id: 3,
          text: "Je reste statique sur ma position, l'information du Mid ne me concerne pas directement.",
          quality: "blunder",
          feedback: "L'information globale est cruciale. Ignorer le déséquilibre numérique c'est s'exposer à une attaque en supériorité sur le côté faible."
        },
        {
          id: 4,
          text: "Je push agressivement seul sur mon BP pour surprendre les 2 T restants.",
          quality: "blunder",
          feedback: "Jouer le héros sans info précise sur un côté potentiellement faible ou fort est un mauvais risque (EV négatif)."
        }
      ]
    },
    {
      id: "malek-brain-s2",
      packId: newPackId,
      theme: "decision",
      subcategory: "Défense - Setup aux extrémités",
      map: "Dust2",
      title: "Défense BP B - Positionnement optimal pour 3 joueurs",
      description: "Vous décidez de défendre le BP B à 3 joueurs sur Dust2. Où devez-vous vous positionner pour maximiser vos chances face à un rush terro ?",
      image: "",
      video: "",
      macro: {
        title: "Setup de défense",
        description: "Se positionner à gauche de la map (le plus près possible de la sortie terro) est une erreur grave. Il faut chercher l'extrémité droite du BP."
      },
      micro: {
        title: "Crossfire et Bait",
        description: "Utiliser l'extrémité de la map (Grillage, Plateau) et avoir un joueur 'bait' (appât) pour concentrer l'attention."
      },
      communication: {
        title: "Team cue",
        description: "'Je bait depuis la porte, vous prenez les kills depuis le fond du BP.'"
      },
      options: [
        {
          id: 1,
          text: "Un caché Grillage, un caché Plateau (extrémité droite du BP), et un joueur plus avancé qui sert d'appât (bait).",
          quality: "perfect",
          feedback: "Le setup parfait. L'appât attire l'attention et meurt, mais les joueurs aux extrémités fortes prennent le 'revenge' et détruisent l'attaque."
        },
        {
          id: 2,
          text: "Les 3 joueurs se collent près des portes/fenêtres B (à gauche de la map).",
          quality: "blunder",
          feedback: "Se mettre du côté faible/gauche de la map vous expose à vous faire 'préshot' ou flasher sans possibilité de repli ou de revenge efficace."
        },
        {
          id: 3,
          text: "Un joueur B, un joueur fenêtre, un joueur porte, tous prêts à duel en même temps.",
          quality: "good",
          feedback: "C'est un setup standard mais qui manque de profondeur. Sans joueur 'bait' défini, les duels sont en 50/50."
        },
        {
          id: 4,
          text: "Les 3 s'empilent en totem (boost) dans un coin pour surprendre.",
          quality: "blunder",
          feedback: "Trop vulnérable aux grenades. Si le totem tombe, le BP est perdu instantanément."
        }
      ]
    },
    {
      id: "malek-brain-s3",
      packId: newPackId,
      theme: "decision",
      subcategory: "Map control - Zones ouvertes vs fermées",
      map: "Any",
      title: "Choix de retake/attaque : Zone Ouverte (A) ou Zone Fermée (B) ?",
      description: "Vous êtes 5 T contre 2 CT restants. L'un est repéré en B (zone très fermée) et l'autre en A (zone très ouverte). Quel BP attaquez-vous ?",
      image: "",
      video: "",
      macro: {
        title: "Nature des zones",
        description: "Les zones fermées (souvent les BP B) avantagent la défense (lignes cassées, stuff facile). Les zones ouvertes avantagent l'attaque (skill, surnombre)."
      },
      micro: {
        title: "Exploitation du surnombre",
        description: "En 5v1 sur un BP, la zone ouverte empêche le CT de faire des kills successifs en se cachant."
      },
      communication: {
        title: "Team cue",
        description: "'On va A, c'est ouvert, on joue les duels à l'aim, il ne pourra pas se cacher.'"
      },
      options: [
        {
          id: 1,
          text: "On attaque le BP A (zone ouverte). L'avantage numérique et le skill feront la différence sans qu'il puisse se cacher et temporiser.",
          quality: "perfect",
          feedback: "Le choix optimal. Une zone ouverte empêche le CT de jouer avec les lignes cassées pour isoler des 1v1 successifs."
        },
        {
          id: 2,
          text: "On attaque le BP B (zone fermée) car il est plus rapide d'y accéder.",
          quality: "blunder",
          feedback: "Dans une zone fermée, un seul CT bien placé peut faire 2 ou 3 kills avec une ligne cassée et un bon stuff. C'est donner une chance à l'adversaire."
        },
        {
          id: 3,
          text: "On split : 3 en A et 2 en B pour être sûr.",
          quality: "blunder",
          feedback: "Vous divisez votre supériorité numérique et offrez des duels plus équilibrés aux CTs isolés."
        },
        {
          id: 4,
          text: "On attend qu'un CT pousse pour prendre une information supplémentaire.",
          quality: "good",
          feedback: "Prudent, mais vous perdez du temps. Quand on sait où est l'avantage (zone ouverte vs 1 CT), il faut exécuter."
        }
      ]
    },
    {
      id: "malek-brain-s4",
      packId: newPackId,
      theme: "decision",
      subcategory: "Backup et Rotation - Focus sur le gros de l'attaque",
      map: "Dust2",
      title: "Split T en A (4 Corniche, 1 GA) - Réaction du CT en GA",
      description: "Les terros lancent un split A : 4 par la Corniche et 1 seul par la GA. Vous êtes le CT assigné à la GA. Que faites-vous ?",
      image: "",
      video: "",
      macro: {
        title: "Le gros de l'attaque",
        description: "L'attaque principale (4 joueurs) est la plus dangereuse. Il ne faut pas se faire appâter par un joueur isolé (le lurker/bait)."
      },
      micro: {
        title: "Replacement immédiat",
        description: "Lâcher la ligne GA risquée pour reculer au fond du BP A et aider ses alliés sur l'attaque principale de la Corniche."
      },
      communication: {
        title: "Team cue",
        description: "'Je lâche GA, focus corniche, ne montrez pas vos têtes à la GA !'"
      },
      options: [
        {
          id: 1,
          text: "Je recule immédiatement à l'extrémité droite du BP pour aider mes alliés contre les 4 joueurs Corniche, ignorant le joueur GA isolé.",
          quality: "perfect",
          feedback: "La meilleure décision. Le joueur GA est un appât. Le vrai danger est sur la Corniche. En reculant, vous aidez le point critique et gagnez de précieuses secondes de backup."
        },
        {
          id: 2,
          text: "Je reste tenir ma ligne GA pour tuer le joueur isolé avant d'aider.",
          quality: "blunder",
          feedback: "Vous vous faites 'bait'. Pendant que vous cherchez ce kill peu impactant, vos alliés se font écraser en 4v1 ou 4v2 sur le vrai front de l'attaque."
        },
        {
          id: 3,
          text: "Je push la GA agressivement pour prendre le kill rapidement.",
          quality: "blunder",
          feedback: "Même problème, en pire. Si vous mourez, vous laissez votre équipe défendre à 4v5 avec une brèche énorme."
        },
        {
          id: 4,
          text: "Je jette un fumigène GA et je me concentre sur la corniche.",
          quality: "good",
          feedback: "Très bonne adaptation avec le stuff, mais le recul physique complet reste la priorité absolue dans la méthode d'analyse."
        }
      ]
    },
    {
      id: "malek-brain-s5",
      packId: newPackId,
      theme: "decision",
      subcategory: "Gestion du temps - Zone de confort vs d'alerte",
      map: "Any",
      title: "Début de round CT - Gestion des premières secondes",
      description: "Le round commence, vous êtes au spawn CT et vous vous dirigez vers votre BP. Comment gérez-vous cette phase selon les zones de confort et d'alerte ?",
      image: "",
      video: "",
      macro: {
        title: "Notion de confort",
        description: "Une zone de confort est un espace/temps où l'ennemi ne peut physiquement pas vous atteindre. Utilisez ce temps pour la macrogestion."
      },
      micro: {
        title: "Exploitation du temps libre",
        description: "Pendant les ~13 secondes de zone de confort, regardez la minimap, analysez l'économie, discutez du plan, au lieu de courir arme en main sans réfléchir."
      },
      communication: {
        title: "Team cue",
        description: "'On a 10s de safe, checkez l'économie, on part sur un setup 2-1-2 standard.'"
      },
      options: [
        {
          id: 1,
          text: "Je profite des ~10-13s de zone de confort couteau en main pour regarder la minimap, l'économie et valider la stratégie avec l'équipe avant d'entrer en zone d'alerte.",
          quality: "perfect",
          feedback: "L'attitude parfaite du haut niveau. Optimiser le temps où l'on est 100% safe pour faire de la collecte d'informations et de la stratégie."
        },
        {
          id: 2,
          text: "Je sors mon arme dès le spawn au cas où un terro 'rusherait' de manière imprévisible.",
          quality: "blunder",
          feedback: "Paranoïa inutile. Mathématiquement (vitesse de déplacement), il est impossible de croiser un terro dans les premières secondes au spawn CT. Vous perdez en vitesse de déplacement (couteau vs arme)."
        },
        {
          id: 3,
          text: "Je cours silencieusement tout le long du trajet pour ne donner aucune info.",
          quality: "blunder",
          feedback: "Courir en 'shift' dans une zone de confort vous fait perdre un temps précieux pour prendre des positions avancées cruciales."
        },
        {
          id: 4,
          text: "Je cours rapidement vers ma ligne sans regarder le radar ni parler.",
          quality: "good",
          feedback: "C'est mécanique et efficace, mais vous gâchez une fenêtre d'opportunité stratégique (analyse, communication) qui différencie les bons joueurs des excellents."
        }
      ]
    }
  ];

  if (!packs.find(p => p.id === newPackId)) {
    packs.push(newPack);
    await fs.writeFile(packsPath, JSON.stringify(packs, null, 2));
    console.log("Pack added.");
  } else {
    console.log("Pack already exists.");
  }

  let addedScenarios = 0;
  for (const s of newScenarios) {
    if (!scenarios.find(ex => ex.id === s.id)) {
      scenarios.push(s);
      addedScenarios++;
    }
  }
  
  if (addedScenarios > 0) {
    await fs.writeFile(scenariosPath, JSON.stringify(scenarios, null, 2));
    console.log(`${addedScenarios} scenarios added.`);
  } else {
    console.log("Scenarios already exist.");
  }
}

main().catch(console.error);