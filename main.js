const selectionBox = document.getElementById("selectionBox");
const output = document.getElementById("output");
const textForm = document.getElementById("textForm");
const inputText = document.getElementById("inputText");

const dragImage = document.createElement("div");
dragImage.classList.add("drag-image");
document.body.appendChild(dragImage);

let startX, startY, endX, endY;
let isMouseDown = false;

textForm.addEventListener("submit", outputText);
output.addEventListener("mousedown", mouseDown);
output.addEventListener("mousemove", selectingText);
document.addEventListener("mouseup", mouseUp);
output.addEventListener("dragstart", dragStart);
output.addEventListener("dragover", dragOver);
output.addEventListener("drop", drop);

function fillWithEmptySpace() {
    output.innerHTML = "";
    for (let i = 0; i < 3000; i++) {
        const span = document.createElement("span");
        span.textContent = "\u00A0";
        span.classList.add("empty");
        span.style.userSelect = "none";
        span.draggable = false;
        output.appendChild(span);
    }
}

function outputText(event) {
    event.preventDefault();
    const text = document.getElementById('inputText').value;
    const string = document.createElement("span");
    
    [...text].forEach(char => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.classList.add("char");
        span.draggable = true;
        string.appendChild(span);
    });

    string.appendChild(document.createTextNode("\u00A0"));
    output.prepend(string);
};

function mouseDown(event) {
    if (event.target.classList.contains("char")) {
        event.target.classList.add("dragged_item");
        return;
    }

    if (event.metaKey || event.ctrlKey) {

        if (event.target.classList.contains("char")) {
            event.target.classList.add("selected");
        }
        return;
    }

    isMouseDown = true;
    startX = event.clientX;
    startY = event.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.display = "block";

    document.querySelectorAll(".char").forEach((char) => {
        char.classList.remove("selected");
    });
}

function selectingText(event) {

    if (isMouseDown) {
        endX = event.clientX;
        endY = event.clientY;

        let left = Math.min(startX, endX);
        let top = Math.min(startY, endY);
        let width = Math.abs(startX - endX);
        let height = Math.abs(startY - endY);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;

        document.querySelectorAll(".char").forEach((char) => {
            const rect = char.getBoundingClientRect();
            const charLeft = rect.left;
            const charTop = rect.top;
            const charRight = rect.right;
            const charBottom = rect.bottom;

            if (charLeft < left + width && charRight > left && charTop < top + height && charBottom > top) {
                char.classList.add("selected");
            } else {
                char.classList.remove("selected");
            }
        })
    }
}

function mouseUp(event) {
    isMouseDown = false;
    selectionBox.style.display = "none";
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
}

function dragStart(event) {
    const selectedItems = document.querySelectorAll(".selected, .dragged_item");
    dragImage.textContent = Array.from(selectedItems).map((el) => el.textContent).join("");
    event.dataTransfer.setDragImage(dragImage, 0, 10);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const selectedItems = document.querySelectorAll(".selected, .dragged_item");
    const fragment = document.createDocumentFragment();

    selectedItems.forEach((el) => {
        const newSpan = document.createElement("span");
        newSpan.classList.add("char");
        newSpan.draggable = true;
        newSpan.textContent = el.textContent;
        fragment.appendChild(newSpan);
        el.classList.remove("selected");
        el.classList.remove("dragged_item");
        el.remove();
    });

    const caret = document.caretPositionFromPoint(event.clientX, event.clientY);
    if (!caret) return; 
    
    const range = new Range();
    range.setStart(caret.offsetNode, caret.offset);
    range.collapse(true); 
    range.insertNode(fragment);
}

fillWithEmptySpace();