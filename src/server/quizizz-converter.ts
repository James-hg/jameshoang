const csvSeparator = "|";
const csvFields = [
    "Question Text",
    "Question Type",
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Correct Answer",
    "Time in seconds",
    "Image Link",
];

let outputName = "";

export default function convertToCSV(content: string[], fileName: string) {
    // Find the correct answers in the paragraphs
    let answers = findCorrectAnswers(content);

    // STEP 3: Build the CSV row
    let csvData = buildCSVRow(content, answers);

    // STEP 4: Clean the data
    let cleanedData = cleanData(csvData);

    outputName = fileName.replace(".docx", ".csv");

    // STEP 5: Download the CSV file
    downloadCSV(cleanedData);
}

interface Question {
    options: string[];
    correctAnswer: string;
}

// Find the correct answers in the paragraphs, which are bolded.
function findCorrectAnswers(paragraphs: string[]): string[] {
    let answers = [""];

    for (let para of paragraphs) {
        if (para.startsWith("<strong>")) {
            let innerText = para.replace(/<[^>]*>/g, "");
            if (innerText.startsWith("A.")) {
                answers.push("1");
            } else if (innerText.startsWith("B.")) {
                answers.push("2");
            } else if (innerText.startsWith("C.")) {
                answers.push("3");
            } else if (innerText.startsWith("D.")) {
                answers.push("4");
            }
        }
    }

    return answers;
}

function cleanCSVRow() {
    return {
        questionText: "",
        questionType: "Multiple Choice",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswer: "",
        timeInSeconds: "900",
        imageLink: "",
    };
}

function buildCSVRow(paragraphs: string[], answers: string[]): string {
    let finalCSV = "";

    let csvRow = cleanCSVRow();

    let count = 0;
    for (let i = 0; i < paragraphs.length; i++) {
        // remove the <strong> tag
        let text = paragraphs[i].replace(/<[^>]*>/g, "");
        text = removeExtraSpaces(text);

        if (text.startsWith("Câu ")) {
            csvRow = cleanCSVRow();
            csvRow.questionText = text;
        } else if (text.startsWith("A.")) {
            csvRow.option1 = text;
        } else if (text.startsWith("B.")) {
            csvRow.option2 = text;
        } else if (text.startsWith("C.")) {
            csvRow.option3 = text;
        } else if (text.startsWith("D.")) {
            csvRow.option4 = text;

            csvRow.correctAnswer = answers[count];
            count++;
            finalCSV += Object.values(csvRow).join(csvSeparator) + "\n";
        }
    }

    return finalCSV;
}

function cleanData(data: string): string {
    // remove Câu #: and Câu #. and  Câu # : and Câu # . from final
    let cleanedData = data.replace(/Câu \d+:|Câu \d+\.|Câu \d+ :|Câu \d+ \./g, "");

    // remove A. B. C. D.
    cleanedData = cleanedData.replace(/A\.|B\.|C\.|D\./g, "");

    return cleanedData;
}

function removeExtraSpaces(text: string): string {
    // Remove double spaces
    text = text.replace(/\s+/g, " ");
    // Remove extra spaces before "." or ":"
    text = text.replace(/\s+([.:])/g, "$1");
    return text;
}

function downloadCSV(data: string) {
    // Add header to the CSV file
    const header = csvFields.join(csvSeparator) + "\n";
    data = header + data;

    // Download the CSV file
    const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("id", "download-csv");
    a.setAttribute("href", url);
    a.setAttribute("download", outputName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
