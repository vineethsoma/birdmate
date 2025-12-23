import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

function BirdDetailPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bird Detail</h1>
      <p>Bird details will be displayed here (US2).</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bird/:id" element={<BirdDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
