import * as XLSX from "xlsx";

const csvFields = [
    "Question",
    "Type",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Answer",
    "Points",
    "Time",
];

export default function convertToExcel(content: string[], fileName: string) {
    console.log("Converting to Excel...");

    let answers = findCorrectAnswers(content);

    // remove <strong> and </strong> tags
    content = content.map((para) => para.replace(/<[^>]*>/g, ""));

    console.log(content.join(" "));

    const excelData = buildExcelData(content, answers);

    const outputName = fileName.replace(".docx", ".xlsx");

    // Create a new workbook with a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

    // Save the workbook
    // XLSX.writeFile(workbook, outputName);
}

function buildExcelData(paragraphs: string[], answers: string[]): string[][] {
    let excelData: string[][] = [[...csvFields]];

    let csvRow: string[] = ["", "Multiple Choice", "", "", "", "", "", "900", ""];

    let count = 0;
    for (let paragraph of paragraphs) {
        // remove the <strong> tag
        let text = paragraph.replace(/<[^>]*>/g, "");
        text = removeExtraSpaces(text);

        if (text.startsWith("Câu ")) {
            csvRow[0] = text;
        } else if (text.startsWith("A.")) {
            csvRow[2] = text;
        } else if (text.startsWith("B.")) {
            csvRow[3] = text;
        } else if (text.startsWith("C.")) {
            csvRow[4] = text;
        } else if (text.startsWith("D.")) {
            csvRow[5] = text;

            csvRow[6] = answers[count];
            count++;
            excelData.push([...csvRow]);
            csvRow = ["", "Multiple Choice", "", "", "", "", "", "900", ""];
        }
    }

    return excelData;
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
