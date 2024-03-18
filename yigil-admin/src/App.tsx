import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage.tsx";
//import "./App.css";
import LoginPage from "./components/login/LoginPage.tsx";
import AdminSignUpPage from "./components/admin_sign_up/AdminSignUpPage.tsx";
import MyPage from "./components/my_page/MyPage.tsx";
import NotFound from "./components/NotFound.tsx";
import NoticePage from "./components/notice/NoticePage.tsx";
import MemberPage from "./components/member/MemberPage.tsx";
import PostPage from "./components/post/PostPage.tsx";
import TestPage from "./components/test.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminSignUpPage />} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/member" element={<MemberPage />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
