import {
  Baby,
  Briefcase,
  Car,
  Check,
  CreditCard,
  Gamepad2,
  Globe,
  Heart,
  Home,
  LucideIcon,
  Phone,
  Plus,
  Shield,
  ShoppingBag,
  Sparkles,
  Trash2,
  Tv,
  Utensils,
  Wallet,
  Wifi,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Envelope, EnvelopeCategory } from '../types';
import { formatNaira } from '../utils/formatters';

export const AVAILABLE_ENVELOPE_ICONS: Record<string, LucideIcon> = {
  Home,
  Utensils,
  CreditCard,
  Baby,
  Wifi,
  Tv,
  Car,
  Gamepad2,
  Wallet,
  Sparkles,
  Globe,
  Heart,
  Shield,
  ShoppingBag,
  Briefcase,
  Phone,
};

const COLOR_OPTIONS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Slate', value: '#64748B' },
];

const PRESET_ENVELOPES: Array<{
  name: string;
  category: EnvelopeCategory;
  monthlyTarget: number;
  isEssentialForSurvival: boolean;
  iconName: string;
  color: string;
}> = [
  {
    name: 'Toiletries & Personal Care',
    category: 'survival',
    monthlyTarget: 15000,
    isEssentialForSurvival: true,
    iconName: 'Sparkles',
    color: '#14B8A6',
  },
  {
    name: 'Online Subscriptions',
    category: 'utility',
    monthlyTarget: 10000,
    isEssentialForSurvival: false,
    iconName: 'Tv',
    color: '#8B5CF6',
  },
  {
    name: 'Health & Pharmacy',
    category: 'survival',
    monthlyTarget: 10000,
    isEssentialForSurvival: true,
    iconName: 'Heart',
    color: '#F43F5E',
  },
  {
    name: 'Family Support / Black Tax',
    category: 'family',
    monthlyTarget: 25000,
    isEssentialForSurvival: true,
    iconName: 'Baby',
    color: '#F59E0B',
  },
  {
    name: 'Work Software & Tools',
    category: 'utility',
    monthlyTarget: 15000,
    isEssentialForSurvival: false,
    iconName: 'Globe',
    color: '#06B6D4',
  },
  {
    name: 'Car / Bike Maintenance',
    category: 'survival',
    monthlyTarget: 20000,
    isEssentialForSurvival: true,
    iconName: 'Car',
    color: '#6366F1',
  },
];

interface EnvelopeEditorModalProps {
  isOpen: boolean;
  envelopeToEdit?: Envelope | null;
  onClose: () => void;
  onSaveEnvelope: (envelopeData: Omit<Envelope, 'id'> & { id?: string }) => void;
  onDeleteEnvelope?: (envelopeId: string) => void;
}

export const EnvelopeEditorModal: React.FC<EnvelopeEditorModalProps> = ({
  isOpen,
  envelopeToEdit,
  onClose,
  onSaveEnvelope,
  onDeleteEnvelope,
}) => {
  const isEditing = !!envelopeToEdit;

  const [name, setName] = useState(envelopeToEdit?.name || '');
  const [category, setCategory] = useState<EnvelopeCategory>(
    envelopeToEdit?.category || 'utility'
  );
  const [monthlyTarget, setMonthlyTarget] = useState(
    envelopeToEdit ? envelopeToEdit.monthlyTarget.toString() : '15000'
  );
  const [currentBalance, setCurrentBalance] = useState(
    envelopeToEdit ? envelopeToEdit.currentBalance.toString() : '0'
  );
  const [isEssentialForSurvival, setIsEssentialForSurvival] = useState(
    envelopeToEdit ? envelopeToEdit.isEssentialForSurvival : true
  );
  const [iconName, setIconName] = useState(envelopeToEdit?.iconName || 'Wallet');
  const [color, setColor] = useState(envelopeToEdit?.color || '#3B82F6');

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_ENVELOPES[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setMonthlyTarget(preset.monthlyTarget.toString());
    setIsEssentialForSurvival(preset.isEssentialForSurvival);
    setIconName(preset.iconName);
    setColor(preset.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetNum = parseFloat(monthlyTarget) || 0;
    const balanceNum = parseFloat(currentBalance) || 0;

    onSaveEnvelope({
      id: envelopeToEdit?.id,
      name: name.trim(),
      category,
      monthlyTarget: Math.max(0, targetNum),
      currentBalance: Math.max(0, balanceNum),
      isEssentialForSurvival,
      iconName,
      color,
      savingsGoal: envelopeToEdit?.savingsGoal,
    });

    onClose();
  };

  const SelectedIcon = AVAILABLE_ENVELOPE_ICONS[iconName] || Wallet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <SelectedIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {isEditing ? 'Edit Envelope & Allocation' : 'Create New Envelope'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? `Update allocations and rules for ${envelopeToEdit.name}`
                  : 'Define a new spending bucket with custom target and category'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Quick Presets (Only when creating new) */}
          {!isEditing && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Preset Suggestions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ENVELOPES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    + {preset.name} ({formatNaira(preset.monthlyTarget)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Envelope Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Envelope Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Toiletries, Online Subscriptions, Fuel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Monthly Target & Current Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Target Allocation (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₦</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  placeholder="0"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Target amount needed every 30 days
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Cash Balance (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₦</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="0"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Cash currently inside this envelope
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EnvelopeCategory)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="survival">Survival (Essential living)</option>
              <option value="utility">Utility & Bills</option>
              <option value="debt">Debt & Obligations</option>
              <option value="family">Family & Child Care</option>
              <option value="lifestyle">Lifestyle & Leisure</option>
              <option value="savings">Savings & Sinking Fund</option>
            </select>
          </div>

          {/* Essential for Survival Toggle */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Essential for Survival Runway
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-relaxed">
                When enabled, this envelope's monthly target is counted in your minimum survival burn rate and prioritized in auto-distribution.
              </span>
            </div>
            <input
              type="checkbox"
              id="essential-toggle"
              checked={isEssentialForSurvival}
              onChange={(e) => setIsEssentialForSurvival(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Choose Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(AVAILABLE_ENVELOPE_ICONS).map((nameKey) => {
                const IconComp = AVAILABLE_ENVELOPE_ICONS[nameKey];
                const isSelected = iconName === nameKey;
                return (
                  <button
                    key={nameKey}
                    type="button"
                    onClick={() => setIconName(nameKey)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-emerald-500'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                    title={nameKey}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color.toLowerCase() === c.value.toLowerCase();
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delete Option (If Editing) */}
          {isEditing && onDeleteEnvelope && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              {confirmDelete ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                    Delete this envelope? Any remaining balance of {formatNaira(envelopeToEdit.currentBalance)} will be transferred to your Unallocated Survival Buffer.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteEnvelope(envelopeToEdit.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Envelope</span>
                </button>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{isEditing ? 'Save Changes' : 'Create Envelope'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
