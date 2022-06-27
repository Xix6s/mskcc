/* eslint-disable no-use-before-define */
import * as React from 'react'
import { useState } from 'react'

//CUSTOM


//FLUENT UI
import { initializeIcons, ITheme, mergeStyleSets, getTheme, ICellStyleProps } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack, IStackProps, IStackStyles } from '@fluentui/react/lib/Stack';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';



import { IInputs } from '../generated/ManifestTypes';




initializeIcons();

const dropdownStyles = { dropdown: { width: 300 } };

export interface IQuestionProps {
    guid: string;
    sectionGuid: string;
    title: string;
    state: string;
    required: boolean;
    order: number;
    type: number;
    responseText: string;
    questionOptions?: IQuestionOptionsProps[];
    antecedentQuestion: string;
    antecendentOption: string;
}

export interface IQuestionOptionsProps {
    title: string;
    questionGuid: string;
    optionLabel: string;
    optionValue: string;
    order: number;
    guid: string;
    selected: boolean;
    dependencyGuid: string;
    state: string;
}

export interface ISectionProps {
    guid: string;
    title: string;
    state: string;
    required?: boolean;
    order?: number;
    questions?: IQuestionProps[];
    dataFetched?: boolean;
}


export interface ICheckListProps {
    title?: string;
    guid: string;
    template: boolean;
    state: string;
    sections?: ISectionProps[];
    pcfContext: ComponentFramework.Context<IInputs>,
    renderComplated: boolean | false;
    onSubmit?: (evt: any) => void;
    onCopy?: (evt: any) => void;
};




export const CheckList = (props: ICheckListProps) => {
    console.log('CheckList--------------');
    console.log(props);
    const [isCompleted, SetIsCompleted] = useState(false);
    const [isTemplate, SetTemplates] = useState(false);
    const [CheckList, SetCheckList] = useState<ICheckListProps>();
    const [SectionList, SetSectionList] = useState<ISectionProps[]>();
    const [QuestionList, SetQuestionList] = useState<IQuestionProps[]>();
    const [QuestionOptionsList, SetQuestionOptionsList] = useState<IQuestionOptionsProps[]>();
    const [isLoading, isError] = useState();
    const [isChecklistTemplate, SetChecklistTemplate] = useState(false);
    const [isCopyDialogShown, ShowCopyDialog] = useState(false);

    React.useEffect(
        () => {
            if (!CheckList) {//Populate all Checklist Field data
                getChecklistMetadata();
            }
            if (!SectionList) {//Check if have built Section Object
                setSections(); //If not build it
            }
            else {
                if (!QuestionList) {//Check if we have built the Question object
                    getQuestions();
                }
                else if (!QuestionOptionsList) {//Get Options
                    getQuestionOptions();
                }
                else {//build object
                    let _CheckList: ICheckListProps = {} as ICheckListProps;
                    _CheckList.guid = props.guid;
                    _CheckList.pcfContext = props.pcfContext;
                    //Set Sections

                    //let questionsF: IQuestionProps[] = [];
                    let sectionsF: ISectionProps[] = [];
                    //let questionOptionsF: IQuestionOptionsProps[] = [];
                   SectionList.forEach((sec: ISectionProps, indx: number) => {
                        console.log(sec);
                        console.log(indx);

                        sectionsF.push(sec);
                        QuestionList.map((que: IQuestionProps, indx2: number) => {
                            console.log(que);
                            console.log(indx2);

                            if (sec.guid = que.sectionGuid) {
                                if (sectionsF[indx].questions === undefined) {
                                    sectionsF[indx].questions = [] as IQuestionProps[];
                                }
                                sectionsF[indx].questions?.push(que);
                                
                                return sectionsF;
                            }
                        });

                    });

                    console.log('mappedsections');
                    console.log(sectionsF);
                    console.log(_CheckList);
                }
            }

            
        }
    )

    //Retrieve all records
    const setSections = async () => {
        console.log('FetchData----------------------');

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
        if (secArray.length > 1) {
            
            SetSectionList(secArray);

        }



    };

    const getChecklistMetadata = async () => {
        console.log('getChecklist---------------');
        
        props.pcfContext.webAPI.retrieveRecord("xix_checklist", props.guid)
            .then((item) => {
                let checklist: ICheckListProps = {} as ICheckListProps;
                checklist.state = item.statecode;
                checklist.title = item.xix_checklistname;
                checklist.template = item.xix_istemplate;
                SetCheckList(checklist);
                SetChecklistTemplate(checklist.template);
                
            })
            .catch((err) => {
                console.log(err);
                
            });
    };

    //Get Questions method
    const getQuestions = async () => {
        console.log('getQuestions---------------');
        let requestArray = [] as any;
        if (SectionList) {
            for (const key in SectionList) {

                let request = '?$filter=_xix_checklistsection_value eq ' + SectionList[key].guid;

                requestArray.push(props.pcfContext.webAPI.retrieveMultipleRecords("xix_question", request));
            }

            Promise.all(requestArray)
                .then((items: any) => {
                    for (let i = 0; i < items.length; i++) {
                        
                        let questionsList: IQuestionProps[] = [];
                        for (let k = 0; k < items[i].entities.length; k++) {
                            let currentSection = items[i].entities[k];
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
                                antecendentOption: currentSection?._xix_antecedentoption_value
                            }
                            questionsList.push(question);

                        }
                        SetQuestionList(questionsList);

                    }

                })
                .catch((err) => {
                    console.log(err);

                });
        }
        
    }

    const getQuestionOptions = async () => {
        let requestArray = [] as any;
        
        if (QuestionList) {
            for (var i = 0; i < QuestionList.length; i++) {
                let currentQuestionGuid = QuestionList[i].guid;
                let request = '?$filter=_xix_question_value eq ' + currentQuestionGuid;
                requestArray.push(props.pcfContext.webAPI.retrieveMultipleRecords("xix_questionoption", request));

            }

            Promise.all(requestArray)
                .then((items: any) => {
                    console.log(items);
                    if (items.length > 0) {
                        let questionOptions: IQuestionOptionsProps[] = [];
                        for (let i = 0; i < items.length; i++) {
                            let currentEntity = items[i];
                            console.log(currentEntity);
                            for (let k = 0; k < currentEntity.entities.length; k++) {
                                let currentOptions = currentEntity.entities[k];
                                console.log(currentOptions);
                                questionOptions.push({
                                    questionGuid: currentOptions._xix_question_value,
                                    guid: currentOptions.xix_questionoptionid,
                                    title: currentOptions.xix_questionoptiontitle,
                                    state: currentOptions.statecode,
                                    order: currentOptions.xix_order,
                                    dependencyGuid: currentOptions.xix_dependencyguids,
                                    optionLabel: currentOptions.xix_optionlabel,
                                    optionValue: currentOptions.xix_optionvalue,
                                    selected: currentOptions.xix_selected,
                                    
                            });

                            }
                            

                        }
                        SetQuestionOptionsList(questionOptions);
                    }
                    
                    

                    
                })
                .catch((err) => {
                    console.log(err);
                    return null;
                });
        }
        

    }

    const _onRadioChange = (ev: React.FormEvent<HTMLInputElement>) => {
        console.dir(ev);
    }

    const _onSubmiteButton = (ev: React.FormEvent<HTMLInputElement>) => {
        console.dir(ev);
    }

    const _onCopyButton = (ev: React.FormEvent<HTMLInputElement>): JSX.Element => {
        console.dir(ev);

        return (
            
            );

    }

    const renderSections = (sections: ISectionProps[]): JSX.Element => {
        console.log('renderSections----------------');
        console.log(sections);

        return (
            <Stack>
                {sections.map((sec: ISectionProps) => (
                    <Stack>{sec.title}
                        {sec.questions != null && sec.questions.map((que: IQuestionProps) => (
                            <Stack.Item>
                                {que.title}
                                {que.type === 596810000 && (//Drop-Down
                                    <Dropdown
                                        placeholder="Select"
                                        ariaLabel="Required dropdown example"
                                        options={[
                                            { key: 'A', text: 'Option a', title: 'I am option a.' },
                                            { key: 'B', text: 'Option b' },
                                            { key: 'C', text: 'Option c', disabled: true },
                                            { key: 'D', text: 'Option d' },
                                            { key: 'E', text: 'Option e' },
                                        ]}
                                        required={que.required}
                                        styles={dropdownStyles}
                                    />
                                    )}
                                {que.type === 596810001 && (//Radio
                                    <ChoiceGroup
                                        defaultSelectedKey="B"
                                        options={[
                                            { key: 'A', text: 'Option A' },
                                            { key: 'B', text: 'Option B' },
                                            { key: 'C', text: 'Option C', disabled: true },
                                            { key: 'D', text: 'Option D' },
                                        ]}
                                        //onChange={_onRadioChange}
                                        label="Pick one"
                                        required={que.required} />
                                    )}
                                {que.type === 596810003 && (//Textarea
                                    <TextField
                                        label="Enter Text"
                                        multiline={true}
                                        // eslint-disable-next-line react/jsx-no-bind
                                        //onChange={onChange}
                                    />
                                    )}
                            </Stack.Item>

                        ))}                       
                    </Stack>
                ))}              
            </Stack>

            );
    }


    // MAIN RENDERING
    console.log('MAIN RENDERING-------------------');


    if (!SectionList || !QuestionList || !QuestionOptionsList) {
        return <Spinner label="I am building your Checklist..." />;
    }
    else {

        return (
            <>
                {QuestionList && SectionList && (
                    <Stack horizontalAlign='center'>
                        {renderSections(SectionList)}
                        {isChecklistTemplate
                            ? <DefaultButton
                                text="Copy"
                                onClick={() => ShowCopyDialog(true)}
                                allowDisabledFocus
                                disabled={false}
                                //checked={checked}
                            />
                            : <DefaultButton
                                text="Submit"
                                onClick={() => _onSubmiteButton}
                                allowDisabledFocus
                                disabled={false}
                            //checked={checked}
                            />
                            }
                    </Stack>
                )}
                {QuestionList.length <= 0 && (
                    <Stack><div>Please Add Sections</div></Stack>
                )}
                {isCopyDialogShown && (
                    <div>add dialog</div>
                    )}
                

            </>
            );
    }
};
