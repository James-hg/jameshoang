"use client";
import React, { useEffect, useState } from "react";
import mammoth from "mammoth";
import convertToExcel from "@/server/quizizz-converter";
import { Center, Container, Text, Stack, Box, Button, Table, TableData } from "@mantine/core";
import FileUpload from "@/components/FileUpload";

const STAGES = {
    starting: {
        name: "starting",
        color: "blue",
    },
    convert: {
        name: "convert",
        color: "blue",
    },
    restart: {
        name: "restart",
        color: "blue",
    },
    error: {
        name: "error",
        color: "red",
    },
};

const QuizizzPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [html, setHtml] = useState<string>("");
    const [stages, setStages] = useState(STAGES.starting);
    const [message, setMessage] = useState<string>("");
    const [boldMessage, setBoldMessage] = useState<string>("");
    const [button, setButton] = useState<string>("");
    const [excelData, setExcelData] = useState<string[][]>([]);

    useEffect(() => {
        if (stages.name.localeCompare(STAGES.starting.name) == 0) {
            setMessage("");
            setBoldMessage("");
            setButton("");
        } else if (stages.name.localeCompare(STAGES.convert.name) == 0) {
            setMessage(`Successfully Uploaded `);
            setBoldMessage(file?.name + " 📄");
            setButton("Convert and Download Excel File 📊");
        } else if (stages.name.localeCompare(STAGES.restart.name) == 0) {
            setMessage(`Successfully Downloaded `);
            setBoldMessage(file?.name.replace("docx", "xlsx") + " 🎉");
            setButton("Convert Another File 🔄");
        } else {
            setMessage("Something went wrong! Please try again. 😥");
            setBoldMessage("");
            setButton("Try Again 🔄");
        }
    }, [stages]);

    const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files?.[0];

        if (!file) return;

        setFile(file);
        setStages(STAGES.convert);
    };

    const startConvert = () => {
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target?.result as ArrayBuffer;

            var options = {
                styleMap: ["b => span", "u => b"],
            };

            try {
                mammoth
                    .convertToHtml({ arrayBuffer: content }, options)
                    .then(function (result) {
                        const html = result.value;

                        // Extract paragraphs from HTML
                        let paragraphs = html.split(/<p>|<\/p>/);

                        // Remove empty paragraphs and HTML tags
                        paragraphs = paragraphs.filter((p) => p.trim().length > 0);
                        paragraphs = paragraphs.map((p) => p.replace(/<(?!\/?b\b)[^>]*>/g, ""));

                        // filter out line that starts with "*"
                        paragraphs = paragraphs.filter((p) => !p.startsWith("*"));

                        setHtml(html);

                        const excelData = convertToExcel(
                            paragraphs.join(" "),
                            file.name.replace("docx", "xlsx")
                        );
                        setExcelData(excelData);

                        setStages(STAGES.restart);
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            } catch (error) {
                console.error("Error extracting text: ", error);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleButtonClick = () => {
        if (stages.name.localeCompare(STAGES.starting.name) == 0) {
            setStages(STAGES.convert);
            setExcelData([]);
        } else if (stages.name.localeCompare(STAGES.convert.name) == 0) {
            startConvert();
        } else if (stages.name.localeCompare(STAGES.restart.name) == 0) {
            setHtml("");
            setExcelData([]);
            setStages(STAGES.starting);
        } else {
            window.location.reload();
        }
    };

    const MainContent = () => {
        if (stages.name.localeCompare(STAGES.starting.name) == 0) {
            return <FileUpload onFileUpload={onFileUpload} />;
        } else {
            return (
                <Stack align="center">
                    <>
                        <Text span>{message}</Text>
                        <Text
                            span
                            fw={900}
                        >
                            {boldMessage}
                        </Text>
                    </>

                    <Button
                        onClick={handleButtonClick}
                        gradient={{ from: "blue", to: "cyan", deg: 124 }}
                        variant="gradient"
                        mt={"lg"}
                        size="lg"
                    >
                        {button}
                    </Button>
                </Stack>
            );
        }
    };

    const OutputTable = () => {
        if (excelData.length == 0) {
            return null;
        }

        // remove 1st row
        const header = excelData.shift();

        const data: TableData = {
            head: [
                "#",
                "Question",
                "Option A",
                "Option B",
                "Option C",
                "Option D",
                "Correct Answer",
            ],
            body: excelData.map((row, index) => {
                return [index + 1, row[0], row[2], row[3], row[4], row[5], row[6]];
            }),
        };

        return (
            <Stack
                align="center"
                mt={"lg"}
                gap={"2rem"}
            >
                <Text
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan", deg: 124 }}
                    size="1.5rem"
                    fw={900}
                >
                    Preview Output
                </Text>

                <Table.ScrollContainer minWidth={550}>
                    <Table
                        stickyHeader
                        horizontalSpacing="md"
                        verticalSpacing="sm"
                        striped
                        highlightOnHover
                        withTableBorder
                        withColumnBorders
                        data={data}
                    />
                </Table.ScrollContainer>
            </Stack>
        );
    };

    return (
        <Container
            p={"lg"}
            className="w-full"
        >
            <Stack
                align="center"
                justify="center"
                gap="3rem"
                m={"sm"}
            >
                <Text
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan", deg: 124 }}
                    size="2rem"
                    fw={900}
                    mt={"lg"}
                >
                    Quizizz Converter
                </Text>

                <Box className="w-full">
                    <Center className="w-full">
                        <MainContent />
                    </Center>
                </Box>

                <OutputTable />
            </Stack>
        </Container>
    );
};

export default QuizizzPage;
