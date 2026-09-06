import { LearnCalloutKind, LearnFigure, LearnSlide, LearnSlideDeck } from './learn-slides.model';

/**
 * Single source for the illustrated slide decks: the English copy lives next to
 * the slide structure, and both the i18n dictionary (LEARN_SLIDES_I18N) and the
 * key-based decks (LEARN_SLIDE_DECKS) are derived from it. Keys follow
 * `${unitPrefix}.slide${n}.title|p1..|callout|fact1..|caption`.
 */
interface SlideSource {
  title: string;
  body: readonly string[];
  /** `labels` are English figure labels turned into `${slide}.fig.lN` keys → params.labelKeys. */
  figure?: LearnFigure & { caption?: string; labels?: readonly string[] };
  callout?: { kind: LearnCalloutKind; text: string };
  facts?: readonly string[];
}

function buildDeck(prefix: string, slides: readonly SlideSource[]): { deck: LearnSlideDeck; i18n: Record<string, string> } {
  const i18n: Record<string, string> = {};
  const deck: LearnSlide[] = slides.map((s, i) => {
    const p = `${prefix}.slide${i + 1}`;
    i18n[`${p}.title`] = s.title;
    const bodyKeys = s.body.map((text, j) => {
      const k = `${p}.p${j + 1}`;
      i18n[k] = text;
      return k;
    });
    const slide: LearnSlide = { id: `slide${i + 1}`, titleKey: `${p}.title`, bodyKeys };
    if (s.figure) {
      const { caption, labels, ...fig } = s.figure;
      slide.figure = { ...fig };
      if (caption) {
        i18n[`${p}.caption`] = caption;
        slide.figure.captionKey = `${p}.caption`;
      }
      if (labels?.length) {
        const labelKeys = labels.map((text, k) => {
          const key = `${p}.fig.l${k + 1}`;
          i18n[key] = text;
          return key;
        });
        slide.figure.params = { ...(slide.figure.params ?? {}), labelKeys };
      }
    }
    if (s.callout) {
      i18n[`${p}.callout`] = s.callout.text;
      slide.callout = { kind: s.callout.kind, textKey: `${p}.callout` };
    }
    if (s.facts?.length) {
      slide.factKeys = s.facts.map((text, k) => {
        const key = `${p}.fact${k + 1}`;
        i18n[key] = text;
        return key;
      });
    }
    return slide;
  });
  return { deck, i18n };
}

const VOLTAGE: readonly SlideSource[] = [
  {
    title: 'Why does anything move at all?',
    body: [
      'Every electric circuit is about moving charge. Charge does not move on its own — something has to push it. That push is voltage.',
      'Think of two water tanks joined by a pipe. If both water levels are equal, nothing happens. Raise one tank and water flows to the lower one. The height difference is the push; the flow is the result.',
      'Voltage works the same way: it is a difference in electrical “level” (potential) between two points. The bigger the difference, the harder charge is pushed.'
    ],
    figure: {
      kind: 'water-tanks',
      caption: 'Same level → no flow. A level difference → flow. Voltage is the level difference.'
    }
  },
  {
    title: 'Voltage is always a difference',
    body: [
      'A single point does not “have” 5 volts by itself. Voltage is measured between two points, so it is always a comparison: this point relative to that one.',
      'A battery keeps a fixed difference between its two terminals. A 5 V battery means the + terminal sits 5 volts higher than the − terminal — no matter what else is in the circuit.',
      'The unit is the volt, symbol V, named after Alessandro Volta. In formulas voltage is written U (Europe) or V (English textbooks). Electro Lab labels use V.'
    ],
    figure: {
      kind: 'battery-meter',
      params: { volts: '5 V' },
      caption: 'A voltmeter is connected across two points and reports the difference between them.'
    },
    callout: { kind: 'tip', text: 'Say “across”, not “through”: voltage is across a part, current flows through it.' }
  },
  {
    title: 'Where voltage comes from',
    body: [
      'A battery separates charge chemically: one terminal ends up with a surplus of electrons (−), the other with a shortage (+). That separation is stored energy waiting to push charge around a loop.',
      'Sources come in very different sizes. A single AA cell gives about 1.5 V, a USB port 5 V, a small block battery 9 V, a car battery 12 V. Mains outlets are 230 V (120 V in some countries) — far outside the safe teaching range.',
      'In the Lab the battery symbol is an ideal source: its terminals always keep the set voltage, whatever you connect.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'V', ticks: ['1.5', '5', '9', '12', '230'], marks: [0.08, 0.3, 0.42, 0.5, 0.95] },
      caption: 'Typical voltages, from a single cell to a wall socket (not to scale).'
    },
    callout: { kind: 'warning', text: 'Everything in these lessons stays below 24 V. Mains voltage can stop a heart — never experiment with it.' }
  },
  {
    title: 'Ground: the zero we agree on',
    body: [
      'Because voltage is a difference, we need a common reference to talk about “the voltage at a node”. That reference is called ground, and by definition it sits at 0 V.',
      'Every node label in the Lab is measured against ground. When a node shows 2.25 V, it is 2.25 V above ground. Ground itself always reads 0.00 V.',
      'Ground is usually the battery’s − terminal. Nothing special happens there physically — it is simply the point everybody measures from, like sea level for altitudes.'
    ],
    figure: {
      kind: 'potential-ladder',
      params: { levels: ['5 V', '2.25 V', '0 V'] },
      caption: 'Potentials are heights on a ladder; ground is the rung we call zero.'
    }
  },
  {
    title: 'Voltage without current',
    body: [
      'Open a switch in the loop and the current stops completely — yet the battery voltage is still there. A voltmeter across the open switch reads the full battery voltage.',
      'This is the key idea: voltage is a potential to push, not the pushing itself. A charged battery on the shelf has voltage between its terminals and zero current.',
      'Only when a closed path exists does that potential turn into moving charge.'
    ],
    figure: {
      kind: 'loop',
      params: { switchOpen: true, flow: false, meter: 'volt-switch' },
      caption: 'Open switch: no current anywhere, but the meter still sees the battery’s 5 V across the gap.'
    }
  },
  {
    title: 'Voltage is shared around the loop',
    body: [
      'Close the switch and the battery’s 5 V is divided among the parts in the path. In the LED circuit about 2.75 V appears across the resistor and about 2.25 V across the LED. The pieces add back up to 5 V.',
      'This is Kirchhoff’s voltage law: around any closed loop, the rises (sources) equal the sum of the drops (loads). Nothing is lost; the potential is simply spent along the way.',
      'You will use this constantly: “how much is left for the LED?” is always “battery minus everything else in series”.'
    ],
    figure: {
      kind: 'loop',
      params: { flow: true, drops: true },
      caption: '5 V = 2.75 V (resistor) + 2.25 V (LED). The drops around the loop sum to the source.'
    },
    callout: { kind: 'formula', text: 'U_battery = U_resistor + U_LED' }
  },
  {
    title: 'Measuring voltage in the Lab',
    body: [
      'In the Lab, run DC and every node shows its voltage against ground. Use the Probe tool on a wire or pin to highlight a net and read its value.',
      'A voltmeter is always connected in parallel — across the two points you care about — because it must see the difference between them without becoming part of the path.',
      'A real voltmeter has a very high resistance so almost no current flows through it. Connecting it in series would break the circuit and read the whole battery instead.'
    ],
    figure: {
      kind: 'loop',
      params: { flow: true, meter: 'volt-led' },
      caption: 'The voltmeter sits across the LED (parallel) and reads the LED’s drop.'
    }
  },
  {
    title: 'Voltage — what to remember',
    body: ['Five ideas carry everything that follows:'],
    facts: [
      'Voltage is a difference in electric potential between two points — the push behind current.',
      'It is measured in volts (V), across a part, with a meter in parallel.',
      'Ground is the agreed 0 V reference; node labels are measured against it.',
      'A source can have voltage with zero current (open loop). Current needs a closed path.',
      'Around a closed loop the drops add up to the source voltage (Kirchhoff’s voltage law).'
    ]
  }
];

const CURRENT: readonly SlideSource[] = [
  {
    title: 'Current is charge on the move',
    body: [
      'Metals are full of electrons that are free to drift. Apply a voltage and they start moving in one direction. That organised drift is electric current.',
      'Current is measured as how much charge passes a point per second. The unit is the ampere (A): one ampere means one coulomb of charge — about 6.2 quintillion electrons — passing every second.',
      'The symbol in formulas is I (from the French intensité). In the Lab, currents appear as labels on parts and as moving dashes along wires.'
    ],
    figure: {
      kind: 'charge-flow',
      params: { mode: 'basic' },
      caption: 'Charge drifting through a wire. Count what passes the gate each second and you have the current.'
    },
    callout: { kind: 'formula', text: 'I = Q / t   (amperes = coulombs per second)' }
  },
  {
    title: 'Which way does it flow?',
    body: [
      'Schematics use conventional current: it flows from the + terminal, through the circuit, back to −. Arrows, LED symbols and the Lab’s dashes all follow this convention.',
      'Historically nobody knew that the moving particles are negatively charged electrons, which actually drift the other way — from − to +. Both descriptions give identical results, so engineers kept the original convention.',
      'Whenever you see an arrow on a diagram, read it as conventional current. It tells you which way the LED must point and which way a meter must be connected.'
    ],
    figure: {
      kind: 'charge-flow',
      params: { mode: 'directions' },
      caption: 'Conventional current (top arrow) runs + → −; the electrons themselves drift − → +.'
    }
  },
  {
    title: 'How much is an ampere?',
    body: [
      'One ampere is a lot for small electronics. Most of the values you meet are thousandths of an ampere, written mA (milliampere): 1 A = 1000 mA.',
      'A sensor input may draw a few microamperes (µA), an indicator LED about 10–20 mA, a phone charging 500 mA to 2 A, an electric kettle around 10 A.',
      'Getting comfortable with mA is essential: an LED at 15 mA is happy, at 40 mA it is in trouble, at 1 A it is gone in an instant.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'A', ticks: ['1 µA', '15 mA', '500 mA', '2 A', '10 A'], marks: [0.05, 0.3, 0.55, 0.7, 0.92] },
      caption: 'From microamperes in sensors to amperes in heaters (not to scale).'
    }
  },
  {
    title: 'Current needs a closed loop',
    body: [
      'Charge cannot pile up anywhere or vanish. For it to keep moving it needs a complete path: out of the source, through the parts, and back into the source.',
      'Break the loop at any point — an open switch, a loose wire, a burnt part — and the current everywhere drops to zero instantly. The battery still has voltage; it simply has nothing to push through.',
      'This is why the return wire to ground matters as much as the wire from the battery. Every teaching circuit in the Lab is a closed loop.'
    ],
    figure: {
      kind: 'loop',
      params: { flow: true },
      caption: 'A complete path: battery + → resistor → LED → ground → battery −. The dashes show the current.'
    }
  },
  {
    title: 'Same current all the way round',
    body: [
      'In a single loop there is exactly one current. The same 12.5 mA that leaves the battery passes the resistor, the LED and the return wire. There is nowhere else for it to go.',
      'Where a wire splits, the current divides — but what flows in must equal what flows out. This is Kirchhoff’s current law: at any junction the sum of incoming currents equals the sum of outgoing currents.',
      'You will use it to reason about parallel branches: two LEDs side by side each take their share, and the battery supplies the total.'
    ],
    figure: {
      kind: 'junction',
      params: { inA: '30 mA', outA: '18 mA', outB: '12 mA' },
      caption: 'At a junction, in = out: 30 mA splits into 18 mA and 12 mA.'
    },
    callout: { kind: 'formula', text: 'I_in = I_out1 + I_out2   (Kirchhoff’s current law)' }
  },
  {
    title: 'Measuring current',
    body: [
      'To measure current you must let it pass through the meter: an ammeter is connected in series, in the path itself. Break the loop, insert the meter, close the loop again.',
      'An ammeter has almost zero resistance so it barely disturbs the circuit. Connecting it across a battery (in parallel) is the classic mistake — it shorts the source and blows the meter’s fuse.',
      'In the Lab you rarely need one: the DC results list every branch current, and the dash speed on each wire scales with the current flowing there.'
    ],
    figure: {
      kind: 'loop',
      params: { flow: true, meter: 'amp' },
      caption: 'The ammeter sits in series on the top wire and reads the loop current.'
    }
  },
  {
    title: 'Too much current',
    body: [
      'Current does work: moving charge through resistance produces heat. A little heat is fine; too much destroys parts. Wires melt insulation, resistors char, LEDs burn out.',
      'The Lab LEDs model this: bright and healthy up to about 20 mA, overloaded above that, and permanently burnt above roughly 35 mA until you replace them.',
      'Limiting current is the everyday job of the resistor — the subject of the next lesson.'
    ],
    figure: {
      kind: 'current-bar',
      params: { safeMax: 20, burn: 35, max: 45 },
      caption: 'LED current zones in the Lab: comfortable, overloaded, and destroyed.'
    },
    callout: { kind: 'warning', text: 'Never connect an LED straight across a battery — without a resistor the current is limited only by the LED’s own destruction.' }
  },
  {
    title: 'Current — what to remember',
    body: ['Keep these five ideas close:'],
    facts: [
      'Current is the rate of charge flow, measured in amperes (A); small circuits live in mA.',
      'Conventional current runs from + to −; arrows and LED symbols follow it.',
      'Current needs a closed loop — break it anywhere and it stops everywhere.',
      'In a single loop the current is the same at every point; at a junction in = out.',
      'Measure current in series with an ammeter; too much current means heat and burnt parts.'
    ]
  }
];

const RESISTANCE: readonly SlideSource[] = [
  {
    title: 'Resistance pushes back',
    body: [
      'Push water through a wide pipe and it flows easily; through a narrow pipe and much less gets through for the same pressure. Electrical resistance is that narrowness.',
      'Every material resists the flow of charge to some degree. Copper barely does — a wire is a very wide pipe. Carbon, thin metal films and long thin wires resist more.',
      'The unit is the ohm, symbol Ω, named after Georg Ohm. One ohm lets one ampere flow when one volt pushes across it.'
    ],
    figure: {
      kind: 'pipes',
      caption: 'Same push, different pipes: the narrow one lets much less through. Narrow = high resistance.'
    }
  },
  {
    title: 'The resistor',
    body: [
      'A resistor is a part built to have a precise, stable resistance. Inside is a carbon or metal film trimmed to the wanted value; outside are colour bands that spell the number.',
      'The Lab uses the zig-zag symbol; many European diagrams use a plain rectangle. Both mean the same thing, and a resistor has no polarity — either way round works.',
      'Read the bands as digits: red-red-brown means 2, 2, ×10 = 220 Ω. The fourth band is tolerance; gold is ±5 %.'
    ],
    figure: {
      kind: 'resistor-bands',
      params: { colors: ['#dc2626', '#dc2626', '#92400e', '#d4a017'], value: '220 Ω' },
      caption: 'A 220 Ω resistor: red (2), red (2), brown (×10), gold (±5 %).'
    }
  },
  {
    title: 'Ohm’s law',
    body: [
      'Georg Ohm found that for a resistor the current is proportional to the voltage across it, and the constant of proportionality is the resistance: U = I · R.',
      'Rearranged, I = U / R: more voltage gives more current, more resistance gives less. And R = U / I lets you measure an unknown resistance from a meter reading.',
      'Worked example: a 5 V battery feeds a resistor and an LED that takes 2 V. The resistor sees 5 − 2 = 3 V. With R = 220 Ω, the current is 3 / 220 ≈ 0.0136 A = 13.6 mA — a comfortable LED current.'
    ],
    figure: {
      kind: 'ohm-triangle',
      caption: 'Cover the quantity you want; the two left over show how to compute it.'
    },
    callout: { kind: 'formula', text: 'U = I · R\nI = U / R\nR = U / I' }
  },
  {
    title: 'More resistance, less current',
    body: [
      'Fix the voltage and step through resistances: 100 Ω passes 30 mA from 3 V, 220 Ω passes 13.6 mA, 1 kΩ only 3 mA. Doubling R halves I.',
      'This inverse relationship is what makes a resistor a current limiter. Choose the resistance and you have chosen how much current the LED gets.',
      'In the Lab, edit the resistor value in the inspector and re-run DC. The LED current label and its brightness follow Ohm’s law exactly.'
    ],
    figure: {
      kind: 'ohm-graph',
      params: { volts: 3, rows: [['100 Ω', 30], ['220 Ω', 13.6], ['470 Ω', 6.4], ['1 kΩ', 3]] },
      caption: 'Current from 3 V for four resistor values: the bigger the R, the smaller the I.'
    }
  },
  {
    title: 'Resistors in series add up',
    body: [
      'Put two resistors one after the other and the current must squeeze through both narrow sections. Their resistances simply add: 220 Ω + 220 Ω = 440 Ω.',
      'That is why an LED plus its resistor behave like one combined load, and why adding a second resistor in the path dims the LED.',
      'Parallel resistors do the opposite — they open a second pipe and lower the total — which you will meet in the series-vs-parallel lesson.'
    ],
    figure: {
      kind: 'series-resistors',
      params: { r1: '220 Ω', r2: '220 Ω', total: '440 Ω' },
      caption: 'Series resistances add.'
    },
    callout: { kind: 'formula', text: 'R_series = R1 + R2 + …' }
  },
  {
    title: 'Everything has resistance',
    body: [
      'A short copper wire is a few milliohms (mΩ) — so small the Lab treats wires as perfect. Human skin is tens of kΩ to MΩ, which is what keeps low voltages harmless.',
      'Some parts change resistance on purpose: a potentiometer by turning a knob, a light-dependent resistor with brightness, a thermistor with temperature. They turn the physical world into something a circuit can measure.',
      'Insulators such as plastic or glass are so high in resistance that practically nothing flows — which is exactly the job of wire insulation.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'Ω', ticks: ['mΩ', 'Ω', 'kΩ', 'MΩ', 'GΩ'], marks: [0.05, 0.27, 0.5, 0.72, 0.94] },
      caption: 'Twelve orders of magnitude: from copper wire to glass insulation.'
    }
  },
  {
    title: 'Resistance turns energy into heat',
    body: [
      'Pushing charge through resistance costs energy, and that energy leaves as heat. The power is P = U · I, or with Ohm’s law, P = I² · R.',
      'Our 220 Ω resistor at 13.6 mA dissipates 3 V × 0.0136 A ≈ 0.04 W — nothing for a standard ¼ W part. Force 100 mA through it and the power jumps to 2.2 W: it would char within seconds.',
      'Every resistor has a power rating. Staying well below it is as important as picking the right ohms.'
    ],
    figure: {
      kind: 'heat',
      params: { power: '0.04 W', rating: '¼ W' },
      caption: 'Power in a resistor is I²·R. Keep it under the part’s rating.'
    },
    callout: { kind: 'formula', text: 'P = U · I = I² · R' }
  },
  {
    title: 'Resistance — what to remember',
    body: ['You now have the third leg of the triangle:'],
    facts: [
      'Resistance opposes current; it is measured in ohms (Ω). Wires ≈ 0 Ω, insulators ≈ ∞.',
      'Ohm’s law: U = I · R. Fix U, and more R means less I.',
      'A resistor limits current and has no polarity; colour bands encode its value.',
      'Series resistances add. Parallel ones reduce the total.',
      'Current through resistance makes heat: P = I² · R — respect the power rating.'
    ]
  }
];


const OHMS_LAW: readonly SlideSource[] = [
  {
    title: 'Three quantities, one law',
    body: [
      'You have met voltage (the push), current (the flow) and resistance (the push-back). Ohm’s law ties them together in a single line: U = I · R.',
      'It holds for every ohmic part — resistors, wires, heating elements — at any moment. Know two of the three quantities and the third is fixed.',
      'The triangle is the classic memory aid: cover the quantity you want and the remaining two, side by side or one over the other, give the formula.'
    ],
    figure: { kind: 'ohm-triangle', caption: 'U on top, I and R below. Cover one to read off how it is computed.' },
    callout: { kind: 'formula', text: 'U = I · R' }
  },
  {
    title: 'The law as a straight line',
    body: [
      'Plot current against voltage for a resistor and you get a straight line through the origin. Double the voltage, double the current. The slope of the line is 1 / R.',
      'A bigger resistance gives a flatter line: for the same voltage, less current gets through. A smaller resistance gives a steeper one.',
      'This straightness is what “ohmic” means. Parts that draw a straight line obey Ohm’s law; parts that curve (LEDs, diodes) do not — more on that in a moment.'
    ],
    figure: {
      kind: 'ohm-graph',
      params: { mode: 'iv', lines: [['220 Ω', 1], ['470 Ω', 0.47]] },
      caption: 'I against U for two resistors. The steeper line is the smaller resistance.'
    }
  },
  {
    title: 'Worked example: choosing an LED resistor',
    body: [
      'A 5 V supply, a red LED that needs about 2 V, and a target of 15 mA. First find what the resistor must absorb: 5 V − 2 V = 3 V.',
      'Then Ohm’s law in the form R = U / I: 3 V / 0.015 A = 200 Ω. Resistors come in standard values, so pick the nearest one upward: 220 Ω.',
      'Check the result: with 220 Ω the current is 3 V / 220 Ω ≈ 13.6 mA — a little under target, which is the safe side. This is exactly the resistor in the Lab’s LED example.'
    ],
    figure: {
      kind: 'loop',
      params: { flow: true, drops: true, designators: true },
      caption: 'R1 absorbs the 2.75 V the LED does not need; Ohm’s law sizes it.'
    },
    callout: { kind: 'formula', text: 'R = (U_supply − U_LED) / I = 3 V / 0.015 A = 200 Ω → 220 Ω' }
  },
  {
    title: 'Worked example: finding an unknown resistance',
    body: [
      'Measure the voltage across a part and the current through it, and Ohm’s law hands you the resistance: R = U / I.',
      'Say a voltmeter across a resistor reads 3.0 V while an ammeter in series reads 6.4 mA. Then R = 3.0 V / 0.0064 A ≈ 470 Ω.',
      'That is how a multimeter’s ohms range works internally: it pushes a known tiny current through the part and measures the voltage that appears.'
    ],
    figure: {
      kind: 'loop',
      params: { flow: true, meter: 'amp' },
      caption: 'Ammeter in series, voltmeter across the part: two readings, one division.'
    }
  },
  {
    title: 'Prefixes without slips',
    body: [
      'Real numbers come with prefixes: kilo (k, ×1000), mega (M, ×1 000 000), milli (m, ÷1000), micro (µ, ÷1 000 000). Most Ohm’s-law mistakes are prefix mistakes.',
      'A tidy habit: convert everything to base units before dividing. 3 V / 2.2 kΩ becomes 3 / 2200 = 0.00136 A, then read that back as 1.36 mA.',
      'Handy shortcut: volts divided by kilo-ohms gives milliamperes directly (3 V / 2.2 kΩ = 1.36 mA), and volts divided by mega-ohms gives microamperes.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: '×', ticks: ['µ (10⁻⁶)', 'm (10⁻³)', '1', 'k (10³)', 'M (10⁶)'], marks: [0.08, 0.3, 0.5, 0.7, 0.92] },
      caption: 'Each prefix step is a factor of one thousand.'
    },
    callout: { kind: 'tip', text: 'V ÷ kΩ = mA.\nV ÷ MΩ = µA.\nmA × kΩ = V.' }
  },
  {
    title: 'Where Ohm’s law stops',
    body: [
      'An LED does not draw a straight line. Below its forward voltage almost nothing flows; above it the current climbs steeply. Its “resistance” changes with the voltage, so R = U / I gives a different number at every point.',
      'Filament bulbs bend the other way: the hot filament has much more resistance than a cold one. Semiconductors, sensors and batteries all have their own curves.',
      'This is why an LED needs a resistor: the resistor is the ohmic part that turns a fixed supply into a predictable current, while the LED simply takes its ~2 V.'
    ],
    figure: {
      kind: 'ohm-graph',
      params: { mode: 'iv-nonlinear' },
      caption: 'Resistor (straight) versus LED (curved): only the straight line follows Ohm’s law.'
    }
  },
  {
    title: 'Power from Ohm’s law',
    body: [
      'Electrical power is voltage times current: P = U · I, in watts. Combine it with Ohm’s law and you get two more useful forms: P = I² · R and P = U² / R.',
      'Our LED resistor: 2.75 V × 13.6 mA ≈ 0.037 W. A standard resistor is rated ¼ W, so it runs cool. A 10 Ω resistor straight across 5 V would take 0.5 A and 2.5 W — smoke.',
      'Whenever you pick a resistor, ask two questions: how many ohms, and how many watts.'
    ],
    figure: { kind: 'heat', params: { power: '0.037 W', rating: '¼ W' }, caption: 'Power turns into heat inside the resistor.' },
    callout: { kind: 'formula', text: 'P = U · I = I² · R = U² / R' }
  },
  {
    title: 'Ohm’s law — what to remember',
    body: ['The working rules:'],
    facts: [
      'U = I · R links voltage, current and resistance for any ohmic part.',
      'Size an LED resistor with R = (U_supply − U_LED) / I, then round up to a standard value.',
      'Find an unknown resistance from a voltage and a current reading: R = U / I.',
      'Convert prefixes to base units first; V ÷ kΩ gives mA.',
      'LEDs and other non-ohmic parts curve — that is why they need an ohmic resistor in series.',
      'Power P = U · I = I² · R; check the wattage as well as the ohms.'
    ]
  }
];

const CIRCUIT_ELEMENTS: readonly SlideSource[] = [
  {
    title: 'What every circuit is made of',
    body: [
      'Strip any circuit down and you find the same four roles: a source that supplies the push, a load that uses the energy, a path of wires that closes the loop, and usually a control that decides when it runs.',
      'In the Lab’s LED example the battery is the source, the LED is the load, the resistor protects it, the switch is the control and ground closes the return.',
      'This lesson walks through the parts on the Lab palette, what each one does and how to recognise its symbol.'
    ],
    figure: {
      kind: 'loop',
      params: { switchOpen: false, flow: true, designators: true },
      caption: 'Source (V1), control (S1), load (R1 + D1) and the return through ground.'
    }
  },
  {
    title: 'Sources',
    body: [
      'A battery gives steady DC. On the symbol the long line is +, the short thick line is −. In the Lab you set its voltage in the inspector.',
      'An AC source (the sine-wave circle) swings its voltage back and forth — mains, audio and radio signals are all AC. A pulse source jumps between two levels, like a digital pin or a clock.',
      'Every source has two terminals; energy leaves at one and returns at the other. No source can push charge out without taking it back.'
    ],
    figure: {
      kind: 'elements-grid',
      params: { parts: ['battery', 'ac_source', 'pulse_source'] },
      labels: ['Battery (DC)', 'AC source', 'Pulse source'],
      caption: 'The three sources on the Lab palette.'
    }
  },
  {
    title: 'Passive parts',
    body: [
      'A resistor limits current and sets voltages. It is the workhorse of every circuit and the part you will place most often.',
      'A capacitor stores charge — energy in an electric field. It passes changing signals and blocks steady DC, so it smooths, times and filters.',
      'An inductor stores energy in a magnetic field. It resists changes in current and shows up in power supplies and radio. These three are “passive”: they never add energy, they only shape it.'
    ],
    figure: {
      kind: 'elements-grid',
      params: { parts: ['resistor', 'capacitor', 'inductor'] },
      labels: ['Resistor', 'Capacitor', 'Inductor'],
      caption: 'Resistance, capacitance and inductance — measured in ohms, farads and henries.'
    }
  },
  {
    title: 'Semiconductors',
    body: [
      'A diode is a one-way valve: current flows from anode to cathode (the bar) and is blocked the other way. It costs about 0.7 V to open.',
      'An LED is a diode that emits light while conducting. It drops about 2 V and must be current-limited — the arrows on the symbol point outward, for light leaving.',
      'Transistors are controllable valves: a small current or voltage at one terminal switches a much larger current at the others. The BJT (base, collector, emitter) and the MOSFET (gate, drain, source) are the two you will meet in later modules.'
    ],
    figure: {
      kind: 'elements-grid',
      params: { parts: ['diode', 'led', 'bjt_npn', 'nmos'] },
      labels: ['Diode', 'LED', 'NPN transistor', 'N-MOSFET'],
      caption: 'One-way parts and electronic switches.'
    },
    callout: { kind: 'tip', text: 'Diode and LED symbols are arrows: current flows in the direction the arrow points.' }
  },
  {
    title: 'Controls and protection',
    body: [
      'A switch opens or closes the path; a pushbutton does the same only while pressed. Both are shown open or closed on the symbol — in the Lab, click a switch to toggle it.',
      'A potentiometer is a resistor with a sliding third terminal (the wiper). Turn it and the resistance between the wiper and each end changes — the volume knob idea.',
      'A fuse is a deliberate weak link: a thin wire that melts when the current exceeds its rating, breaking the loop before anything else burns.'
    ],
    figure: {
      kind: 'elements-grid',
      params: { parts: ['switch', 'pushbutton', 'potentiometer', 'fuse'] },
      labels: ['Switch', 'Pushbutton', 'Potentiometer', 'Fuse'],
      caption: 'Parts that decide when and how much current flows.'
    }
  },
  {
    title: 'Wires, junctions, ground and meters',
    body: [
      'Wires are drawn as lines and treated as perfect conductors: zero resistance, zero voltage drop. A dot where wires meet is a junction — an electrical connection. Lines that merely cross without a dot are not connected.',
      'The ground symbol marks the 0 V reference. Every ground symbol in a diagram is the same node, even if no wire joins them on paper.',
      'Meters are parts too: a voltmeter goes across two points, an ammeter sits in the path. The Lab shows both readings automatically, so you rarely need to place them.'
    ],
    figure: {
      kind: 'elements-grid',
      params: { parts: ['junction', 'ground', 'voltmeter', 'ammeter'] },
      labels: ['Junction', 'Ground', 'Voltmeter', 'Ammeter'],
      caption: 'The connective tissue of a schematic, plus the two meters.'
    }
  },
  {
    title: 'Reading a schematic',
    body: [
      'A schematic is a map of connections, not a picture of the board. Parts can be anywhere on the page; only which pin joins which matters.',
      'Every part gets a reference designator — R1, D1, C1, V1, S1 — and usually its value next to the symbol: 220 Ω, 100 µF, 5 V. The Lab inspector shows and edits these.',
      'Read a schematic the way current does: start at the source’s + terminal, follow the wires through each part, and make sure you can get back to −. If you cannot, nothing will light.'
    ],
    figure: {
      kind: 'loop',
      params: { flow: true, designators: true, drops: true },
      caption: 'Designators name the parts; values and readings sit beside them.'
    }
  },
  {
    title: 'Circuit elements — what to remember',
    body: ['The vocabulary you now own:'],
    facts: [
      'Every circuit has a source, a load, a closed path and usually a control.',
      'Sources: battery (DC, long line is +), AC source, pulse source.',
      'Passives: resistor (limits), capacitor (stores charge, blocks DC), inductor (stores in a magnetic field).',
      'Semiconductors: diode and LED are one-way arrows; transistors are controllable valves.',
      'Controls: switch, pushbutton, potentiometer; a fuse protects by melting.',
      'Dots connect, crossings do not; all ground symbols are one node; designators name the parts.'
    ]
  }
];

const SERIES_PARALLEL: readonly SlideSource[] = [
  {
    title: 'Two ways to connect two loads',
    body: [
      'Take two resistors and a battery. Connect the resistors end to end so the current has a single path: that is a series circuit. Every charge that passes the first must pass the second.',
      'Or give each resistor its own wire from the battery’s + terminal back to −: that is a parallel circuit. The current splits, each branch taking a share.',
      'Almost every real circuit is a mixture of the two. Learning to see which parts are in series and which in parallel is the core skill of circuit reading.'
    ],
    figure: {
      kind: 'two-loads',
      params: { topology: 'series', labels: ['12 mA', '12 mA'] },
      caption: 'Series: one path, one current through both parts.'
    }
  },
  {
    title: 'Series rules',
    body: [
      'One path means one current: the same I flows through every part, so an ammeter reads the same anywhere in the chain.',
      'The battery voltage is shared. Each part takes a drop of U = I · R, and the drops add up to the source (Kirchhoff’s voltage law). A bigger resistor takes a bigger share.',
      'Resistances simply add: R_total = R1 + R2 + …. Two 220 Ω resistors in series act like one 440 Ω resistor, and the current halves compared with a single one.'
    ],
    figure: {
      kind: 'two-loads',
      params: { topology: 'series', labels: ['2.5 V', '2.5 V'], showTotal: '5 V' },
      caption: 'Two equal resistors in series each take half the 5 V.'
    },
    callout: { kind: 'formula', text: 'R_series = R1 + R2\nU_source = U1 + U2\nI is the same everywhere' }
  },
  {
    title: 'Parallel rules',
    body: [
      'Branches share the same two nodes, so every branch sees the full source voltage: U is the same across each.',
      'Currents add. Each branch draws I = U / R on its own, and the battery supplies the sum (Kirchhoff’s current law at the junction).',
      'The combined resistance is smaller than the smallest branch — you opened a second pipe. For two equal resistors it is exactly half; in general 1 / R_total = 1 / R1 + 1 / R2.'
    ],
    figure: {
      kind: 'two-loads',
      params: { topology: 'parallel', labels: ['6 mA', '6 mA'], showTotal: '12 mA' },
      caption: 'Parallel: same voltage on each branch, currents add at the battery.'
    },
    callout: { kind: 'formula', text: '1 / R_parallel = 1 / R1 + 1 / R2\nI_source = I1 + I2\nU is the same on each branch' }
  },
  {
    title: 'What breaks, and what keeps going',
    body: [
      'In a series string one failed part breaks the only path: old Christmas lights went dark all at once when a single bulb died.',
      'In parallel, each branch is its own loop. Remove one LED and the others stay lit at the same brightness — the battery just supplies less total current.',
      'That independence is why house wiring, USB hubs and LED strips use parallel branches, and why series is used when one current must be shared, like LEDs on a common resistor.'
    ],
    figure: {
      kind: 'two-loads',
      params: { topology: 'parallel', parts: 'led', labels: ['on', 'on'] },
      caption: 'Parallel LEDs light independently; one can fail without darkening the other.'
    }
  },
  {
    title: 'Mixing the two',
    body: [
      'The Lab’s series-parallel example puts a resistor in series with each LED, then the two resistor–LED pairs in parallel across the battery.',
      'Inside a branch the rules are series: the resistor and its LED share one current, and the resistor absorbs what the LED does not need. Between branches the rules are parallel: both see 5 V and their currents add at the supply.',
      'Solve mixed circuits from the inside out: collapse series parts into one, then parallel groups into one, until a single load is left.'
    ],
    figure: {
      kind: 'two-loads',
      params: { topology: 'parallel', parts: 'led', labels: ['13 mA', '13 mA'], showTotal: '26 mA' },
      caption: 'Each branch is a series pair; the branches are in parallel.'
    }
  },
  {
    title: 'Series or parallel? A quick test',
    body: [
      'Two parts are in series if the only way from one to the other is through a single wire with nothing else attached — the current has no alternative.',
      'Two parts are in parallel if both their ends connect to the same two nodes. Trace each end: same node on the left, same node on the right, then parallel.',
      'When neither holds, the parts are neither — you must simplify the surrounding network first.'
    ],
    figure: { kind: 'junction', params: { inA: 'I', outA: 'I₁', outB: 'I₂' }, caption: 'A junction is the tell-tale sign of parallel branches.' },
    callout: { kind: 'tip', text: 'Same current → series. Same voltage → parallel.' }
  },
  {
    title: 'In the Lab',
    body: [
      'Open the series-parallel example and Run DC. Probe the two branch nodes: both sit at the battery voltage on the top rail, which is the parallel signature.',
      'Read the branch currents on the LEDs and compare them with the battery current: the sum should match. Then delete one branch’s wire and re-run — the other LED does not care.',
      'Try the series-LEDs example next to see the opposite: one shared current and a supply voltage that has to cover every LED’s drop.'
    ],
    figure: {
      kind: 'two-loads',
      params: { topology: 'parallel', parts: 'led', labels: ['5 V', '5 V'] },
      caption: 'Probe both branches: the same 5 V across each is what parallel looks like.'
    }
  },
  {
    title: 'Series & parallel — what to remember',
    body: ['The two rule sets:'],
    facts: [
      'Series: one path, same current, voltages add, resistances add.',
      'Parallel: same voltage on every branch, currents add, total resistance drops (half for two equal parts).',
      'A broken series part stops everything; parallel branches are independent.',
      'Mixed circuits: simplify from the inside out.',
      'Same current → series. Same voltage → parallel.'
    ]
  }
];

const AC_DC: readonly SlideSource[] = [
  {
    title: 'Two kinds of current',
    body: [
      'Direct current (DC) always flows the same way. A battery, a USB port or a solar cell gives DC: the + terminal stays +, and the current is a steady value.',
      'Alternating current (AC) reverses direction many times a second. The voltage swings smoothly positive, then negative, then positive again in a sine wave. Wall sockets deliver AC.',
      'Everything you have built so far is DC. This lesson shows what changes when the voltage starts to swing.'
    ],
    figure: { kind: 'waveform', params: { mode: 'both' }, caption: 'DC: a flat line. AC: a sine wave crossing zero twice per cycle.' }
  },
  {
    title: 'DC up close',
    body: [
      'DC has a polarity. Swap the battery and the LED goes dark, a motor spins backwards, an electrolytic capacitor can fail. Every DC circuit has a + side and a − side.',
      'Steady does not mean perfectly flat: a “DC” supply may carry ripple, small waves left over from converting AC. Capacitors are used to smooth them out.',
      'The Lab’s DC analysis assumes everything has settled. It reports one voltage per node and one current per part — the numbers you have been probing.'
    ],
    figure: { kind: 'waveform', params: { mode: 'dc' }, caption: 'A 5 V DC supply: the same value at every instant.' }
  },
  {
    title: 'AC up close',
    body: [
      'One complete swing — up, down and back to the start — is a cycle. Its duration is the period T; the number of cycles per second is the frequency f = 1 / T, in hertz.',
      'European mains runs at 50 Hz (T = 20 ms); the Americas use 60 Hz. Audio spans roughly 20 Hz to 20 kHz; radio reaches millions of hertz.',
      'The height of the swing is the amplitude. Because it changes every instant, AC needs more than one number to describe its size.'
    ],
    figure: { kind: 'waveform', params: { mode: 'ac' }, caption: 'Period T and amplitude Û of a sine wave.' },
    callout: { kind: 'formula', text: 'f = 1 / T\n50 Hz ↔ T = 20 ms' }
  },
  {
    title: 'Peak, peak-to-peak and RMS',
    body: [
      'The peak value Û is the highest point of the wave; peak-to-peak is the full swing from bottom to top, twice the peak.',
      'The most useful number is the RMS (root-mean-square) value: the DC voltage that would heat a resistor equally. For a sine wave U_RMS = Û / √2 ≈ 0.707 · Û.',
      '“230 V mains” is an RMS value. Its peak is 230 × √2 ≈ 325 V, and it swings between +325 V and −325 V a hundred times a second.'
    ],
    figure: { kind: 'waveform', params: { mode: 'rms' }, caption: 'Peak Û, RMS at 0.707 Û, and the full peak-to-peak swing.' },
    callout: { kind: 'formula', text: 'U_RMS = Û / √2\nÛ = 1.414 · U_RMS' }
  },
  {
    title: 'Why the grid is AC and your gadgets are DC',
    body: [
      'AC won the grid because of the transformer: two coils on an iron core change AC voltage up or down with almost no loss, and only a changing current can do that. Power travels at hundreds of kilovolts to cut losses, then steps down to 230 V at your street.',
      'Chips, LEDs and batteries need steady DC, so every charger converts: transform down, rectify, smooth, regulate.',
      'The Lab’s power module walks through that chain part by part.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'V', ticks: ['5 V DC', '230 V AC', '20 kV', '400 kV'], marks: [0.08, 0.36, 0.64, 0.92] },
      caption: 'From the grid to a USB port: AC for transport, DC at the load.'
    }
  },
  {
    title: 'Turning AC into DC',
    body: [
      'A diode passes only one half of each AC cycle: the negative halves are cut away. This is rectification, and a bridge of four diodes flips the negative halves upward instead of discarding them.',
      'The result is bumpy DC. A capacitor across the output fills the gaps between bumps — charging at each peak and releasing charge in between — leaving a much smoother voltage with a little ripple.',
      'A regulator then holds the output at an exact value, such as 5 V, regardless of the ripple and the load.'
    ],
    figure: { kind: 'waveform', params: { mode: 'rectified' }, caption: 'Rectified AC (bumps) and the smoothed voltage a capacitor produces.' }
  },
  {
    title: 'AC in the Lab',
    body: [
      'Place an AC source, pick a frequency and run the AC analysis. Instead of a single voltage the Lab reports a magnitude and a phase for every node — how large the swing is and how far it is shifted in time.',
      'Capacitors behave differently under AC: they block DC completely but let AC through, more easily as the frequency rises. Inductors do the opposite.',
      'That frequency dependence is what filters exploit. The AC RC example is a low-pass filter: high frequencies are attenuated, low ones pass — the filters module builds on it.'
    ],
    figure: {
      kind: 'elements-grid',
      params: { parts: ['ac_source', 'resistor', 'capacitor', 'ground'] },
      labels: ['AC source', 'Resistor', 'Capacitor', 'Ground'],
      caption: 'The parts of the AC RC example.'
    }
  },
  {
    title: 'AC & DC — what to remember',
    body: ['The essentials:'],
    facts: [
      'DC flows one way at a steady value and has polarity; batteries and USB are DC.',
      'AC reverses direction in a sine wave; period T and frequency f = 1 / T (mains: 50 or 60 Hz).',
      'Describe AC by peak, peak-to-peak or RMS; for a sine U_RMS = Û / √2, and “230 V” is RMS.',
      'The grid uses AC because transformers only work with changing current; electronics run on DC.',
      'Diodes rectify, capacitors smooth, regulators hold the value.',
      'Under AC, capacitors pass changing signals and block steady ones — the basis of filters.'
    ]
  }
];

const built = {
  'voltage-intro': buildDeck('learn.project.voltageIntro', VOLTAGE),
  'current-intro': buildDeck('learn.project.currentIntro', CURRENT),
  'resistance-intro': buildDeck('learn.project.resistanceIntro', RESISTANCE),
  'ohms-law': buildDeck('learn.project.ohmsLaw', OHMS_LAW),
  'circuit-elements': buildDeck('learn.project.circuitElements', CIRCUIT_ELEMENTS),
  'series-parallel-circuits': buildDeck('learn.project.seriesParallelCircuits', SERIES_PARALLEL),
  'ac-dc': buildDeck('learn.project.acDc', AC_DC)
} as const;

/** Slide decks by unitSlug. Units without a deck fall back to the two lesson blocks. */
export const LEARN_SLIDE_DECKS: Readonly<Record<string, LearnSlideDeck>> = Object.fromEntries(
  Object.entries(built).map(([slug, b]) => [slug, b.deck])
);

/** English copy for every slide key — spread into LEARN_ASSESSMENT_I18N. */
export const LEARN_SLIDES_I18N: Readonly<Record<string, string>> = Object.assign(
  {},
  ...Object.values(built).map((b) => b.i18n)
);

export function learnSlideDeckFor(unitSlug: string): LearnSlideDeck | null {
  return LEARN_SLIDE_DECKS[unitSlug] ?? null;
}
