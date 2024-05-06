initializationComponent();

function initializationComponent() {
    var container = document.createElement("div");
    document.body.appendChild(container);

    var inputArea = document.createElement("textarea");
    inputArea.setAttribute("id", "inputArea");
    container.appendChild(inputArea);

    var outputArea = document.createElement("textarea");
    outputArea.setAttribute("id", "outputArea");
    outputArea.setAttribute("readonly", "");
    container.appendChild(outputArea);

    var machineTable = document.createElement("table");
    machineTable.setAttribute("id", "machineTable");
    for (var i = 0; i < 10; i++) {
        var row = machineTable.insertRow();
        for (var j = 0; j < 10; j++) {
            var cell = row.insertCell();
            cell.innerHTML = "000";
        }
    }
    container.appendChild(machineTable);

    var loadInput = document.createElement("input");
    loadInput.setAttribute("type", "file");
    loadInput.setAttribute("id", "loadInput");
    loadInput.setAttribute("hidden", "");
    loadInput.setAttribute("onchange", "load(this)");
    document.body.appendChild(loadInput);

    var loadButton = document.createElement("label");
    loadButton.setAttribute("for", "loadInput");
    loadButton.setAttribute("class", "btn");
    loadButton.innerHTML = "Load";
    document.body.appendChild(loadButton);

    var compileButton = document.createElement("label");
    compileButton.setAttribute("class", "btn");
    compileButton.setAttribute("onclick", "compile()");
    compileButton.innerHTML = "Compile";
    document.body.appendChild(compileButton);
}

function load(input) {
    var file = input.files[0];
    var reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function () {
        var inputArea = document.getElementById("inputArea");
        inputArea.value = reader.result;
    }
}

function compile() {
    var inputArea = document.getElementById("inputArea");
    var outputArea = document.getElementById("outputArea");
    var machineTable = document.getElementById("machineTable");

    var lines = inputArea.value.split("\n").filter(Boolean);
    // Очистка комментариев
    deletingComments(lines);

    // Первый проход, получаем адреса меток 
    var labels = getLabelsAddress(lines);

    // Второй проход, построение промежуточного кода
    var intermediateCode = getIntermediateCode(lines, labels);

    // Проверка на синтаксические ошибки
    if (dataValidity(intermediateCode, outputArea)) {

        // Третий проход, построение машинного кода
        var machineCode = getMachineCode(intermediateCode);

        outputArea.value = intermediateCode;

        var trs = (machineTable.children)[0].children;
        for (var i = 0; i < trs.length; i++) {
            var tds = trs[i].children;
            for (var j = 0; j < tds.length; j++) {
                tds[j].innerHTML = machineCode[i * trs.length + j];
            }
        }
    }
}

function deletingComments(lines) {
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].includes("//")) {
            if (lines[i].indexOf("//") == 0)
                lines.splice(i, 1);
            else
                lines[i] = lines[i].slice(0, lines[i].indexOf("//"));
        }
    }
}

function dataValidity(intermediateCode, outputArea) {
    var lines = intermediateCode.split("\n").filter(Boolean);
    for (var i = 0; i < lines.length; i++) {
        var items = lines[i].split(" ").filter(Boolean);
        if (isCommand(items[1]) != "LABEL") {
            if (items[1] != "INP" && items[1] != "OUT" && items[1] != "HLT") {
                if (Number.isNaN(Number(items[2]))) {
                    outputArea.value = "String: " + (i + 1).toString() + "\tItem: 3";
                    return false;
                }
            }
            else if (items.length > 2) {
                outputArea.value = "String: " + (i + 1).toString() + "\tItem: 3";
                return false;
            }
        }
        else {
            outputArea.value = "String: " + (i + 1).toString() + "\tItem: 2";
            return false;
        }
    }
    return true;
}

function getLabelsAddress(lines) {
    var labels = new Map();
    var count = 0;
    lines.forEach(line => {
        var items = line.split(" ").filter(Boolean);
        if (isCommand(items[0]) == "LABEL")
            labels.set(items[0], count.toString().padStart(2, "0"));
        count++;
    });
    return labels;
}

function getIntermediateCode(lines, labels) {
    var count = 0;
    var intermediateCode = "";
    lines.forEach(line => {
        intermediateCode += count.toString().padStart(2, "0");
        var items = line.split(" ").filter(Boolean);
        for (var i = 0; i < items.length; i++) {
            if (isCommand(items[i]) == "LABEL" && labels.has(items[i])) {
                intermediateCode += i ? ' ' + labels.get(items[i]) : '';
            }
            else {
                intermediateCode += ' ' + items[i].toString().padStart(2, "0");
                if (items[i] == "DAT" && i == items.length - 1)
                    intermediateCode += ' 00';
            }
        }
        intermediateCode += "\n";
        count++;
    });
    return intermediateCode;
}

function getMachineCode(intermediateCode) {
    var machineCode = new Array(100);
    for (var i = 0; i < machineCode.length; i++) {
        machineCode[i] = "000";
    }

    var lines = intermediateCode.split("\n");
    lines = lines.filter(Boolean);
    lines.forEach(line => {
        var items = line.split(" ");
        items = items.filter(Boolean);
        machineCode[parseInt(items[0])] = (isCommand(items[1]) + (items.length == 3 ? items[2].toString() : '')).padStart(3, "0");
    });

    return machineCode;
}

// Желательно придумать что-то с этим 
function isCommand(command) {
    switch (command) {
        case "ADD":
            return "1";
        case "SUB":
            return "2";
        case "STA":
            return "3";
        case "LDA":
            return "5";
        case "BRA":
            return "6";
        case "BRZ":
            return "7";
        case "BRP":
            return "8";
        case "INP":
            return "901";
        case "OUT":
            return "902";
        case "HLT":
            return "000";
        case "DAT":
            return ""
        default:
            return "LABEL"
    }
}