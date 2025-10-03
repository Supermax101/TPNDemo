import { Button } from "@mantine/core";
import { IconDoorEnter, IconDoorExit } from "@tabler/icons-react";

export interface IShowParametersButtonProps {
    isShowingParameters: boolean;
    onClick: () => void;
}

export default function ShowParametersButton(props: IShowParametersButtonProps) {
    return (
        <Button
            size="lg"
            radius="xl"
            onClick={props.onClick}
            leftSection={props.isShowingParameters ? <IconDoorExit /> : <IconDoorEnter />}
        >
            {props.isShowingParameters ? "Hide Parameters" : "Show Parameters"}
        </Button>
    );
}