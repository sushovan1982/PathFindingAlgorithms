let isDragging = false;
let newCellPositionStart = null;
let newCellPositionFinish = null;
let currentDroppable = null;
let obstacleFunction = [];

window.addEventListener('load', function () {
  buildMatrix();
});

function buildMatrix() {
  let cellItems = [];
  cellItems.length = 4900;

  for (let i = 0; i < 4900; i++) {
    cellItems.fill('');
  }

  // DRAW HTML TABLE
  let perrow = 70, // 70 items per row
    count = 0, // Flag for current cell
    columnCount = 0;
  rowCount = 0;
  (table = document.createElement('table')), (row = table.insertRow());

  table.id = 'tblGrid';

  for (let j of cellItems) {
    let cell = row.insertCell();
    cell.innerHTML = j;

    row.id = rowCount;
    cell.id = String(rowCount) + ',' + String(columnCount);

    if (count == 300) {
      cell.bgColor = 'Green';
      cell.className = 'draggable';
      cell.innerHTML = 'S';
      cell.align = 'center';
    } else if (count == 330) {
      cell.bgColor = 'Red';
      cell.className = 'draggable';
      cell.innerHTML = 'F';
      cell.align = 'center';
    } else {
      cell.addEventListener('click', obstacleFunction[count] = function () {
        if (cell.bgColor == '#8a8a8a') {
          cell.innerHTML = '';
          cell.bgColor = '';
        } else {
          cell.innerHTML = '0';
          cell.bgColor = '#8a8a8a';
        }
      });
    }

    columnCount++;
    // Break into next row
    count++;
    if (count % perrow == 0) {
      row = table.insertRow();
      rowCount++;
      columnCount = 0;
    }
  }

  // ATTACH TABLE TO CONTAINER
  document.getElementById('container').appendChild(table);
}

document.addEventListener('mousedown', function (event) {
  let dragElement = event.target.closest('.draggable');

  if (!dragElement) return;

  event.preventDefault();

  dragElement.ondragstart = function () {
    return false;
  };

  let shiftX, shiftY;

  startDrag(dragElement, event.clientX, event.clientY);

  function onMouseUp() {
    finishDrag();
  }

  function onMouseMove(event) {
    moveAt(event.clientX, event.clientY);

    dragElement.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    dragElement.hidden = false;

    if (!elemBelow) return; 

    let droppableBelow = elemBelow.id;

    if(document.getElementById(droppableBelow).innerHTML == 'S' || document.getElementById(droppableBelow).innerHTML == 'F')
    {
      return;
    }

    if (currentDroppable != droppableBelow) {
      if (currentDroppable) {
        // null when we were not over a droppable before this event
        leaveDroppable(currentDroppable);
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        // null if we're not coming over a droppable now
        // (maybe just left the droppable)
        enterDroppable(currentDroppable);
      }
    }

    function enterDroppable(elem) {
      document.getElementById(elem).style.backgroundColor = 'pink';
      if (dragElement.innerHTML == 'S') {
        newCellPositionStart = elem;
      } else if (dragElement.innerHTML == 'F') {
        newCellPositionFinish = elem;
      }
    }

    function leaveDroppable(elem) {
      if (document.getElementById(elem).style.backgroundColor == 'pink') {
        document.getElementById(elem).style.backgroundColor = '';
      }
    }
  }

  //   on drag start:
  //   remember the initial shift
  //   move the element position:fixed and a direct child of body
  function startDrag(element, clientX, clientY) {
    if (isDragging) {
      return;
    }

    isDragging = true;

    document.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseup', onMouseUp);

    shiftX = clientX - element.getBoundingClientRect().left;
    shiftY = clientY - element.getBoundingClientRect().top;

    element.style.position = 'fixed';

    moveAt(clientX, clientY);
  }

  // switch to absolute coordinates at the end, to fix the element in the document
  function finishDrag() {
    if (!isDragging) {
      return;
    }

    isDragging = false;

    dragElement.style.top =
      parseInt(dragElement.style.top) + pageYOffset + 'px';
    dragElement.style.position = 'absolute';

    document.removeEventListener('mousemove', onMouseMove);
    dragElement.removeEventListener('mouseup', onMouseUp);
  }

  function moveAt(clientX, clientY) {
    // new window-relative coordinates
    let newX = clientX - shiftX;
    let newY = clientY - shiftY;

    // check if the new coordinates are below the bottom window edge
    let newBottom = newY + dragElement.offsetHeight; // new bottom

    // below the window? let's scroll the page
    if (newBottom > document.documentElement.clientHeight) {
      // window-relative coordinate of document end
      let docBottom = document.documentElement.getBoundingClientRect().bottom;

      // scroll the document down by 10px has a problem
      // it can scroll beyond the end of the document
      // Math.min(how much left to the end, 10)
      let scrollY = Math.min(docBottom - newBottom, 10);

      // calculations are imprecise, there may be rounding errors that lead to scrolling up
      // that should be impossible, fix that here
      if (scrollY < 0) scrollY = 0;

      window.scrollBy(0, scrollY);

      // a swift mouse move make put the cursor beyond the document end
      // if that happens -
      // limit the new Y by the maximally possible (right at the bottom of the document)
      newY = Math.min(
        newY,
        document.documentElement.clientHeight - dragElement.offsetHeight
      );
    }

    // check if the new coordinates are above the top window edge (similar logic)
    if (newY < 0) {
      // scroll up
      let scrollY = Math.min(-newY, 10);
      if (scrollY < 0) scrollY = 0; // check precision errors

      window.scrollBy(0, -scrollY);
      // a swift mouse move can put the cursor beyond the document start
      newY = Math.max(newY, 0); // newY may not be below 0
    }

    // limit the new X within the window boundaries
    // there's no scroll here so it's simple
    if (newX < 0) newX = 0;
    if (newX > document.documentElement.clientWidth - dragElement.offsetWidth) {
      newX = document.documentElement.clientWidth - dragElement.offsetWidth;
    }

    dragElement.style.left = newX + 'px';
    dragElement.style.top = newY + 'px';

    dragElement.onmouseup = function () {
      if (dragElement.innerHTML == 'S') {
        if (dragElement.id == newCellPositionStart) {
          return;
        }

        let newCell = document.getElementById(newCellPositionStart);
        let row = document.getElementById(
          dragElement.id.substring(0, dragElement.id.indexOf(','))
        );

        let obstacleArrNumber = parseInt(newCellPositionStart.substring(0, newCellPositionStart.indexOf(','))) *
          70 + parseInt(newCellPositionStart.substring(newCellPositionStart.indexOf(',') + 1));

        newCell.removeEventListener('click', obstacleFunction[obstacleArrNumber]);

        newCell.style.backgroundColor = 'Green';
        newCell.className = 'draggable';
        newCell.innerHTML = 'S';
        newCell.align = 'center';
        document.getElementById(dragElement.id).remove();
        document.getElementById(newCellPositionStart).replaceWith(newCell);

        let oldCell = row.insertCell(
          parseInt(dragElement.id.substring(dragElement.id.indexOf(',') + 1))
        );
        oldCell.id = dragElement.id;
        oldCell.addEventListener('click', function () {
          if (oldCell.bgColor == '#8a8a8a') {
            oldCell.innerHTML = '';
            oldCell.bgColor = '';
          } else {
            oldCell.innerHTML = '0';
            oldCell.bgColor = '#8a8a8a';
          }
        }
        );
      } else if (dragElement.innerHTML == 'F') {
        if (dragElement.id == newCellPositionFinish) {
          return;
        }

        let newCell = document.getElementById(newCellPositionFinish);
        let row = document.getElementById(
          dragElement.id.substring(0, dragElement.id.indexOf(','))
        );

        let obstacleArrNumber = parseInt(newCellPositionFinish.substring(0, newCellPositionFinish.indexOf(','))) *
          70 + parseInt(newCellPositionFinish.substring(newCellPositionFinish.indexOf(',') + 1));

        newCell.removeEventListener('click', obstacleFunction[obstacleArrNumber]);

        newCell.style.backgroundColor = 'Red';
        newCell.className = 'draggable';
        newCell.innerHTML = 'F';
        newCell.align = 'center';
        document.getElementById(dragElement.id).remove();
        document.getElementById(newCellPositionFinish).replaceWith(newCell);

        let oldCell = row.insertCell(
          parseInt(dragElement.id.substring(dragElement.id.indexOf(',') + 1))
        );
        oldCell.id = dragElement.id;
        oldCell.addEventListener('click', function () {
          if (oldCell.bgColor == '#8a8a8a') {
            oldCell.innerHTML = '';
            oldCell.bgColor = '';
          } else {
            oldCell.innerHTML = '0';
            oldCell.bgColor = '#8a8a8a';
          }
        }
        );
      }
    };
  }
});
