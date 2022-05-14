/* eslint-disable no-use-before-define */
import { initializeIcons } from '@fluentui/react';
import * as React from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
//import { CheckList } from '../components/CheckList';
import { useItems } from '../hooks/useItems';

import { Stack } from '@fluentui/react/lib/Stack';
import { Text, ITextProps } from '@fluentui/react/lib/Text';

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

//Props, Class Porperties
export interface ICheckListProps {
    dataset: Dataset;
    util: ComponentFramework.Utility;
    isTemplate: boolean;
};

// eslint-disable-next-line no-undef
export const CheckListApp = (props: ICheckListProps): JSX.Element => {
    console.log(props.dataset);
    //const { items } = useItems(dataset);

    return (
        <Stack>
            <Text>Section</Text>
            

        </Stack>
    );

};
    
    