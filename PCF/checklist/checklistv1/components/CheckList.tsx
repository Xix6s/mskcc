/* eslint-disable no-use-before-define */
import * as React from 'react'
import { useState } from 'react'

//CUSTOM


//FLUENT UI
import { initializeIcons, Panel } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack, IStackProps, IStackStyles } from '@fluentui/react/lib/Stack';
import { Spinner } from '@fluentui/react/lib/Spinner';

import { useBoolean } from '@fluentui/react-hooks';
import { IInputs } from '../generated/ManifestTypes';




initializeIcons();

const dropdownStyles = { dropdown: { width: 300 } };


export interface IQuestionProps {
    guid: string;
    sectionGuid?: string;
    title?: string;
    state?: boolean | true;
    required?: boolean;
    order?: number;
    type?: QuestionType;
    responseText?: string;
    questionOptions?: IQuestionOptionsProps[];
    antecedentQuestion?: string;
    antecendentOption?: string;
    dependencyGuid?: string;
    dataFetched?: boolean | false;
    hide?: boolean | true;
}

export interface IQuestionOptionsProps {
    title?: string;
    questionGuid?: string;
    optionLabel?: string;
    optionValue?: string;
    order?: number;
    guid?: string;
    selected?: boolean;
    dependencyGuid?: string;
    state?: string;
    dataFetched?: boolean | false;
    hide?: boolean | true;
}

export interface ISectionProps {
    guid: string;
    title: string;
    state: string;
    required?: boolean;
    order?: number;
    questions?: IQuestionProps[];
    dataFetched?: boolean | false;
}


export interface ICheckListProps {
    title?: string;
    guid: string;
    template: boolean | false;
    state: string;
    sections?: ISectionProps[];
    pcfContext: ComponentFramework.Context<IInputs>,
    renderCompleted: boolean | false;
    onSubmit: (evt: any) => void;
    onCopyClicked: (evt: any) => void;
    dataFetched?: boolean | false;
    onItemChange?: (evt: any) => void;
};

enum QuestionType {
    DropDown = 596810000,
    Radio = 596810001,
    TextArea = 596810003
};



export const CheckList = (props: ICheckListProps) => {

    const [isChechlistCompleted, SetChecklistCompleted] = useState(false);
    const [CheckList, SetCheckList] = useState<ICheckListProps>();
    const [SectionList, SetSectionList] = useState<ISectionProps[]>();
    const [QuestionList, SetQuestionList] = useState<IQuestionProps[]>();
    const [QuestionOptionsList, SetQuestionOptionsList] = useState<IQuestionOptionsProps[]>();
    const [CopiesToMake, SetCopiesToMake] = useState(1);
    const [isChecklistTemplate, SetChecklistTemplate] = useState(false);
    const [isCopyDialogShown, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

    const questionsToSubmit = React.useRef([] as IQuestionProps[]);

    React.useEffect(
        () => {
            if (!CheckList?.dataFetched) {//Populate all Checklist Field data
                getChecklistMetadata();
            }
            else if (CheckList.renderCompleted) {//We are done fetching data, implement final hooks before rendering

            }
            else {
                if (!SectionList) {//Check if have built Section Object
                    setSections(); //If not build it
                }
                if (!QuestionList) {//Check if we have built the Question object
                    getQuestions();
                }
                else if (!QuestionOptionsList) {//Get Options
                    getQuestionOptions();
                }
                else if (SectionList && QuestionList && QuestionOptionsList) {//build object
                    //Here we build object that will be displayed
                    let questionsF: IQuestionProps[] = [];
                    let sectionsF: ISectionProps[] = [];

                    for (let j = 0; j < QuestionList.length; j++) {//For all questions
                        let currQue = QuestionList[j];
                        if (currQue.type !== QuestionType.TextArea) {//Only type without Options
                            let questionOptionsF: IQuestionOptionsProps[] = [];
                            for (let k = 0; k < QuestionOptionsList.length; k++) {//For all Options
                                let currOpt = QuestionOptionsList[k];

                                if (currQue.guid === currOpt.questionGuid) {

                                    questionOptionsF.push(currOpt);
                                }

                            }
                            questionsF.push({
                                sectionGuid: currQue?.sectionGuid,
                                guid: currQue?.guid,
                                state: currQue?.state,
                                title: currQue?.title,
                                order: currQue?.order,
                                required: currQue?.required,
                                antecedentQuestion: currQue?.antecedentQuestion,
                                antecendentOption: currQue?.antecendentOption,
                                responseText: currQue?.responseText,
                                type: currQue?.type,
                                dependencyGuid: currQue?.dependencyGuid,
                                questionOptions: questionOptionsF
                            });
                        }
                        else {//Text ARea type question
                            questionsF.push(currQue);
                        }

                    }

                    for (let i = 0; i < SectionList.length; i++) {
                        let currSec = SectionList[i];
                        let quePush: IQuestionProps[] = [];
                        for (let j = 0; j < questionsF.length; j++) {
                            let currQue = questionsF[j];

                            if (currQue.sectionGuid === currSec.guid) {
                                quePush.push(currQue);
                            }

                        }

                        sectionsF.push({
                            guid: currSec.guid,
                            order: currSec.order,
                            title: currSec.title,
                            required: currSec.required,
                            state: currSec.state,
                            questions: quePush
                        });
                    }

                    //Here is the Checklist that defines that UI
                    let _CheckList: ICheckListProps = {
                        guid: props.guid,
                        pcfContext: props.pcfContext,
                        title: CheckList?.title,
                        template: CheckList?.template ? CheckList?.template : false,
                        state: CheckList?.state ? CheckList?.state : '0',
                        renderCompleted: true,
                        sections: sectionsF,
                        dataFetched: true,
                        onSubmit: OnChecklistSubmit.bind(this),
                        onCopyClicked: OnChecklistCopy.bind(this),
                        onItemChange: OnChecklistItemChange.bind(this)
                    };
                    //Set it to rebuild the UI
                    SetCheckList(_CheckList);
                }
            }


        }
    );

    //Handle on Submit function
    const OnChecklistSubmit = (event: any) => {

        props.pcfContext.navigation.openConfirmDialog(
            { title: "Submit Survey", text: "Are you sure you want to Submit?" },
            { height: 200, width: 450 }
        )
            .then((response: any) => {
                if (questionsToSubmit.current.length > 0) {
                    for (let i = 0; i < questionsToSubmit.current.length; i++) {
                        let currQ = questionsToSubmit.current[i];

                        if (currQ.questionOptions) {//Check if it has Question Options
                            //Update Question to answered
                            let question = {} as any;
                            question.xix_questionanswer = true;
                            props.pcfContext.webAPI.updateRecord("xix_question", currQ.guid, question);

                            for (let j = 0; j < currQ.questionOptions.length; j++) {//Look for Options to Update
                                let currOption = currQ.questionOptions[j]
                                let questionOption = {} as any;
                                questionOption.xix_selected = true;
                                questionOption.xix_optionvalue = currOption.optionValue;
                                props.pcfContext.webAPI.updateRecord("xix_questionoption", currOption.guid as string, questionOption);

                            }

                        }
                        else {//no Options just text area
                            let question = {} as any;
                            question.xix_questionanswer = true;
                            question.xix_textfieldresponse = currQ?.responseText;

                            props.pcfContext.webAPI.updateRecord("xix_question", currQ.guid, question);
                        }

                        if (CheckList) {//Check if not null
                            //Update checklist
                            let checklist = {} as any;
                            checklist.xix_submitteddate = new Date().toISOString();
                            props.pcfContext.webAPI.updateRecord("xix_checklist", CheckList.guid, checklist).then((success) => {
                                //Refresh Page
                                props.pcfContext.navigation.openForm({
                                    entityName: "xix_checklist",
                                    entityId: CheckList.guid
                                });
                            },
                                (error) => {
                                    console.log(error);
                                }

                            );

                           
                        }

                    }
                }

            });

    };

    //Handle the Copying, update number of copies to make on the form field and refresh form
    const OnChecklistCopy = (event: any) => {
        if (CheckList) {         
            for (let i = 0; i < CopiesToMake; i++) {
                let checkl = {} as any;
                checkl.xix_checklistname = CheckList.title;
                checkl.xix_istemplate = false;
                props.pcfContext.webAPI.createRecord('xix_checklist', checkl)
                    .then((sucess) => {

                        //Create Sections if we have any
                        //We only create Checklist and Sections: Questions and Options are handled by Flows
                        if (CheckList.sections) {
                            for (let j = 0; j < CheckList.sections.length; j++) {
                                let currSec = CheckList.sections[j];
                                let sec = {} as any;
                                sec.xix_checklistsectiontitle = currSec.title;
                                sec["xix_ParentCheckList@odata.bind"] = "/xix_checklists(" + sucess.id + ")";
                                sec.xix_requiredsection = currSec.required as any === "Yes" ? true : false;
                                sec.xix_sectionorder = currSec.order;
                                sec["xix_SectionTeamplate@odata.bind"] = "/xix_checklistsections(" + currSec.guid + ")";
                                console.log(sec);
                                props.pcfContext.webAPI.createRecord('xix_checklistsection', sec);
                                                                   
                            }
                            //Refresh to same record
                            props.pcfContext.navigation.openForm({
                                entityName: "xix_checklist",
                                entityId: CheckList.guid
                            });
                            
                        }
                        else {
                            //Refresh to same record
                            props.pcfContext.navigation.openForm({
                                entityName: "xix_checklist",
                                entityId: CheckList.guid
                            });
                        }
                        
                        
                    });
            }

        }

    };


    //Handle on Change events of all form controls
    const OnChecklistItemChange = (event: any, option?: any, index?: any) => {
        
        if (CheckList) {
            if (event.target.localName === 'textarea') {//This is a text area control
                questionsToSubmit.current.push({
                    guid: event.target.id,
                    responseText: option
                });

            }
            else {//This is a Radio or Dropdown control
                //Debug to Complete Dependency Quesitons: this must be a Grid
                console.log(option);
                let opPush: IQuestionOptionsProps[] = []
                //Implelement dependency guid here
                //If there is one we need to rebuild the main Checklist Object to re-render the View with hidden/displayed quesions/options
                if (option.data.dependencyGuid) {//there is a dependency guid get the dependent and set hide to false
                    console.log('dependencyGuid--------------------');
                    console.log(option.data.dependencyGuid);
                }
                opPush.push({
                    guid: option.key,
                    optionValue: option.selected
                });

                questionsToSubmit.current.push({
                    guid: option.id,
                    questionOptions: opPush
                });

                
            }
            
        }   

    };

    //Get all Sections from the Checklist, this is in the Context Parameters
    const setSections = async () => {
        let checklistSections = props.pcfContext.parameters.sampleDataSet.records;      
        let secArray: ISectionProps[] = [];
        for (let sec in checklistSections) {
            console.log(sec);
            let secPush: ISectionProps = {} as ISectionProps;
            let currentSection = checklistSections[sec] as any;
            console.log(currentSection);
            secPush.guid = currentSection._record.identifier.id.guid;
            secPush.order = currentSection._record.fields?.xix_sectionorder.value;
            secPush.title = currentSection._record.fields.xix_checklistsectiontitle.value;
            secPush.required = currentSection._record.fields.xix_requiredsection.label;
            secPush.state = currentSection._record.fields.statecode;
            secArray.push(secPush);           
        }        

        SetSectionList(secArray);

    };

    //Get all fields for the Checklist, here we can add more fields to build the object out.
    const getChecklistMetadata = async () => {     
        props.pcfContext.webAPI.retrieveRecord("xix_checklist", props.guid)
            .then((item) => {
                let checklist: ICheckListProps = {} as ICheckListProps;
                checklist.state = item.statecode;
                checklist.title = item.xix_checklistname;
                checklist.template = item.xix_istemplate;
                checklist.dataFetched = true;
                SetCheckList(checklist);
                SetChecklistTemplate(checklist.template);
                
            })
            .catch((err) => {
                console.log(err);
                
            });
    };

    //Fetch xml to get all question and set Question State
    const getQuestions = async () => {
        if (SectionList) {
            let fetchXml = `<fetch>
                              <entity name="xix_question">
                                <filter type="or">`;


            for (const key in SectionList) {
                fetchXml += `<condition attribute="xix_checklistsection" operator="eq" value="${SectionList[key].guid}" />`;
            }
            fetchXml += `</filter>
                              </entity>
                            </fetch>`;
            props.pcfContext.webAPI.retrieveMultipleRecords('xix_question', `?fetchXml=${fetchXml}`)
                .then((response: ComponentFramework.WebApi.RetrieveMultipleResponse) => {
                    if (response.entities.length > 0) {

                        let questionsList: IQuestionProps[] = [];
                        for (let i = 0; i < response.entities.length; i++) {
                            let currentSection = response.entities[i];
                            let question: IQuestionProps = {
                                guid: currentSection?.xix_questionid,
                                sectionGuid: currentSection?._xix_checklistsection_value,
                                title: currentSection?.xix_questiontitle,
                                state: currentSection?.statecode,
                                required: currentSection?.xix_requiredquestion,
                                order: currentSection?.xix_sortorder,
                                type: currentSection?.xix_questiontype,
                                responseText: currentSection?.xix_textfieldresponse,
                                antecedentQuestion: currentSection?._xix_antecedentquestion_value,
                                antecendentOption: currentSection?._xix_antecedentoption_value,
                                dependencyGuid: currentSection?.xix_dependencyguids
                            }
                            questionsList.push(question);
                        }

                        SetQuestionList(questionsList);


                    }
                    else {//Set a Function for no questions found
                        SetQuestionList([]);
                    }
                });

        }

    };

    //Fetch xml to get all question options and set Options State
    const getQuestionOptions = async () => {
        if (QuestionList) {
            let fetchXml = `<fetch>
                              <entity name="xix_questionoption">
                                <filter type="or">`;

            for (var i = 0; i < QuestionList.length; i++) {

                let currentQuestionGuid = QuestionList[i].guid;
                fetchXml += `<condition attribute="xix_question" operator="eq" value="${currentQuestionGuid}" />`;
            }

            fetchXml += `</filter>
                              </entity>
                            </fetch>`;
            props.pcfContext.webAPI.retrieveMultipleRecords('xix_questionoption', `?fetchXml=${fetchXml}`)
                .then((response: ComponentFramework.WebApi.RetrieveMultipleResponse) => {
                    if (response.entities.length > 0) {

                        let questionsList: IQuestionOptionsProps[] = [];
                        for (let i = 0; i < response.entities.length; i++) {
                            let currentSection = response.entities[i];
                            let question: IQuestionOptionsProps = {
                                guid: currentSection?.xix_questionoptionid,
                                questionGuid: currentSection?._xix_question_value,
                                title: currentSection?.xix_questionoptiontitle,
                                state: currentSection?.statecode,
                                order: currentSection?.xix_sortorder,
                                dependencyGuid: currentSection?.xix_dependencyguids,
                                selected: currentSection?.xix_selected,
                                optionLabel: currentSection.xix_optionlabel,
                                optionValue: currentSection.xix_optionvalue,

                            }
                            questionsList.push(question);
                        }

                        SetQuestionOptionsList(questionsList);
                    }
                    else {//Set a Function for no question options found
                        SetQuestionOptionsList([]);
                    }
                });
        }

    };


    //Method to Render Radio type
    const RenderRadioOptions = (options: IQuestionOptionsProps[], que: IQuestionProps): JSX.Element => {

        let opToReturn = options.map((option: IQuestionOptionsProps): any => {
            return {
                key: option?.guid,//the option record guid
                text: option?.optionLabel,
                selected: option?.optionValue,
                data: {
                    'dependencyGuid': option?.dependencyGuid,
                    'answer': option.optionValue
                },
                id: que?.guid,//the question guid
            };
        });

        let selected = options.find((op: IQuestionOptionsProps) => op.selected === true);

        return (
            <ChoiceGroup
                defaultSelectedKey={selected?.guid}
                options={opToReturn}
                onChange={(evt, option) => OnChecklistItemChange(evt, option)}
                label={que.title}
                required={que?.required}
                data-dependency={que.antecedentQuestion}
            />
        );
    };

    //Method to Render DropDown type
    const RenderDropDownOptions = (options: IQuestionOptionsProps[], que: IQuestionProps): JSX.Element => {

        let opToReturn = options.map((option: IQuestionOptionsProps): any => {
            return {
                key: option.guid,//the option record guid
                text: option.optionLabel,
                selected: option?.selected,
                data: {
                    'dependencyGuid': option?.dependencyGuid,
                    'answer': option.optionValue
                },
                id: que?.guid,//the question guid              
            };
        });


        return (
            <Dropdown
                label={que.title}
                placeholder="Select"
                ariaLabel="Select"
                options={opToReturn}
                required={que.required}
                styles={dropdownStyles}
                hidden={que.dependencyGuid && que.hide ? true : false}
                disabled={isChechlistCompleted}
                data-dependency={que.antecedentQuestion}
                onChange={(evt, option, index) => OnChecklistItemChange(evt, option, index)}
            />
        );
    };

    //Rendering of all Sections and children happens here
    const renderSections = (): JSX.Element => {

        return (
            <Stack>
                {CheckList?.sections?.map((sec: ISectionProps) => (
                    <Stack>{sec.title}
                        {sec.questions != null && sec.questions.map((que: IQuestionProps) => (
                            <Stack.Item order={que.order}>
                                {que.type === QuestionType.DropDown
                                    && que.questionOptions
                                    && que.questionOptions.length > 0
                                    && RenderDropDownOptions(que.questionOptions, que)
                                }
                                {que.type === QuestionType.Radio
                                    && que.questionOptions
                                    && que.questionOptions.length > 0
                                    && RenderRadioOptions(que.questionOptions, que)
                                }
                                {que.type === QuestionType.TextArea && (//Textarea
                                    <TextField
                                        id={que.guid} //question guid
                                        label={que.title}
                                        multiline={true}
                                        defaultValue={que.responseText}
                                        required={que.required}
                                        onChange={(evt, newValue) => OnChecklistItemChange(evt, newValue)}
                                        disabled={isChechlistCompleted}
                                        hidden={que.dependencyGuid && que.hide ? true : false}
                                        data={que.antecedentQuestion}
                                    />
                                )}
                            </Stack.Item>

                        ))}
                    </Stack>
                ))}
            </Stack>

        );
    };


    // MAIN RENDERING
    //While the Checklist Questions and Question Options have not been fetched, keep returning spinner.
    //This should change to when the Checklist object is completed


    if (!CheckList?.renderCompleted) {
        return <Spinner label="I am building your Checklist..." />;
    }
    else if (SectionList?.length === 0 || QuestionList?.length === 0) {
        return <Stack><div>Please Add Sections</div></Stack>;
    }
    else {

        return (
            <>
                {CheckList.renderCompleted === true && (
                    <Stack horizontalAlign='center'>
                        {renderSections()}
                        {isChecklistTemplate
                            ? <DefaultButton
                                text="Copy"
                                onClick={openPanel}
                                allowDisabledFocus
                                disabled={false}
                            />
                            : <PrimaryButton
                                text="Submit"
                                onClick={(evt) => OnChecklistSubmit(evt)}
                                allowDisabledFocus
                                disabled={false}
                            />
                            }
                    </Stack>
                )}
                {isCopyDialogShown && (
                    <div>
                        <Panel
                            isOpen={isCopyDialogShown}
                            onDismiss={dismissPanel}
                            headerText="Copy Checklist Template"
                            closeButtonAriaLabel="Close"
                            onRenderFooterContent={() => (
                                <div>                             
                                <PrimaryButton
                                    text="Copy"
                                    onClick={(evt) => OnChecklistCopy(evt)}
                                    allowDisabledFocus
                                    disabled={false}
                                    />
                                    </div>
                            )}
                            // Stretch panel content to fill the available height so the footer is positioned
                            // at the bottom of the page
                            isFooterAtBottom={true}
                        >
                            <p>
                                <TextField
                                    label="Enter Number of Copies to Make:"
                                    type="number"
                                    width="50%"
                                    required
                                    onChange={(evt, amount: any) => { SetCopiesToMake(amount) }}
                                />
                            </p>
                        </Panel>
                    </div>
                )}
                

            </>
            );
    }
};
