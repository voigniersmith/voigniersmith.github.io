import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

// Material UI Stuff
// import Appbar from './components/appbar';
import MyCard from './components/myCard';
import Tabs from './components/tabs';
import {  Grid, Paper } from '@material-ui/core';
// Theme Stuff
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createTheme from "@material-ui/core/styles/createTheme";
import themeFile from "./components/theme";
import "./App.css";

const theme = createTheme(themeFile);

export default function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
          <Switch>
            <Route path="/">
              <br></br>
              <br></br>
              <Grid container justify="center" spacing={4}>
                <Grid item>
                  <MyCard />
                </Grid>

                <Grid item>
                  <Paper>
                    <Tabs/>
                  </Paper>
                </Grid>
              </Grid>
            </Route>
          </Switch>
        </Router>
      </MuiThemeProvider>
  );
}
