import { Model } from "survey-core";
import { SurveyPDF } from "survey-pdf";

import { json } from "../data/survey_json.js";

function savePDF(model) {
  const surveyPDF = new SurveyPDF(json);
  surveyPDF.data = model.data;
  surveyPDF.save();
};

export function ExportToPDFPage() {
  const model = new Model(json);
  return (
    <div className="container">
      <h1>导出测试数据</h1>
      <div className="jumbotron">
        <p>利用SurveyJS PDF提供的服务导出生成的quiz</p>
        <p>NOTE: Dynamic elements and characteristics (visibility, validation, navigation buttons) are not supported.</p>
        <button onClick={() => savePDF(model)}>保存为PDF</button>
      </div>
    </div>
  );
}
