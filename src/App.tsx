import React, { useState, useEffect, KeyboardEvent } from 'react';
import { ArrowLeftRight, Plus, X, Save, Calendar } from 'lucide-react';
import type { Presenter, DayOfWeek, Settings } from './types';
import {
  getCurrentWeekNumber,
  getPresenterForWeek,
  getWeekStartDate,
  formatDate,
  formatDayOfWeek,
  encodePresenterList,
  decodePresenterList,
  encodeSettings,
  decodeSettings
} from './utils';

const defaultPresenters: Presenter[] = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Carol Williams' },
  { id: 4, name: 'David Brown' },
  { id: 5, name: 'Eva Martinez' },
];

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

function App() {
  const [presenters, setPresenters] = useState<Presenter[]>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedPresenters = urlParams.get('presenters');
    return encodedPresenters ? decodePresenterList(encodedPresenters) : defaultPresenters;
  });
  
  const [settings, setSettings] = useState<Settings>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedSettings = urlParams.get('settings');
    return encodedSettings ? decodeSettings(encodedSettings) : { presentationDay: 1 };
  });
  
  const [swapMode, setSwapMode] = useState(false);
  const [selectedForSwap, setSelectedForSwap] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPresenterName, setNewPresenterName] = useState('');
  
  const currentWeek = getCurrentWeekNumber();
  const currentPresenter = getPresenterForWeek(presenters, currentWeek);
  
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('presenters', encodePresenterList(presenters));
    params.set('settings', encodeSettings(settings));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [presenters, settings]);

  const handleSwap = (presenterId: number) => {
    if (!swapMode) {
      setSwapMode(true);
      setSelectedForSwap(presenterId);
      return;
    }

    if (selectedForSwap === null) return;

    const newPresenters = [...presenters];
    const index1 = presenters.findIndex(p => p.id === selectedForSwap);
    const index2 = presenters.findIndex(p => p.id === presenterId);

    [newPresenters[index1], newPresenters[index2]] = [newPresenters[index2], newPresenters[index1]];

    setPresenters(newPresenters);
    setSwapMode(false);
    setSelectedForSwap(null);
  };

  const addPresenter = () => {
    if (!newPresenterName.trim()) return;
    
    const newId = Math.max(0, ...presenters.map(p => p.id)) + 1;
    setPresenters([...presenters, { id: newId, name: newPresenterName.trim() }]);
    setNewPresenterName('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newPresenterName.trim()) {
      e.preventDefault();
      addPresenter();
    }
  };

  const removePresenter = (id: number) => {
    if (presenters.length <= 2) {
      alert('Cannot remove presenter. Minimum 2 presenters required.');
      return;
    }
    setPresenters(presenters.filter(p => p.id !== id));
  };

  const upcomingWeeks = Array.from({ length: 5 }, (_, i) => currentWeek + i + 1);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Weekly Status Presenter</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <select
                  value={settings.presentationDay}
                  onChange={(e) => setSettings({ ...settings, presentationDay: Number(e.target.value) as DayOfWeek })}
                  className="px-3 py-2 border rounded-md bg-white"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEditing ? 'Save List' : 'Edit List'}
              </button>
            </div>
          </div>
          
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Current Week
            </h2>
            <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
              <div>
                <p className="text-sm text-gray-500">
                  {formatDayOfWeek(getWeekStartDate(currentWeek, settings.presentationDay))}, {' '}
                  {formatDate(getWeekStartDate(currentWeek, settings.presentationDay))}
                </p>
                <p className="text-xl font-bold text-blue-600">{currentPresenter.name}</p>
              </div>
              {swapMode ? (
                <button
                  onClick={() => {
                    setSwapMode(false);
                    setSelectedForSwap(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel Swap
                </button>
              ) : (
                <button
                  onClick={() => handleSwap(currentPresenter.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Swap Presenter
                </button>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Upcoming Presentations</h3>
            <div className="space-y-2">
              {upcomingWeeks.map(week => {
                const presenter = getPresenterForWeek(presenters, week);
                const date = getWeekStartDate(week, settings.presentationDay);
                return (
                  <div key={week} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">
                        {formatDayOfWeek(date)}, {formatDate(date)}
                      </p>
                      <p className="font-medium text-gray-800">{presenter.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">Presentation Order</h3>
              {isEditing && (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newPresenterName}
                    onChange={(e) => setNewPresenterName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="New presenter name"
                    className="px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={addPresenter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            {presenters.map((presenter, index) => (
              <div
                key={presenter.id}
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  selectedForSwap === presenter.id
                    ? 'bg-blue-100'
                    : swapMode
                    ? 'bg-gray-50 hover:bg-blue-50 cursor-pointer'
                    : 'bg-gray-50'
                }`}
                onClick={() => swapMode && selectedForSwap !== presenter.id && handleSwap(presenter.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
                    {index + 1}
                  </span>
                  <span className="font-medium">{presenter.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {swapMode && selectedForSwap === presenter.id && (
                    <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                  )}
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePresenter(presenter.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;