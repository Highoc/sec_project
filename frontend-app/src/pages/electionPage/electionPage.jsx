import React, { Component } from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import styles from './electionsPage.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import { Typography } from "@material-ui/core";
import { connect } from 'react-redux';
import { setElectionId } from "../../store/actions/election";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";


class electionPage extends Component {
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
      const result = await this.backend().get(`election/${id}/vote/`);
      console.log(result.data);
      this.setState({
        data: result.data,
        isLoaded: true,
      });
    } catch (error) {
      this.setState({ isLoaded: false });
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
            Список проголосовавших: {name}
          </Typography>
        </div>
        <Paper className={classes.root}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Кандидат</TableCell>
                <TableCell align="center">Id голоса</TableCell>
                <TableCell align="center">Подписанный кандидат</TableCell>
                <TableCell align="center">Проверочный ключ</TableCell>
                <TableCell align="center">Приватный ключ проголосовавшего</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.candidate}>
                  <TableCell component="th" scope="row" align="center">
                    {row.candidate}
                  </TableCell>
                  <TableCell component="th" scope="row" align="center">
                    {row.id}
                  </TableCell>
                  <TableCell component="th" scope="row" align="center">
                      {row.candidate_crypted}
                  </TableCell>
                  <TableCell component="th" scope="row" align="center">
                      {row.check_public_key}
                  </TableCell>
                  <TableCell component="th" scope="row" align="center">
                      {row.vote_private_key}
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

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(electionPage));