import {
  SchematicDocument,
  assignNets,
  createComponent,
  resetIdSeq
} from '../schematic.model';

/**
 * Arduino Wire + SSD1306 with 4.7 kΩ pull-ups on SDA/SCL.
 * Teaches I2C wiring (power, ground, open-drain bus + pull-ups) — not bit-level protocol.
 */
export function createI2cOledPreset(): SchematicDocument {
  resetIdSeq(250);
  const mcu = createComponent('arduino_i2c', 90, 200, 'MCU1');
  mcu.params = { vHigh: 5 };
  const jV = createComponent('junction', 200, 100, 'JV');
  const jScl = createComponent('junction', 280, 170, 'JSCL');
  const jSda = createComponent('junction', 280, 240, 'JSDA');
  const rpuScl = createComponent('resistor', 200, 140, 'RpuSCL');
  rpuScl.params = { r: 4700 };
  rpuScl.rotation = 90;
  const rpuSda = createComponent('resistor', 240, 140, 'RpuSDA');
  rpuSda.params = { r: 4700 };
  rpuSda.rotation = 90;
  const oled = createComponent('ssd1306', 420, 200, 'OLED1');
  oled.params = { addr: 60, rLoad: 500 };
  const gnd = createComponent('ground', 90, 320, 'GND1');

  return assignNets({
    groundNet: 'gnd',
    components: [mcu, jV, jScl, jSda, rpuScl, rpuSda, oled, gnd],
    wires: [
      { id: 'W1', a: { componentId: 'MCU1', pin: 'v5' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W2', a: { componentId: 'MCU1', pin: 'gnd' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W3', a: { componentId: 'MCU1', pin: 'scl' }, b: { componentId: 'JSCL', pin: 'j' } },
      { id: 'W4', a: { componentId: 'MCU1', pin: 'sda' }, b: { componentId: 'JSDA', pin: 'j' } },
      { id: 'W5', a: { componentId: 'RpuSCL', pin: 'a' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W6', a: { componentId: 'RpuSCL', pin: 'b' }, b: { componentId: 'JSCL', pin: 'j' } },
      { id: 'W7', a: { componentId: 'RpuSDA', pin: 'a' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W8', a: { componentId: 'RpuSDA', pin: 'b' }, b: { componentId: 'JSDA', pin: 'j' } },
      { id: 'W9', a: { componentId: 'OLED1', pin: 'vcc' }, b: { componentId: 'JV', pin: 'j' } },
      { id: 'W10', a: { componentId: 'OLED1', pin: 'gnd' }, b: { componentId: 'GND1', pin: 'g' } },
      { id: 'W11', a: { componentId: 'OLED1', pin: 'scl' }, b: { componentId: 'JSCL', pin: 'j' } },
      { id: 'W12', a: { componentId: 'OLED1', pin: 'sda' }, b: { componentId: 'JSDA', pin: 'j' } }
    ]
  });
}
