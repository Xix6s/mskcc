import { IInputs, IOutputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
//REACT
import * as React from 'react';
import * as ReactDOM from 'react-dom';
//FLUENTUI
import { initializeIcons } from '@fluentui/react/lib/Icons';

//CUSTOM
//import { CheckListApp, ICheckListProps } from './components/CheckListApp';
//import { runInThisContext } from "vm";

type DataSet = ComponentFramework.PropertyTypes.DataSet;
initializeIcons(undefined, { disableWarnings: true });

export class checklistv1 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _context: ComponentFramework.Context<IInputs>;
    private _container: HTMLDivElement;
    private _formContainer: HTMLElement;
    //private _appprops: ICheckListProps;

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
        this._notifyOutputChanged = notifyOutputChanged;
        this._context = context;
        this._container = container;
        context.mode.trackContainerResize(true);
        //this._formContainer = new HTMLDivElement();
        //this._formContainer.innerHTML = '';
        //this.renderCheckList(context);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {
        console.log('updateView---------------------');

        //this._appprops.dataset = context.parameters.sampleDataSet;
        ////Is this only a Template? **CHANGE THE HARD CODE
        //this._appprops.isTemplate = false;
        //this._appprops.util = context.utils;
        //// RENDER React Component
        //ReactDOM.render(
        //    React.createElement(CheckListApp, this._appprops),
        //    this._container
        //);

        const sections = this._context.parameters.sampleDataSet.records;

        const questionsResponse = await this.retrieveQuestions(sections);
        //console.log(questionsResponse);
        const optionsResponse = await this.retrieveQuestionOptions(questionsResponse);
        //console.log(optionsResponse);


        this.renderCheckList(questionsResponse, optionsResponse);
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

    private async retrieveQuestions(sections: any) {
        console.log('retrieveQuestions-------------------');
        //console.log(sections);
        let requestArray = [] as any;
        for (const key in sections) {

            let request = '?$filter=_xix_checklistsection_value eq ' + key;

            requestArray.push(this._context.webAPI.retrieveMultipleRecords("xix_question", request));
        }

        const response = await Promise.all(requestArray);
        //console.log(response);

        
        if (response) {
            return response;
        }
        return null;
    }

    private async retrieveQuestionOptions(questions: any) {
        console.log('retrieveQuestionOptions-------------------');
        //console.log(questions);

        let requestArray = [] as any;
        for (var i = 0; i < questions.length; i++) {
            let currentQuestionSection = questions[i];
            for (var j = 0; j < currentQuestionSection.entities.length; j++) {
                let request = '?$filter=_xix_question_value eq ' + currentQuestionSection.entities[j].xix_questionid;
                requestArray.push(this._context.webAPI.retrieveMultipleRecords("xix_questionoption", request));
            }

        }

        const response = await Promise.all(requestArray);
        //console.log(response);
        if (response) {

            return response;
        }
        return null;
    
    }

    private async renderCheckList(questions: any, options: any) {
        console.log('renderCheckList---------------');
        console.log(questions);
        console.log(options);


        let formHtml = '<div style="text-align: center;padding: 50px;">';
        const sections = this._context.parameters.sampleDataSet.records;

        for (const key in sections) {

            let currentSection = sections[key] as any;
            console.log(currentSection);
            const sectionGuid = currentSection._record.identifier.id.guid;
            const sectionTitle = currentSection._record.fields.xix_checklistsectiontitle.value;
            const sectionRequired = currentSection._record.fields.xix_requiredsection.label; //YES/NO
            const sectionText = currentSection._record.fields.xix_sectionhinttext?.value;
            const sectionAddText = currentSection._record.fields.xix_sectionadditionaltext?.value;
            const associatedQuestions = questions.filter((question: any) => {
                if (question.entities[0]._xix_checklistsection_value === sectionGuid) return question;
            });
            console.log(associatedQuestions);

            formHtml += `<h1 style="background-color: lightgray;">` + sectionTitle + `</h1>`;

            for (var i = 0; i < associatedQuestions.length; i++) {
                if (associatedQuestions[i]) {                   
                    console.log(associatedQuestions[i]);
                    associatedQuestions[i].entities.forEach((question: any) => {
                        console.log(question);
                        let questionGuid = question.xix_questionid;
                        let questionTitle = question.xix_questiontitle;
                        let questionAddText = (question.xix_questionadditionaltext == null ? '' : question.xix_questionadditionaltext);
                        let questionHintText = question.xix_questionhinttext;
                        let questionAllowMultiselect = question.xix_allowmultiselect; //false/true
                        let questionType = question.xix_questiontype;
                        let questionRequired = question.xix_requiredquestion;
                        let questionSortOrder = question.xix_sortorder;
                        let questionAntecedentOption = question._xix_antecedentoption_value;
                        let questionAntecedentQuestion = question._xix_antecedentquestion_value;
                        let questionTextResponse = (question.xix_textfieldresponse == null ? '' : question.xix_textfieldresponse);

                        //HTML props
                        let questionVisible = ''; //hidden

                        //Check if it has no antecent question or question option,andd update visibility
                        if (question._xix_antecedentoption_value || question._xix_antecedentquestion_value) {
                            console.log('ANTECEDENT record');
                            questionVisible = 'hidden';
                            //formHtml += `<h1>` + associatedQuestions[i].entities[i].xix_questiontitle + `</h1>`;
                        }
                        
                        //Question Div
                        formHtml += `<div id="question-` + questionGuid + `" style="padding: 10px;" ` + questionVisible + ` >`;

                        //Question headers
                        formHtml += `<h3>` + questionTitle + `</h3>`;
                        /*formHtml += `<h3>` + question.xix_questiontitle + `</h3>`;*/


                        //create question component per question type
                        //Radio
                        if (question.xix_questiontype === 596810001) {
                            //let choices = 
                            formHtml += `<div style="padding: 10px;" class="form-check">`;

                            options.forEach((option: any) => {
                                console.log(option);
                                option.entities.forEach((optionPiece: any) => {
                                    console.log(optionPiece);
                                    if (optionPiece._xix_question_value === questionGuid) {
                                        formHtml += `<input type="radio" name="` + questionGuid + `" id="` + optionPiece.xix_questionoptionid + `">
              <label for="` + optionPiece.xix_optionvalue + `">
                ` + optionPiece.xix_optionlabel + `
              </label>`;
                                    }
                                   
                                });

                            });

                            formHtml += `</div>`;

                        }

                        //Drop-down
                        if (question.xix_questiontype === 596810000) {
                            //let choices = 
                            formHtml += `<div style="padding: 10px;"><label for="` + questionGuid + `">Select...</label></br><select name="` + questionGuid + `" id="` + questionGuid + `">`;

                            options.forEach((option: any) => {
                                console.log(option);
                                option.entities.forEach((optionPiece: any) => {
                                    console.log(optionPiece);
                                    if (optionPiece._xix_question_value === questionGuid) {
                                        formHtml += `<option value="` + optionPiece.xix_optionlabel + `">` + optionPiece.xix_optionlabel + `</option>`;
                                    }
                                    
                                });
                                

                                //formHtml += `</select>`;
                            });

                            formHtml += `</select></div>`;

                        }

                        //Text Area
                        if (question.xix_questiontype === 596810003) {
                            //let choices = 
                            formHtml += `<div style="padding: 10px;"><textarea class="form-control" id="` + questionGuid + `" rows="3">` + questionTextResponse + `</textarea></div>`;
                          

                        }

                        


                        formHtml += `</div>`;
                        

                    });

                                      
                }
                
            }
            

            
        }
        
        //Buttons
        formHtml += `<div><button onclick="this.OnSubmit(evt)" type="button">Submit</button></div>`;
        formHtml += `</div>`;

        this._container.innerHTML = formHtml;


    }

    private async OnSubmit(evt: any) {
        console.log(evt);
    }

}