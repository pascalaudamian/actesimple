import React from 'react';
import { CategoryId, CategoryMeta } from '../types.ts';
import { Language } from '../i18n/translations.ts';
import {
  Layers,
  IdCard,
  Car,
  Briefcase,
  Scale,
  Users,
  Home,
  HeartPulse,
  Gift,
  Globe,
  FileQuestion,
} from 'lucide-react';

interface CategoryFilterProps {
  categories: CategoryMeta[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  lang: Language;
}

const CATEGORY_NAMES_EN: Record<string, string> = {
  toate: 'All procedures',
  international: 'International & Visas',
  identitate: 'Identity & Passports',
  auto: 'Vehicles & Driving',
  afaceri: 'Business & Work',
  juridic: 'Legal & Criminal Record',
  familie: 'Family & Civil Status',
  locuinta: 'Housing & Property',
  beneficii: 'Social Benefits',
  sanatate: 'Healthcare & CAS',
  altele: 'Other procedures',
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  lang,
}) => {
  const getCategoryIcon = (iconName: string, isSelected: boolean) => {
    const className = `w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Layers':
        return <Layers className={className} />;
      case 'Globe':
        return <Globe className={className} />;
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
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Gift':
        return <Gift className={className} />;
      default:
        return <Globe className={className} />;
    }
  };

  return (
    <div className="py-2 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 pb-1 min-w-max">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const label = lang === 'en' && CATEGORY_NAMES_EN[cat.id] ? CATEGORY_NAMES_EN[cat.id] : cat.name;

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
              <span>{label}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
