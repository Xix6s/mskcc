/* eslint-disable no-use-before-define */
import * as React from 'react'
import { useState } from 'react'

//CUSTOM
import { usePcfContext } from '../services/PcfContext';
import { useRecordsAsOptions } from '../hooks/useRecords'

//FLUENT UI
import { initializeIcons, ITheme} from '@fluentui/react'

initializeIcons();


export interface ICheckListProps {
    value: string;

}

const CheckList = (props: ICheckListProps): JSX.Element => {

    const pcfcontext = usePcfContext();
    // Custom Hook based on react-query
    const { options, isLoading, isError } = useRecordsAsOptions();

    // MAIN RENDERING
    console.log('MAIN RENDERING-------------------')

    if (isLoading) {
        return <div>Loading...</div>
    } if (isError) {
        return <div>Error fetching data...</div>
    } else {

        return (
            <>

            </>
        )
    }
}

export default CheckList