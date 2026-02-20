import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaxLayout } from './layouts/TaxLayout';
import { RiddleLayout } from './layouts/RiddleLayout';
import { HomePage } from './features/taxes/HomePage';
import { TheCave } from './features/riddles/TheCave';
import { PinGate } from './features/admin/PinGate';

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

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
