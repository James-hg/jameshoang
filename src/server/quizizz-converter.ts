import * as XLSX from "xlsx";

const excelFields = [
    "Question Text",
    "Question Type",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Answer",
    "Time in seconds",
    "Image Link",
];

export interface QuestionSet {
    [key: string]: {
        Question: string;
        A: string;
        B: string;
        C: string;
        D: string;
        CorrectAnswer: string;
    };
}

// MAIN FUNCTION
export default function convertToExcel(content: string, fileName: string): string[][] {
    const questionSet: QuestionSet = parseInfo(content);

    const excelData = buildExcelData(questionSet);

    downloadExcel(excelData, fileName);

    return excelData;
}

// Find the correct question, options and answers from the HTML
const parseInfo = (text: string) => {
    let questionSet: QuestionSet = {};

    let counter = 0;

    // Find question sets, which are wrapped around by two "Câu"'s or the end of the text.
    const regex = /Câu (\d+):(.*?)(?=Câu \d+|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const [entire, questionNumber, rest] = match;

        // find all matches of <b> tag in the entire string
        const boldMatches = entire.match(/<b>(A|B|C|D)<\/b>/g);
        if (!boldMatches) {
            console.log("Error parsing bold matches: ", entire);
            continue;
        }

        questionSet[counter] = {
            Question: "",
            A: "",
            B: "",
            C: "",
            D: "",
            CorrectAnswer: "0",
        };

        // Find the correct answer
        for (let boldMatch of boldMatches) {
            if (boldMatch.includes("A")) {
                questionSet[counter.toString()].CorrectAnswer = "1";
            } else if (boldMatch.includes("B")) {
                questionSet[counter.toString()].CorrectAnswer = "2";
            } else if (boldMatch.includes("C")) {
                questionSet[counter.toString()].CorrectAnswer = "3";
            } else if (boldMatch.includes("D")) {
                questionSet[counter.toString()].CorrectAnswer = "4";
            }
        }

        // Find the question and options
        const clean = rest.replace(/<[^>]*>/g, "").replace(/\u00A0/g, ""); // Remove all HTML tags and non-breaking spaces

        // const subRegex = /^(.*?)(?=A\.)A\.(.*?)B\.(.*?)C\.(.*?)D\.( .*?)$/g;
        const subRegex =
            /^(.*?)(?=[ABCD]\.)A\.(.*?)(?=[BCD]\.)B\.(.*?)(?=[CD]\.)C\.(.*?)(?=[D]\.)D\.(.*?)$/g;
        const subMatches = subRegex.exec(clean);

        if (!subMatches) {
            console.log("Error parsing question: ", clean);
            continue;
        }

        const [, question, A, B, C, D] = subMatches;

        questionSet[counter.toString()] = {
            Question: question.trim(),
            A: A.trim(),
            B: B.trim(),
            C: C.trim(),
            D: D.trim(),
            CorrectAnswer: questionSet[counter.toString()].CorrectAnswer,
        };

        counter++;
    }

    return questionSet;
};

// Build the Excel data from the question set
function buildExcelData(questionSet: QuestionSet): string[][] {
    // Add the header row
    let excelData: string[][] = [excelFields];

    // Add the data rows
    Object.keys(questionSet).forEach((key) => {
        let row = ["", "Multiple Choice", "", "", "", "", "", "900", ""];
        const question = questionSet[key];
        row[0] = question.Question;
        row[2] = question.A;
        row[3] = question.B;
        row[4] = question.C;
        row[5] = question.D;
        row[6] = question.CorrectAnswer;

        excelData.push([...row]);
    });

    // console.table(excelData);

    return excelData;
}

// Create and download the Excel file
export function downloadExcel(excelData: string[][], fileName: string) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quizizz Questions");

    XLSX.writeFile(workbook, fileName);
}
