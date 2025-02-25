import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import "./App.css";
import { HomePage } from "./pages/Home";
import { CreatorPage } from "./pages/Creator";
import { SurveyPage } from "./pages/Survey";
import { ExportToPDFPage } from "./pages/Export";
import { AnalyticsPage } from "./pages/Analytics";
import { AnalyticsTabulatorPage } from "./pages/AnalyticsTabulator";
import SurveyAnalyticsDatatables from './components/SurveyAnalyticsDatatables';

import "bootstrap/dist/css/bootstrap.css";

export { MyQuestion } from "./components/MyQuestion";

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="/">
                SurveyJS + React
              </a>
            </div>
            <ul className="nav navbar-nav">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/survey">Survey</Link>
              </li>
              <li>
                <Link to="/creator">Survey Creator</Link>
              </li>
              <li>
                <Link to="/export">PDF Export</Link>
              </li>
              <li>
                <Link to="/analytics">Analytics</Link>
              </li>
              <li>
                <Link to="/analyticstabulator">Results Table</Link>
              </li>
              <li>
                <Link to="/analyticsdatatables">
                  Results Table (IE Support)
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="app-content">
          <Switch>
            <Route path="/survey" component={SurveyPage} />
            <Route path="/creator" component={CreatorPage} />
            <Route path="/export" component={ExportToPDFPage} />
            <Route path="/analytics" component={AnalyticsPage} />
            <Route path="/analyticsdatatables" component={SurveyAnalyticsDatatables} />
            <Route path="/analyticstabulator" component={AnalyticsTabulatorPage} />
            <Route path="/" component={HomePage} />
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
