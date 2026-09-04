import { SchematicDocument } from '../../lab/data/schematic.model';
import { createLedPreset } from '../../lab/data/presets/led-series.preset';
import { createLedFadePreset } from '../../lab/data/presets/led-fade.preset';
import { createRcStepPreset } from '../../lab/data/presets/rc-step.preset';
import { createPotDividerPreset } from '../../lab/data/presets/pot-divider.preset';
import { createPulseRcPreset } from '../../lab/data/presets/pulse-rc.preset';
import { createDiodeDirectionPreset } from '../../lab/data/presets/diode-direction.preset';
import { createSeriesParallelPreset } from '../../lab/data/presets/series-parallel.preset';
import { createSeriesLedsPreset } from '../../lab/data/presets/series-leds.preset';
import { createOpAmpBufferPreset } from '../../lab/data/presets/opamp-buffer.preset';
import { createOpAmpFollowerPreset } from '../../lab/data/presets/opamp-follower.preset';
import { createOpAmpNonInvPreset } from '../../lab/data/presets/opamp-noninv.preset';
import { createOpAmpComparatorPreset } from '../../lab/data/presets/opamp-comparator.preset';
import { createOpAmpSchmittPreset } from '../../lab/data/presets/opamp-schmitt.preset';
import { createOpAmpSummingPreset } from '../../lab/data/presets/opamp-summing.preset';
import { createOpAmpIntegratorPreset } from '../../lab/data/presets/opamp-integrator.preset';
import { createOpAmpDifferentiatorPreset } from '../../lab/data/presets/opamp-differentiator.preset';
import { createOpAmpActiveFilterPreset } from '../../lab/data/presets/opamp-active-filter.preset';
import { createAcRcPreset } from '../../lab/data/presets/ac-rc.preset';
import { createBjtSwitchPreset } from '../../lab/data/presets/bjt-switch.preset';
import { createRelayDiodePreset } from '../../lab/data/presets/relay-diode.preset';
import { createNmosSwitchPreset } from '../../lab/data/presets/nmos-switch.preset';
import { createNe555AstablePreset } from '../../lab/data/presets/ne555-astable.preset';
import { createNe555ChristmasTreePreset } from '../../lab/data/presets/ne555-christmas-tree.preset';
import { createNe555PotBlinkPreset } from '../../lab/data/presets/ne555-pot-blink.preset';
import { createPushbuttonLedPreset } from '../../lab/data/presets/pushbutton-led.preset';
import { createLdrNightLightPreset } from '../../lab/data/presets/ldr-nightlight.preset';
import { createBuzzerButtonPreset } from '../../lab/data/presets/buzzer-button.preset';
import { createMotorNmosPreset } from '../../lab/data/presets/motor-nmos.preset';
import { createArduinoLedPreset } from '../../lab/data/presets/arduino-led.preset';
import { createI2cOledPreset } from '../../lab/data/presets/i2c-oled.preset';
import { createHalfWavePreset } from '../../lab/data/presets/half-wave.preset';
import { createBridgePreset } from '../../lab/data/presets/bridge.preset';
import { createFilterCapPreset } from '../../lab/data/presets/filter-cap.preset';
import { createZenerPreset } from '../../lab/data/presets/zener.preset';
import { createVreg7805Preset } from '../../lab/data/presets/vreg-7805.preset';
import { createReversePolarityPreset } from '../../lab/data/presets/reverse-polarity.preset';
import { createFuseProtectPreset } from '../../lab/data/presets/fuse-protect.preset';
import { createRipplePreset } from '../../lab/data/presets/ripple.preset';
import { createBuckPreset } from '../../lab/data/presets/buck.preset';
import { createBoostPreset } from '../../lab/data/presets/boost.preset';
import { createRcLowPassPreset } from '../../lab/data/presets/rc-low-pass.preset';
import { createRcHighPassPreset } from '../../lab/data/presets/rc-high-pass.preset';
import { createRlcSeriesPreset } from '../../lab/data/presets/rlc-series.preset';
import { createBandPassPreset } from '../../lab/data/presets/band-pass.preset';
import { createNotchFilterPreset } from '../../lab/data/presets/notch-filter.preset';
import { createVoltageDividerPreset } from '../../lab/data/presets/voltage-divider.preset';
import { createMeasureAcPreset } from '../../lab/data/presets/measure-ac.preset';
import { createMotorPwmPreset } from '../../lab/data/presets/motor-pwm.preset';
import { createHBridgePreset } from '../../lab/data/presets/h-bridge.preset';
import { createMotorDirectionPreset } from '../../lab/data/presets/motor-direction.preset';
import { createPullUpDownPreset } from '../../lab/data/presets/pull-up-down.preset';
import { createDebouncePreset } from '../../lab/data/presets/debounce.preset';
import { createNtcDividerPreset } from '../../lab/data/presets/ntc-divider.preset';
import { createPwmFilterPreset } from '../../lab/data/presets/pwm-filter.preset';
import { createRelayBjtPreset } from '../../lab/data/presets/relay-bjt.preset';
import { createEstopRelayPreset } from '../../lab/data/presets/estop-relay.preset';
import { createIndustrial24vPreset } from '../../lab/data/presets/industrial-24v.preset';
import { EXAMPLE_PRESET_IDS, ExamplePresetId } from '../../lab/services/lab-editor.store';
import { checkLabCriteria } from './lab-challenge-checker';
import { getLearnChallengeSpec } from './learn-challenge-spec';

const PRESET_DOCS: Record<ExamplePresetId, () => SchematicDocument> = {
  led: createLedPreset,
  ledFade: createLedFadePreset,
  rc: createRcStepPreset,
  pot: createPotDividerPreset,
  pulse: createPulseRcPreset,
  diodeDirection: createDiodeDirectionPreset,
  seriesParallel: createSeriesParallelPreset,
  seriesLeds: createSeriesLedsPreset,
  opamp: createOpAmpBufferPreset,
  opampFollower: createOpAmpFollowerPreset,
  opampNonInv: createOpAmpNonInvPreset,
  opampComparator: createOpAmpComparatorPreset,
  opampSchmitt: createOpAmpSchmittPreset,
  opampSumming: createOpAmpSummingPreset,
  opampIntegrator: createOpAmpIntegratorPreset,
  opampDifferentiator: createOpAmpDifferentiatorPreset,
  opampActiveFilter: createOpAmpActiveFilterPreset,
  ac: createAcRcPreset,
  bjt: createBjtSwitchPreset,
  relay: createRelayDiodePreset,
  nmos: createNmosSwitchPreset,
  ne555: createNe555AstablePreset,
  ne555Pot: createNe555PotBlinkPreset,
  christmasTree: createNe555ChristmasTreePreset,
  pushbutton: createPushbuttonLedPreset,
  ldr: createLdrNightLightPreset,
  buzzer: createBuzzerButtonPreset,
  motor: createMotorNmosPreset,
  arduino: createArduinoLedPreset,
  i2cOled: createI2cOledPreset,
  halfWave: createHalfWavePreset,
  bridge: createBridgePreset,
  filterCap: createFilterCapPreset,
  zener: createZenerPreset,
  vreg7805: createVreg7805Preset,
  reversePolarity: createReversePolarityPreset,
  fuseProtect: createFuseProtectPreset,
  ripple: createRipplePreset,
  buck: createBuckPreset,
  boost: createBoostPreset,
  rcLowPass: createRcLowPassPreset,
  rcHighPass: createRcHighPassPreset,
  rlcSeries: createRlcSeriesPreset,
  bandPass: createBandPassPreset,
  notchFilter: createNotchFilterPreset,
  voltageDivider: createVoltageDividerPreset,
  measureAc: createMeasureAcPreset,
  motorPwm: createMotorPwmPreset,
  hBridge: createHBridgePreset,
  motorDirection: createMotorDirectionPreset,
  pullUpDown: createPullUpDownPreset,
  debounce: createDebouncePreset,
  ntcDivider: createNtcDividerPreset,
  pwmFilter: createPwmFilterPreset,
  relayBjt: createRelayBjtPreset,
  estopRelay: createEstopRelayPreset,
  industrial24v: createIndustrial24vPreset
};

describe('Learn challenge preset contracts', () => {
  it('every example preset has a challenge spec', () => {
    for (const id of EXAMPLE_PRESET_IDS) {
      expect(getLearnChallengeSpec(id)).withContext(id).not.toBeNull();
    }
  });

  it('has_models criteria match the shipping sample preset parts', () => {
    for (const id of EXAMPLE_PRESET_IDS) {
      const spec = getLearnChallengeSpec(id);
      expect(spec).withContext(id).not.toBeNull();
      const hasModels = spec!.criteria.filter((c) => c.type === 'has_models');
      if (!hasModels.length) continue;
      const doc = PRESET_DOCS[id]();
      const results = checkLabCriteria(
        hasModels.map((c, i) => ({
          id: i + 1,
          order: i + 1,
          labelKey: 'x',
          type: c.type,
          paramsJson: c.paramsJson
        })),
        { doc, result: null, analysisMode: spec!.analysisMode }
      );
      expect(results.every((r) => r.passed))
        .withContext(`${id}: has_models failed on sample preset`)
        .toBeTrue();
    }
  });
});
