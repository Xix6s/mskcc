import { IInputs, IOutputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
//REACT
import * as React from 'react';
import * as ReactDOM from 'react-dom';
//FLUENTUI
import { initializeIcons } from '@fluentui/react/lib/Icons';


//CUSTOM
import { CheckList, ICheckListProps } from './components/CheckList';


type DataSet = ComponentFramework.PropertyTypes.DataSet;
initializeIcons(undefined, { disableWarnings: true });


export class checklistv1 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _context: ComponentFramework.Context<IInputs>;
    private _container: HTMLDivElement;
    private _checkListGuid: any;
    constructor() {
    }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._context = context;
        this._container = container;
        this._checkListGuid = context.mode.contextInfo.entityId;

    }

    public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {

        this._context = context;
        let properties: ICheckListProps = {} as ICheckListProps;
        properties.guid = this._checkListGuid;
        properties.pcfContext = this._context;
        properties.onSubmit = this.onSubmit;
        // RENDER React Component
        ReactDOM.render(
            React.createElement(CheckList, properties),
            this._container
        );
       
    }

    public onSubmit(event: any): void {
        console.log('onSubmit------------------');
        console.log(event);
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
        ReactDOM.unmountComponentAtNode(this._container);
    }

}