import React, { useState, useEffect, useRef } from "react";
import moment from "moment";

import logo from "./assets/logo.svg";
import "./App.css";
import CoreServices from "./services/coreService";
import Autocomplete from "./components/autocomplete/Autocomplete";
import ColumnChart from "./components/charts/columnChart";

function App() {
  const [userList, setUserList] = useState([]);
  const [repoList, setRepoList] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [showList, setShowList] = useState(false);
  const [avgIssue, setAvgIssue] = useState("");
  const [avgPull, setAvgPull] = useState("");
  const [pullList, setPullList] = useState([]);
  const autocompleteElement = useRef();
  let colChartData = [
    { name: "Small", avg: 0, amt: 0 },
    { name: "Medium", avg: 0, amt: 0 },
    { name: "Large", avg: 0, amt: 0 },
  ];

  let smallPulls = [];
  let mediumPulls = [];
  let largePulls = [];

  useEffect(() => {
    setShowList(false);
    autocompleteElement.current.clear();

    const delayDebounceFn = setTimeout(() => {
      if (userInput.length > 0) {
        fetchUsers(userInput);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [userInput]);

  useEffect(() => {
    organizePulls();
    getPullAverage();
  }, [pullList]);

  const organizePulls = () => {
    pullList.forEach((pull) => {
      const size = pull.additions + pull.deletions;
      if (size <= 100) {
        smallPulls.push(pull);
      } else if (size <= 1000) {
        mediumPulls.push(pull);
      } else {
        largePulls.push(pull);
      }
    });
  };

  const getPullAverage = () => {
    if (smallPulls.length > 0) {
      let smallAverage = calcAverage(smallPulls);
      colChartData[0].avg = smallAverage;
      colChartData[0].amt = smallPulls.length;
    }

    if (mediumPulls.length > 0) {
      let mediumAverage = calcAverage(mediumPulls);
      colChartData[1].avg = mediumAverage;
      colChartData[1].amt = mediumPulls.length;
    }

    if (largePulls.length > 0) {
      let largeAverage = calcAverage(largePulls);
      colChartData[2].avg = largeAverage;
      colChartData[2].amt = largePulls.length;
    }
  };

  const calcAverage = (arr) => {
    let totalTime = 0;
    let average = 0;
    if (arr.length > 0) {
      arr.forEach((item) => {
        let created = moment(item.created_at);
        let merged = moment(item.merged_at);
        let difference = merged.diff(created);
        totalTime += difference;
      });
    }

    if (arr.length > 0) {
      average = (totalTime / arr.length).toFixed(2);
      average = (average / (1000 * 60 * 60)).toFixed(0);
    }

    return parseInt(average);
  };

  const fetchUsers = (query) => {
    CoreServices.getUsers(query)
      .then((res) => {
        if (res.data.items.length > 0) {
          setUserList(res.data.items);
          setShowList(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchRepos = (url) => {
    CoreServices.getRepos(url)
      .then((res) => {
        setRepoList(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchIssues = (name) => {
    CoreServices.getIssues(userInput, name)
      .then((res) => {
        handleIssues(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchPullRequests = (name, state) => {
    CoreServices.getPullRequests(userInput, name, state)
      .then((res) => {
        handlePullRequests(res.data, name);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchSinglePR = (name, number) => {
    CoreServices.getSinglePR(userInput, name, number)
      .then((res) => {
        if (res.data) {
          setPullList((pullList) => [...pullList, res.data]);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleIssues = (arrIssue) => {
    let totalTime = 0;
    let average = 0;

    arrIssue.forEach((issue) => {
      if (issue.created_at && issue.closed_at) {
        let created = moment(issue.created_at);
        let closed = moment(issue.closed_at);
        let difference = closed.diff(created);
        totalTime += difference;
      }
    });

    if (arrIssue.length > 0) {
      average = (totalTime / arrIssue.length).toFixed(2);
    }

    setAvgIssue(parseMilliseconds(average));
  };

  const handlePullRequests = (arrPulls, name) => {
    let totalTime = 0;
    let average = 0;

    arrPulls.forEach((pull) => {
      if (pull.merged_at && pull.created_at) {
        let created = moment(pull.created_at);
        let merged = moment(pull.merged_at);
        let difference = merged.diff(created);
        totalTime += difference;
        fetchSinglePR(name, pull.number);
      }
    });

    if (arrPulls.length) {
      average = (totalTime / arrPulls.length).toFixed(2);
    }

    setAvgPull(parseMilliseconds(average));
  };

  const handleRepo = (data) => {
    fetchIssues(data.name);
    fetchPullRequests(data.name, "closed");
  };

  const onClick = (user) => {
    setUserInput(user.login);
    setShowList(false);
    fetchRepos(user.repos_url);
  };

  const parseMilliseconds = (milliseconds) => {

    let numberOfHours = (milliseconds / (1000 * 60 * 60)).toFixed(1);
    let days = Math.floor(numberOfHours / 24);
    let remainder = numberOfHours % 24;
    let hours = Math.floor(remainder);
    let minutes = Math.floor(60 * (remainder - hours));

    return days > 1
      ? `${days}days ${hours}h${minutes}m`
      : `${days}day ${hours}h${minutes}m`;
  };

  const renderList = () => {
    if (showList && userList) {
      if (userList.length) {
        return (
          <ul className="suggestions">
            {userList.map((user, index) => {
              let className;
              return (
                <li
                  className={className}
                  key={user.login}
                  onClick={() => onClick(user)}
                >
                  {user.login}
                </li>
              );
            })}
          </ul>
        );
      } else {
        return (
          <div className="no-suggestions">
            <em>No suggestions, you're on your own!</em>
          </div>
        );
      }
    }
  };

  return (
    <div className="App d-flex">
      <div className="sidebar d-flex col-1">
        <img src={logo} className="logo" alt="logo" />
      </div>

      <div className="container-fluid">
        <div className="row header d-flex">
          <input
            className="user-input"
            spellCheck="false"
            type="text"
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
            placeholder="Type to search"
          />
          {renderList()}
          <Autocomplete
            suggestions={repoList}
            onSelectRepo={handleRepo}
            ref={autocompleteElement}
          />
        </div>

        <div className="row content d-flex">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                Average Merge Time by Pull Request Size
              </div>
              <div className="card-body chart-card">
                <ColumnChart dataModel={colChartData} />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card">
              <div className="card-header">Average Pull Request Merge Time</div>
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-center">
                  {avgPull}
                </h5>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card">
              <div className="card-header">Average Issue Close Time</div>
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-center">
                  {avgIssue}
                </h5>
              </div>
            </div>
          </div>

          {/* <div className="col-12">
            <div className="card">
              <div className="card-header">Month Summary</div>
              <div className="card-body chart-card"></div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default App;
