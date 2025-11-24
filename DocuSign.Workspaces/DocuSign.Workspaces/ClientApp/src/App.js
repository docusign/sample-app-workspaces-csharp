import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import { RequestTranscriptPage } from './pages/RequestTranscript';
import './App.scss';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="workspaces" element={<RequestTranscriptPage />} />
      </Route>
    </Routes>
  );
}

export default App;
