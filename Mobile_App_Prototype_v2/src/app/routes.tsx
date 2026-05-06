import { createBrowserRouter } from "react-router";
import SplashScreen from "./components/SplashScreen";
import MainMenu from "./components/MainMenu";
import BluetoothPairing from "./components/BluetoothPairing";
import GameSelection from "./components/GameSelection";
import DiceGame from "./components/DiceGame";
import ObstacleGame from "./components/ObstacleGame";
import PuzzleGame from "./components/PuzzleGame";
import GuidedBreathing from "./components/GuidedBreathing";
import RewardScreen from "./components/RewardScreen";
import ProfilePage from "./components/ProfilePage";
import TherapistDashboard from "./components/TherapistDashboard";
import ParentSettings from "./components/ParentSettings";
import SupervisorGuard from "./components/SupervisorGuard";

export const router = createBrowserRouter([
  { path: "/", element: <SplashScreen /> },
  { path: "/menu", element: <MainMenu /> },
  { path: "/bluetooth", element: <BluetoothPairing /> },
  { path: "/games", element: <GameSelection /> },
  { path: "/game/dice", element: <DiceGame /> },
  { path: "/game/obstacle", element: <ObstacleGame /> },
  { path: "/game/puzzle", element: <PuzzleGame /> },
  { path: "/breathing", element: <GuidedBreathing /> },
  { path: "/reward", element: <RewardScreen /> },
  { path: "/profile", element: <ProfilePage /> },
  // Supervisor-only routes
  {
    path: "/therapist",
    element: <SupervisorGuard><TherapistDashboard /></SupervisorGuard>,
  },
  {
    path: "/settings",
    element: <SupervisorGuard><ParentSettings /></SupervisorGuard>,
  },
]);
