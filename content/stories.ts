// The stories behind the four story shards, told by Lee, the building. A visitor opens one by
// clicking an unlocked shard (see CURRENT_PHASE in config/phases.ts). One story per phase, shown
// like a short blog post: the photo at the top, then the small line, the title, the text and the
// signature.
//
// To change a story, edit the text below:
// - each string in `paragraphs` is one paragraph;
// - "\n" inside a string starts a new line within the same paragraph;
// - `eyebrow`, `title` and `signature` can be left out.

export type Story = {
  /** Small line above the title. */
  eyebrow?: string;
  title?: string;
  /**
   * The photo at the top of the story, a path in public/. It is shown as a 3:2 rectangle,
   * cropped from the centre if the photo has another shape.
   */
  image: string;
  /** Describes the photo for screen readers. */
  imageAlt: string;
  /** The story, one string per paragraph. */
  paragraphs: string[];
  /** Shown in italics below the story. */
  signature?: string;
};

/** How a story is named for screen readers: its title, or the small line when it has none. */
export const storyName = (story: Story) => story.title ?? story.eyebrow ?? "Lee";

export const STORIES: Record<1 | 2 | 3 | 4, Story> = {
  1: {
    eyebrow: "Hoofdstuk 1",
    image: "/glass/phases/phase-1.webp",
    imageAlt: "Een lange schoolgang in warm avondlicht, met ramen, radiatoren en planten op de vensterbank.",
    paragraphs: [
      "Binnenkort wordt het stil in mijn gangen.",
      "Ik ben het gewend, stilte. Ooit was ze alles wat ik kende.",
      "Stille gebeden. Voetstappen die niet wilden storen. Een bel die de uren telde, en verder niets.",
      "Toen kwam het geluid. Lachende stemmen in de trappenhal.",
      "Voetstappen die twee treden tegelijk namen. Mensen die elkaar door de gangen toeriepen.",
      "Ik heb nooit gepraat. Ik heb alleen geluisterd. Nu wordt het weer stil.",
      "Maar deze keer weet ik niet wat er daarna komt. Er zijn verhalen die ik nooit heb verteld.",
      "Ik heb ze al die tijd bewaard.",
      "Wil je ze horen?",
    ],
    signature: "— Lee",
  },
  2: {
    eyebrow: "Hoofdstuk 2",
    title: "Mijn ouders",
    image: "/glass/phases/phase-2.webp",
    imageAlt: "Bakstenen schoolgebouwen met verlichte ramen en straatlantaarns, in de blauwe avondschemering.",
    paragraphs: [
      "Ik ben niet in één keer gebouwd.",
      "Vijf mensen, 73 jaar.",
      "Pieter. Henri. Edmond. Gaston. Prosper.",
      "Ik ken ze nog allemaal.",
      "Ze tekenden mij op papier, lijn na lijn, tussen 1886 en 1959.",
      "Ze bepaalden waar mijn trappen kwamen,\nwelk raam het ochtendlicht zou vangen,\nhoe breed mijn gangen werden.",
      "Ik heb hun stemmen zelden gehoord.",
      "Ik ken alleen hun handschrift.",
      "Vijf handen, en toch één gebouw.",
      "Elke lijn had een reden.",
      "En ik ben het bijna vergeten.",
      "Ze bouwden mij om gezien te worden.",
      "Dat wil ik nog één keer.",
    ],
    signature: "— Lee",
  },
  3: {
    eyebrow: "Hoofdstuk 3",
    title: "Mijn stem",
    image: "/glass/phases/phase-3.webp",
    imageAlt: "Een oude zwarte telefoon onder een lamp, achter een raam vol regendruppels.",
    paragraphs: [
      "Ik heb het je al verteld: stilte is wat ik ken.",
      "Voor de studenten kwamen, was ik een klooster.",
      "De zusters franciscanessen, vanaf 1888.",
      "Ze spraken weinig. Ze zongen wel.",
      "Bijna een eeuw lang waren ze er. Wanneer ze vertrokken, weet ik niet meer.",
      "Op een manier ben ik nog altijd een klooster.",
      "Achter een deur in mijn gang ligt nog de trap naar toen.",
      "Bijna niemand gaat er nog doorheen.",
      "Daar is het nog stil, zoals vroeger.",
      "Eén geluid klonk toen luider dan alle andere. De bel.",
      "Ze bepaalde wanneer er gebeden werd, gegeten, geslapen.",
      "Ik dacht dat dat mijn stem was.",
      "Tot ze stilviel.",
      "Sindsdien wist ik niet meer hoe ik moest spreken.",
      "Tot nu.",
      "Nu probeer ik het op een andere manier.",
    ],
    signature: "— Lee",
  },
  4: {
    eyebrow: "Hoofdstuk 4",
    title: "Wat ik was",
    image: "/glass/phases/phase-4.webp",
    imageAlt: "Een open smeedijzeren poort met het woord Zoo, tussen lantaarns in de mist.",
    paragraphs: [
      "Ik moet je nog één ding vertellen.",
      "Ik zei dat stilte alles was wat ik kende.",
      "Dat is niet helemaal waar.",
      "Toen ik jong was, lag er een dierentuin naast mij.",
      // TODO: the text has a note here, "[Een beeld: het gebrul, de geur, de kooien.]". Add the line once it is written.
      "Mensen kwamen van overal om te kijken.",
      "Ik keek mee.",
      "Later werd ik een klooster, en daarna een school.",
      "Telkens zeiden anderen wat ik moest worden.",
      "Ik was het graag.",
      "Maar niemand vroeg wat ik zelf wilde zijn.",
      "Nu wordt het weer stil.",
      "En voor het eerst vraag ik het zelf.",
      // The text says "[datum]": filled in with the festival date.
      "Kom op 23 januari 2027.",
      "Dan vertel ik je de rest van mijn verhalen.",
      "Iedereen is welkom, alleen of samen.",
      "Neem gerust familie, vrienden, buren of kinderen mee.",
      "Je hoeft niets mee te brengen.",
    ],
    signature: "— Lee",
  },
};
