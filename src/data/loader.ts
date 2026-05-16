import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ICComponentSchema } from '@/lib/schema';
import type { ICComponent, ICComponentSummary } from '@/types/component';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'ics');

export class ComponentNotFoundError extends Error {
  constructor(partNumber: string) {
    super(`Component not found: ${partNumber}`);
    this.name = 'ComponentNotFoundError';
  }
}

export interface ComponentLoader {
  load(partNumber: string): Promise<ICComponent>;
}

function findYamlFile(partNumber: string): string | null {
  if (!fs.existsSync(DATA_DIR)) return null;
  const series = fs.readdirSync(DATA_DIR, { withFileTypes: true });
  for (const dir of series) {
    if (!dir.isDirectory()) continue;
    const candidate = path.join(DATA_DIR, dir.name, `${partNumber}.yaml`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export class YamlFileLoader implements ComponentLoader {
  async load(partNumber: string): Promise<ICComponent> {
    const filePath = findYamlFile(partNumber);
    if (!filePath) throw new ComponentNotFoundError(partNumber);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = yaml.load(raw);
    return ICComponentSchema.parse(parsed) as ICComponent;
  }
}

export async function listComponents(series?: string): Promise<ICComponentSummary[]> {
  if (!fs.existsSync(DATA_DIR)) return [];
  const results: ICComponentSummary[] = [];
  const seriesDirs = fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());
  for (const dir of seriesDirs) {
    if (series && dir.name !== series) continue;
    const dirPath = path.join(DATA_DIR, dir.name);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.yaml'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        const parsed = yaml.load(raw);
        const component = ICComponentSchema.parse(parsed) as ICComponent;
        results.push({
          partNumber: component.partNumber,
          name: component.name,
          series: component.series,
          pinCount: component.package.pinCount,
        });
      } catch {
        // skip malformed files in listing
      }
    }
  }
  return results.sort((a, b) => a.partNumber.localeCompare(b.partNumber));
}
