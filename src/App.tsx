import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { TaxLayout } from './layouts/TaxLayout';
import { RiddleLayout } from './layouts/RiddleLayout';
import { HomePage } from './features/taxes/HomePage';
import { PinGate } from './features/admin/PinGate';
import { QuizClipTrimmer } from './features/admin/QuizClipTrimmer';
import { VinylTimelinePage } from './features/vinyl-timeline/VinylTimelinePage';
import { TheCave } from './features/riddles/TheCave';
import { SpiderLair } from './features/riddles/spider-lair/SpiderLair';
import { OuterWilds } from './features/riddles/outer-wilds/OuterWilds';
import { Expedition33 } from './features/riddles/expedition-33/Expedition33';
import { LinkedInGames } from './features/riddles/linkedin/LinkedInGames';
import { ItsAHitRiddle } from './features/riddles/its-a-hit/ItsAHitRiddle';

const Translator = lazy(() => import('./features/translator/Translator'));
function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Tax (Boring) Routes */}
        <Route element={<TaxLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<PinGate />} />
        </Route>

        {/* Riddle (Fun) Routes */}
        <Route element={<RiddleLayout />}>
          <Route path="/the-cave" element={<TheCave />} />
        </Route>
        <Route path="/spider-lair" element={<SpiderLair />} />
        <Route path="/eye-signal-locator" element={<OuterWilds />} />
        <Route path="/xp-33" element={<Expedition33 />} />
        <Route path="/linkedin-games" element={<LinkedInGames />} />
        <Route path="/its-a-hit" element={<ItsAHitRiddle />} />
        <Route path="/translator" element={<Suspense fallback={<div>Loading...</div>}><Translator /></Suspense>} />
        <Route path="/admin/trimmer" element={<QuizClipTrimmer />} />
        <Route path="/vinyl" element={<VinylTimelinePage />} />
        <Route path="/vinyl/play/:id" element={<VinylTimelinePage />} />
        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
