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
    title: 'Something has to push the charge',
    body: [
      'Electric charge does not start moving on its own. Before it can flow through a wire, something has to push it, and that push is what we call voltage.',
      'Water is the easiest picture. Join two tanks with a pipe and, as long as the levels are equal, nothing happens. Lift one tank and water starts flowing into the lower one. The difference in level is what drives the water, and voltage plays exactly the same role in a circuit.',
      'Notice that voltage by itself does not say how much water flows. It only describes how hard the water is being pushed. The actual amount depends on the pipe as well, on how easily water can get through it. That is what the next two lessons, on current and on resistance, are about.'
    ],
    figure: { kind: 'water-tanks', caption: 'Equal levels, no flow. A difference in level sets the water moving. Voltage is that difference.' }
  },
  {
    title: 'Voltage is always between two points',
    body: [
      'A single point in a circuit does not "have" 5 volts. Voltage is always a comparison of two places, the difference between them. That is why a voltmeter has to touch two points at once.',
      'A 5 V battery keeps its positive terminal 5 volts above its negative terminal, no matter what you connect to it. The unit of voltage is the volt, written V. In formulas voltage is written as U.',
      'When someone says that "this node is at 3 V", they mean 3 volts relative to ground. The second point is simply left unsaid because everyone assumes it. It is always there, though.'
    ],
    figure: { kind: 'battery-meter', params: { volts: '5 V' }, caption: 'A voltmeter connects between two points and shows the difference in their voltage.' },
    callout: { kind: 'tip', text: 'Voltage is measured across a part, between its terminals. Current flows through the part.' }
  },
  {
    title: 'Where voltage comes from',
    body: [
      'Inside a battery a chemical reaction separates charge. One terminal collects a surplus of electrons, the other is left short of them. This stored imbalance is the source of the push that later drives charge around the circuit.',
      'Sources differ a lot in size. An AA cell gives 1.5 V, a USB port 5 V and a car battery 12 V. A wall socket carries 230 V, which is a voltage these lessons will never work with.',
      'Chemistry is not the only option. A solar cell makes voltage from light, a generator from motion, and a USB charger derives it from the mains through a transformer. The result is the same every time: a difference in potential that a circuit can put to use.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'V', ticks: ['1.5', '5', '9', '12', '230'], marks: [0.08, 0.3, 0.42, 0.5, 0.95] },
      caption: 'Typical voltages, from a single cell to the wall socket.'
    },
    callout: { kind: 'warning', text: 'Everything in these lessons stays below 24 V. Never experiment with mains voltage.' }
  },
  {
    title: 'Ground is the shared zero',
    body: [
      'To talk about the voltage "at a node" we need a common reference point that all voltages are measured from. That point is called ground, and by agreement its voltage is 0 V.',
      'Every voltage label you see next to a node in the Lab is measured against ground. Ground is usually the negative terminal of the battery. Nothing special happens there; it is just the place we measure from.',
      'We could just as well pick any other node as the zero. Every difference between parts would stay exactly the same, only the numbers on the labels would shift. Ground is a convention that makes the values in a circuit easy to compare.'
    ],
    figure: { kind: 'potential-ladder', params: { levels: ['5 V', '2.25 V', '0 V'] }, caption: 'Think of voltages as heights on a ladder. Ground is the rung we call zero.' }
  },
  {
    title: 'Voltage can exist without current',
    body: [
      'Open the switch and the current stops everywhere in the circuit. The battery voltage does not go anywhere, though. Put a voltmeter across the open switch and it reads the full 5 V.',
      'So voltage is a readiness to push, not the pushing itself. Only a closed path through the circuit lets that readiness turn into moving charge, which is current.',
      'This example deserves a moment of thought. No charge is moving, and yet the whole battery voltage sits between the contacts of the open switch. The push is waiting there for the moment a path appears.'
    ],
    figure: {
      kind: 'loop',
      params: { switchOpen: true, flow: false, meter: 'volt-switch' },
      caption: 'Open switch: no current anywhere, but 5 V across the switch contacts.'
    }
  },
  {
    title: 'Voltage is shared out around the loop',
    body: [
      'Close the switch and the battery\'s 5 V gets divided between the parts. About 2.75 V appears across the resistor and 2.25 V across the LED. Add the two together and you are back at 5 V.',
      'This always holds: the voltage drops across the parts in a closed loop add up to the voltage of the source. Whatever the LED does not take falls on the resistor, and the other way round.',
      'The rule is known as Kirchhoff\'s voltage law, and it is the main tool for reasoning about series circuits. Know the source voltage and one drop, and you can work out the other.'
    ],
    figure: { kind: 'loop', params: { flow: true, drops: true }, caption: '2.75 V + 2.25 V = 5 V.' },
    callout: { kind: 'formula', text: 'U_battery = U_resistor + U_LED' }
  },
  {
    title: 'Voltage: what to take away',
    body: [
      'Everything that follows rests on these four points.'
    ],
    facts: [
      'Voltage is the difference in potential between two points. It is the "push" that drives charge.',
      'It is measured in volts, across a part, with a voltmeter connected in parallel.',
      'Ground is the agreed zero. Node voltages are given relative to it.',
      'A source has voltage even when no current flows. Around a closed loop the drops add up to the source voltage.'
    ]
  }
];

const CURRENT: readonly SlideSource[] = [
  {
    title: 'Charge on the move',
    body: [
      'Metals are full of electrons that are free to move. Apply a voltage to a wire and they all start shifting in one direction. This orderly movement of charge is what we call electric current.',
      'Current tells you how much charge passes a given point every second. The unit is the ampere (A): a current of one ampere means one coulomb of charge passes the point each second. In formulas current is written as I.',
      'The electrons themselves move surprisingly slowly, well under a millimetre per second. What travels fast is the push that drives them. That is why, when you close a switch, electrons along the whole length of the wire start moving almost at once.'
    ],
    figure: { kind: 'charge-flow', params: { mode: 'basic' }, caption: 'Count how much charge passes the gate each second and you have the current.' },
    callout: { kind: 'formula', text: 'I = Q / t' }
  },
  {
    title: 'Which way current flows',
    body: [
      'Schematics use what is called conventional current: from the positive terminal of the source, through the circuit, to the negative terminal. Arrows in diagrams, diode symbols and the moving dashes on the Lab wires all follow this direction.',
      'Electrons actually drift the other way, from negative to positive. For calculations and for understanding a circuit this makes no difference, both views give the same results. So the old convention stayed, and you should read every arrow as conventional current.',
      'The convention is older than the electron. Benjamin Franklin decided which charge would be called positive long before anyone knew what actually carried charge in a wire. By the time electrons were discovered, the arrows were already in every textbook.'
    ],
    figure: { kind: 'charge-flow', params: { mode: 'directions' }, caption: 'Conventional current (top) runs from + to −. Electrons (bottom) move the other way.' }
  },
  {
    title: 'How much is one ampere',
    body: [
      'For small electronics one ampere is a lot. Most values you will meet are in milliamperes: 1 A = 1000 mA.',
      'A sensor input draws only microamperes, an LED needs 10 to 20 mA, a phone charger delivers up to 2 A, and an electric kettle takes around 10 A.',
      'To get a sense of scale: a phone battery holds about 3000 mAh. That means it can deliver 3 A for one hour, or 15 mA for 200 hours. A single LED would run on it for more than a week.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'A', ticks: ['1 µA', '15 mA', '500 mA', '2 A', '10 A'], marks: [0.05, 0.3, 0.55, 0.7, 0.92] },
      caption: 'From sensors to heating elements.'
    }
  },
  {
    title: 'Current needs a closed circuit',
    body: [
      'Charge cannot pile up anywhere or get lost. For a current to flow it needs a complete path: out of the source, through every part, and back into the source again.',
      'Break the circuit in one single place and the current drops to zero everywhere, not just at the break. The battery still has its voltage, it simply has nowhere to push.',
      'This is exactly why a bird can sit safely on a high-voltage line. It touches only one wire, so there is no closed path through its body and no current flows through it.'
    ],
    figure: { kind: 'loop', params: { flow: true }, caption: 'Battery + → resistor → LED → ground → battery −.' }
  },
  {
    title: 'One loop, one current',
    body: [
      'In a simple loop there is only one current. Whatever leaves the battery passes through the resistor, the LED and the return wire, because there is nowhere else for it to go. You will therefore see the same value on every part.',
      'Where a wire splits, the current divides between the branches. But the total flowing into a junction always equals the total flowing out. That is the basic rule for every junction in a circuit.',
      'This rule is called Kirchhoff\'s current law. Together with the voltage law from the previous lesson it is enough to solve every circuit you will meet in this course.'
    ],
    figure: { kind: 'junction', params: { inA: '30 mA', outA: '18 mA', outB: '12 mA' }, caption: '30 mA flows into the junction, 18 + 12 mA flow out.' },
    callout: { kind: 'formula', text: 'I_in = I_out1 + I_out2' }
  },
  {
    title: 'How current is measured',
    body: [
      'An ammeter is connected in series, directly in the path of the current, so that the current it measures flows through it. Connected in parallel with a battery it would short the battery out.',
      'In the Lab you rarely need an ammeter. After a run the current of every branch is listed, and the speed of the dashes on a wire follows its current.',
      'With a real meter it takes more work: you have to break the circuit and insert the meter into the gap. That is one reason voltage is measured far more often than current in practice. Measuring a voltage needs no rewiring at all.'
    ],
    figure: { kind: 'loop', params: { flow: true, meter: 'amp' }, caption: 'An ammeter connected in series in the top wire.' }
  },
  {
    title: 'When there is too much current',
    body: [
      'Current passing through resistance produces heat. A little is harmless, but too much melts insulation, burns resistors and destroys LEDs.',
      'A Lab LED comfortably handles about 20 mA and burns out at roughly 35 mA. Limiting the current to a safe value is precisely the job of the resistor connected in series with the LED.',
      'Wires have limits too. A thin wire carrying too much current heats up. A fuse is built on exactly this: it is a deliberately weak piece of wire that is meant to melt first.'
    ],
    figure: { kind: 'current-bar', params: { safeMax: 20, burn: 35, max: 45 }, caption: 'LED current zones in the Lab.' },
    callout: { kind: 'warning', text: 'Never connect an LED straight to a battery without a resistor.' }
  },
  {
    title: 'Current: what to take away',
    body: [
      'Keep these five points close.'
    ],
    facts: [
      'Current is the amount of charge per second and is measured in amperes. Small circuits work in milliamperes.',
      'Conventional current runs from + to −. Arrows and LED symbols follow it.',
      'Current needs a closed circuit. Break it anywhere and it stops everywhere.',
      'In a single loop there is one current. At a junction, what flows in equals what flows out.',
      'It is measured in series. Too much current means heat and destroyed parts.'
    ]
  }
];

const RESISTANCE: readonly SlideSource[] = [
  {
    title: 'Resistance stands in the way of current',
    body: [
      'Water flows easily through a wide pipe. Through a narrow one, far less gets through at the same pressure. Electrical resistance is exactly this "narrowness" of the path the current has to take.',
      'Copper wire puts up almost no resistance. Carbon or a thin metal film puts up a great deal. The unit of resistance is the ohm, written Ω.',
      'Resistance depends on the material, the length and the thickness of a conductor. A longer wire has more resistance, a thicker one less. That is why a thick cable feeds a cooker while a thin wire is enough for a doorbell.'
    ],
    figure: { kind: 'pipes', caption: 'Same pressure, different pipes. A narrow pipe means high resistance.' }
  },
  {
    title: 'The resistor',
    body: [
      'A resistor is a part made to have a precise value of resistance. Coloured bands on its body spell out that value. A resistor has no polarity, so it does not matter which way round you connect it.',
      'The bands are read as digits. Red, red and brown mean 2, 2 and a multiplier of 10, so 220 Ω. A gold band means a tolerance of 5 %.',
      'You do not have to memorise the colour code. The Lab shows the value right next to the symbol, and a multimeter will measure it for you. Still, it is nice to recognise a 220 Ω resistor at a glance.'
    ],
    figure: {
      kind: 'resistor-bands',
      params: { colors: ['#dc2626', '#dc2626', '#92400e', '#d4a017'], value: '220 Ω' },
      caption: 'A resistor with a resistance of 220 Ω.'
    }
  },
  {
    title: 'Ohm\'s law',
    body: [
      'For a resistor the current is proportional to the voltage. The constant of proportionality is the resistance, and the relation between them is written U = I · R.',
      'An example: the supply is 5 V and the LED takes 2 V of it, leaving 3 V for the resistor. With 220 Ω the current through the resistor, and so through the whole loop, is 3 / 220 ≈ 13.6 mA.',
      'It helps to say the units out loud while you calculate: volts across the part, amperes through it, ohms in between. If a result looks absurd, say 3000 A through an LED, a prefix has certainly gone missing somewhere.'
    ],
    figure: { kind: 'ohm-triangle', caption: 'Cover the quantity you are looking for. The other two show how to calculate it.' },
    callout: { kind: 'formula', text: 'U = I · R\nI = U / R\nR = U / I' }
  },
  {
    title: 'More resistance, less current',
    body: [
      'Keep the voltage the same and change only the resistor. From 3 V, a 100 Ω resistor passes 30 mA, a 220 Ω resistor only 13.6 mA, and 1 kΩ a mere 3 mA.',
      'This is exactly why a resistor works as a current limiter. By choosing the resistance R you are also choosing the current I that will flow through the circuit.',
      'This table is really the whole design method for a simple circuit. Decide how much current the load should get, and Ohm\'s law tells you which resistor you need.'
    ],
    figure: {
      kind: 'ohm-graph',
      params: { volts: 3, rows: [['100 Ω', 30], ['220 Ω', 13.6], ['470 Ω', 6.4], ['1 kΩ', 3]] },
      caption: 'Current from 3 V for four different resistors.'
    }
  },
  {
    title: 'Resistors in series add up',
    body: [
      'Connect two resistors one after the other and the current has to squeeze through both. Their resistances therefore add: 220 + 220 = 440 Ω.',
      'A parallel connection works the other way round. A second "pipe" next to the first lowers the total resistance, because the current has more paths. The lesson on series and parallel circuits covers this in detail.',
      'Adding comes in handy when you do not have the value you need. No 440 Ω resistor in the drawer? Two 220 Ω resistors in a row do the same job.'
    ],
    figure: { kind: 'series-resistors', params: { r1: '220 Ω', r2: '220 Ω', total: '440 Ω' }, caption: 'Resistances in series add.' },
    callout: { kind: 'formula', text: 'R_series = R1 + R2' }
  },
  {
    title: 'Everything has resistance',
    body: [
      'A short wire has a resistance of only a few milliohms, which is why the Lab treats wires as perfect. Human skin has tens of kilo-ohms or more, and that is precisely why small voltages are harmless.',
      'Some parts change their resistance on purpose: a potentiometer when you turn it, a light-dependent resistor with the amount of light, and a thermistor with temperature.',
      'Long thin wires are the exception. A 100 m extension cord has a few ohms, and a motor drawing 10 A loses several volts along it. That is why power tools run weaker at the far end of a long cord.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'Ω', ticks: ['mΩ', 'Ω', 'kΩ', 'MΩ', 'GΩ'], marks: [0.05, 0.27, 0.5, 0.72, 0.94] },
      caption: 'From copper wire to glass insulation.'
    }
  },
  {
    title: 'Resistance produces heat',
    body: [
      'Pushing charge through resistance costs energy, and that energy turns into heat. The power lost in a part is P = U · I, or equally I² · R.',
      'Our 220 Ω resistor at 13.6 mA gives off about 0.04 W, no problem at all for an ordinary quarter-watt resistor. Force 100 mA through it, though, and it would dissipate 2.2 W and start to burn.',
      'Sometimes heat is the whole point. A kettle, a toaster and an old-fashioned light bulb are essentially resistors designed to run hot. In every other case it is waste, and it limits how much power a small part can take.'
    ],
    figure: { kind: 'heat', params: { power: '0.04 W', rating: '¼ W' }, caption: 'Stay below the power rating of the part.' },
    callout: { kind: 'formula', text: 'P = U · I = I² · R' }
  },
  {
    title: 'Resistance: what to take away',
    body: [
      'The third side of the triangle.'
    ],
    facts: [
      'Resistance opposes the flow of current and is measured in ohms. Wires have almost none, insulators an enormous amount.',
      'U = I · R. At a fixed voltage, more resistance means less current.',
      'A resistor limits current and has no polarity. Coloured bands give its value.',
      'Resistances in series add. A parallel connection lowers the total.',
      'Current through resistance produces heat: P = I² · R.'
    ]
  }
];

const OHMS_LAW: readonly SlideSource[] = [
  {
    title: 'One law, three quantities',
    body: [
      'Voltage pushes, current flows and resistance holds it back. Ohm\'s law ties the three together in a single line: U = I · R.',
      'As soon as you know two of the quantities, the third is fixed. The triangle in the picture is a memory aid: cover the quantity you want and the remaining two show whether to multiply or divide.',
      'The law works for any single ohmic part, and for a whole chain of them as long as you use the total voltage and the total resistance. The only trick is to keep track of which voltage belongs to which resistance.'
    ],
    figure: { kind: 'ohm-triangle', caption: 'U on top, I and R underneath.' },
    callout: { kind: 'formula', text: 'U = I · R' }
  },
  {
    title: 'A straight line',
    body: [
      'Plot the current through a resistor against the voltage across it and you get a straight line through the origin. Double the voltage and the current doubles as well.',
      'A larger resistance gives a flatter line, because the same voltage produces less current. Parts whose graph is a straight line like this are called ohmic.',
      'The slope of the line is 1 / R. Take any two points on it and you can read off the resistance. A multimeter does the same thing on its ohms range: it pushes a known current through the part and measures the voltage.'
    ],
    figure: { kind: 'ohm-graph', params: { mode: 'iv', lines: [['220 Ω', 1], ['470 Ω', 0.47]] }, caption: 'A steeper line means a smaller resistance.' }
  },
  {
    title: 'Worked example: choosing a resistor for an LED',
    body: [
      'The supply is 5 V, the red LED needs 2 V and we want about 15 mA through it. The resistor has to take the rest of the voltage, 5 − 2 = 3 V.',
      'From Ohm\'s law, R = U / I = 3 V / 0.015 A = 200 Ω. Resistors only come in standard values, so we round up to 220 Ω. A quick check: 3 / 220 ≈ 13.6 mA, which is fine.',
      'Rounding up is deliberate. A slightly larger resistor gives slightly less current, which is on the safe side. Rounding down would push the LED harder than planned.'
    ],
    figure: { kind: 'loop', params: { flow: true, drops: true, designators: true }, caption: 'R1 takes whatever voltage the LED does not need.' },
    callout: { kind: 'formula', text: 'R = (U_supply − U_LED) / I\n= 3 V / 0.015 A = 200 Ω → 220 Ω' }
  },
  {
    title: 'Worked example: finding an unknown resistor',
    body: [
      'Measure the voltage across the resistor and the current through it, and Ohm\'s law gives you the resistance: R = U / I.',
      'If you read 3.0 V across the part and 6.4 mA through it, the resistance is 3.0 / 0.0064 ≈ 470 Ω. A multimeter on its ohms range does exactly this calculation for you.',
      'The method works for anything that behaves like a resistor: a heating element, a long cable, a light bulb at a fixed brightness. Two readings and one division.'
    ],
    figure: { kind: 'loop', params: { flow: true, meter: 'amp' }, caption: 'Ammeter in series, voltmeter across. Two readings, one division.' }
  },
  {
    title: 'Prefixes',
    body: [
      'The prefix k means ×1000, M means ×1 000 000, m means ÷1000 and µ means ÷1 000 000. Most mistakes with Ohm\'s law are really mistakes with prefixes.',
      'The safest habit is to convert everything to base units first. For example, 3 V / 2.2 kΩ = 3 / 2200 = 0.00136 A, which is 1.36 mA.',
      'A quick sanity check helps too. LED currents are milliamperes, resistors range from hundreds of ohms to kilo-ohms, and hobby voltages are single digits. If your answer lands far outside that, look for the slipped prefix.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: '×', ticks: ['µ', 'm', '1', 'k', 'M'], marks: [0.08, 0.3, 0.5, 0.7, 0.92] },
      caption: 'Each step is a factor of 1000.'
    },
    callout: { kind: 'tip', text: 'V ÷ kΩ = mA\nV ÷ MΩ = µA\nmA × kΩ = V' }
  },
  {
    title: 'Where the law stops working',
    body: [
      'An LED does not draw a straight line. Almost nothing flows below about 2 V, and then the current climbs steeply. Its "resistance" changes with the voltage, so a single number cannot describe it.',
      'That is exactly why an LED needs a resistor. The resistor is the ohmic part that sets the current; the LED simply takes its 2 V and lets the rest of the loop do the arithmetic.',
      'Many parts curve like this: diodes, transistors, a filament bulb as it heats up. Ohm\'s law still holds at any one operating point, it is just not a fixed value. Datasheets give a curve instead of a number.'
    ],
    figure: { kind: 'ohm-graph', params: { mode: 'iv-nonlinear' }, caption: 'Resistor: a straight line. LED: a curve.' }
  },
  {
    title: 'Power',
    body: [
      'Power is voltage times current, P = U · I. Combined with Ohm\'s law it can also be written as I² · R or U² / R.',
      'The LED resistor from the example dissipates 2.75 V × 13.6 mA ≈ 0.037 W, which is nothing for a quarter-watt part. A 10 Ω resistor connected straight across 5 V, on the other hand, would have to handle 2.5 W and would burn.',
      'The three power formulas are one law rearranged. Use whichever pair of quantities you already know. For a resistor that is usually R together with either U or I.'
    ],
    figure: { kind: 'heat', params: { power: '0.037 W', rating: '¼ W' }, caption: 'Always ask two questions: how many ohms, and how many watts.' },
    callout: { kind: 'formula', text: 'P = U · I = I² · R = U² / R' }
  },
  {
    title: 'Ohm\'s law: what to take away',
    body: [
      'The working rules.'
    ],
    facts: [
      'U = I · R holds for any ohmic part.',
      'LED resistor: R = (U_supply − U_LED) / I, then round up to a standard value.',
      'Unknown resistor: R = U / I from two readings.',
      'Convert prefixes first. V ÷ kΩ gives mA.',
      'LEDs are not ohmic, so they need a resistor. Check the watts as well as the ohms.'
    ]
  }
];

const CIRCUIT_ELEMENTS: readonly SlideSource[] = [
  {
    title: 'Four roles',
    body: [
      'Every circuit is built from the same four roles: a source that pushes, a load that uses the energy, wires that close the loop, and usually a control that decides when the circuit runs.',
      'In the LED example the battery is the source, the LED with its resistor is the load, the wires and ground close the loop, and the switch is the control.',
      'When a circuit does not work, check the roles in this order. Is there a source? Is the loop closed? Is the control letting current through? Only then start looking at the load itself.'
    ],
    figure: { kind: 'loop', params: { switchOpen: false, flow: true, designators: true }, caption: 'Source V1, control S1, load R1 + D1, return through ground.' }
  },
  {
    title: 'Sources',
    body: [
      'A battery gives a steady direct voltage; the longer line on its symbol marks the positive terminal. An AC source swings back and forth like the mains. A pulse source jumps between two levels, like the output pin of a microcontroller.',
      'Every source has two terminals. Whatever current leaves through one of them has to come back in through the other.',
      'A real source has its limits. A battery cannot deliver unlimited current, and its voltage sags under a heavy load. The Lab battery has an internal resistance setting for exactly this effect.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['battery', 'ac_source', 'pulse_source'] }, labels: ['Battery', 'AC source', 'Pulse source'], caption: 'The three sources available in the Lab.' }
  },
  {
    title: 'Passive parts',
    body: [
      'A resistor limits current. A capacitor stores charge and blocks steady direct current. An inductor stores energy in a magnetic field and resists any change in current.',
      'None of these parts add energy to the circuit. They only shape how the energy from the source is used.',
      'Capacitors and inductors only matter when something changes. In a steady DC circuit a capacitor behaves like an open gap and an inductor like a plain wire. Their real role appears in the RC and AC lessons.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['resistor', 'capacitor', 'inductor'] }, labels: ['Resistor', 'Capacitor', 'Inductor'], caption: 'Ohms, farads and henries.' }
  },
  {
    title: 'Semiconductors',
    body: [
      'A diode is a one-way valve. Current flows from the anode to the cathode, the side with the bar, and the diode costs about 0.7 V to keep open. An LED is a diode that emits light and drops about 2 V.',
      'Transistors are controllable valves. A small signal at one pin switches a much larger current between the other two. You will meet the BJT and the MOSFET later in the course.',
      'The transistor is the reason electronics exists at all. Every chip in a phone contains billions of them, each working as a tiny switch. Here you start with a single one driving an LED.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['diode', 'led', 'bjt_npn', 'nmos'] }, labels: ['Diode', 'LED', 'NPN transistor', 'N-MOSFET'], caption: 'One-way parts and electronic switches.' },
    callout: { kind: 'tip', text: 'Diode and LED symbols are arrows. Current flows in the direction the arrow points.' }
  },
  {
    title: 'Controls and protection',
    body: [
      'A switch opens or closes the path. A pushbutton does the same, but only while it is held down. In the Lab you toggle a switch by clicking it.',
      'A potentiometer is a resistor with a sliding tap, so its resistance can be adjusted. A fuse is a deliberately weak link that melts when the current gets too high.',
      'A relay is a switch operated by a coil, which lets a small circuit turn a much bigger one on and off. Later lessons use it, and the transistor does the same job with no moving parts.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['switch', 'pushbutton', 'potentiometer', 'fuse'] }, labels: ['Switch', 'Pushbutton', 'Potentiometer', 'Fuse'], caption: 'Deciding when current flows, and how much.' }
  },
  {
    title: 'Wires, dots, ground and meters',
    body: [
      'In the Lab, wires are perfect conductors. A dot where lines meet means a connection. Lines that cross without a dot are not connected.',
      'The ground symbol marks 0 V, and every ground symbol in a drawing is the same node. A voltmeter is connected across two points, an ammeter is inserted into the path.',
      'Two ground symbols on opposite sides of a drawing are connected even though no wire is drawn between them. This keeps schematics tidy, but it trips up beginners. Remember: every ground is one and the same node.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['junction', 'ground', 'voltmeter', 'ammeter'] }, labels: ['Junction', 'Ground', 'Voltmeter', 'Ammeter'], caption: 'The glue of a schematic, plus the two meters.' }
  },
  {
    title: 'Reading a schematic',
    body: [
      'A schematic is a map of connections, not a picture of a circuit board. The only thing that matters is which pin is joined to which.',
      'Parts get names such as R1, D1 or C1, with their values written next to them. Read the drawing the way the current does: start at the positive terminal, follow the path, and make sure you arrive back at the negative one.',
      'A good habit: before you run anything, trace the loop with your finger. If you cannot get from + back to − without lifting it, the circuit will not work either.'
    ],
    figure: { kind: 'loop', params: { flow: true, designators: true, drops: true }, caption: 'Names and values sit next to the symbols.' }
  },
  {
    title: 'Elements: what to take away',
    body: [
      'Your vocabulary of parts.'
    ],
    facts: [
      'Every circuit has a source, a load, a closed path and usually a control.',
      'Sources: battery, AC source, pulse source. The long line on the battery is +.',
      'A resistor limits, a capacitor stores charge and blocks DC, an inductor resists change.',
      'Diodes and LEDs are arrows. Transistors are controlled valves.',
      'Dots connect, crossings do not. All grounds are one node.'
    ]
  }
];

const SERIES_PARALLEL: readonly SlideSource[] = [
  {
    title: 'Two ways to connect parts',
    body: [
      'Put two parts one after the other and the current has only one path through both of them. That is a series connection.',
      'Give each part its own path from + to − and the current can choose. That is a parallel connection. Most real circuits mix the two.',
      'The words describe how parts are connected, not where they sit on the page. Two resistors drawn side by side are still in series if the current has no choice but to pass through both.'
    ],
    figure: { kind: 'two-loads', params: { topology: 'series', labels: ['12 mA', '12 mA'] }, caption: 'Series: one path, one current.' }
  },
  {
    title: 'The rules for series',
    body: [
      'In a series circuit one current flows through everything. The voltage is shared between the parts, and the drops add up to the source voltage. Resistances add.',
      'Two 220 Ω resistors in series behave like a single 440 Ω resistor, so the current is half of what one resistor would allow.',
      'The voltage splits in proportion to the resistances: the larger resistor takes the larger share. A 220 Ω and a 440 Ω resistor in series across 6 V get 2 V and 4 V respectively.'
    ],
    figure: { kind: 'two-loads', params: { topology: 'series', labels: ['2.5 V', '2.5 V'], showTotal: '5 V' }, caption: 'Two equal resistors each take half of the voltage.' },
    callout: { kind: 'formula', text: 'R_series = R1 + R2\nU_source = U1 + U2\nthe same I everywhere' }
  },
  {
    title: 'The rules for parallel',
    body: [
      'In a parallel circuit every branch sees the full source voltage. Each branch draws its own current, and the source has to supply the sum of them.',
      'The total resistance is lower than that of any single branch. Two equal resistors in parallel give half the resistance of one.',
      'Adding a branch never reduces the current drawn from the source, it only adds to it. That is why plugging too many heaters into one socket trips the breaker: each heater is another parallel path.'
    ],
    figure: { kind: 'two-loads', params: { topology: 'parallel', labels: ['6 mA', '6 mA'], showTotal: '12 mA' }, caption: 'The same voltage on each branch; the currents add up.' },
    callout: { kind: 'formula', text: '1 / R_parallel = 1 / R1 + 1 / R2\nI_source = I1 + I2\nthe same U on each branch' }
  },
  {
    title: 'What happens when a part fails',
    body: [
      'In a series circuit a single dead part breaks the only path, and everything stops. Old strings of Christmas lights went dark all at once for exactly this reason.',
      'In a parallel circuit each branch is a loop of its own. One LED can fail and the other keeps shining as if nothing had happened.',
      'This is why the wiring in a house is parallel. Every lamp and every socket gets the full 230 V and works independently of the others. Modern LED strings use parallel groups for the same reason.'
    ],
    figure: { kind: 'two-loads', params: { topology: 'parallel', parts: 'led', labels: ['on', 'on'] }, caption: 'Parallel LEDs light independently of each other.' }
  },
  {
    title: 'Mixing both',
    body: [
      'The Lab example puts a resistor in series with each LED, and then connects the two pairs in parallel.',
      'Inside a branch you use the series rules, between the branches the parallel rules. Simplify a mixed circuit from the inside out.',
      'Each branch here draws about 13 mA, so the battery supplies about 26 mA. Add a third identical branch and the total becomes 39 mA. The LEDs do not notice each other; the battery certainly does.'
    ],
    figure: { kind: 'two-loads', params: { topology: 'parallel', parts: 'led', labels: ['13 mA', '13 mA'], showTotal: '26 mA' }, caption: 'Each branch is a series pair.' }
  },
  {
    title: 'A quick test',
    body: [
      'Series: the only way from one part to the other is a single wire with nothing else attached to it.',
      'Parallel: both ends of both parts sit on the same two nodes. A junction dot is the tell-tale sign.',
      'When in doubt, follow the current from + and ask at every point: does it have a choice? No choice means series. A choice means parallel branches begin here.'
    ],
    figure: { kind: 'junction', params: { inA: 'I', outA: 'I₁', outB: 'I₂' }, caption: 'A junction means branches.' },
    callout: { kind: 'tip', text: 'Same current: series. Same voltage: parallel.' }
  },
  {
    title: 'Series and parallel: what to take away',
    body: [
      'The two sets of rules.'
    ],
    facts: [
      'Series: the same current, voltages add, resistances add.',
      'Parallel: the same voltage, currents add, total resistance goes down.',
      'A broken part in series stops everything. Parallel branches are independent.',
      'Mixed circuits: simplify from the inside out.'
    ]
  }
];

const AC_DC: readonly SlideSource[] = [
  {
    title: 'Two kinds of current',
    body: [
      'Direct current, DC for short, always flows in the same direction at a steady value. Batteries, USB ports and solar cells all supply DC.',
      'Alternating current, AC, reverses its direction many times every second, following a sine wave. This is what comes out of a wall socket.',
      'Both kinds carry energy equally well. The difference is in what you can connect to them: LEDs and chips need DC, heaters and many motors accept either, and transformers work only with AC.'
    ],
    figure: { kind: 'waveform', params: { mode: 'both' }, caption: 'DC is a flat line. AC crosses zero twice in every cycle.' }
  },
  {
    title: 'Direct current',
    body: [
      'DC has polarity. Turn the battery round and the LED goes dark and a motor spins the other way. Which terminal is which matters.',
      'The DC analysis in the Lab assumes that everything has settled down. It gives you one voltage for every node and one current for every part, with nothing changing in time.',
      'Even DC is rarely perfectly flat. The output of a charger carries a little ripple, and a battery\'s voltage sinks as it runs down. DC means that the direction never flips, not that the value never moves.'
    ],
    figure: { kind: 'waveform', params: { mode: 'dc' }, caption: 'A 5 V supply, the same at every instant.' }
  },
  {
    title: 'Alternating current',
    body: [
      'One complete swing of the wave is a cycle, and its duration is the period T. The number of cycles per second is the frequency f = 1 / T, measured in hertz.',
      'The European mains runs at 50 Hz, so one period lasts 20 ms. Audio signals cover roughly 20 Hz to 20 kHz.',
      'Frequency is what your ear hears as pitch and what a radio tunes to. The hum you sometimes hear from a transformer or a cheap amplifier is the 50 Hz of the mains.'
    ],
    figure: { kind: 'waveform', params: { mode: 'ac' }, caption: 'Period T and amplitude Û.' },
    callout: { kind: 'formula', text: 'f = 1 / T\n50 Hz → T = 20 ms' }
  },
  {
    title: 'Peak value and RMS',
    body: [
      'The peak value Û is the top of the wave. The peak-to-peak value is the whole swing from bottom to top, twice as much.',
      'The RMS value is the DC voltage that would heat a resistor by the same amount. For a sine wave U_RMS = Û / √2. When we say "230 V" we mean the RMS value; the peak is about 325 V.',
      'RMS is the number that matters for power and for safety. A rating of "12 V AC" is an RMS value, and the peak is about 17 V. Parts have to survive the peak, not just the RMS value.'
    ],
    figure: { kind: 'waveform', params: { mode: 'rms' }, caption: 'Peak, RMS at 0.707 of the peak, and the full swing.' },
    callout: { kind: 'formula', text: 'U_RMS = Û / √2' }
  },
  {
    title: 'Why the grid is AC and gadgets run on DC',
    body: [
      'A transformer can step an AC voltage up or down with almost no loss, but it works only with a changing current. That is why electricity travels across the country at very high voltage and comes down to 230 V in your street.',
      'Chips and LEDs need steady DC, so every charger and power supply has to convert the AC from the socket into DC.',
      'The power lost in a cable is I² · R. Ten times the voltage means a tenth of the current for the same power, and therefore a hundredth of the loss. That is the whole argument for high-voltage transmission lines.'
    ],
    figure: {
      kind: 'scale',
      params: { unit: 'V', ticks: ['5 V DC', '230 V AC', '20 kV', '400 kV'], marks: [0.08, 0.36, 0.64, 0.92] },
      caption: 'AC for transport, DC at the load.'
    }
  },
  {
    title: 'From AC to DC',
    body: [
      'A diode lets through only one half of each cycle. Four diodes arranged as a bridge flip the negative halves upward as well. This is called rectification.',
      'The result is still bumpy. A capacitor fills in the gaps between the bumps and leaves a much smoother voltage with a small ripple. A regulator then holds the output at a fixed value, for example 5 V.',
      'Open any USB charger and you will find exactly these stages: a rectifier, a capacitor and a regulator, usually a switching one. The power module of this course builds each of them.'
    ],
    figure: { kind: 'waveform', params: { mode: 'rectified' }, caption: 'Rectified bumps and the smoothed output.' }
  },
  {
    title: 'AC in the Lab',
    body: [
      'Place an AC source, set its frequency and run the AC analysis. Every node then gets a magnitude and a phase instead of a single voltage.',
      'Capacitors block DC but let AC through, and the higher the frequency, the more easily. Filters are built on exactly this behaviour, and the filters module takes it further.',
      'The AC analysis assumes a pure sine wave at one frequency and reports how the circuit responds to it. To see the actual shape of the wave over time, use the Transient analysis instead.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['ac_source', 'resistor', 'capacitor', 'ground'] }, labels: ['AC source', 'Resistor', 'Capacitor', 'Ground'], caption: 'The AC RC example.' }
  },
  {
    title: 'AC and DC: what to take away',
    body: [
      'The essentials.'
    ],
    facts: [
      'DC flows in one direction at a steady value and has polarity.',
      'AC is a sine wave. f = 1 / T. The mains is 50 or 60 Hz.',
      'AC is described by its peak or its RMS value. U_RMS = Û / √2, and "230 V" is RMS.',
      'The grid uses AC because of transformers. Electronics runs on DC.',
      'Diodes rectify, capacitors smooth, regulators hold the value.'
    ]
  }
];

// ───────────────────────── Hands-on units, short decks ─────────────────────────

const LED_SERIES: readonly SlideSource[] = [
  {
    title: 'Why the resistor?',
    body: [
      'An LED connected straight across a battery has nothing to limit the current. It draws far more than it can handle and burns out within moments.',
      'A resistor in series turns a fixed voltage into a safe and predictable current. That is its only job here, and it is an essential one.',
      'Think of the LED as the part that fixes the voltage and the resistor as the part that fixes the current. Neither of them can do the other\'s job.'
    ],
    figure: { kind: 'loop', params: { flow: true, ledBurn: true }, caption: 'Too little resistance: 40 mA and a dead LED.' },
    callout: { kind: 'warning', text: 'Never connect an LED straight across a supply.' }
  },
  {
    title: 'The LED takes 2 V',
    body: [
      'A lit LED holds roughly 2 V across itself almost regardless of the current. The resistor takes whatever is left of the supply voltage.',
      'With a 5 V supply that leaves 3 V for the resistor. Those 3 V together with the resistance R set the current.',
      'The exact LED voltage depends on the colour. Red sits around 1.8 to 2 V, green and blue around 3 V. A blue LED on 5 V leaves only 2 V for the resistor, so it needs a smaller resistor for the same current.'
    ],
    figure: { kind: 'loop', params: { flow: true, drops: true }, caption: 'About 2 V across the LED, the rest across R1.' }
  },
  {
    title: 'Choosing the value',
    body: [
      'Pick a current, say 15 mA. Then R = (5 − 2) V / 0.015 A = 200 Ω. Round up to the standard value of 220 Ω.',
      'A smaller resistor gives a brighter LED, right up to the point where the LED cooks. A larger one gives a dimmer LED and a longer life.',
      'Resistors come in standard steps: 100, 150, 220, 330, 470, 680 Ω and so on. Pick the nearest value above the one you calculated.'
    ],
    figure: { kind: 'ohm-triangle', caption: 'R = U / I, using the resistor\'s share of the voltage.' },
    callout: { kind: 'formula', text: 'R = (U_supply − U_LED) / I' }
  },
  {
    title: 'Build it',
    body: [
      'In the Lab:'
    ],
    facts: [
      'Battery, resistor, LED, ground. At least four wires.',
      'Run the DC analysis. The LED conducts and stays healthy.',
      'Lower R1 step by step. Watch the brightness rise, then the burn-out at about 35 mA.',
      'Replace the LED and set R1 back to 220 Ω.'
    ]
  }
];

const DIODE_DIRECTION: readonly SlideSource[] = [
  {
    title: 'A one-way valve',
    body: [
      'A diode lets current through in one direction and blocks it in the other. Its symbol is an arrow: current flows the way the arrow points, from the anode to the cathode, which is the side with the bar.',
      'An LED is a diode too, so its orientation matters just as much.',
      'On a real part the cathode is marked: a stripe on a diode, the shorter leg or a flat edge on an LED. In the Lab, rotate the symbol until the bar points to where the current should end up.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['diode', 'led'] }, labels: ['Diode', 'LED'], caption: 'Anode on the flat side, cathode at the bar.' }
  },
  {
    title: 'Forward: the diode conducts',
    body: [
      'With the anode towards the positive side the diode opens. Keeping it open costs about 0.7 V for an ordinary diode and about 2 V for an LED.',
      'The rest of the loop behaves as usual and the LED lights.',
      'Those 0.7 V or 2 V are lost as heat inside the part. It is not much, but it has to be subtracted from the supply before you work out the resistor.'
    ],
    figure: { kind: 'loop', params: { flow: true }, caption: 'Forward biased. Current flows and the LED is on.' }
  },
  {
    title: 'Reverse: the diode blocks',
    body: [
      'Turn the diode round and almost nothing flows. The whole supply voltage now sits across the diode and the LED stays dark.',
      'This is not a fault. It is the diode doing exactly what it is for.',
      'Reverse bias has a limit. Push a real diode far enough backwards and it breaks down. Small signal diodes withstand tens of volts, and nothing in this course comes close to that.'
    ],
    figure: { kind: 'loop', params: { reverseLed: true }, caption: 'Reverse biased. No current anywhere.' }
  },
  {
    title: 'Try both ways',
    body: [
      'In the Lab:'
    ],
    facts: [
      'Run the diode example as given. The LED lights.',
      'Select D1 and rotate it twice (180°). Run again. Dark.',
      'Probe the node before the diode: the full voltage is waiting there.',
      'Rotate it back. It works again.'
    ]
  }
];

const SERIES_LEDS: readonly SlideSource[] = [
  {
    title: 'One string',
    body: [
      'Two LEDs and a resistor in a single line. There is one path, so one and the same current runs through everything.',
      'The same current means the LEDs share the same brightness.',
      'A series string is the usual way to run several LEDs from one resistor. One resistor, one current, and every LED in the string is equally bright.'
    ],
    figure: { kind: 'two-loads', params: { topology: 'series', parts: 'led', labels: ['10 mA', '10 mA'] }, caption: 'LEDs in series: one current.' }
  },
  {
    title: 'The drops add up',
    body: [
      'Each LED takes about 2 V. Two of them take 4 V before the resistor gets anything at all.',
      'That is why this example uses a 9 V battery. With 5 V there would be only 1 V left for the resistor and very little current would flow.',
      'The supply has to exceed the sum of the LED voltages with some room to spare for the resistor. Three 2 V LEDs want at least about 8 V to leave a comfortable margin.'
    ],
    figure: { kind: 'two-loads', params: { topology: 'series', parts: 'led', labels: ['2 V', '2 V'], showTotal: '9 V' }, caption: '9 V = 2 V + 2 V + the resistor\'s 5 V.' },
    callout: { kind: 'formula', text: 'I = (9 − 2 − 2) V / 470 Ω ≈ 10.6 mA' }
  },
  {
    title: 'Try it',
    body: [
      'In the Lab:'
    ],
    facts: [
      'Run the series LEDs example. Both LEDs show the same current.',
      'Change the battery to 5 V and run again. Watch the current collapse.',
      'Back to 9 V. Add a third LED and see the current drop again.'
    ]
  }
];

const LED_BURN_LIMIT: readonly SlideSource[] = [
  {
    title: 'What "too much" means',
    body: [
      'Up to about 20 mA a Lab LED is bright and perfectly happy. Above that it is overloaded. Above roughly 35 mA it burns out and stays dead until you replace it.',
      'Real LEDs behave the same way, just a little less dramatically.',
      'Datasheets call the safe value the continuous forward current, usually 20 mA for small LEDs. The absolute maximum listed above it is meant for short pulses, not for everyday use.'
    ],
    figure: { kind: 'current-bar', params: { safeMax: 20, burn: 35, max: 45 }, caption: 'Green is comfortable, red is gone.' }
  },
  {
    title: 'What 40 mA looks like',
    body: [
      'With too small a resistor the LED flares briefly and then fails open. The whole loop goes dead along with it.',
      'In the Lab the part turns into a burnt symbol. Use Replace LED to get a fresh one.',
      'A burnt LED fails open, so the entire series loop dies with it. That is the one upside of the failure: the resistor and the battery are left unharmed.'
    ],
    figure: { kind: 'loop', params: { flow: true, ledBurn: true }, caption: 'An overdriven LED at 40 mA.' }
  },
  {
    title: 'Heat is the killer',
    body: [
      'Power is voltage times current. Double the current and the heat produced inside the LED chip roughly doubles as well.',
      'A safe design keeps the LED at 10 to 20 mA and leaves the resistor well below its power rating.',
      'LEDs also age faster when they run hot. A lamp designed for 15 mA lasts far longer than the same LED pushed to 25 mA, even though both work fine on the first day.'
    ],
    figure: { kind: 'heat', params: { power: '0.03 W', rating: '¼ W' }, caption: 'Keep both the LED and the resistor cool.' }
  },
  {
    title: 'Try it, then fix it',
    body: [
      'In the Lab:'
    ],
    facts: [
      'Lower R1 until the LED burns. Note the current at which it happens.',
      'Replace the LED.',
      'Pick a resistor that keeps the current below 25 mA and run again.'
    ]
  }
];

const RC_CHARGE: readonly SlideSource[] = [
  {
    title: 'A capacitor stores charge',
    body: [
      'A capacitor is two plates with a gap between them. Apply a voltage and charge piles up on the plates. The more charge they hold, the higher the voltage across them.',
      'Capacitance, measured in farads, says how much charge the capacitor stores per volt. A value of 1 µF is typical for small circuits.',
      'Capacitors range from picofarads in radios to thousands of microfarads in power supplies. A larger value means more charge at the same voltage, and more time to fill it through the same resistor.'
    ],
    figure: { kind: 'elements-grid', params: { parts: ['battery', 'resistor', 'capacitor'] }, labels: ['Battery', 'Resistor', 'Capacitor'], caption: 'The parts of the RC example.' }
  },
  {
    title: 'Charging through a resistor',
    body: [
      'Connect the battery through a resistor and the capacitor starts to fill up. At first the current is large. As the capacitor voltage rises, less voltage is left for the resistor, and so the current shrinks.',
      'The filling therefore slows down as it goes. The last part of the climb takes much longer than the first.',
      'The current is not one fixed number here. It starts at U / R, as if the capacitor were a short circuit, and fades towards zero as the capacitor voltage approaches the battery voltage.'
    ],
    figure: { kind: 'loop', params: { flow: true, load: 'capacitor' }, caption: 'Current flows only while the capacitor is still charging.' }
  },
  {
    title: 'The time constant',
    body: [
      'The time constant is τ = R · C. With 1 kΩ and 1 µF, τ = 1 ms. After one τ the capacitor has reached 63 % of its final voltage, and after 5τ it is practically full.',
      'A bigger resistor or a bigger capacitor means slower charging, because either one stretches τ.',
      'τ is a rule of thumb you can use without a calculator. Double R or double C and the whole curve stretches to twice the width. It governs every RC delay, filter and timer in the later lessons.'
    ],
    figure: { kind: 'rc-curve', params: { mode: 'charge', final: '5 V', tau: '1 ms' }, caption: 'The charging curve. 63 % at τ, done by 5τ.' },
    callout: { kind: 'formula', text: 'τ = R · C\n1 kΩ · 1 µF = 1 ms' }
  },
  {
    title: 'Reading τ off the scope',
    body: [
      'Find the point where the capacitor voltage reaches 63 % of its final value. The time it took to get there is one τ. For a 5 V supply that point is at 3.15 V.',
      'After 3τ the voltage is at 95 %, after 5τ at 99 %. Engineers call 5τ fully charged.',
      'Discharging follows the same rule in reverse. After one τ the capacitor has lost 63 % of its voltage and still holds 37 %. The shape is the mirror image of the charging curve.'
    ],
    figure: { kind: 'rc-curve', params: { mode: 'charge', final: '5 V' }, caption: 'Each τ closes 63 % of the remaining gap.' },
    callout: { kind: 'formula', text: '1τ → 63 %\n3τ → 95 %\n5τ → 99 %' }
  },
  {
    title: 'Watch it happen',
    body: [
      'In the Lab:'
    ],
    facts: [
      'First work out τ = R · C from the part values.',
      'Open the RC example. Switch to Transient and run.',
      'Hover over the scope near 63 % of the final voltage and compare the time with your estimate.',
      'Change C to 10 µF and run again. Ten times slower.'
    ]
  }
];

const LED_FADE: readonly SlideSource[] = [
  {
    title: 'Store first',
    body: [
      'With the switch closed, the battery charges a large capacitor. The LED lights from the same supply at the same time.',
      'Once charged, the capacitor is a small reservoir of energy sitting next to the LED.',
      'A capacitor of a few hundred microfarads holds a noticeable amount of energy at 5 V. Enough to keep an LED glowing for a moment, not enough to run anything for long.'
    ],
    figure: { kind: 'loop', params: { flow: true, load: 'capacitor', designators: true }, caption: 'Charging: the capacitor fills while the switch is closed.' }
  },
  {
    title: 'Then release',
    body: [
      'Open the switch. The battery is out of the picture, but the capacitor still holds its voltage and keeps pushing current through the resistor and the LED.',
      'Its voltage falls along a discharge curve with the same time constant τ = R · C as before.',
      'The discharge resistor here is the LED resistor. A smaller R drains the capacitor faster and the fade gets shorter; a bigger R stretches it out.'
    ],
    figure: { kind: 'rc-curve', params: { mode: 'discharge', final: 'U₀' }, caption: 'Discharge: down to 37 % after one τ.' }
  },
  {
    title: 'Why it fades',
    body: [
      'The LED current follows the capacitor voltage minus the LED\'s 2 V. As the voltage sinks, the current shrinks and the LED grows dimmer.',
      'Once the capacitor drops below about 2 V the LED goes out completely, even though some charge is still left in it.',
      'This is why the LEDs in some devices linger for a moment after you switch them off. A capacitor somewhere inside is still emptying through them.'
    ],
    figure: { kind: 'current-bar', params: { safeMax: 20, burn: 35, max: 45 }, caption: 'The current slides down the scale as the capacitor empties.' }
  },
  {
    title: 'Try it',
    body: [
      'In the Lab:'
    ],
    facts: [
      'Run with the switch closed. The capacitor charges.',
      'Untick Closed and run again. Watch the LED fade.',
      'Change C to 470 µF. The fade gets much shorter.'
    ]
  }
];

const PULSE_RC: readonly SlideSource[] = [
  {
    title: 'Edges get rounded off',
    body: [
      'A pulse source jumps between 0 and 5 V. Feed that into a resistor and a capacitor and the output cannot jump with it. It charges up and drains down along RC curves instead.',
      'Sharp edges go in, rounded edges come out.',
      'The output follows the same τ = R · C as in the DC RC example. The only difference is that the input keeps changing before the capacitor has finished.'
    ],
    figure: { kind: 'waveform', params: { mode: 'pulse-rc' }, caption: 'A square pulse in, a rounded response out.' }
  },
  {
    title: 'Pulse width against τ',
    body: [
      'If the pulse lasts much longer than τ, the output reaches the top before the pulse ends. If the pulse is shorter than τ, the output never gets there.',
      'That is the whole idea behind RC delays and simple filters.',
      'Filters work on exactly this principle. A signal that changes much faster than τ barely gets through, while a slow one passes almost untouched.'
    ],
    figure: { kind: 'rc-curve', params: { mode: 'charge', final: '5 V', tau: '1 ms' }, caption: 'A 4 ms pulse with τ = 1 ms gets to about 98 %.' },
    callout: { kind: 'formula', text: 'τ = 1 kΩ · 1 µF = 1 ms' }
  },
  {
    title: 'Try it',
    body: [
      'In the Lab:'
    ],
    facts: [
      'Run the pulse example in Transient. Compare the input and output traces.',
      'Shorten the pulse width to 0.5 ms and run again. The output stays low.',
      'Change C to 0.1 µF. The edges get sharp again.'
    ]
  }
];

const BASICS_FINAL: readonly SlideSource[] = [
  {
    title: 'What this group covered',
    body: [
      'A quick recap before the questions.'
    ],
    facts: [
      'Voltage is the push, measured between two points. Ground is 0 V.',
      'Current is the flow, measured in the path. It needs a closed loop.',
      'Resistance limits the current. U = I · R.',
      'Series: one current, the drops add up. Parallel: one voltage, the currents add up.',
      'DC is steady and has polarity. AC swings, and "230 V" is an RMS value.',
      'An LED takes about 2 V and needs a resistor. An RC circuit charges with τ = R · C.'
    ]
  },
  {
    title: 'How the final quiz works',
    body: [
      'Ten questions drawn from everything above. You need eight correct answers to pass.',
      'After every attempt you see which answers were wrong and why. You can retry as often as you like.'
    ],
    callout: { kind: 'tip', text: 'Stuck on a question? Go back to that lesson. The slides are short.' }
  }
];

const built = {
  'voltage-intro': buildDeck('learn.project.voltageIntro', VOLTAGE),
  'current-intro': buildDeck('learn.project.currentIntro', CURRENT),
  'resistance-intro': buildDeck('learn.project.resistanceIntro', RESISTANCE),
  'ohms-law': buildDeck('learn.project.ohmsLaw', OHMS_LAW),
  'circuit-elements': buildDeck('learn.project.circuitElements', CIRCUIT_ELEMENTS),
  'series-parallel-circuits': buildDeck('learn.project.seriesParallelCircuits', SERIES_PARALLEL),
  'ac-dc': buildDeck('learn.project.acDc', AC_DC),
  'led-series': buildDeck('learn.project.led', LED_SERIES),
  'diode-direction': buildDeck('learn.project.diodeDirection', DIODE_DIRECTION),
  'series-leds': buildDeck('learn.project.seriesLeds', SERIES_LEDS),
  'led-burn-limit': buildDeck('learn.project.ledBurnLimit', LED_BURN_LIMIT),
  'rc-charge': buildDeck('learn.project.rc', RC_CHARGE),
  'led-fade': buildDeck('learn.project.ledFade', LED_FADE),
  'pulse-rc': buildDeck('learn.project.pulseRc', PULSE_RC),
  'basics-final-quiz': buildDeck('learn.project.basicsFinal', BASICS_FINAL)
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
