import { Component } from "react";
import { data, json } from "../data/analytics_data";
import { DataTables } from "survey-analytics/survey.analytics.datatables";
import { Model } from "survey-core";
import $ from "jquery";
import "datatables.net/js/jquery.dataTables";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-colreorder/js/dataTables.colReorder";
import "datatables.net-rowgroup/js/dataTables.rowGroup";
import "datatables.net-colreorder-dt/css/colReorder.dataTables.css";
import "survey-analytics/survey.analytics.datatables.css";

export default class SurveyAnalyticsDatatables extends Component {
  visPanel;
  componentDidMount() {
    DataTables.initJQuery($);
    const survey = new Model(json);
    this.visPanel = new DataTables(survey, data);
    this.visPanel.render(document.getElementById("summaryContainer"));
  }
  render() {
    return <div id="summaryContainer"></div>;
  }
}
