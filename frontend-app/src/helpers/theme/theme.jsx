import { createMuiTheme } from '@material-ui/core';

const theme = createMuiTheme({
  overrides: {
    MuiTableHead: {
      root: {
        backgroundImage: 'linear-gradient(to bottom, rgb(255, 255, 255), rgb(214, 219, 247), rgb(173, 183, 240), rgb(132, 147, 232), rgb(91, 111, 225), rgb(50, 75, 217), rgb(81, 63, 181), rgb(112, 50, 145), rgb(143, 38, 109), rgb(173, 25, 72), rgb(204, 13, 36), rgb(235, 0, 0))',
      }
    },
    MuiTableCell: {
      head: {
        color: '#F0E68C',
        fontSize: 20,
      },
      root: {
        wordWrap: "break-word",
        maxWidth: '300px',
      }
    }
  }
});

export default theme;