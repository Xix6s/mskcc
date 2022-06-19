/* eslint-disable no-use-before-define */
import * as React from 'react'
import { useState } from 'react'

//CUSTOM
import { usePcfContext } from '../services/PcfContext';

//FLUENT UI
import { initializeIcons, ITheme } from '@fluentui/react';
import { useRecords } from '../hooks/useRecord';


initializeIcons();

export interface IQuestionProps {
    title: string;
    state: string;
    required: boolean;
    order: number;
    type: string;
    antecedent: IQuestionProps;
}

export interface ISectionProps {
    title: string;
    state: string;
    required: boolean;
    order: number;
    questions: IQuestionProps[];
}


export interface ICheckListProps {
    title: string;
    template: boolean;
    state: string;
    sections: ISectionProps;

};

const CheckList = (props: ICheckListProps) => {

    const pcfcontext = usePcfContext();
    // Custom Hook based on react-query
    //const { options, isLoading, isError } = useRecords();

    // MAIN RENDERING
    console.log('MAIN RENDERING-------------------');

    //    if (isLoading) {
    //        return <div>Loading...</div>
    //    } if (isError) {
    //        return <div>Error fetching data...</div>
    //    } else {

    return (
        <>

        </>
    );
    //    }
};

export default CheckList;