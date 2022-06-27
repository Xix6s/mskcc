/* eslint-disable no-undef */

import { useQuery } from 'react-query';
import { usePcfContext } from '../services/PcfContext';
import { useLookupViewFetchXml } from './useLookupViewFetchXml';


export const useRecords = () => {

    const pcfcontext = usePcfContext()
    console.log(pcfcontext);
    //const { fetchxml } = useLookupViewFetchXml()

    //const { data, isLoading, isError } =
    //    useQuery<ComponentFramework.WebApi.Entity[], Error>(
    //        ['lookuprecords', pcfcontext.instanceid],
    //        () => pcfcontext,
    //        {
    //            enabled: Boolean(primaryname) && Boolean(fetchxml),
    //            staleTime: Infinity
    //        }
    //    )

    //return { records: data, isLoading, isError }

}
