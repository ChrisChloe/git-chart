import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Average Time ${payload[0].payload.avg}h`}</p>
        <p className="label">{`Pull Requests ${payload[0].payload.amt}`}</p>
      </div>
    );
  }

  return null;
};

export default class Chart extends Component {

  static propTypes = {
    dataModel: PropTypes.instanceOf(Array)
  };

  static defaultProps = {
    dataModel: []
  };

  state = {
    list: [...this.props.dataModel]
  };

  render() {
    const { list } = this.state;
    return (
      <ResponsiveContainer>
        <BarChart
          data={list}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          {/* <Legend /> */}
          <Bar dataKey="avg" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
