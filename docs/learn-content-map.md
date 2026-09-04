# Learn content map — target curriculum

This document designs **how someone should learn practical electronics on Electro Lab**, not an inventory of whatever presets happen to exist today.

- **Primary driver:** good teaching order for the subject  
- **Secondary:** what Lab can already demonstrate  
- **Tertiary:** what we ship in Learn MVP vs later  

Lab v1 is feature-frozen for *new simulator capabilities* ([ADR-001](adr/001-lab-v1-freeze.md)). That does **not** mean the curriculum must stop at current parts — it means future projects may need a later ADR to unfreeze Lab, or they stay “theory + external link” until then.

Catalog shape: [ADR-002](adr/002-learn-content-source.md). Phase B scope: [requirements-learn-mvp.md](requirements-learn-mvp.md). Product map: [requirements.md](requirements.md).

---

## Tone: a bit game-like

Product principle ([vision.md](vision.md), NFR-11): Learn should feel closer to **Duolingo** than to a dense manual — short units, friendly feedback, obvious next action, progress you can see.

| Do | Don’t |
|----|--------|
| Bite-sized projects (~10–25 min) | Walls of unbroken theory |
| Celebrate “you ran it / step done” | Shame for wrong quiz answers (when quizzes exist) |
| One clear primary button | Scattered competing CTAs |
| Progress ticks / later streaks lightly | Mandatory daily streak guilt in MVP |
| Lab as the “level” you enter | Fake points with no learning value |

**MVP:** tone + session length + checkmarks. **Later:** quizzes, soft rewards, optional streaks once Account/progress exist.

## Three horizons

| Horizon | Meaning |
|---------|---------|
| **Target curriculum** | Ideal path and topics (this doc’s spine) |
| **Lab coverage** | `ready` = preset exists · `partial` = related preset · `gap` = needs Lab work / ADR later |
| **Learn shipping** | `mvp` = show in Phase B · `soon` = after MVP catalog · `later` = with quizzes/account/etc. |

A topic can be in the **target path** with Lab = `gap` and Learn = `later`. That is intentional.

---

## Product layers for learning content

| Layer | When | What |
|-------|------|------|
| **Path** | Always (design) | Ordered modules → units |
| **Project** | MVP+ | Hands-on unit with Lab deep-link when available |
| **Steps** | MVP+ | Checklist inside a project |
| **Concept notes** | Soon | Short “before you Run” explainers (still i18n) |
| **Quiz** | Later | Formative checks after a unit/module |
| **Challenge** | Later | Slightly open task (change a value, fix a fault) |
| **Progress** | Local MVP / server later | Checkmarks → then account-backed |
| **Certificate / path complete** | Optional later | Only after progress + quizzes exist |

MVP implements Path (light) + Project + Steps. Quizzes and challenges are **designed here**, built in a later phase.

---

## Target learning path (electronics)

Modules are ordered for a motivated beginner → early hobbyist. Each module lists **units** (future Learn projects).

### Module A — Voltage, current, resistance

**Intent:** Comfortable with a simple loop and Ohm’s law at teaching level.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `fundamentals-loop` | Battery, resistor, current, ground | ready (`led`) | **mvp** |
| `ohm-explore` | Change R, see I (probe) | ready (`led`) | **mvp** |
| `series-parallel-intro` | Series vs parallel intuition | ready (`seriesParallel`) | **mvp** |

**Quiz A (later):** Identify which change raises current; pick a safe ballpark resistor for an LED given Vf (teaching numbers).

### Module B — Diodes and LEDs

**Intent:** One-way behaviour, forward drop, why LEDs need limiting.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `led-series` | LED + series R | ready (`led`) | **mvp** |
| `diode-direction` | Diode orientation / blocking | ready (`diodeDirection`) | **mvp** |
| `led-burn-limit` | What “too much current” means in Lab | ready (`led`) | **mvp** |

**Quiz B (later):** Pick polarity; choose “more R / less R” for brighter vs safer.

### Module C — Time and capacitors

**Intent:** Things that don’t settle instantly; RC as the gateway to timing.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `rc-charge` | Capacitor charge curve | ready (`rc`) | **mvp** |
| `led-fade` | Store and release energy (fade) | ready (`ledFade`) | **mvp** |
| `pulse-rc` | Edges and RC | ready (`pulse`) | **mvp** |
| `time-constant-estimate` | τ ≈ R·C by eye on the scope | ready (`rc`) | **mvp** |

**Quiz C (later):** Larger C → slower/faster; what happens if R doubles.

### Module C2 — Power supplies

**Intent:** AC→DC, regulation, protection, and simple switching converters.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `half-wave-rectifier` | Single-diode rectification | ready (`halfWave`) | **mvp** |
| `bridge-rectifier` | Full-wave bridge | ready (`bridge`) | **mvp** |
| `filter-capacitor` | Reservoir C after rectifier | ready (`filterCap`) | **mvp** |
| `zener-regulator` | Shunt Zener clamp | ready (`zener`) | **mvp** |
| `linear-7805` | Series 7805 teaching IC | ready (`vreg7805`) | **mvp** |
| `reverse-polarity` | Series protection diode | ready (`reversePolarity`) | **mvp** |
| `fuse-protection` | Fuse opens on overcurrent | ready (`fuseProtect`) | **mvp** |
| `ripple-measure` | See residual AC on DC | ready (`ripple`) | **mvp** |
| `buck-converter` | Discrete buck (PWM+L+C) | ready (`buck`) | **mvp** |
| `boost-converter` | Discrete boost (PWM+L+C) | ready (`boost`) | **mvp** |

**Quiz C2 (later):** Half-wave vs bridge pulse rate; why series R with a Zener; buck vs boost switch placement.

### Module D — Dividers and pots

**Intent:** Make and read intermediate voltages.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `pot-divider` | Wiper sets mid voltage | ready (`pot`) | **mvp** |
| `divider-design` | Two resistors, predict Vmid | ready (`voltageDivider`) | **mvp** |

**Quiz D (later):** Estimate mid-point for equal resistors.

### Module E — Switching with transistors

**Intent:** Small control signal, larger load path.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `bjt-switch` | NPN/BC547 as switch | ready (`bjt`) | **mvp** |
| `nmos-switch` | MOSFET as switch | ready (`nmos`) | **mvp** |
| `bjt-vs-mos-compare` | When which mental model | ready (both) | **mvp** |

**Quiz E (later):** Base/gate open vs driven; role of series base resistor.

### Module F — Relays and inductive loads

**Intent:** Coils kick; diodes protect; contacts isolate.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `relay-flyback` | Relay + flyback | ready (`relay`) | **mvp** |
| `motor-lowside` | Motor + NMOS + diode | ready (`motor`) | **mvp** |
| `inductive-why-diode` | Concept focus (can reuse motor/relay) | ready | **mvp** |

**Quiz F (later):** Diode orientation; what the diode is for.

### Module G — Op-amps ⭐⭐⭐

**Intent:** Feedback sets gain; open-loop compares; capacitors turn amps into timing/filters. Very important chapter.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `opamp-follower` | Voltage follower (buffer) | ready (`opampFollower`) | **mvp** |
| `opamp-invert` | Inverting amp | ready (`opamp`) | **mvp** |
| `opamp-noninv` | Non-inverting amp | ready (`opampNonInv`) | **mvp** |
| `opamp-comparator` | Comparator | ready (`opampComparator`) | **mvp** |
| `opamp-schmitt` | Schmitt trigger | ready (`opampSchmitt`) | **mvp** |
| `opamp-summing` | Summing amp | ready (`opampSumming`) | **mvp** |
| `opamp-integrator` | Integrator | ready (`opampIntegrator`) | **mvp** |
| `opamp-differentiator` | Differentiator | ready (`opampDifferentiator`) | **mvp** |
| `opamp-active-filter` | Active low-pass filter | ready (`opampActiveFilter`) | **mvp** |

**Quiz G (later):** Ideal gain −Rf/Rin vs 1+Rf/Rg; what “hit the rail” means; hysteresis vs plain compare.

### Module H — Timing ICs

**Intent:** Astable blink without a MCU.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `ne555-astable` | 555 blinker | ready (`ne555`) | **mvp** |
| `ne555-play` | Richer LED load / tree | ready (`christmasTree`) | **mvp** |

**Quiz H (later):** Which parts set period (qualitative).

### Module I — Human input and sensing

**Intent:** Buttons and light as signals.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `pushbutton-led` | Momentary input | ready (`pushbutton`) | **mvp** |
| `ldr-nightlight` | Light → threshold behaviour | ready (`ldr`) | **mvp** |
| `debounce-idea` | Debounce as a concept | gap | later |

**Quiz I (later):** Dark vs bright on the night-light divider.

### Module J — Actuators (sound / motion)

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `buzzer-button` | Simple “sounding” load | ready (`buzzer`) | **mvp** |
| `motor-control` | H-bridge direction + PWM speed on `motor` | ready (`motor`) | **mvp** |

**Quiz J (later):** Why series R / switch rating matters (teaching).

### Module K — Logic-level IO (MCU-shaped)

**Intent:** Pins as outputs/inputs — still no full MCU sim.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `arduino-dio-led` | digitalWrite mental model | ready (`arduino`) | **mvp** |
| `pin-input-pulldown` | Floating vs defined input | ready (`arduino`) | **mvp** |

**Quiz K (later):** Output HIGH vs INPUT; 5 V vs 3.3 V vHigh.

### Module L — Serial buses (wiring first)

**Intent:** I2C as **wires + pull-ups + address**, not bit bang.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `i2c-oled-wiring` | SSD1306 + pull-ups | ready (`i2cOled`) | **mvp** |
| `i2c-address-idea` | 0x3C vs 0x3D | ready (`i2cOled`) | **mvp** |
| `i2c-multi-slave` | Two devices idea | gap | later |
| `spi-vs-i2c` | Comparison (mostly text) | gap | later |

**Quiz L (later):** Why pull-ups; what happens if one is missing.

### Module M — AC and filters *(stretch)*

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `ac-rc-lpf` | AC low-pass feel | ready (`ac`) | **mvp** |
| `bode-intuition` | Magnitude vs frequency | partial | later |

**Quiz M (later):** Above cutoff → more/less attenuation.

### Module F2 — Filters & analog signals ⭐⭐⭐

**Intent:** Passive filters, dividers, and reading AC amplitude/frequency. Broadens analog-signal intuition.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `rc-low-pass` | RC low-pass | ready (`rcLowPass` / `ac`) | **mvp** |
| `rc-high-pass` | RC high-pass | ready (`rcHighPass`) | **mvp** |
| `rlc-series` | Series RLC | ready (`rlcSeries`) | **mvp** |
| `band-pass` | Band-pass (RLC) | ready (`bandPass`) | **mvp** |
| `notch-filter` | Notch (series LC shunt + Rs) | ready (`notchFilter`) | **mvp** |
| `voltage-divider` | Resistive divider | ready (`voltageDivider`) | **mvp** |
| `pot-divider` | Pot as divider | ready (`pot`) | **mvp** |
| `bjt-amplifier` | Linear BJT amp | **gap** (BJT is switch model today) | later |
| `measure-freq-amp` | Frequency & amplitude (AC probe) | ready (`measureAc`) | **mvp** |

**Quiz F2 (later):** LPF vs HPF; what a notch rejects; pot mid-point.

### Module Mot — Motors & power electronics ⭐⭐⭐

**Intent:** MOSFETs, PWM, flyback, and H-bridge direction — ties Arduino-style drive to power paths.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `motor-mosfet` | DC motor + MOSFET | ready (`motor`) | **mvp** |
| `motor-pwm` | PWM speed control | ready (`motorPwm`) | **mvp** |
| `motor-flyback` | Flyback diode | ready (`motor`) | **mvp** |
| `h-bridge` | H-bridge | ready (`hBridge`) | **mvp** |
| `motor-direction` | Reverse with H-bridge | ready (`motorDirection`) | **mvp** |
| `motor-speed` | Speed via PWM (alias) | ready (`motorPwm`) | **mvp** |
| `servo` | Hobby servo | **gap** (needs servo model ADR) | later |
| `stepper` | Stepper motor | **gap** | later |
| `stepper-driver` | Stepper driver | **gap** | later |
| `bldc-basics` | BLDC principle (text) | **gap** | later |

**Quiz Mot (later):** Why the flyback diode; which switches close for forward vs reverse.

### Module Dig — Digital logic ⭐⭐⭐

**Intent:** Combinational & sequential basics. **Gate ICs need a future Lab ADR** — ship wiring habits now, truth-table labs later.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `logic-not` … `logic-xor` | Gate primitives | **gap** (no gate models) | later |
| `truth-tables` | Truth tables | gap (text/quiz) | later |
| `pull-up-down` | Pull-up / pull-down | ready (`pullUpDown`) | **mvp** |
| `debounce` | Switch debounce (RC) | ready (`debounce`) | **mvp** |
| `latch` / `flip-flop` / `counter` / `shift-register` / `mux` / `seven-seg` | Sequential & display | **gap** | later |
| `counter-0-9` | Counter 0–9 without MCU | **gap** (needs gates + display) | later |

**Quiz Dig (later):** Pull-up vs floating; why debounce.

### Module Sen — Sensors ⭐⭐⭐

**Intent:** Turn physical quantities into usable voltages — dividers, variable R, and thresholds. Most specialty sensors need a future Lab ADR.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `sensor-ldr` | LDR → voltage / night-light | ready (`ldr`) | **mvp** |
| `sensor-pot` | Pot as position sensor | ready (`pot`) | **mvp** |
| `sensor-ntc` | NTC / thermistor divider (pot stand-in) | ready (`ntcDivider`) | **mvp** |
| `sensor-threshold` | Sensor vs comparator threshold | ready (`opampComparator`) | **mvp** |
| `hall` / `pir` / `ultrasonic` / `ir` / `temp-ic` / `pressure` / `accel` / `gyro` | Specialty sensors | **gap** | later |

**Quiz Sen (later):** Why a sensor usually needs a divider or pull-up; what “usable signal” means.

### Module Com — Communication ⭐⭐⭐

**Intent:** Wiring-first buses for MCU / industrial paths. Bit-level protocols stay later.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `i2c-wiring` | I²C + pull-ups (OLED) | ready (`i2cOled`) | **mvp** |
| `uart` | UART TX/RX | **gap** | later |
| `spi` | SPI (SCLK/MOSI/MISO/CS) | **gap** | later |
| `one-wire` | 1-Wire | **gap** | later |
| `rs485` | RS-485 differential | **gap** | later |
| `can-basics` | CAN principle | **gap** (text) | later |
| `modbus-rtu` | Modbus RTU idea | **gap** (text) | later |

**Quiz Com (later):** Why I²C needs pull-ups; UART vs shared bus.

### Module AD — ADC / DAC ⭐⭐⭐

**Intent:** Analog ↔ digital intuition without a full MCU ADC peripheral model.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `adc-front-end` | Voltage an ADC would sample | ready (`pot`) | **mvp** |
| `adc-reference` | Reference / full-scale idea (divider) | ready (`voltageDivider`) | **mvp** |
| `pwm-pseudo-dac` | PWM + RC as pseudo-DAC | ready (`pwmFilter`) | **mvp** |
| `arduino-adc` | Arduino analogRead | **gap** (no ADC model) | later |
| `true-dac` | Dedicated DAC IC | **gap** | later |

**Quiz AD (later):** Duty → average; what resolution means qualitatively.

### Module Ind — Relays & industrial control ⭐⭐⭐

**Intent:** Coil drive, protection, e-stop idea, and 24 V control habits — with today’s relay/BJT/NMOS parts.

| Unit id | Topic | Lab | Learn ship |
|---------|--------|-----|------------|
| `relay-transistor` | Relay + BJT driver | ready (`relayBjt`) | **mvp** |
| `mosfet-driver` | MOSFET as switch/driver | ready (`nmos`) | **mvp** |
| `coil-protection` | Flyback on coil | ready (`relay`) | **mvp** |
| `inductive-load` | Inductive load awareness | ready (`motor`) | **mvp** |
| `estop-principle` | Series e-stop in coil path | ready (`estopRelay`) | **mvp** |
| `control-24v` | Basic 24 V control rail | ready (`industrial24v`) | **mvp** |
| `optocoupler` / `galvanic` / `ssr` / `contactor` | Isolation & power switching | **gap** | later |

**Quiz Ind (later):** Why e-stop is series; why coil diodes matter at 24 V too.

### Module N — Practice habits *(ongoing, weave in)*

Not always separate projects — short notes or challenges:

- Probe before guessing  
- One change at a time  
- Read the teaching model note (“not SPICE”)  
- Ground and return path  

**Challenge bank (later):** “LED won’t light — pick the fault”; “make it blink slower”; “night-light inverted — fix divider.”

---

## Post-MVP learning features (designed now, built later)

### Quizzes

| Piece | Design choice |
|-------|----------------|
| Placement | End of module (A, B, C…) and optional mid-unit |
| Type | Mostly MCQ + “what happens if…” tied to Lab observables |
| Scoring | Formative first (show correct + short why); summative only after Account |
| Content source | `docs/learn-quizzes.md` later + catalog references `quizId` |
| Lab link | Prefer questions answerable with current teaching models |

### Challenges

Short tasks that reuse a preset (“change one component”, “diagnose”). Stored as content entries with `type: challenge`, not only `project`.

### Progress

| Phase | Behaviour |
|-------|-----------|
| MVP | Optional local step ticks ([ADR-004](adr/004-progress-storage.md)) |
| After Account | Server progress + quiz attempts ([ADR-003](adr/003-auth-deferred.md) lifts) |

### Paths

Named paths over modules, e.g. **“Hobbyist starter”** = A→B→C→E→I→K→L. UI can highlight a path without locking order.

---

## MVP subset (what Phase B should prioritise)

Ship Learn catalog structure + modules that already have strong Lab coverage, **without pretending the curriculum ends there**.

**Include in MVP catalog (grouped by module):**

- B: `led-series` (wire up Learn if not present)  
- C: `rc-charge`, `led-fade` (same)  
- E: `bjt-switch`, `nmos-switch`  
- F: `relay-flyback`, `motor-lowside`  
- G: `opamp-follower`, `opamp-invert`, `opamp-noninv`, `opamp-comparator`, `opamp-schmitt`, `opamp-summing`, `opamp-integrator`, `opamp-differentiator`, `opamp-active-filter`  
- H: `ne555-astable`  
- I: `pushbutton-led`, `ldr-nightlight`  
- J: `buzzer-button`  
- K: `arduino-dio-led`  
- L: `i2c-oled-wiring`  

**Explicitly not MVP:** quiz engine, challenges UI, multi-slave I2C, debounce lab, certificates.

The **target path above** remains the north star when prioritising post-MVP content and any future Lab unfreeze ADR.

---

## Coverage summary

| Lab status | Meaning for planning |
|------------|----------------------|
| **ready** | Can teach hands-on now |
| **partial** | Teach with today’s parts; maybe thin |
| **gap** | Keep in curriculum; schedule Lab ADR or teach as reading-only until then |

Gaps are allowed. Do not delete a pedagogically important unit just because Lab v1 froze.

---

## How this drives software

1. Catalog schema supports `moduleId`, `unitId`, `kind: project \| challenge`, optional `quizId`  
2. MVP UI may show modules that only contain `mvp` units first  
3. Quiz/challenge tables or content files appear in a later requirements doc (`requirements-learn-assessment.md`)  
4. New Lab devices only when a **gap** unit is scheduled and ADR-001 is reopened  

---

## Maintenance

When you add or rethink a unit: update **this** map first (intent, module, Lab status, ship horizon), then i18n, then catalog, then Lab if needed.
