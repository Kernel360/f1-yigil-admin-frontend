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
import PlacePage from "./components/place/PlacePage.tsx";
import ReportPage from "./components/report/ReportPage.tsx";
import StatusPage from "./components/status/StatusPage.tsx";
import RegionStatPage from "./components/stat/RegionStatPage.tsx";
import FavorStatPage from "./components/stat/FavorStatPage.tsx";

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
        <Route path="/place" element={<PlacePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/region-stat" element={<RegionStatPage />} />
        <Route path="/like-stat" element={<FavorStatPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
