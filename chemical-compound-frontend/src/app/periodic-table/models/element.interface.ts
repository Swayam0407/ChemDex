export enum ElementCategory {
  ALKALI_METALS = 'alkali-metals',
  ALKALINE_EARTH_METALS = 'alkaline-earth-metals',
  TRANSITION_METALS = 'transition-metals',
  POST_TRANSITION_METALS = 'post-transition-metals',
  METALLOIDS = 'metalloids',
  NONMETALS = 'nonmetals',
  HALOGENS = 'halogens',
  NOBLE_GASES = 'noble-gases',
  LANTHANIDES = 'lanthanides',
  ACTINIDES = 'actinides'
}

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  group: number;
  period: number;
  electronConfiguration: string;
  meltingPoint?: number;
  boilingPoint?: number;
  density?: number;
  description: string;
  gridPosition: {
    row: number;
    column: number;
  };
}

export interface CategoryConfig {
  [key: string]: {
    name: string;
    color: string;
    description: string;
  };
}

export const ELEMENT_CATEGORIES: CategoryConfig = {
  'alkali-metals': {
    name: 'Alkali Metals',
    color: '#ff6b6b',
    description: 'Highly reactive metals in group 1'
  },
  'alkaline-earth-metals': {
    name: 'Alkaline Earth Metals',
    color: '#ffa726',
    description: 'Reactive metals in group 2'
  },
  'transition-metals': {
    name: 'Transition Metals',
    color: '#42a5f5',
    description: 'Metals with variable oxidation states'
  },
  'post-transition-metals': {
    name: 'Post-transition Metals',
    color: '#66bb6a',
    description: 'Metals with lower melting points'
  },
  'metalloids': {
    name: 'Metalloids',
    color: '#ab47bc',
    description: 'Elements with properties between metals and nonmetals'
  },
  'nonmetals': {
    name: 'Nonmetals',
    color: '#ffee58',
    description: 'Elements that typically gain electrons'
  },
  'halogens': {
    name: 'Halogens',
    color: '#26c6da',
    description: 'Highly reactive nonmetals in group 17'
  },
  'noble-gases': {
    name: 'Noble Gases',
    color: '#ef5350',
    description: 'Inert gases with complete electron shells'
  },
  'lanthanides': {
    name: 'Lanthanides',
    color: '#ffa726',
    description: 'Rare earth elements'
  },
  'actinides': {
    name: 'Actinides',
    color: '#8d6e63',
    description: 'Radioactive elements'
  }
};