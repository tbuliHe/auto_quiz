import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import LogoutIcon from '@mui/icons-material/Logout';
// 导入额外的图标
import QuizIcon from '@mui/icons-material/Quiz';
import AnalyticsIcon from '@mui/icons-material/Assessment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// 导入页面组件
import { HomePage } from './pages/Home';
import { QuizPage } from './pages/Quiz';
import { LoginPage } from './components/Login';
import { RegisterPage } from './components/Register';
import { UserAccountPage } from './components/UserAccount';
import { CourseSelectionPage } from './components/CourseSelection';
import { StudentGradesPage } from './components/StudentGrades';
import { Footer } from './components/Footer';
import { isAuthenticated, logout } from './services/authService';
import { SpecificSurveyPage } from './pages/SpecificSurvey';
import { QuizHistoryPage } from './pages/QuizHistory';
import { AnalyticsHistoryPage } from './pages/AnalyticsHistory';
import { SpecificAnalyticsPage } from './pages/SpecificAnalytics';
import { ExportToPDFPage } from './pages/Export';
// 创建受保护路由组件
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
      )
    }
  />
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export function Navigation() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, [location]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    handleClose();
    setDrawerOpen(false);
    history.push('/login');
  };

  const menuItems = [
    { text: '主页', icon: <HomeIcon />, path: '/' },
    { text: '测验历史', icon: <QuizIcon />, path: '/survey' },
    { text: '分析结果', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'PDF导出', icon: <PictureAsPdfIcon />, path: '/export' },
    { text: '个人信息', icon: <PersonIcon />, path: '/account', requireAuth: true },
    { text: '课程选择', icon: <SchoolIcon />, path: '/course-selection', requireAuth: true },
    { text: '成绩查询', icon: <GradeIcon />, path: '/grades', requireAuth: true },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item) => (
          (!item.requireAuth || (item.requireAuth && isAuthenticated())) && (
            <ListItem 
              button 
              key={item.text} 
              component={RouterLink} 
              to={item.path}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          )
        ))}
      </List>
      <Divider />
      {isAuthenticated() && (
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="登出" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Auto Quiz 智能测验
          </Typography>
          
          {!isMobile && (
            <>
              <Button color="inherit" component={RouterLink} to="/">
                主页
              </Button>
              <Button color="inherit" component={RouterLink} to="/survey">
                测验
              </Button>
              <Button color="inherit" component={RouterLink} to="/analytics">
                分析
              </Button>
              <Button color="inherit" component={RouterLink} to="/export">
                导出
              </Button>
              
              {isAuthenticated() ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/account">
                    个人信息
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/course-selection">
                    课程选择
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/grades">
                    成绩查询
                  </Button>
                  
                  <IconButton
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => { handleClose(); history.push('/account'); }}>个人信息</MenuItem>
                    <MenuItem onClick={handleLogout}>登出</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    登录
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
                    注册
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navigation />
          <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Switch>
              {/* 主页和认证相关路由 */}
              <Route exact path="/" component={HomePage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              
              {/* 测验相关路由 */}
              <Route path="/survey/:quizId" component={SpecificSurveyPage} />
              <Route path="/survey" component={QuizHistoryPage} />
              
              {/* 分析相关路由 */}
              <Route path="/analytics/:analysisId" component={SpecificAnalyticsPage} />
              <Route path="/analytics" component={AnalyticsHistoryPage} />
              
              {/* PDF导出路由 */}
              <Route path="/export" component={ExportToPDFPage} />
              
              {/* 重定向路由 */}
              <Route path="/quiz/:id" component={QuizPage} />
              
              {/* 受保护的用户路由 */}
              <PrivateRoute path="/account" component={UserAccountPage} />
              <PrivateRoute path="/course-selection" component={CourseSelectionPage} />
              <PrivateRoute path="/grades" component={StudentGradesPage} />
              
              {/* 404页面 */}
              <Route path="*">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                  <Typography variant="h4" gutterBottom>页面未找到</Typography>
                  <Button variant="contained" component={RouterLink} to="/">
                    返回首页
                  </Button>
                </Box>
              </Route>
            </Switch>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
