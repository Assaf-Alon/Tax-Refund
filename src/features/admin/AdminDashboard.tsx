import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RIDDLE_REGISTRY } from '../../shared/logic/riddleRegistry';
import {
    loadState,
    setRiddleProgress,
    resetRiddleProgress,
    resetAllProgress,
    updateAdminSettings,
} from '../../shared/logic/gameState';

const getStatusEmoji = (stage: number, totalStages: number): string => {
    if (stage === 0) return '🔴 Not started';
    if (stage >= totalStages - 1) return '🟢 Completed';
    return '🟡 In progress';
};

export const AdminDashboard: React.FC = () => {
    const [tick, setTick] = useState(0);
    const refresh = () => setTick(t => t + 1);
    const state = loadState();

    // tick is used indirectly — reading state after refresh re-reads localStorage
    void tick;

    const handleJump = (riddleId: string, stage: number) => {
        setRiddleProgress(riddleId, stage);
        refresh();
    };

    const handleReset = (riddleId: string, riddleName: string) => {
        if (window.confirm(`Are you sure you want to reset "${riddleName}"?`)) {
            resetRiddleProgress(riddleId);
            refresh();
        }
    };

    const handleResetAll = () => {
        if (window.confirm('Are you sure you want to reset ALL riddle progress?')) {
            resetAllProgress();
            refresh();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">Riddle</th>
                            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">Stage</th>
                            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RIDDLE_REGISTRY.map(riddle => {
                            const stage = state.riddleProgress[riddle.id] ?? 0;
                            const label = riddle.stageLabels[stage] ?? 'Unknown';

                            return (
                                <tr key={riddle.id}>
                                    <td className="border border-gray-200 px-4 py-2">
                                        <Link
                                            to={riddle.path}
                                            className="text-blue-700 hover:underline font-medium"
                                        >
                                            {riddle.name}
                                        </Link>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2 text-sm">
                                        {getStatusEmoji(stage, riddle.totalStages)}
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2 text-sm">
                                        Stage {stage + 1} of {riddle.totalStages} — {label}
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={stage}
                                                onChange={e => handleJump(riddle.id, Number(e.target.value))}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                                            >
                                                {riddle.stageLabels.map((sLabel, i) => (
                                                    <option key={i} value={i}>
                                                        {i} — {sLabel}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleReset(riddle.id, riddle.name)}
                                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            id="bypass-toggle"
                            type="checkbox"
                            checked={state.adminSettings.bypassPinOnLocalhost}
                            onChange={(e) => {
                                updateAdminSettings({ bypassPinOnLocalhost: e.target.checked });
                                refresh();
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="bypass-toggle" className="text-sm text-gray-700 font-medium cursor-pointer">
                            Bypass PIN in Development
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="devtools-toggle"
                            type="checkbox"
                            checked={state.adminSettings.devToolsEnabled}
                            onChange={(e) => {
                                updateAdminSettings({ devToolsEnabled: e.target.checked });
                                refresh();
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="devtools-toggle" className="text-sm text-gray-700 font-medium cursor-pointer">
                            Enable Dev Tools Overlay
                        </label>
                    </div>
                </div>
                <button
                    onClick={handleResetAll}
                    className="bg-red-700 text-white px-4 py-2 rounded text-sm hover:bg-red-800 transition-colors"
                >
                    🗑 Reset All Progress
                </button>
            </div>
        </div>
    );
};
