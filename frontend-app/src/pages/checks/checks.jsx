import React, { Component } from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import styles from './checks.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import { Typography } from "@material-ui/core";
import { connect } from 'react-redux';
import { setElectionId } from "../../store/actions/election";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";


class checks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
    };
    this.backend = RequestResolver.getBackend();
  }
  async componentDidMount() {
    const { id } = this.props.location.aboutProps;
    this.props.onElection(id);
    try {
      const result = await this.backend().get(`election/${id}/check/list/`);
      console.log(result.data);
      this.setState({
        data: result.data,
        isLoaded: true,
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { name } = this.props.location.aboutProps;
    const { classes } = this.props;
    const { isLoaded, data } = this.state;

    return (
      isLoaded &&
      <div>
        <div className={classes.headerText}>
          <Typography component="h1" variant="h5">
            Список для проверки: {name}
          </Typography>
        </div>
        <Paper className={classes.root}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Id голос</TableCell>
                <TableCell align="center">Проверочная информация</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row" align="center">
                    {row.v.id}
                  </TableCell>
                  <TableCell component="th" scope="row" align="center">
                    {row.check_info_crypted}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  onElection: id => dispatch(setElectionId(id)),
});

const mapStateToProps = state => ({
  id: state.election.id,
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(checks));