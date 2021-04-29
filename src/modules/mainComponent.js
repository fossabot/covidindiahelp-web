import React from "react";
// import { Route, Switch } from "react-router-dom";

// Import material modules
import {
    Container
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Navbar from "../common/components/Navbar";
import { Coloumn } from ".";
import MobileView from '../modules/mobile-view/select-states'

const useStyles = makeStyles({
    root: {
        marginLeft: 0,
        marginRight: 0,
        position:"relative"
    },
    navbar: {
        backgroundColor: '#333333',
        Select: {
            '&:before': {
                borderColor: 'white',
            },
            '&:after': {
                borderColor: 'white',
            }
        }
    },
    mx10: {
        marginLeft: 10,
        marginRight: 10
    },
    dropdown:{
     '.& MuiSelect-outlined.MuiSelect-outlined':{     
     paddingRight: '82px'
     }
    },
  });

  
function Main() {
    const classes = useStyles();

    return (

        <div disableGutters={true} style={{width:"100% !important"}} className={classes.root}>
            {/* <Navbar classes={classes} /> */}
            <Coloumn className="desktop-view" />
            <MobileView className="mobile-view"></MobileView>
        </div>
    );
}

export default Main;
