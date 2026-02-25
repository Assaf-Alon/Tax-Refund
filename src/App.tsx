import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { TaxLayout } from './layouts/TaxLayout';
import { RiddleLayout } from './layouts/RiddleLayout';
import { HomePage } from './features/taxes/HomePage';
import { PinGate } from './features/admin/PinGate';
import { TheCave } from './features/riddles/TheCave';
import { SpiderLair } from './features/riddles/spider-lair/SpiderLair';
import { OuterWilds } from './features/riddles/outer-wilds/OuterWilds';

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
        <Route path="/outer-wilds" element={<OuterWilds />} />
        <Route path="/translator" element={<Suspense fallback={<div>Loading...</div>}><Translator /></Suspense>} />
        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

