import { IInputs, IOutputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
//REACT
import * as React from 'react';
import * as ReactDOM from 'react-dom';
//FLUENTUI
import { initializeIcons } from '@fluentui/react/lib/Icons';
//import { error } from "console";

//CUSTOM
//import { CheckListApp, ICheckListProps } from './components/CheckListApp';
//import { runInThisContext } from "vm";

type DataSet = ComponentFramework.PropertyTypes.DataSet;
initializeIcons(undefined, { disableWarnings: true });

interface IQuestionProps {
    title: string;
    questionId: string;
    state: string;
    required: boolean;
    order: number;
    type: string;
    questionOptionGuid: string;
    questionOptionValue: string;
    optionsToRemove: [];
    antecedent: IQuestionProps;
}
interface IQuestionOptionProps {
    title: string;
    optionGuid: string;
    state: string;
    dependencyGuids: string;
    order: number;
    type: string;
    optionLabel: string;
    optionValue: string;
    selected: boolean;
    questionGuid: string;
}

enum ChecklistState {
    Active,
    Inactive
}

interface ICheckListProps {
    title: string;
    guid: string;
    state: ChecklistState;
    template: boolean;
    questions: IQuestionProps;
}

export class checklistv1 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _context: ComponentFramework.Context<IInputs>;
    private _container: HTMLDivElement;
    private _sectionDiv: HTMLDivElement;
    private _submitButton: HTMLButtonElement;
    private _answerJson: any[];
    private _checkListGuid: string;
    

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
        this._answerJson = [];
        this._checkListGuid = '';
        //context.mode.trackContainerResize(true);

    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {
        console.log('updateView---------------------');

        //this._appprops.dataset = context.parameters.sampleDataSet;
        //this._appprops.isTemplate = false;
        //this._appprops.util = context.utils;
        //// RENDER React Component
        //ReactDOM.render(
        //    React.createElement(CheckListApp, this._appprops),
        //    this._container
        //);


        //Application Begins here
        //Get all sections from the Grid
        const sections = this._context.parameters.sampleDataSet.records;
        let pageParams = this._context as any;
        //Get all properties of the current checklist record, only name and Guid are sent by framework
        const checkList = await this.retrieveChecklist(pageParams.page.entityId);
        //Get all Questions related to the sections
        const questionsResponse = await this.retrieveQuestions(sections);
        //Get all question Options related to the Questions
        const optionsResponse = await this.retrieveQuestionOptions(questionsResponse);


        //Render Checlist Form
        this.renderCheckList(questionsResponse, optionsResponse, checkList);
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

    private async retrieveChecklist(guid: any) {
        const response = await this._context.webAPI.retrieveRecord("xix_checklist", guid);


        if (response) {
            return response;
        }
        return null;
    }

    private async retrieveQuestions(sections: any) {
        let requestArray = [] as any;
        for (const key in sections) {

            let request = '?$filter=_xix_checklistsection_value eq ' + key;

            requestArray.push(this._context.webAPI.retrieveMultipleRecords("xix_question", request));
        }

        const response = await Promise.all(requestArray);

        
        if (response) {
            return response;
        }
        return null;
    }

    private async retrieveQuestionOptions(questions: any) {
        let requestArray = [] as any;
        for (var i = 0; i < questions.length; i++) {
            let currentQuestionSection = questions[i];
            for (var j = 0; j < currentQuestionSection.entities.length; j++) {
                let request = '?$filter=_xix_question_value eq ' + currentQuestionSection.entities[j].xix_questionid;
                requestArray.push(this._context.webAPI.retrieveMultipleRecords("xix_questionoption", request));
            }

        }

        const response = await Promise.all(requestArray);
        if (response) {

            return response;
        }
        return null;
    
    }

    private async renderCheckList(questions: any, options: any, checklist: any) {

        //Checklist params
        this._checkListGuid = checklist.xix_checklistid;
        const checklistGuid = checklist.xix_checklistid;
        const checklistTitle = checklist.xix_checklistname;
        const checklistTemplate = checklist.xix_istemplate; //false/true
        const checklistState = checklist.statecode; //0/1
        const checklistStatus = checklist.statuscode;
        const checklistAddText = checklist.xix_checklistadditionaltext;


        //Create Form Div
        const sections = this._context.parameters.sampleDataSet.records;
        let formDiv = document.createElement('div');
        formDiv.style.textAlign = 'center';
        formDiv.style.padding = '50px';       

        //Check the State of Checlist Record and update properties
        let formState = (checklistState == 1 ? true : false);
        let currentSectionDiv = document.createElement('div');
        currentSectionDiv.id = 'MSKCC-TopDiv';
        formDiv.appendChild(currentSectionDiv);

        //Create Question Divs and controls
        for (const key in sections) {
            //For each Section Record Loop questions
            let currentSection = sections[key] as any;
            const sectionGuid = currentSection._record.identifier.id.guid;
            const sectionTitle = currentSection._record.fields.xix_checklistsectiontitle.value;
            const sectionRequired = currentSection._record.fields.xix_requiredsection.label; //YES/NO
            const sectionText = currentSection._record.fields.xix_sectionhinttext?.value;
            const sectionAddText = currentSection._record.fields.xix_sectionadditionaltext?.value;
            const associatedQuestions = questions.filter((question: any) => {
                if (question.entities[0]._xix_checklistsection_value === sectionGuid) return question;
            });

            //Create Section Div
            let currentSectionHeader = document.createElement('h1');
            currentSectionHeader.innerHTML = sectionTitle;
            currentSectionHeader.style.backgroundColor = 'lightgray';


            currentSectionDiv.appendChild(currentSectionHeader);
            //If the current Section has Questions develop disaplay
              if (associatedQuestions[0]) {                   
                    associatedQuestions[0].entities.forEach((question: any) => {
                        //console.log(question);
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
                        let questionVisible = 'visible'; //hidden

                        //Check if it has no antecent question or question option,andd update visibility
                        if ((question._xix_antecedentoption_value || question._xix_antecedentquestion_value) && checklistState === 0) {
                            console.log('ANTECEDENT record');
                            questionVisible = 'hidden';

                        }
                        
                        //Question Div
                        let questionDiv = document.createElement('div');
                        questionDiv.id = questionGuid;
                        questionDiv.innerHTML = questionTitle;
                        questionDiv.className = 'question';
                        questionDiv.style.padding = '10px';
                        //Hide/Show Div
                        questionDiv.style.visibility = questionVisible;


                        //create question component per question type
                        //Radio
                        if (question.xix_questiontype === 596810001) {
                            let choicesDiv = document.createElement('div');                           
                            //Question Options
                            options.forEach((option: any) => {
                                option.entities.forEach((optionPiece: any) => {
                                    if (optionPiece._xix_question_value === questionGuid) {

                                        let choicesControl = document.createElement('input');
                                        choicesControl.type = 'radio';
                                        choicesControl.name = questionGuid;
                                        

                                        choicesControl.id = optionPiece.xix_questionoptionid;
                                        if (optionPiece.xix_selected == true) {
                                            choicesControl.checked = true;
                                        }
                                        choicesDiv.appendChild(choicesControl);
                                        choicesControl.disabled = formState;
                                        //The question will have antecedent so add the guid at the control level
                                        if (question.xix_dependencyguids) {
                                            let dependencyAttr = document.createAttribute('data-dependency');
                                            dependencyAttr.value = question.xix_dependencyguids;
                                            choicesControl.attributes.setNamedItem(dependencyAttr);
                                        }
                                        
                                        //Control Event
                                        choicesControl.addEventListener('change', this.OnItemSelectionRadio.bind(this));

                                        //If dependency is at the Option level at the dependency here
                                        let choicesControlLabel = document.createElement('label');
                                        choicesControlLabel.id = optionPiece.xix_optionvalue;
                                        choicesControlLabel.innerHTML = optionPiece.xix_optionlabel;

                                        choicesDiv.appendChild(choicesControlLabel);
                                    }
                                   
                                });

                            });

                            questionDiv.appendChild(choicesDiv);
                            currentSectionDiv.appendChild(questionDiv);
                        }

                        //Drop-down
                        if (question.xix_questiontype === 596810000) {
                            let dropdownDiv = document.createElement('div');
                            let dropdownControl = document.createElement('select');
                            dropdownControl.id = questionGuid;
                            dropdownControl.disabled = formState;
                            //The question will have antecedent so add the guid at the control level
                            if (question.xix_dependencyguids) {
                                let dependencyAttr = document.createAttribute('data-dependency');
                                dependencyAttr.value = question.xix_dependencyguids;
                                dropdownControl.attributes.setNamedItem(dependencyAttr);
                            }
                            dropdownControl.addEventListener('change', this.OnItemSelectionDropdown.bind(this));

                            options.forEach((option: any) => {
                                option.entities.forEach((optionPiece: any) => {
                                    if (optionPiece._xix_question_value === questionGuid) {
                                        let controlOption = document.createElement('option');
                                        controlOption.value = optionPiece.xix_optionvalue;
                                        controlOption.text = optionPiece.xix_optionlabel;
                                        controlOption.id = optionPiece.xix_questionoptionid;
                                        if (optionPiece.xix_selected == true) {
                                            controlOption.selected = true;
                                        }
                                        //If dependency is at the Option level at the dependency here
                                        dropdownControl.add(controlOption);
                                    }
                                    
                                });

                            });

                            dropdownDiv.appendChild(dropdownControl);
                            questionDiv.appendChild(dropdownDiv)
                            currentSectionDiv.appendChild(questionDiv);

                        }

                        //Text Area
                        if (question.xix_questiontype === 596810003) {
                            let textareaDiv = document.createElement('div');
                            let textareaControl = document.createElement('textarea');
                            textareaControl.id = questionGuid;
                            textareaControl.innerHTML = questionTextResponse;
                            textareaControl.rows = 4;
                            textareaControl.disabled = formState;
                            //The question will have antecedent so add the guid at the control level
                            if (question.xix_dependencyguids) {
                                let dependencyAttr = document.createAttribute('data-dependency');
                                dependencyAttr.value = question.xix_dependencyguids;
                                textareaControl.attributes.setNamedItem(dependencyAttr);
                            }
                            textareaControl.addEventListener('change', this.OnItemSelectionTextarea.bind(this));

                            textareaDiv.appendChild(textareaControl);
                            questionDiv.appendChild(textareaDiv);
                            currentSectionDiv.appendChild(questionDiv);
                       
                        }
                                                                 

                    });
                                      
              }
                
        }
       
        //Buttons div
        this._container.appendChild(formDiv);
        this._submitButton = this.createSubmitButton('Submit', formState, this.OnSubmit.bind(this));
        this._container.appendChild(this._submitButton);

    }



    private createSubmitButton(buttonLabel: string, buttonState: boolean, onClickHandler: (event?: any) => void): HTMLButtonElement {

        const button: HTMLButtonElement = document.createElement("button");
        button.innerHTML = buttonLabel;
        button.disabled = buttonState;
        button.style.marginLeft = '50%';

        button.addEventListener('click', onClickHandler);
        return button;

    }

    private async OnItemSelectionDropdown(evt: any) {
        
        //Check if we have Dependent questions
        if (evt.srcElement.attributes.getNamedItem('data-dependency')) {
            let dependentGuid = evt.srcElement.attributes.getNamedItem('data-dependency').nodeValue;
            let hiddenEl = document.getElementById(dependentGuid);

            if (hiddenEl) {
                if (hiddenEl.style.visibility === 'hidden') {
                    hiddenEl.style.visibility = 'visible';
                }
                else {
                    hiddenEl.style.visibility = 'hidden';
                }

            }


        }

        //Implement handling of any events on Question selection
        //Get Question GUID from Question Div
        //Get Selected item Value and Guid for question option record
        let questionGuid = evt.target.id;
        let questionDependencyGuid = null;
        if (evt.target.dataset.dependency) {
            questionDependencyGuid = evt.target.dataset.dependency;
        }
        let questionOptionGuid = evt.target.selectedOptions.item(0).id;
        let questionOptionValue = evt.target.selectedOptions.item(0).value;

        let allOptions = evt.path[1].children.item(0).options;//all dropdown options html
        let optionsToRemove = [] as any;
        if (this._answerJson.length > 0) {
            for (let i = 0; i < allOptions.length; i++) {
                let currentOption = allOptions[i];
                if (currentOption.tagName === 'OPTION') {
                    if (questionOptionGuid !== currentOption.id) {
                        optionsToRemove.push(currentOption.id);
                        this._answerJson = this._answerJson.filter((x: any) => {
                            return x.questionoptionId !== currentOption.id;
                        });
                    }

                }
            }
        }

        let obj = {} as any;
        obj.questionGuid = questionGuid;
        obj.questionDependency = questionDependencyGuid;
        obj.questionoptionId = questionOptionGuid;
        obj.questionoptionValue = questionOptionValue;
        obj.optionsToRemove = optionsToRemove;
        this._answerJson.push(obj);
    }

    private async OnItemSelectionRadio(evt: any) {

        //Check if we have Dependent questions
        if (evt.srcElement.attributes.getNamedItem('data-dependency')) {
            let dependentGuid = evt.srcElement.attributes.getNamedItem('data-dependency').nodeValue;
            let hiddenEl = document.getElementById(dependentGuid);

            if (hiddenEl) {
                if (hiddenEl.style.visibility === 'hidden') {
                    hiddenEl.style.visibility = 'visible';
                }
                else {
                    hiddenEl.style.visibility = 'hidden';
                }
                
            }
            

        }

        //Implement handling of any events on Question selection
        //Get Question GUID from Question Div
        //Get Selected item Value and Guid for question option record
        let questionGuid = evt.target.name;
        let questionDependencyGuid = null;
        if (evt.target.dataset.dependency) {
            questionDependencyGuid = evt.target.dataset.dependency;
        }
        let questionOptionGuid = evt.target.id;//questionGuid
        let questionOptionValue = evt.target.nextElementSibling.id;//questionOption Guid

        let allOptions = evt.path[1].children;
        let optionsToRemove = [] as any;
        if (this._answerJson.length > 0) {
            for (let i = 0; i < allOptions.length; i++) {
                let currentOption = evt.path[1].children.item(i);
                if (currentOption.tagName === 'INPUT') {
                    if (questionOptionGuid !== evt.path[1].children.item(i).id) {
                        optionsToRemove.push(evt.path[1].children.item(i).id);
                        this._answerJson = this._answerJson.filter((x: any) => {
                            return x.questionoptionId !== evt.path[1].children.item(i).id;
                        });
                    }                  
                    
                }
            }                  
        }

        //let questionToAdd: IQuestionProps;
        //questionToAdd.questionId = questionGuid;

        let obj = {} as any;
        obj.questionGuid = questionGuid;
        obj.questionDependency = questionDependencyGuid;
        obj.questionoptionId = questionOptionGuid;
        obj.questionoptionValue = questionOptionValue;
        obj.optionsToRemove = optionsToRemove;
        this._answerJson.push(obj);

    }

    private async OnItemSelectionTextarea(evt: any) {

        //Check if we have Dependent questions
        if (evt.srcElement.attributes.getNamedItem('data-dependency')) {
            let dependentGuid = evt.srcElement.attributes.getNamedItem('data-dependency').nodeValue;
            let hiddenEl = document.getElementById(dependentGuid);

            if (hiddenEl) {
                if (hiddenEl.style.visibility === 'hidden') {
                    hiddenEl.style.visibility = 'visible';
                }
                else {
                    hiddenEl.style.visibility = 'hidden';
                }

            }


        }

        //Implement handling of any events on Question selection
        //Get Question GUID from Question Div
        //Get text from textarea and update

        let questionGuid = evt.target.id;
        let questionDependencyGuid = null;
        if (evt.target.dataset.dependency) {
            questionDependencyGuid = evt.target.dataset.dependency;
        }

        let questionTextValue = evt.target.value;//questionOption Guid
        let obj = {} as any;
        obj.questionGuid = questionGuid;
        obj.questionDependency = questionDependencyGuid;
        obj.questionText = questionTextValue;
        this._answerJson.push(obj);

    }
    //When the Submit Button is clicked
    private async OnSubmit(evt: any) {

        //Check the answer object, if null don't process
        if (this._answerJson && this._answerJson.length > 0) {
            this._context.navigation.openConfirmDialog(
                { title: "Submit Survey", text: "Are you sure you want to Submit?" },
                { height: 200, width: 450 }
            ).then((success) => {
                if (success.confirmed) {
                    //Run the Process
                    //for every question update the record
                    
                    for (var i = 0; i < this._answerJson.length; i++) {

                        let question = {} as any;
                        //question.statecode = 1;
                        if (this._answerJson[i].questionText) {
                            question.xix_textfieldresponse = this._answerJson[i].questionText;
                        }
                        this._context.webAPI.updateRecord("xix_question", this._answerJson[i].questionGuid, question);
                        //Check for Question Options
                        if (this._answerJson[i].questionoptionId) {
                            let questionOption = {} as any;
                            questionOption.xix_selected = true;
                            questionOption.xix_optionvalue = this._answerJson[i].questionoptionValue;
                            this._context.webAPI.updateRecord("xix_questionoption", this._answerJson[i].questionoptionId, questionOption);
                        }
                    }

                    //update current checklist to inactive and refresh page
                    let checklist = {} as any;
                    checklist.statecode = 1;
                    this._context.webAPI.updateRecord("xix_checklist", this._checkListGuid, checklist).then((success) => {
                        //Refresh Page
                        this._context.navigation.openForm({
                            entityName: "xix_checklist",
                            entityId: this._checkListGuid
                        });
                    },
                        (error) => {
                            console.log(error);
                        }

                    );
                    

                }
                else {
                    console.log('Nothing happens');
                }
            });

        }

    }

}