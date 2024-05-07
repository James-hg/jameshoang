import { Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, DropzoneProps, MS_WORD_MIME_TYPE } from "@mantine/dropzone";

export function FileUpload() {
    return (
        <Dropzone
            onDrop={(file) => console.log("dropped file", file)}
            onReject={(files) => console.log("rejected files", files)}
            maxSize={5 * 1024 ** 2}
            accept={MS_WORD_MIME_TYPE}
        >
            <Group
                justify="center"
                gap="xl"
                mih={220}
                style={{ pointerEvents: "none" }}
            >
                <Dropzone.Accept>
                    <IconUpload
                        style={{
                            width: rem(52),
                            height: rem(52),
                            color: "var(--mantine-color-blue-6)",
                        }}
                        stroke={1.5}
                    />
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <IconX
                        style={{
                            width: rem(52),
                            height: rem(52),
                            color: "var(--mantine-color-red-6)",
                        }}
                        stroke={1.5}
                    />
                </Dropzone.Reject>
                <Dropzone.Idle>
                    <IconPhoto
                        style={{
                            width: rem(52),
                            height: rem(52),
                            color: "var(--mantine-color-dimmed)",
                        }}
                        stroke={1.5}
                    />
                </Dropzone.Idle>

                <div>
                    <Text
                        size="xl"
                        inline
                    >
                        Drag DOCX file here or click to select file
                    </Text>
                </div>
            </Group>
        </Dropzone>
    );
}
