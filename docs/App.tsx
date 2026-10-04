import { TooltipProvider } from '../src/index.js'
import { Showcase } from './Showcase.js'

export function App() {
  return (
    <TooltipProvider>
      <a className="skip-link" href="#main">Skip to components</a>
      <header className="topbar shell">
        <span className="wordmark">form<span>.</span></span>
        <span className="page-label">Home design system / 0.1.0</span>
      </header>
      <main id="main" className="page shell" tabIndex={-1}>
        <Showcase />
      </main>
      <footer className="footer shell">
        <p>Reusable React components. Local-only specimens.</p>
        <a href="https://github.com/giulioungaretti/home-design-system">
          Source and usage documentation
        </a>
      </footer>
    </TooltipProvider>
  )
}
