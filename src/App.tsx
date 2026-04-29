import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LinkInputPage from '@/pages/LinkInputPage'
import ConfirmCategoryPage from '@/pages/ConfirmCategoryPage'
import BodyInfoPage from '@/pages/BodyInfoPage'
import ImageSourcePage from '@/pages/ImageSourcePage'
import PreviewPage from '@/pages/PreviewPage'
import SavedPreviewsPage from '@/pages/SavedPreviewsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LinkInputPage />} />
        <Route path="/category" element={<ConfirmCategoryPage />} />
        <Route path="/body" element={<BodyInfoPage />} />
        <Route path="/image-source" element={<ImageSourcePage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/saved" element={<SavedPreviewsPage />} />
      </Routes>
    </Router>
  )
}

export default App
