import { useState } from "react";
import { Modal, Text, TextInput, NumberInput, SimpleGrid, Space, Button } from "@mantine/core";
import { DatePickerInput, DatePicker } from "@mantine/dates";
import * as r4 from "fhir/r4";
import SexSelect from "../core/select/SexSelect";

type Sex = r4.Patient["gender"];
interface IPatientDetailsModal {
    opened: boolean;
    sex: Sex | undefined;
    gestationalAge: number | undefined;
    birthWeight: number | undefined;
    age: number | undefined;
    therapyDay: number | undefined;
    dosingWeight: number | undefined;
    ward: string | undefined;

    onSave: (sex: Sex, gestationalAge: number, birthWeight: number, age: number, therapyDay: number, dosingWeight: number, ward: string) => void;
    onClose: () => void;
}

export default function PatientDetailsModal(props: IPatientDetailsModal) {
    const [sex, setSex] = useState<Sex>(props.sex);
    const [gestationalAge, setGestationalAge] = useState<string | number | undefined>(props.gestationalAge);
    const [birthWeight, setBirthWeight] = useState<string | number | undefined>(props.birthWeight);
    const [age, setAge] = useState<string | number | undefined>(props.age);
    const [therapyDay, setTherapyDay] = useState<string | number | undefined>(props.therapyDay);
    const [dosingWeight, setWeight] = useState<string | number | undefined>(props.dosingWeight);
    const [ward, setWard] = useState<string>(props.ward ?? "");

    return (
        <Modal title={<Text>Patient Details</Text>} size="md" padding="md" radius="lg" opened={props.opened} onClose={props.onClose}>
            <Text c="gray" size="sm">Edit or modify fields.</Text>

            <SimpleGrid cols={2} spacing="md">
                <SexSelect sex={sex} setSex={setSex} />
                <NumberInput label="Gestational Age (weeks)" placeholder="Enter gestational age" min={0} value={gestationalAge} onChange={setGestationalAge} />
                <NumberInput label="Birth Weight (kgs)" placeholder="Enter birth weight" min={0} value={birthWeight} onChange={setBirthWeight} />
                <NumberInput label="Age (years)" placeholder="Enter age" min={0} value={age} onChange={setAge} />
                <NumberInput label="Therapy Day" placeholder="Enter therapy day" min={0} value={therapyDay} onChange={setTherapyDay} />
                <NumberInput label="Dosing Weight (kgs)" placeholder="Enter dosing weight" min={0} value={dosingWeight} onChange={setWeight} />
                <TextInput label="Ward" placeholder="Enter ward" value={ward} onChange={(e) => setWard(e.target.value)} />
            </SimpleGrid>

            <Space h={20} />
            <Button w="100%" radius="md" my={10} color="black" variant="filled" onClick={() => props.onSave(
                sex, Number(gestationalAge), Number(birthWeight), Number(age), Number(therapyDay),
                Number(dosingWeight), ward)}>Save</Button>
            <Button w="100%" radius="md" my={10} color="gray" variant="subtle" onClick={props.onClose}>Discard</Button>
        </Modal>
    );
}