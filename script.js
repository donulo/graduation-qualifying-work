
var container = document.createElement("div");
document.body.appendChild(container);

var input = document.createElement("textarea");
var output = document.createElement("textarea");
output.setAttribute("readonly", "");

container.appendChild(input);
container.appendChild(output);

var button = document.createElement("button");
button.textContent = "Interpret";
button.onclick = test;
document.body.appendChild(button);

function test() {
    var lines = input.value.split("\n").filter(Boolean);

    // Очистка комментариев
    deletingComments(lines);

    // Проверка на синтаксические ошибки
    

    // Первый проход, получаем адреса меток 
    var labels = getLabelsAddress(lines);

    // Второй проход, построение промежуточного кода
    var intermediateCode = getIntermediateCode(lines, labels);

    // Третий проход, построение машинного кода
    var machineCode = getMachineCode(intermediateCode);

    output.value = intermediateCode + "\n";
    for (var i = 0; i < machineCode.length; i++) {
        output.value += machineCode[i] + ' ';
        if (i % 10 == 9)
            output.value += "\n";
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