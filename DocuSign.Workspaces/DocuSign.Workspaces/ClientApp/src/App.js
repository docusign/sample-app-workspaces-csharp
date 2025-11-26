import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import { UseCaseOnePage } from './pages/UseCaseOne';
import { UseCaseTwoPage } from './pages/UseCaseTwo';
import './App.scss';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="use-case1" element={<UseCaseOnePage />} />
        <Route path="use-case2" element={<UseCaseTwoPage />} />
      </Route>
    </Routes>
  );
}

export default App;
