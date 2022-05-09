/* eslint-disable no-use-before-define */
import { initializeIcons } from '@fluentui/react';
import * as React from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { PcfContextProvider } from '../services/PcfContext';
import { IPcfContextServiceProps, PcfContextService } from '../services/PcfContextService';
//import { CheckList } from '../components/CheckList';

import { Stack } from '@fluentui/react/lib/Stack';

type Dataset = ComponentFramework.PropertyTypes.DataSet;

initializeIcons();


// declare outside of FC element so it doesnt gets evaluated at each rerenders
const queryClient = new QueryClient({
    queryCache: new QueryCache(), // creates a new querycahe for each instance of the control on a page
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false
            // IMPORTANT otherwise data will be refreshed everytime the focus on the PCF is lost and regained
            // https://react-query.tanstack.com/guides/window-focus-refetching#_top
        }
    }
});

export interface ICheckListProps {
    dataset: Dataset;
    util: ComponentFramework.Utility;
    isTemplate: boolean;
};

// eslint-disable-next-line no-undef
export const CheckListApp = React.memo(function CheckList({
    dataset,
    util,
    isTemplate
}: ICheckListProps): JSX.Element {


    return (
        <Stack>

        </Stack>
    );

}, (prevProps, newProps) => {
    return prevProps.dataset === newProps.dataset
});
    
    