function Dijkstra(startRowIndex,
  startColIndex,
  endRowIndex,
  endColIndex,
  allowDiagonal) {
  let vertexCount = 70;
  let st = [];
  let processedSet = [];
  let path = [];
  let rowNbr = [0, 1, -1, 0, 1, 1, -1, -1];
  let colNbr = [1, 0, 0, -1, -1, 1, -1, 1];
  let extractPosition;
  let rowPart;
  let colPart;
  let arrHTMLLine = [];
  let isSearchCompleted = false;
  let animationRequestID;

  performDijkstra(
    startRowIndex,
    startColIndex,
    endRowIndex,
    endColIndex,
    allowDiagonal
  );

  function animateCells() {
    let i = 0;

    while (i < 10) {
      let cellValue = document.getElementById(path[0]);
      cellValue.style.backgroundColor = '#f5ffab';
      path.shift();
      i++;
      if (path.length == 0) {
        cancelAnimationFrame(animationRequestID);
        animationRequestID = requestAnimationFrame(animateLine);
        return;
      }
    }
    animationRequestID = requestAnimationFrame(animateCells);
  }

  function animateLine() {
    document.getElementById('container').innerHTML += arrHTMLLine[arrHTMLLine.length - 1];
    arrHTMLLine.splice(arrHTMLLine.length - 1, 1);
    if (arrHTMLLine.length == 0) {
      cancelAnimationFrame(animationRequestID);
      return;
    }
    animationRequestID = requestAnimationFrame(animateLine);
  }

  function performDijkstra(
    startRowIndex,
    startColIndex,
    endRowIndex,
    endColIndex,
    allowDiagonal
  ) {
    if (!allowDiagonal) {
      rowNbr = [1, -1, 0, 0];
      colNbr = [0, 0, 1, -1];
    }

    st.push(startRowIndex + ',' + startColIndex);
    while (st.length > 0) {
      extractPosition = st[0];
      st.shift();
      rowPart = extractPosition.substring(0, extractPosition.indexOf(','));
      colPart = extractPosition.substring(extractPosition.indexOf(',') + 1);

      for (let i = 0; i < rowNbr.length; i++) {
        let r = parseInt(rowPart) + parseInt(rowNbr[i]);
        let c = parseInt(colPart) + parseInt(colNbr[i]);
        if (isValid(r, c)) {
          if (r == endRowIndex && c == endColIndex) {
            isSearchCompleted = true;
            processedSet.push({
              parent: rowPart + ',' + colPart,
              child: r + ',' + c,
            });
            for (let j = 0; j < rowNbr.length; j++) {
              if (
                isValid(
                  parseInt(endRowIndex) + rowNbr[j],
                  parseInt(endColIndex) + colNbr[j]
                )
              ) {
                path.push(
                  String(parseInt(endRowIndex) + rowNbr[j]) +
                  ',' +
                  String(parseInt(endColIndex) + parseInt(colNbr[j]))
                );
              }
            }
            animationRequestID = requestAnimationFrame(animateCells);
            drawShortestPath(
              startRowIndex,
              startColIndex,
              endRowIndex,
              endColIndex
            );
            return;
          }
          if (!st.includes(r + ',' + c) && !processedSet.includes(r + ',' + c)) {
            let cellValue = document.getElementById(String(r) + ',' + String(c));
            st.push(r + ',' + c);
            processedSet.push({
              parent: rowPart + ',' + colPart,
              child: r + ',' + c,
            });
            if (
              String(r) + ',' + String(c) !=
              startRowIndex + ',' + startColIndex
            ) {
              cellValue.innerHTML = calculateDistance(
                startRowIndex,
                startColIndex,
                r,
                c
              );
              path.push(String(r) + ',' + String(c));
            }
          }
        }
      }
    }
  }

  function isValid(row, col) {
    if (row >= 0 && col >= 0 && row < vertexCount && col < vertexCount) {
      if (
        document.getElementById(String(row) + ',' + String(col)).innerHTML == '0'
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  function drawShortestPath(
    startRowIndex,
    startColIndex,
    endRowIndex,
    endColIndex
  ) {
    st = [];
    st.push(endRowIndex + ',' + endColIndex);

    while (st[st.length - 1] != startRowIndex + ',' + startColIndex) {
      let findParent = processedSet.find(obj => obj.child == st[st.length - 1]);
      st.push(findParent.parent);
    }

    for (let j = 0; j < st.length - 1; j++) {
      connectTwoPoints(st[j], st[j + 1], '#670087', '2');
    }
    return;
  }

  function getOffset(el) {
    let rect = el.getBoundingClientRect();
    return {
      left: rect.left + 12,
      top: rect.top + 12,
      width: rect.width - 10,
      height: rect.height - 10,
    };
  }

  function connectTwoPoints(td1, td2, color, thickness) {
    let sourceCell = document.getElementById(td1);
    let destCell = document.getElementById(td2);
    // draw a line connecting elements
    let off1 = getOffset(sourceCell);
    let off2 = getOffset(destCell);

    let x1 = off1.left;
    let y1 = off1.top;

    let x2 = off2.left;
    let y2 = off2.top;
    // distance
    let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    // center
    let cx = (x1 + x2) / 2 - length / 2;
    let cy = (y1 + y2) / 2 - thickness / 2;
    // angle
    let angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

    let htmlLine =
      "<div style='padding:0px; margin:0px; height:" +
      thickness +
      'px; background-color:' +
      color +
      '; line-height:1px; position:absolute; left:' +
      cx +
      'px; top:' +
      cy +
      'px; width:' +
      length +
      'px; -moz-transform:rotate(' +
      angle +
      'deg); -webkit-transform:rotate(' +
      angle +
      'deg); -o-transform:rotate(' +
      angle +
      'deg); -ms-transform:rotate(' +
      angle +
      'deg); transform:rotate(' +
      angle +
      "deg);' />";

    arrHTMLLine.push(htmlLine);
  }

  function calculateDistance(
    startRowIndex,
    startColIndex,
    currentRowIndex,
    currentColIndex
  ) {
    let rowDifference = Math.abs(currentRowIndex - startRowIndex);
    let colDifference = Math.abs(currentColIndex - startColIndex);

    return Math.max(rowDifference, colDifference);
  }

  function shortestPath(
    startRowIndex,
    startColIndex,
    currentRowIndex,
    currentColIndex,
    distance
  ) {
    let rowDifference = currentRowIndex - startRowIndex;
    let colDifference = currentColIndex - startColIndex;

    if (rowDifference < 0) {
      rowDifference = -1 * rowDifference;
    }

    if (colDifference < 0) {
      colDifference = -1 * colDifference;
    }

    if (Math.max(rowDifference, colDifference) < distance) {
      return true;
    } else {
      return false;
    }
  }
}
