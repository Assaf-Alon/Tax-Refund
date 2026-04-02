import React, { useMemo } from 'react';
import { Trophy, Medal, ChevronRight } from 'lucide-react';

interface LeaderboardStageProps {
    gameName: string;
    userTime: number;
    onNext: () => void;
}

interface Competitor {
    name: string;
    time: number;
    isUser?: boolean;
    rank: number;
}

const AvatarSilhouette: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => (
    <div className={`rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-gray-400 dark:text-gray-500 mt-1">
            <path fill="currentColor" d="M12,12C14.21,12 16,10.21 16,8C16,5.79 14.21,4 12,4C9.79,4 8,5.79 8,8C8,10.21 9.79,12 12,12M12,14C9.33,14 4,15.34 4,18V20H20V18C20,15.34 14.67,14 12,14Z" />
        </svg>
    </div>
);

export const LeaderboardStage: React.FC<LeaderboardStageProps> = ({ gameName, userTime, onNext }) => {
    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds <= 0) return "--s";
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const competitors: Competitor[] = useMemo(() => {
        const names = [
            "Sarah Jenkins", "Michael Chen", "Elena Rodriguez", "David Smith", 
            "Aisha Khan", "James Wilson", "Maria Garcia", "Robert Taylor"
        ];
        
        // Shuffle names partially for some variety
        const shuffled = [...names].sort(() => Math.random() - 0.5);

        // If userTime is 0 or NaN (welcome screen bug), use a default set of values for flavor
        const displayTime = (isNaN(userTime) || userTime <= 0) ? 60 : userTime;

        return [
            { name: shuffled[0], time: displayTime * 0.88, rank: 1 },
            { name: "You", time: userTime, rank: 2, isUser: true },
            { name: shuffled[1], time: displayTime * 1.15, rank: 3 },
            { name: shuffled[2], time: displayTime * 1.42, rank: 4 },
            { name: shuffled[3], time: displayTime * 1.68, rank: 5 },
        ];
    }, [userTime]);

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-[#1d2226] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h2>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                            {gameName} Performance
                        </p>
                    </div>
                    <Trophy className="text-yellow-500 w-8 h-8" />
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {competitors.map((c) => (
                        <div key={c.rank} className={`flex items-center gap-4 p-4 transition-colors ${c.isUser ? 'bg-[#f0f7ff] dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                            <div className="w-8 flex justify-center font-bold text-lg">
                                {c.rank === 1 ? <Medal className="text-[#c1a03e] w-6 h-6" /> : 
                                 c.rank === 2 ? <Medal className="text-[#a4aab2] w-6 h-6" /> : 
                                 c.rank === 3 ? <Medal className="text-[#b27248] w-6 h-6" /> : 
                                 <span className="text-gray-400 dark:text-gray-600 font-sans text-base">{c.rank}</span>}
                            </div>

                            <AvatarSilhouette className={c.isUser ? "border-2 border-blue-500" : ""} />

                            <div className="flex-1">
                                <div className={`font-semibold ${c.isUser ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {c.name} {c.isUser && "(You)"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Member since 2024
                                </div>
                            </div>

                            <div className={`font-mono text-sm font-bold ${c.isUser ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {formatTime(c.time)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/20 flex justify-end">
                    <button 
                        onClick={onNext}
                        className="flex items-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md"
                    >
                        Play Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                Your performance is verified by LinkedIn SmartScore™
            </div>
        </div>
    );
};
