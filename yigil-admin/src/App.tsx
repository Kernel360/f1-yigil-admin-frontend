import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage.tsx";
//import "./App.css";
import LoginPage from "./components/login/LoginPage.tsx";
import AdminSignUpPage from "./components/admin_sign_up/AdminSignUpPage.tsx";
import MyPage from "./components/my_page/MyPage.tsx";
import NotFound from "./components/NotFound.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminSignUpPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
