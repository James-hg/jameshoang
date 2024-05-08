"use client";
import React, { useEffect, useState } from "react";
import mammoth from "mammoth";
import convertToExcel from "@/server/quizizz-converter";
import { Center, Container, Text, Stack, Box, Button, ScrollArea } from "@mantine/core";
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
    const [bold, setBold] = useState<string>("");
    const [button, setButton] = useState<string>("");

    useEffect(() => {
        if (stages.name.localeCompare(STAGES.starting.name) == 0) {
            setMessage("");
            setBold("");
            setButton("");
        } else if (stages.name.localeCompare(STAGES.convert.name) == 0) {
            setMessage(`Successfully Uploaded `);
            setBold(file?.name + " 📄");
            setButton("Convert and Download Excel File 📊");
        } else if (stages.name.localeCompare(STAGES.restart.name) == 0) {
            setMessage(`Successfully Downloaded `);
            setBold(file?.name.replace("docx", "xlsx") + " 🎉");
            setButton("Convert Another File 🔄");
        } else {
            setMessage("Something went wrong! Please try again. 😥");
            setBold("");
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
                        convertToExcel(paragraphs.join(" "), file.name.replace("docx", ".xlsx"));

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
        } else if (stages.name.localeCompare(STAGES.convert.name) == 0) {
            startConvert();
        } else if (stages.name.localeCompare(STAGES.restart.name) == 0) {
            setHtml("");
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
                            {bold}
                        </Text>
                    </>

                    <Button
                        onClick={handleButtonClick}
                        color={stages.color}
                    >
                        {button}
                    </Button>
                </Stack>
            );
        }
    };

    return (
        <Container
            p={"lg"}
            className="w-full"
        >
            <Stack
                align="center"
                justify="center"
                gap="lg"
            >
                <Text
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan", deg: 124 }}
                    size="2rem"
                    fw={900}
                >
                    Quizizz Converter
                </Text>

                <Box className="w-full">
                    <Center className="w-full">
                        <MainContent />
                    </Center>
                </Box>

                <div
                    id="output"
                    dangerouslySetInnerHTML={{ __html: html }}
                    style={{ width: "90%", maxWidth: "800px" }}
                ></div>
            </Stack>
        </Container>
    );
};

export default QuizizzPage;
