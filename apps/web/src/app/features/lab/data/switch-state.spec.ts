import { allEnergyPathsClosed, allEnergyPathsOpen, controllableSwitchStateKey, hasControllableSwitch } from './switch-state';
import { createLedFadePreset } from './presets/led-fade.preset';
import { createComponent, assignNets } from './schematic.model';

describe('switch-state', () => {
  it('treats pushbutton as a controllable path', () => {
    const doc = assignNets({
      groundNet: 'gnd',
      components: [
        createComponent('pushbutton', 0, 0, 'BTN1'),
        createComponent('ground', 0, 100, 'GND1')
      ],
      wires: [
        {
          id: 'W1',
          a: { componentId: 'BTN1', pin: 'a' },
          b: { componentId: 'GND1', pin: 'g' }
        }
      ]
    });
    expect(allEnergyPathsOpen(doc)).toBeTrue();
  });

  it('returns false when any switch is closed', () => {
    const doc = createLedFadePreset();
    expect(allEnergyPathsOpen(doc)).toBeFalse();
  });

  it('returns true when switch is open', () => {
    const doc = createLedFadePreset();
    const open = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    };
    expect(allEnergyPathsOpen(open)).toBeTrue();
  });

  it('returns true when all switches are closed', () => {
    expect(allEnergyPathsClosed(createLedFadePreset())).toBeTrue();
  });

  it('builds a stable switch state key', () => {
    const doc = createLedFadePreset();
    expect(controllableSwitchStateKey(doc)).toContain('S1:true');
    const open = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    };
    expect(controllableSwitchStateKey(open)).toContain('S1:false');
    expect(controllableSwitchStateKey(open)).not.toBe(controllableSwitchStateKey(doc));
  });

  it('returns false when any switch is open', () => {
    const doc = createLedFadePreset();
    const open = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    };
    expect(allEnergyPathsClosed(open)).toBeFalse();
  });

  it('detects controllable switches', () => {
    expect(hasControllableSwitch(createLedFadePreset())).toBeTrue();
    const doc = assignNets({
      groundNet: 'gnd',
      components: [createComponent('battery', 0, 0, 'V1')],
      wires: []
    });
    expect(hasControllableSwitch(doc)).toBeFalse();
  });
});
