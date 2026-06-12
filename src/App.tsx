import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import { AppShell } from "@/components/app/AppShell"
import { I18nProvider } from "@/i18n/I18nProvider"
import Dashboard from "@/pages/Dashboard"
import CmcCoverage from "@/pages/CmcCoverage"
import GuidedJourney from "@/pages/GuidedJourney"
import Hypotheses from "@/pages/Hypotheses"
import HypothesisDetail from "@/pages/HypothesisDetail"
import Landing from "@/pages/Landing"
import MarketMemory from "@/pages/MarketMemory"
import MarketReplay from "@/pages/MarketReplay"
import Research from "@/pages/Research"
import ResearchReportShare from "@/pages/ResearchReportShare"
import Settings from "@/pages/Settings"
import StrategyLab from "@/pages/StrategyLab"
import SystemHealth from "@/pages/SystemHealth"

export default function App() {
  return (
    <I18nProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/journey" element={<GuidedJourney />} />
          <Route path="/research/reports/:id" element={<ResearchReportShare />} />

          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hypotheses" element={<Hypotheses />} />
            <Route path="/hypotheses/:id" element={<HypothesisDetail />} />
            <Route path="/market-memory" element={<MarketMemory />} />
            <Route path="/market-replay" element={<MarketReplay />} />
            <Route path="/strategy-lab" element={<StrategyLab />} />
            <Route path="/research" element={<Research />} />
            <Route path="/cmc-coverage" element={<CmcCoverage />} />
            <Route path="/system-health" element={<SystemHealth />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </I18nProvider>
  )
}
