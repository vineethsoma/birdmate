import { BrowserRouter, Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>BirdMate</h1>
      <p>Natural Language Bird Search</p>
      <p style={{ color: '#666', marginTop: '2rem' }}>
        Foundation setup complete. User stories will add functionality here.
      </p>
    </div>
  );
}

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
