import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from './electionsTable.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import {NavLink} from "react-router-dom";

function createData(name) {
  return { name };
}

const rows = [
  createData('Импичмент трампу'),
  createData('Голосование студсовета'),
  createData('Смена власти'),
  createData('Избрание мэра'),
  createData('Референдум'),
];

class electionsTable extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Название голосования</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  <NavLink to={{
                    pathname: '/electionPage',
                    aboutProps: {
                      name: row.name,
                    }
                  }}>
                    {row.name}
                  </NavLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    )
  }
}

export default withStyles(styles)(electionsTable);

