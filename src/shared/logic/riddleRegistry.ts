export interface RiddleMeta {
    id: string;
    name: string;
    path: string;
    totalStages: number;
    stageLabels: string[];
}

export const RIDDLE_REGISTRY: RiddleMeta[] = [
    {
        id: 'the-cave',
        name: 'The Cave',
        path: '/the-cave',
        totalStages: 4,
        stageLabels: ['Entrance', 'Narrow Passage', 'The Light', 'Completed'],
    },
    {
        id: 'spider-lair',
        name: 'Spider Lair',
        path: '/spider-lair',
        totalStages: 12,
        stageLabels: [
            'Entrance', 'Passcode', 'Lyrics', 'Skarrsinger',
            'Acts', 'Aids', 'Friends', 'Creature',
            'Slab', 'Mite', 'Git Gud', 'Completed',
        ],
    },
];
