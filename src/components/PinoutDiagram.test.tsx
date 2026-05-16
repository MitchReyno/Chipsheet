import React from 'react';
import { render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ICComponentSchema } from '@/lib/schema';
import type { ICComponent } from '@/types/component';
import PinoutDiagram from './PinoutDiagram';

function loadFixture(name: string): ICComponent {
  const filePath = path.join(process.cwd(), 'src', 'test', 'fixtures', `${name}.yaml`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return ICComponentSchema.parse(yaml.load(raw)) as ICComponent;
}

describe('PinoutDiagram', () => {
  let component: ICComponent;

  beforeAll(() => {
    component = loadFixture('TEST4069');
  });

  it('renders the IC body rect', () => {
    render(<PinoutDiagram component={component} />);
    expect(screen.getByTestId('ic-body')).toBeInTheDocument();
  });

  it('renders the notch marker', () => {
    render(<PinoutDiagram component={component} />);
    expect(screen.getByTestId('notch-marker')).toBeInTheDocument();
  });

  it('renders a pin name label for every pin', () => {
    render(<PinoutDiagram component={component} />);
    const pins = component.pins;
    for (const pin of pins) {
      expect(screen.getByTestId(`pin-name-${pin.number}`)).toBeInTheDocument();
    }
  });

  it('renders the correct number of pin name labels', () => {
    render(<PinoutDiagram component={component} />);
    const labels = screen.getAllByTestId(/^pin-name-/);
    expect(labels).toHaveLength(component.pins.length);
  });
});
