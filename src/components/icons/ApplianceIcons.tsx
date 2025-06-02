import type { ApplianceType } from '@/types';
import { CarFront, CookingPot, WashingMachine, Shirt, GlassWater, LucideProps, HelpCircle } from 'lucide-react';
import React from 'react';

interface ApplianceIconProps extends LucideProps {
  type: ApplianceType;
}

const iconMap: Record<ApplianceType, React.ElementType<LucideProps>> = {
  'car-charger': CarFront,
  'oven': CookingPot,
  'washing-machine': WashingMachine,
  'dryer': Shirt,
  'dishwasher': GlassWater,
};

export const ApplianceIcon: React.FC<ApplianceIconProps> = ({ type, ...props }) => {
  const IconComponent = iconMap[type] || HelpCircle;
  return <IconComponent {...props} />;
};

export const getApplianceName = (type: ApplianceType): string => {
  switch (type) {
    case 'car-charger': return 'Car Charger';
    case 'oven': return 'Oven';
    case 'washing-machine': return 'Washing Machine';
    case 'dryer': return 'Dryer';
    case 'dishwasher': return 'Dishwasher';
    default: return 'Unknown Appliance';
  }
};
