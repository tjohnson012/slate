'use client';

import { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Utensils, Zap, Bot, CheckCircle } from 'lucide-react';
import { AutonomyConfig } from '@/lib/types';

interface AutonomySetupProps {
  initialConfig?: Partial<AutonomyConfig>;
  onSave?: (config: AutonomyConfig) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AUTONOMY_LEVELS = [
  {
    level: 'suggest' as const,
    title: 'Suggest',
    description: 'Shows options, you decide',
    icon: Bot,
  },
  {
    level: 'book_with_confirm' as const,
    title: 'Book & Confirm',
    description: 'Books but you can cancel',
    icon: CheckCircle,
  },
  {
    level: 'full_auto' as const,
    title: 'Full Auto',
    description: 'Just handles it',
    icon: Zap,
  },
];

export function AutonomySetup({ initialConfig, onSave }: AutonomySetupProps) {
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyConfig['autonomyLevel']>(
    initialConfig?.autonomyLevel || 'suggest'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialConfig?.schedule?.daysOfWeek || [5, 6]
  );
  const [partySize] = useState(initialConfig?.constraints?.partySize || 2);
  const [budgetMin, setBudgetMin] = useState(initialConfig?.constraints?.budgetPerPerson?.min || 50);
  const [budgetMax, setBudgetMax] = useState(initialConfig?.constraints?.budgetPerPerson?.max || 150);
  const [neighborhoods, setNeighborhoods] = useState<string[]>(
    initialConfig?.constraints?.neighborhoods || []
  );
  const [cuisinePrefs, setCuisinePrefs] = useState<string[]>(
    initialConfig?.constraints?.cuisinePreferences || []
  );
  const [includeDrinks, setIncludeDrinks] = useState(
    initialConfig?.constraints?.includeDrinks ?? true
  );
  const [timeEarliest, setTimeEarliest] = useState(
    initialConfig?.constraints?.timePreference?.earliest || '18:00'
  );
  const [timeLatest, setTimeLatest] = useState(
    initialConfig?.constraints?.timePreference?.latest || '21:00'
  );
  const [notifyTime, setNotifyTime] = useState(
    initialConfig?.schedule?.notifyTime || '10:00'
  );
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(
    initialConfig?.schedule?.notifyDaysBefore || 2
  );

  const [neighborhoodInput, setNeighborhoodInput] = useState('');
  const [cuisineInput, setCuisineInput] = useState('');

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const addNeighborhood = () => {
    if (neighborhoodInput.trim() && !neighborhoods.includes(neighborhoodInput.trim())) {
      setNeighborhoods([...neighborhoods, neighborhoodInput.trim()]);
      setNeighborhoodInput('');
    }
  };

  const addCuisine = () => {
    if (cuisineInput.trim() && !cuisinePrefs.includes(cuisineInput.trim())) {
      setCuisinePrefs([...cuisinePrefs, cuisineInput.trim()]);
      setCuisineInput('');
    }
  };

  const handleSave = () => {
    const config: AutonomyConfig = {
      id: initialConfig?.id || crypto.randomUUID(),
      userId: initialConfig?.userId || 'demo-user',
      enabled: true,
      schedule: {
        daysOfWeek: selectedDays,
        notifyDaysBefore,
        notifyTime,
      },
      constraints: {
        partySize,
        budgetPerPerson: { min: budgetMin, max: budgetMax },
        neighborhoods,
        cuisinePreferences: cuisinePrefs,
        cuisineExclusions: [],
        includeDrinks,
        timePreference: { earliest: timeEarliest, latest: timeLatest },
      },
      autonomyLevel,
      vibeVector: initialConfig?.vibeVector || {
        lighting: 50,
        noiseLevel: 50,
        crowdVibe: 50,
        formality: 50,
        adventurousness: 50,
        priceLevel: 50,
      },
      successfulBookings: initialConfig?.successfulBookings || 0,
      createdAt: initialConfig?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave?.(config);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Autonomy Level</h3>
        <div className="grid grid-cols-3 gap-3">
          {AUTONOMY_LEVELS.map(({ level, title, description, icon: Icon }) => (
            <button
              key={level}
              onClick={() => setAutonomyLevel(level)}
              className={`p-4 rounded-xl border text-left transition-all ${
                autonomyLevel === level
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-2 ${
                  autonomyLevel === level ? 'text-amber-400' : 'text-zinc-400'
                }`}
              />
              <p className="font-medium">{title}</p>
              <p className="text-xs text-zinc-400 mt-1">{description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          Schedule
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Plan dates for</label>
            <div className="flex gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays.includes(i)
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {day[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-2">Notify me at</label>
              <input
                type="time"
                value={notifyTime}
                onChange={(e) => setNotifyTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-2">Days before</label>
              <select
                value={notifyDaysBefore}
                onChange={(e) => setNotifyDaysBefore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Timing
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Earliest</label>
            <input
              type="time"
              value={timeEarliest}
              onChange={(e) => setTimeEarliest(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Latest</label>
            <input
              type="time"
              value={timeLatest}
              onChange={(e) => setTimeLatest(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-400" />
          Budget
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Min per person</label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Max per person</label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-2">Party size: {partySize} guests</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          Neighborhoods
        </h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={neighborhoodInput}
            onChange={(e) => setNeighborhoodInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNeighborhood()}
            placeholder="Add neighborhood..."
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
          />
          <button
            onClick={addNeighborhood}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {neighborhoods.map((n) => (
            <span
              key={n}
              className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-2"
            >
              {n}
              <button
                onClick={() => setNeighborhoods(neighborhoods.filter((x) => x !== n))}
                className="text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-amber-400" />
          Cuisine Preferences
        </h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={cuisineInput}
            onChange={(e) => setCuisineInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCuisine()}
            placeholder="Add cuisine..."
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
          />
          <button
            onClick={addCuisine}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {cuisinePrefs.map((c) => (
            <span
              key={c}
              className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-2"
            >
              {c}
              <button
                onClick={() => setCuisinePrefs(cuisinePrefs.filter((x) => x !== c))}
                className="text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
        <input
          type="checkbox"
          id="includeDrinks"
          checked={includeDrinks}
          onChange={(e) => setIncludeDrinks(e.target.checked)}
          className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-amber-500 focus:ring-amber-500"
        />
        <label htmlFor="includeDrinks" className="text-sm">
          Include drinks spot after dinner
        </label>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors"
      >
        Save Autonomy Settings
      </button>
    </div>
  );
}
