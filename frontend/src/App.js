import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SchoolIcon from '@mui/icons-material/School';

import "./App.css";
import { HomePage } from "./pages/Home";
import { CreatorPage } from "./pages/Creator";
import { SurveyPage } from "./pages/Survey";
import { ExportToPDFPage } from "./pages/Export";
import { AnalyticsPage } from "./pages/Analytics";

// 导入字体
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export { MyQuestion } from "./components/MyQuestion";

// 定义应用主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
      marginBottom: '0.75rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      marginBottom: '0.5rem',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <div>
          <AppBar position="static" color="primary">
            <Toolbar>
              <SchoolIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Auto Quiz Generator
              </Typography>
              <Button color="inherit" component={Link} to="/">首页</Button>
              <Button color="inherit" component={Link} to="/survey">测验</Button>
              <Button color="inherit" component={Link} to="/export">导出PDF</Button>
              <Button color="inherit" component={Link} to="/analytics">分析</Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ py: 2 }}>
              <Switch>
                <Route path="/survey" component={SurveyPage} />
                <Route path="/export" component={ExportToPDFPage} />
                <Route path="/analytics" component={AnalyticsPage} />
                <Route path="/" component={HomePage} />
              </Switch>
            </Box>
          </Container>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
