// 宣告中文使用的 Google Fonts 字型。
const chineseFontFamily = "Chocolate Classical Sans";

// 宣告英文與數字使用的 Google Fonts 字型。
const englishFontFamily = "Bitcount Ink";

// 設定 Google 試算表發布後的 CSV 網址。
const googleSheetCsvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vREZsCwCPFGB0s9VfSMdzI7CVz6C6gipcx5oLLhZpe1HbF8Bdyw9NcA8GWvvuf2vEs1sHNnjDFl1w8_/pub?gid=646970280&single=true&output=csv";
// 宣告選項按鈕背景顏色。
const optionColor = "#073b4c";

// 宣告正確答案背景顏色。
const correctColor = "#2baa8b";

// 宣告錯誤選項背景顏色。
const wrongColor = "#f94144";

// 宣告畫布背景顏色。
const backgroundColor = "#f7f9fc";

// 宣告輔助文字顏色。
const secondaryTextColor = "#52606d";

// 宣告提示文字顏色。
const hintTextColor = "#7b8794";

// 宣告選項文字顏色。
const optionTextColor = "#ffffff";

// 宣告目前畫面狀態。
let screen = "home";

// 宣告每次測驗抽出的題目數量。
const quizLength = 5;

// 宣告畫布設計寬度。
const designWidth = 900;

// 宣告畫布設計高度。
const designHeight = 650;

// 宣告 Google 試算表資料。
let questionTable = null;

// 宣告轉換後的題庫。
let questionBank = [];

// 宣告題庫是否載入完成。
let questionsLoaded = false;

// 宣告題庫錯誤訊息。
let questionLoadError = "";

// 宣告目前測驗題目。
let quizQuestions = [];

// 宣告目前題目索引。
let currentQuestion = 0;

// 宣告答對題數。
let correctCount = 0;

// 宣告使用者選擇的選項索引。
let selectedOption = -1;

// 宣告目前題目是否已作答。
let answered = false;

// 宣告錯誤選項開始晃動的時間。
let shakeStartTime = 0;

// 宣告目前瀏覽的題庫題目索引。
let bankQuestionIndex = 0;

// 宣告彩帶陣列。
let confetti = [];

// 宣告彩帶數量。
const confettiAmount = 90;

// 宣告彩帶顏色。
const confettiColors = [
  "#ef476f",
  "#ffd166",
  "#06d6a0",
  "#118ab2",
  "#8338ec",
  "#fb5607"
];

// 在 p5.js 啟動前讀取 Google 試算表。
function preload() {
  // 使用 loadTable 直接讀取 Google 試算表 CSV。
  questionTable = loadTable(
    googleSheetCsvUrl,
    "csv",
    "header"
  );
}

// 建立 p5.js 畫布。
function setup() {
  // 建立符合視窗大小的畫布。
  createCanvas(windowWidth, windowHeight);

  // 設定文字水平與垂直置中。
  textAlign(CENTER, CENTER);

  // 設定矩形以中心點定位。
  rectMode(CENTER);

  // 降低高解析度裝置的效能負擔。
  pixelDensity(1);

  // 設定網頁預設字型。
  document.body.style.fontFamily =
    `"${chineseFontFamily}", sans-serif`;

  // 設定滑鼠游標。
  cursor(ARROW);

  // 確認 Google 試算表資料是否成功載入。
  if (questionTable) {
    // 將表格資料轉換成題庫陣列。
    questionBank = convertTableToQuestionBank(questionTable);

    // 確認題庫至少有五題。
    if (questionBank.length >= quizLength) {
      // 設定題庫載入成功。
      questionsLoaded = true;

      // 清除錯誤訊息。
      questionLoadError = "";
    } else {
      // 設定題庫題數不足錯誤。
      questionLoadError = "Google 試算表題庫至少需要 5 題。";
    }
  } else {
    // 設定資料載入錯誤。
    questionLoadError = "Google 試算表載入失敗。";
  }
}

// 每一幀重新繪製畫面。
function draw() {
  // 清除畫面並填入背景色。
  background(backgroundColor);

  // 計算內容等比例縮放值。
  const scaleValue = min(width / designWidth, height / designHeight);

  // 計算縮放後內容寬度。
  const scaledWidth = designWidth * scaleValue;

  // 計算縮放後內容高度。
  const scaledHeight = designHeight * scaleValue;

  // 計算水平偏移量。
  const offsetX = (width - scaledWidth) / 2;

  // 計算垂直偏移量。
  const offsetY = (height - scaledHeight) / 2;

  // 儲存目前繪圖狀態。
  push();

  // 將內容移動至中央。
  translate(offsetX, offsetY);

  // 依照視窗大小縮放內容。
  scale(scaleValue);

  // 根據目前畫面狀態繪製內容。
  if (screen === "home") {
    // 繪製首頁。
    drawHome();
  } else if (screen === "quiz") {
    // 繪製測驗頁面。
    drawQuiz();
  } else if (screen === "bank") {
    // 繪製題庫頁面。
    drawQuestionBank();
  } else {
    // 繪製結果頁面。
    drawResult();
  }

  // 還原繪圖狀態。
  pop();

  // 繪製彩帶。
  drawConfetti();
}

// 將 Google 試算表轉換成題庫陣列。
function convertTableToQuestionBank(tableData) {
  // 建立空的題庫陣列。
  const convertedQuestions = [];

  // 逐列讀取試算表資料。
  for (let index = 0; index < tableData.getRowCount(); index++) {
    // 取得目前資料列。
    const row = tableData.getRow(index);

    // 取得題目。
    const question = row.getString("question").trim();

    // 取得四個選項。
    const options = [
      row.getString("option1").trim(),
      row.getString("option2").trim(),
      row.getString("option3").trim(),
      row.getString("option4").trim()
    ];

    // 將 answer 的 1 到 4 轉成程式的 0 到 3。
    const answer = Number(row.getString("answer").trim()) - 1;

    // 檢查資料格式。
    if (
      question !== "" &&
      options.every((option) => option !== "") &&
      answer >= 0 &&
      answer <= 3
    ) {
      // 將有效題目加入題庫。
      convertedQuestions.push({
        question: question,
        options: options,
        answer: answer
      });
    }
  }

  // 回傳題庫。
  return convertedQuestions;
}

// 設定中文文字樣式。
function setChineseTextStyle(size, colorValue) {
  // 設定中文字型。
  textFont(chineseFontFamily);

  // 設定文字大小。
  textSize(size);

  // 設定文字顏色。
  fill(colorValue);
}

// 設定英文與數字文字樣式。
function setEnglishTextStyle(size, colorValue) {
  // 設定英文字型。
  textFont(englishFontFamily);

  // 設定文字大小。
  textSize(size);

  // 設定文字顏色。
  fill(colorValue);
}

// 繪製首頁。
function drawHome() {
  // 使用英文與數字字型顯示標題。
  setEnglishTextStyle(58, optionColor);

  // 顯示英文標題。
  text("Math Quiz", designWidth / 2, 115);

  // 使用中文顯示副標題。
  setChineseTextStyle(25, secondaryTextColor);

  // 顯示測驗名稱。
  text("國小簡易數學選擇題測驗", designWidth / 2, 175);

  // 顯示題庫數量。
  setChineseTextStyle(21, secondaryTextColor);

  // 顯示目前題庫數量。
  text(
    `Google 試算表題庫共 ${questionBank.length} 題，每次隨機抽出 5 題`,
    designWidth / 2,
    220
  );

  // 判斷題庫是否載入失敗。
  if (questionLoadError !== "") {
    // 使用紅色顯示錯誤訊息。
    setChineseTextStyle(19, wrongColor);

    // 顯示錯誤。
    text(questionLoadError, designWidth / 2, 270);
  } else {
    // 取得上次成績。
    const lastScore = getLastScore();

    // 判斷是否有上次成績。
    if (lastScore === null) {
      // 顯示尚無成績。
      setChineseTextStyle(24, optionColor);

      // 顯示成績紀錄。
      text("上次成績：尚無測驗紀錄", designWidth / 2, 270);
    } else {
      // 使用英文與數字顯示上次成績。
      setEnglishTextStyle(24, optionColor);

      // 顯示成績。
      text(`Last Score: ${lastScore} / ${quizLength}`, designWidth / 2, 270);
    }
  }

  // 繪製開始測驗按鈕。
  drawButton("開始測驗", designWidth / 2, 385, 280, 68, optionColor, 24);

  // 繪製題庫按鈕。
  drawButton("查看題庫", designWidth / 2, 480, 280, 68, optionColor, 24);

  // 顯示操作提示。
  setChineseTextStyle(18, hintTextColor);

  // 顯示操作說明。
  text("老師修改 Google 試算表後，重新整理即可更新題目", designWidth / 2, 570);
}

// 繪製題庫頁面。
function drawQuestionBank() {
  // 取得目前瀏覽的題目。
  const current = questionBank[bankQuestionIndex];

  // 繪製返回首頁按鈕。
  drawButton("返回首頁", 100, 45, 150, 44, optionColor, 18);

  // 顯示題庫標題。
  setChineseTextStyle(38, optionColor);

  // 顯示標題文字。
  text("題庫與解答", designWidth / 2, 65);

  // 顯示題目編號。
  setEnglishTextStyle(21, secondaryTextColor);

  // 顯示目前題號。
  text(
    `Question ${bankQuestionIndex + 1} / ${questionBank.length}`,
    designWidth / 2,
    125
  );

  // 顯示題目。
  setChineseTextStyle(28, optionColor);

  // 顯示題目文字。
  text(current.question, designWidth / 2, 185);

  // 設定選項起始位置。
  const startY = 275;

  // 設定選項垂直間距。
  const gapY = 65;

  // 逐一顯示選項。
  for (let index = 0; index < current.options.length; index++) {
    // 判斷是否為正確答案。
    const isAnswer = index === current.answer;

    // 正確答案使用綠色，其餘使用深藍色。
    const choiceColor = isAnswer ? correctColor : optionColor;

    // 組合選項文字。
    const choiceText = `${index + 1}. ${current.options[index]}`;

    // 繪製選項。
    drawButton(
      choiceText,
      designWidth / 2,
      startY + index * gapY,
      520,
      48,
      choiceColor,
      21,
      optionTextColor
    );
  }

  // 顯示正確答案。
  setChineseTextStyle(21, correctColor);

  // 顯示答案文字。
  text(
    `正確答案：${current.options[current.answer]}`,
    designWidth / 2,
    545
  );

  // 繪製上一題按鈕。
  drawButton("上一題", 260, 605, 190, 48, optionColor, 20);

  // 繪製下一題按鈕。
  drawButton("下一題", 640, 605, 190, 48, optionColor, 20);
}

// 繪製測驗頁面。
function drawQuiz() {
  // 取得目前題目。
  const current = quizQuestions[currentQuestion];

  // 顯示題目進度。
  setEnglishTextStyle(22, secondaryTextColor);

  // 顯示進度文字。
  text(`Question ${currentQuestion + 1} / ${quizLength}`, designWidth / 2, 45);

  // 繪製返回首頁按鈕。
  drawButton("返回首頁", 100, 45, 150, 44, optionColor, 18);

  // 顯示題目。
  setChineseTextStyle(30, optionColor);

  // 顯示題目文字。
  text(current.question, designWidth / 2, 115);

  // 設定選項起始位置。
  const startY = 215;

  // 設定選項垂直間距。
  const gapY = 75;

  // 逐一繪製選項。
  for (let index = 0; index < current.options.length; index++) {
    // 計算選項位置。
    const optionY = startY + index * gapY;

    // 宣告水平晃動距離。
    let shakeOffset = 0;

    // 判斷是否為答錯選項。
    if (answered && index === selectedOption && index !== current.answer) {
      // 計算晃動時間。
      const elapsed = millis() - shakeStartTime;

      // 判斷是否仍在晃動。
      if (elapsed < 500) {
        // 產生左右晃動。
        shakeOffset = sin(elapsed * 0.08) * 12;
      }
    }

    // 設定預設選項顏色。
    let currentColor = optionColor;

    // 判斷是否為正確答案。
    if (answered && index === current.answer) {
      // 設定為綠色。
      currentColor = correctColor;
    }

    // 判斷是否為錯誤選項。
    if (answered && index === selectedOption && index !== current.answer) {
      // 設定為紅色。
      currentColor = wrongColor;
    }

    // 取得響應式按鈕寬度。
    const buttonWidth = getResponsiveButtonWidth();

    // 繪製選項按鈕。
    drawButton(
      current.options[index],
      designWidth / 2 + shakeOffset,
      optionY,
      buttonWidth,
      58,
      currentColor,
      getResponsiveOptionTextSize(),
      optionTextColor
    );

    // 顯示正確答案提示。
    if (answered && index === current.answer && selectedOption !== current.answer) {
      // 使用綠色顯示提示。
      setChineseTextStyle(16, correctColor);

      // 顯示提示文字。
      text(
        "正確答案",
        designWidth / 2 + buttonWidth / 2 + 72,
        optionY
      );
    }
  }

  // 取得下一題按鈕寬度。
  const nextButtonWidth = getResponsiveNextButtonWidth();

  // 判斷是否已作答。
  if (answered) {
    // 決定按鈕文字。
    const nextLabel =
      currentQuestion === quizLength - 1 ? "查看結果" : "下一題";

    // 繪製下一題按鈕。
    drawButton(
      nextLabel,
      designWidth / 2,
      575,
      nextButtonWidth,
      55,
      optionColor,
      getResponsiveButtonTextSize()
    );
  } else {
    // 顯示作答提示。
    setChineseTextStyle(18, hintTextColor);

    // 顯示提示。
    text("請點擊一個選項作答", designWidth / 2, 575);
  }
}

// 繪製結果頁面。
function drawResult() {
  // 顯示結果標題。
  setChineseTextStyle(52, optionColor);

  // 顯示測驗完成。
  text("測驗完成！", designWidth / 2, 150);

  // 繪製返回首頁按鈕。
  drawButton("返回首頁", 100, 45, 150, 44, optionColor, 18);

  // 顯示成績標題。
  setChineseTextStyle(28, secondaryTextColor);

  // 顯示你的成績。
  text("你的成績", designWidth / 2, 235);

  // 使用英文與數字顯示分數。
  setEnglishTextStyle(38, optionColor);

  // 顯示分數。
  text(`${correctCount} / ${quizLength}`, designWidth / 2, 290);

  // 顯示鼓勵文字。
  if (correctCount === quizLength) {
    // 使用中文顯示滿分訊息。
    setChineseTextStyle(25, secondaryTextColor);

    // 顯示鼓勵文字。
    text("太棒了！全部答對！", designWidth / 2, 350);
  } else if (correctCount >= 3) {
    // 使用中文顯示中高分訊息。
    setChineseTextStyle(25, secondaryTextColor);

    // 顯示鼓勵文字。
    text("做得很好，繼續加油！", designWidth / 2, 350);
  } else {
    // 使用中文顯示練習訊息。
    setChineseTextStyle(25, secondaryTextColor);

    // 顯示鼓勵文字。
    text("再多練習幾次，你一定會進步！", designWidth / 2, 350);
  }

  // 取得重新測驗按鈕寬度。
  const restartButtonWidth = getResponsiveRestartButtonWidth();

  // 繪製重新測驗按鈕。
  drawButton(
    "重新測驗",
    designWidth / 2,
    455,
    restartButtonWidth,
    75,
    optionColor,
    getResponsiveButtonTextSize()
  );
}

// 繪製通用按鈕。
function drawButton(
  label,
  x,
  y,
  buttonWidth,
  buttonHeight,
  buttonFill,
  buttonTextSize = 24,
  buttonTextColor = "#ffffff"
) {
  // 判斷滑鼠是否位於按鈕範圍。
  const hovering = isInsideButton(x, y, buttonWidth, buttonHeight);

  // 設定按鈕陰影。
  drawingContext.shadowColor = "rgba(7, 59, 76, 0.22)";

  // 設定陰影模糊程度。
  drawingContext.shadowBlur = hovering ? 15 : 8;

  // 設定陰影垂直位移。
  drawingContext.shadowOffsetY = 4;

  // 設定按鈕背景色。
  fill(buttonFill);

  // 移除按鈕外框。
  noStroke();

  // 繪製圓角按鈕。
  rect(x, y, buttonWidth, buttonHeight, 14);

  // 清除陰影。
  drawingContext.shadowColor = "transparent";

  // 判斷文字是否為中文。
  if (containsChinese(label)) {
    // 中文使用 Chocolate Classical Sans。
    textFont(chineseFontFamily);
  } else {
    // 英文與數字使用 Bitcount Ink。
    textFont(englishFontFamily);
  }

  // 設定文字大小。
  textSize(buttonTextSize);

  // 設定文字顏色。
  fill(buttonTextColor);

  // 顯示按鈕文字。
  text(label, x, y);
}

// 判斷文字是否包含中文。
function containsChinese(value) {
  // 使用 Unicode 範圍判斷中文。
  return /[\u3400-\u9FFF]/.test(value);
}

// 取得響應式選項按鈕寬度。
function getResponsiveButtonWidth() {
  // 計算寬度比例。
  const widthRatio = width / designWidth;

  // 換算為設計座標寬度。
  const availableWidth = widthRatio > 0 ? width / widthRatio : designWidth;

  // 限制選項按鈕寬度。
  return constrain(availableWidth - 120, 430, 600);
}

// 取得響應式選項文字大小。
function getResponsiveOptionTextSize() {
  // 判斷是否為手機寬度。
  if (width < 500) {
    // 回傳手機文字大小。
    return 19;
  }

  // 判斷是否為平板寬度。
  if (width < 750) {
    // 回傳平板文字大小。
    return 22;
  }

  // 回傳桌機文字大小。
  return 24;
}

// 取得響應式按鈕文字大小。
function getResponsiveButtonTextSize() {
  // 判斷是否為手機寬度。
  if (width < 500) {
    // 回傳手機文字大小。
    return 20;
  }

  // 回傳一般文字大小。
  return 24;
}

// 取得響應式下一題按鈕寬度。
function getResponsiveNextButtonWidth() {
  // 判斷是否為手機寬度。
  if (width < 500) {
    // 回傳手機按鈕寬度。
    return 220;
  }

  // 回傳一般按鈕寬度。
  return 240;
}

// 取得響應式重新測驗按鈕寬度。
function getResponsiveRestartButtonWidth() {
  // 判斷是否為手機寬度。
  if (width < 500) {
    // 回傳手機按鈕寬度。
    return 240;
  }

  // 回傳一般按鈕寬度。
  return 280;
}

// 判斷滑鼠是否位於按鈕內。
function isInsideButton(x, y, buttonWidth, buttonHeight) {
  // 計算畫面縮放值。
  const scaleValue = min(width / designWidth, height / designHeight);

  // 計算縮放後寬度。
  const scaledWidth = designWidth * scaleValue;

  // 計算縮放後高度。
  const scaledHeight = designHeight * scaleValue;

  // 計算水平偏移量。
  const offsetX = (width - scaledWidth) / 2;

  // 計算垂直偏移量。
  const offsetY = (height - scaledHeight) / 2;

  // 將滑鼠 X 座標換算為設計座標。
  const designMouseX = (mouseX - offsetX) / scaleValue;

  // 將滑鼠 Y 座標換算為設計座標。
  const designMouseY = (mouseY - offsetY) / scaleValue;

  // 判斷滑鼠是否在按鈕範圍內。
  return (
    designMouseX >= x - buttonWidth / 2 &&
    designMouseX <= x + buttonWidth / 2 &&
    designMouseY >= y - buttonHeight / 2 &&
    designMouseY <= y + buttonHeight / 2
  );
}

// 處理滑鼠點擊事件。
function mousePressed() {
  // 判斷目前是否在首頁。
  if (screen === "home") {
    // 判斷是否點擊開始測驗。
    if (isInsideButton(designWidth / 2, 385, 280, 68)) {
      // 確認題庫可用。
      if (questionsLoaded && questionBank.length >= quizLength) {
        // 開始測驗。
        startQuiz();
      }

      // 結束首頁點擊。
      return;
    }

    // 判斷是否點擊查看題庫。
    if (isInsideButton(designWidth / 2, 480, 280, 68)) {
      // 確認題庫可用。
      if (questionsLoaded && questionBank.length > 0) {
        // 設定從第一題開始。
        bankQuestionIndex = 0;

        // 切換到題庫頁面。
        screen = "bank";
      }

      // 結束首頁點擊。
      return;
    }
  }

  // 判斷是否點擊測驗頁面的返回首頁。
  if (screen === "quiz" && isInsideButton(100, 45, 150, 44)) {
    // 返回首頁。
    goHome();

    // 結束點擊處理。
    return;
  }

  // 判斷是否點擊題庫頁面的返回首頁。
  if (screen === "bank" && isInsideButton(100, 45, 150, 44)) {
    // 返回首頁。
    goHome();

    // 結束點擊處理。
    return;
  }

  // 判斷是否點擊結果頁面的返回首頁。
  if (screen === "result" && isInsideButton(100, 45, 150, 44)) {
    // 返回首頁。
    goHome();

    // 結束點擊處理。
    return;
  }

  // 判斷目前是否在題庫頁面。
  if (screen === "bank") {
    // 判斷是否點擊上一題。
    if (isInsideButton(260, 605, 190, 48)) {
      // 題庫索引往前一題。
      bankQuestionIndex--;

      // 如果超過第一題，回到最後一題。
      if (bankQuestionIndex < 0) {
        // 設定為最後一題。
        bankQuestionIndex = questionBank.length - 1;
      }

      // 結束題庫點擊。
      return;
    }

    // 判斷是否點擊下一題。
    if (isInsideButton(640, 605, 190, 48)) {
      // 題庫索引往後一題。
      bankQuestionIndex++;

      // 如果超過最後一題，回到第一題。
      if (bankQuestionIndex >= questionBank.length) {
        // 設定為第一題。
        bankQuestionIndex = 0;
      }

      // 結束題庫點擊。
      return;
    }
  }

  // 判斷目前是否在結果頁面。
  if (screen === "result") {
    // 取得重新測驗按鈕寬度。
    const restartButtonWidth = getResponsiveRestartButtonWidth();

    // 判斷是否點擊重新測驗。
    if (isInsideButton(designWidth / 2, 455, restartButtonWidth, 75)) {
      // 開始新的測驗。
      startQuiz();
    }

    // 結束結果頁面點擊。
    return;
  }

  // 判斷目前是否在測驗頁面且尚未作答。
  if (screen === "quiz" && !answered) {
    // 取得目前題目。
    const current = quizQuestions[currentQuestion];

    // 設定選項起始位置。
    const startY = 215;

    // 設定選項垂直間距。
    const gapY = 75;

    // 取得選項按鈕寬度。
    const buttonWidth = getResponsiveButtonWidth();

    // 逐一檢查四個選項。
    for (let index = 0; index < current.options.length; index++) {
      // 計算選項位置。
      const optionY = startY + index * gapY;

      // 判斷是否點擊選項。
      if (isInsideButton(designWidth / 2, optionY, buttonWidth, 58)) {
        // 記錄使用者選擇。
        selectedOption = index;

        // 設定已經作答。
        answered = true;

        // 判斷答案是否正確。
        if (index === current.answer) {
          // 增加答對題數。
          correctCount++;

          // 產生彩帶。
          createConfetti();
        } else {
          // 記錄錯誤選項時間。
          shakeStartTime = millis();
        }

        // 停止檢查其他選項。
        break;
      }
    }
  }

  // 判斷目前是否在測驗頁面且已作答。
  if (screen === "quiz" && answered) {
    // 取得下一題按鈕寬度。
    const nextButtonWidth = getResponsiveNextButtonWidth();

    // 判斷是否點擊下一題。
    if (isInsideButton(designWidth / 2, 575, nextButtonWidth, 55)) {
      // 判斷是否完成最後一題。
      if (currentQuestion === quizLength - 1) {
        // 儲存本次成績。
        saveLastScore(correctCount);

        // 切換到結果頁面。
        screen = "result";
      } else {
        // 前往下一題。
        currentQuestion++;

        // 清除選項。
        selectedOption = -1;

        // 設定尚未作答。
        answered = false;

        // 清除彩帶。
        confetti = [];
      }
    }
  }
}

// 開始新的測驗。
function startQuiz() {
  // 複製題庫並打亂順序。
  const shuffledBank = shuffle(questionBank.slice());

  // 隨機抽出五題。
  quizQuestions = shuffledBank.slice(0, quizLength);

  // 將目前題目設定為第一題。
  currentQuestion = 0;

  // 將答對題數歸零。
  correctCount = 0;

  // 清除選項紀錄。
  selectedOption = -1;

  // 設定尚未作答。
  answered = false;

  // 清除彩帶。
  confetti = [];

  // 切換到測驗頁面。
  screen = "quiz";
}

// 返回首頁。
function goHome() {
  // 切換到首頁。
  screen = "home";

  // 清除測驗資料。
  quizQuestions = [];

  // 清除選項紀錄。
  selectedOption = -1;

  // 設定尚未作答。
  answered = false;

  // 清除彩帶。
  confetti = [];
}

// 取得上次成績。
function getLastScore() {
  // 從 localStorage 讀取上次成績。
  const storedScore = localStorage.getItem("mathQuizLastScore");

  // 判斷是否沒有成績紀錄。
  if (storedScore === null) {
    // 回傳空值。
    return null;
  }

  // 將文字轉換為數字。
  return Number(storedScore);
}

// 儲存本次成績。
function saveLastScore(score) {
  // 將成績轉成文字並儲存。
  localStorage.setItem("mathQuizLastScore", String(score));
}

// 建立彩帶。
function createConfetti() {
  // 清除上一批彩帶。
  confetti = [];

  // 建立彩帶。
  for (let index = 0; index < confettiAmount; index++) {
    // 將彩帶加入陣列。
    confetti.push({
      // 設定水平位置。
      x: random(width),

      // 設定起始垂直位置。
      y: random(-height * 0.4, -20),

      // 設定水平速度。
      speedX: random(-2, 2),

      // 設定垂直速度。
      speedY: random(2, 6),

      // 設定旋轉角度。
      angle: random(TWO_PI),

      // 設定旋轉速度。
      rotationSpeed: random(-0.15, 0.15),

      // 設定寬度。
      width: random(6, 12),

      // 設定高度。
      height: random(12, 24),

      // 設定彩帶顏色。
      color: random(confettiColors)
    });
  }
}

// 繪製彩帶。
function drawConfetti() {
  // 判斷目前是否有彩帶。
  if (confetti.length === 0) {
    // 沒有彩帶時結束函式。
    return;
  }

  // 儲存繪圖狀態。
  push();

  // 從後往前處理彩帶。
  for (let index = confetti.length - 1; index >= 0; index--) {
    // 取得目前彩帶。
    const piece = confetti[index];

    // 更新水平位置。
    piece.x += piece.speedX;

    // 更新垂直位置。
    piece.y += piece.speedY;

    // 增加重力效果。
    piece.speedY += 0.04;

    // 更新旋轉角度。
    piece.angle += piece.rotationSpeed;

    // 儲存單一彩帶狀態。
    push();

    // 移動至彩帶位置。
    translate(piece.x, piece.y);

    // 旋轉彩帶。
    rotate(piece.angle);

    // 設定彩帶顏色。
    fill(piece.color);

    // 移除彩帶外框。
    noStroke();

    // 繪製彩帶。
    rect(0, 0, piece.width, piece.height, 2);

    // 還原單一彩帶狀態。
    pop();

    // 判斷彩帶是否離開畫面。
    if (piece.y > height + 40) {
      // 移除離開畫面的彩帶。
      confetti.splice(index, 1);
    }
  }

  // 還原繪圖狀態。
  pop();
}

// 當瀏覽器視窗大小改變時執行。
function windowResized() {
  // 重新調整畫布大小。
  resizeCanvas(windowWidth, windowHeight);

  // 清除彩帶。
  confetti = [];
}