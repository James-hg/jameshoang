"use client";
import React, { useState } from "react";
import mammoth from "mammoth";
import convertToCSV from "@/server/quizizz-converter";
import { Center, Container, Text, Stack, Box } from "@mantine/core";

const STAGES = {
    starting: {
        name: "starting",
        message: "Upload a DOCX file to get started",
        color: "black",
    },
    convert: {
        name: "convert",
        message: "Convert and Download CSV",
        color: "black",
    },
};

const QuizizzPage = () => {
    const [stages, setStages] = useState(STAGES.starting);
    const [file, setFile] = useState<File | null>(null);
    const [html, setHtml] = useState<string>("");

    const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files?.[0];

        if (!file) {
            return;
        }

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

            try {
                mammoth
                    .convertToHtml({ arrayBuffer: content })
                    .then(function (result) {
                        var html = result.value; // The generated HTML
                        setHtml(html);
                        var messages = result.messages; // Any messages, such as warnings during conversion
                        let paragraphs = html.split(/<p>|<\/p>/);
                        paragraphs = paragraphs.filter((p) => p.trim().length > 0);

                        convertToCSV(paragraphs, file.name);
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

    const FileUploader = () => {
        return (
            <label
                id="uploadFile1"
                className="font-semibold text-base rounded w-full h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif]"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-11 mb-2 fill-gray-500"
                    viewBox="0 0 32 32"
                >
                    <path
                        d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                        data-original="#000000"
                    />
                    <path
                        d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                        data-original="#000000"
                    />
                </svg>
                Upload file
                <input
                    type="file"
                    name="docx-reader"
                    className="hidden"
                    onChange={onFileUpload}
                    accept=".docx"
                />
                <p className="text-xs font-medium text-gray-400 mt-2">Only DOCX is supported</p>
            </label>
        );
    };

    const MainContent = () => {
        if (stages.name.localeCompare(STAGES.starting.name) == 0) {
            return <FileUploader />;
        } else if (stages.name.localeCompare(STAGES.convert.name) == 0) {
            return (
                <Stack align="center">
                    <Text>Successfully Uploaded {file?.name}</Text>

                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={startConvert}
                    >
                        {STAGES.convert.message}
                    </button>
                </Stack>
            );
        } else {
            return (
                <Center>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setStages(STAGES.starting)}
                    >
                        Upload another file
                    </button>
                </Center>
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
                >
                    {/* {html} */}
                </div>
            </Stack>
        </Container>
    );
};

export default QuizizzPage;
