import { Routes, Route } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Instructions from './pages/Instructions'
import Assessment from './pages/Assessment'
import SummaryInterview from './pages/SummaryInterview'
import AdminMaster from './pages/AdminMaster'
import InvitePage from './pages/InvitePage'
import Completed from './pages/Completed'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/invite/:inviteLink" element={<InvitePage />} />
      <Route path="/invite/:inviteLink/instructions" element={<Instructions />} />
      <Route path="/invite/:inviteLink/assessment" element={<Assessment />} />
      <Route path="/invite/:inviteLink/summary-interview" element={<SummaryInterview />} />
      <Route path="/invite/:inviteLink/completed" element={<Completed />} />
      <Route path="/summary-interview" element={<SummaryInterview />} />
      <Route path="/admin-master" element={<AdminMaster />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
