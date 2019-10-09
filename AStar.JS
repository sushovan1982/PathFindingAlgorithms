function AStar(startRowIndex,
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
    let pathCost = [];
    let isSearchCompleted = false;
    let animationRequestID;

    performAStar(
        startRowIndex,
        startColIndex,
        endRowIndex,
        endColIndex,
        allowDiagonal);

    function animateCells() {
        let cellValue = document.getElementById(path[0]);
        cellValue.style.backgroundColor = '#f5ffab';
        path.shift()
        if (path.length == 0) {
            cancelAnimationFrame(animationRequestID);
            animationRequestID = requestAnimationFrame(animateLine);
        }
        animationRequestID = requestAnimationFrame(animateCells);
    }

    function animateLine() {
        document.body.innerHTML += arrHTMLLine[arrHTMLLine.length - 1];
        arrHTMLLine.splice(arrHTMLLine.length - 1, 1);
        if (arrHTMLLine.length == 0) {
            cancelAnimationFrame(animationRequestID);
            return;
        }
        animationRequestID = requestAnimationFrame(animateLine);
    }

    function performAStar(
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
            extractPosition = st[st.length - 1];
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
                    if (!path.includes(r + ',' + c)) {
                        let cellValue = document.getElementById(String(r) + ',' + String(c));
                        processedSet.push({
                            parent: rowPart + ',' + colPart,
                            child: r + ',' + c,
                        });
                        if (r + ',' + c !=
                            startRowIndex + ',' + startColIndex
                        ) {
                            cellValue.innerHTML = calculateHeuristic(
                                endRowIndex,
                                endColIndex,
                                r,
                                c,
                                allowDiagonal
                            );
                            calculateDistance(startRowIndex, startColIndex, r, c);
                            path.push(r + ',' + c);
                        }
                    }
                }
            }
            let leastHeuristic = Number.MAX_SAFE_INTEGER;
            let leastCellPosition = null;
            for (let j = 0; j < rowNbr.length; j++) {
                let r = parseInt(rowPart) + parseInt(rowNbr[j]);
                let c = parseInt(colPart) + parseInt(colNbr[j]);
                if (isValid(r, c) && !st.includes(r + ',' + c)) {
                    let cellValue = document.getElementById(r + ',' + c);
                    let travelCost = pathCost.find(obj => obj.cellPosition == r + ',' + c);
                    if (leastHeuristic > parseInt(cellValue.innerHTML) + parseInt(travelCost.result)) {
                        leastHeuristic = parseInt(cellValue.innerHTML) + parseInt(travelCost.result);
                        leastCellPosition = r + ',' + c;
                    }
                }
            }
            if (leastHeuristic == Number.MAX_SAFE_INTEGER) {
                st.push(path[path.length - 1]);
                processedSet.push({
                    parent: rowPart + ',' + colPart,
                    child: path[path.length - 1]
                });
            }
            else {
                st.push(leastCellPosition);
                processedSet.push({
                    parent: rowPart + ',' + colPart,
                    child: leastCellPosition
                });
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

    function calculateHeuristic(
        endRowIndex,
        endColIndex,
        currentRowIndex,
        currentColIndex,
        allowDiagonal
    ) {
        let rowDifference = Math.abs(currentRowIndex - endRowIndex);
        let colDifference = Math.abs(currentColIndex - endColIndex);

        let result = 0;

        if (allowDiagonal) {
            result = Math.max(rowDifference, colDifference);
        }
        else {
            result = rowDifference + colDifference;
        }

        return result;
    }

    function calculateDistance(
        startRowIndex,
        startColIndex,
        currentRowIndex,
        currentColIndex
    ) {
        let rowDifference = Math.abs(currentRowIndex - startRowIndex);
        let colDifference = Math.abs(currentColIndex - startColIndex);

        let cellPosition = currentRowIndex + ',' + currentColIndex;
        let result = Math.max(rowDifference, colDifference);

        pathCost.push({ cellPosition, result });
    }

    function shortestPath(
        startRowIndex,
        startColIndex,
        currentRowIndex,
        currentColIndex,
        distance
    ) {
        let rowDifference = Math.abs(currentRowIndex - startRowIndex);
        let colDifference = Math.abs(currentColIndex - startColIndex);

        if (Math.max(rowDifference, colDifference) < distance) {
            return true;
        } else {
            return false;
        }
    }
}
