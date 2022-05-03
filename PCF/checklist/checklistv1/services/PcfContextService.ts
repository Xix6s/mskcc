import { IInputs } from '../generated/ManifestTypes'

export interface IPcfContextServiceProps {
    context: ComponentFramework.Context<IInputs>;
    onChange: (selectedOption?: ComponentFramework.LookupValue[] | undefined) => void;
}

export class PcfContextService {

    constructor(props?: IPcfContextServiceProps) {
        console.log('PcfContextService----------------');
        console.log(props);
        if (props) {


        }
    }
}