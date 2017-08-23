import React, { Component } from "react";
import "./App.css";
import TableContainer from "./TableContainer";
import Options from "./Options";

class App extends Component {
  constructor() {
    super();

    this.state = {
      currencies: [],
      currentDate: new Date().toISOString().split("T")[0],
      historicalOptions: ["Current", "Historical"],
      tableData: [{}],
      currentBase: "EUR",
      currentHistorical: "Current"
    };
  }

  componentDidMount() {
    this.getExchangeRates();
  }

  getExchangeRates = (base = this.state.currentBase) => {
    if (this.state.currentHistorical === "Current") {
      fetch(`http://api.fixer.io/latest?base=${base}`, { method: "GET" })
        .then(response => {
          return response.json();
        })
        .then(json => {
          this.setState({
            tableData: [json],
            currencies: Object.keys(json.rates),
            currentBase: base
          });
        });
    } else {
      this.getHistoricalRates(base);
    }
  };

  getHistoricalRates = (
    base = this.state.currentBase,
    date = this.state.currentDate
  ) => {
    let newTableData = [];
    const halfDate = date.slice(4);
    const years = Array(3)
      .fill(0)
      .map((_, i) => (Number(date.slice(0, 4)) - i).toString());

    const promises = years.map(year =>
      fetch(`http://api.fixer.io/${year}${halfDate}?base=${base}`, {
        method: "GET"
      }).then(r => r.json())
    );
    Promise.all(promises).then(results => {
      this.setState({
        tableData: results,
        currencies: Object.keys(results[0].rates)
      });
    });
  };

  onBaseChange = e => {
    const target = e.target;
    this.getExchangeRates(target.value);
  };

  onHistoricalChange = e => {
    const target = e.target;
    this.setState(
      {
        currentHistorical: target.value
      },
      () => this.getExchangeRates()
    );
  };

  render() {
    const {
      currentHistorical,
      tableData,
      currencies,
      historicalOptions
    } = this.state;

    currencies.unshift("Select Currency");

    return (
      <div className="App container">
        <div className="App-header">
          <h2>Welcome to Our Currency Converter</h2>
        </div>
        <Options dataOptions={currencies} handler={this.onBaseChange} />
        <Options
          dataOptions={historicalOptions}
          handler={this.onHistoricalChange}
        />
        <TableContainer tableData={tableData} />
      </div>
    );
  }
}

export default App;
