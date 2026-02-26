import type { FundStrategy } from './funds';

/**
 * @deprecated — Canonical types live in `@/types`. Import from there for new code.
 * This file is kept for backward compatibility with existing components.
 */
export type { PropertyType } from '@/types/enums';

import type { PropertyType } from '@/types/enums';

export interface Property {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  imageUrl: string;
  capRate: number;
  irr: number;
  equityMultiple: number;
  type: PropertyType;
  fundStrategy?: FundStrategy;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  renovations?: number;
  reserves?: number;
  debtCosts?: number;
  equity?: number;
  ltc?: number;
  interestRate?: number;
  amortization?: number;
  exitCapRate?: number;
  netSaleProceeds?: number;
  netSalePerUnit?: number;
  profitMultiple?: number;
  inPlaceRent?: number;
  stabilizedRent?: number;
  noiMargin?: number;
  dscr?: number;
  spread?: number;
}

export const properties: Property[] = [
  {
    id: '1',
    streetAddress: '123 Oak Street',
    city: 'Atlanta',
    state: 'GA',
    zip: '30318',
    price: 325000,
    imageUrl: '/images/property1.jpg',
    capRate: 0.064,
    irr: 0.115,
    equityMultiple: 1.75,
    type: 'Long Term Hold',
    fundStrategy: 'pheasant',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1450,
    renovations: 50000,
    reserves: 15000,
    debtCosts: 20000,
    equity: 100000,
    ltc: 65,
    interestRate: 6.5,
    amortization: 30,
    exitCapRate: 7.0,
    netSaleProceeds: 500000,
    netSalePerUnit: 250000,
    profitMultiple: 1.75,
    inPlaceRent: 1200,
    stabilizedRent: 1500,
    noiMargin: 0.55,
    dscr: 1.25,
    spread: 180
  },
  {
    id: '2',
    streetAddress: '456 Maple Avenue',
    city: 'Decatur',
    state: 'GA',
    zip: '30030',
    price: 289000,
    imageUrl: '/images/property2.jpg',
    capRate: 0.089,
    irr: 0.145,
    equityMultiple: 1.92,
    type: 'Fix and Flip',
    fundStrategy: 'grouse',
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 1800,
    renovations: 60000,
    reserves: 12000,
    debtCosts: 18000,
    equity: 90000,
    ltc: 70,
    interestRate: 6.8,
    amortization: 25,
    exitCapRate: 7.5,
    netSaleProceeds: 520000,
    netSalePerUnit: 260000,
    profitMultiple: 1.85,
    inPlaceRent: 1300,
    stabilizedRent: 1600,
    noiMargin: 0.60,
    dscr: 1.30,
    spread: 170
  },
  {
    id: '3',
    streetAddress: '789 Pine Street',
    city: 'Savannah',
    state: 'GA',
    zip: '31401',
    price: 415000,
    imageUrl: '/images/property3.jpg',
    capRate: 0.102,
    irr: 0.158,
    equityMultiple: 2.12,
    type: 'Short Term Rental',
    fundStrategy: 'pheasant',
    bedrooms: 5,
    bathrooms: 3,
    squareFeet: 2100,
    renovations: 70000,
    reserves: 18000,
    debtCosts: 22000,
    equity: 110000,
    ltc: 68,
    interestRate: 6.3,
    amortization: 28,
    exitCapRate: 6.8,
    netSaleProceeds: 600000,
    netSalePerUnit: 300000,
    profitMultiple: 2.05,
    inPlaceRent: 1400,
    stabilizedRent: 1700,
    noiMargin: 0.58,
    dscr: 1.28,
    spread: 175
  },
];