import React from 'react';
import { CategoryId, CategoryMeta } from '../types.ts';
import {
  Layers,
  IdCard,
  Car,
  Briefcase,
  Scale,
  Users,
  Home,
  HeartPulse,
} from 'lucide-react';

interface CategoryFilterProps {
  categories: CategoryMeta[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getCategoryIcon = (iconName: string, isSelected: boolean) => {
    const className = `w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Layers':
        return <Layers className={className} />;
      case 'IdCard':
        return <IdCard className={className} />;
      case 'Car':
        return <Car className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Scale':
        return <Scale className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Home':
        return <Home className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  return (
    <div className="py-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 pb-1 min-w-max">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-2xs select-none ${
                isSelected
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20 ring-2 ring-blue-700/20'
                  : 'bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {getCategoryIcon(cat.icon, isSelected)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
