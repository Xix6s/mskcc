/* eslint-disable no-use-before-define */
import * as React from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { PcfContextProvider } from '../services/PcfContext';
import { IPcfContextServiceProps, PcfContextService } from '../services/PcfContextService';
import { CheckList } from '../components/CheckList';


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

// eslint-disable-next-line no-undef
const CheckListApp = (props: IPcfContextServiceProps): JSX.Element => {
    const pcfcontextservice = new PcfContextService(props)


    const entitySelectHandler = (item: any): void => {
        //console.log("entitySelectHandler-------------------");
        //this.setState({ value: item.searchValue });
        //props.onResult(item.searchValue);

    }


    const onChangeHandler = (item?: string): void => {
        //console.log("onChangeHandler-------------------");
        //props.onChange(item);
    }



    return (
        <QueryClientProvider client={queryClient} contextSharing={true}>
            <PcfContextProvider pcfcontext={pcfcontextservice}>
                    <CheckList                                            


                    />

            </PcfContextProvider>
        </QueryClientProvider>
    )
}

export default CheckListApp