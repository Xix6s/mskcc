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


    /**
     * Empty constructor.
     */
    constructor() {
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        console.log('INIT-------------------------------------');
        console.log(context);
        this._context = context;
        this._container = container;
        this._checkListGuid = context.mode.contextInfo.entityId;
        //this._checkListGuid = context.utils.getEntityMetadata.arguments;



    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {
        console.log('updateView---------------------');

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

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        console.log('INDEX - getOutputs------------------------');
        console.log(this);
        return {
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
        ReactDOM.unmountComponentAtNode(this._container);
    }



}