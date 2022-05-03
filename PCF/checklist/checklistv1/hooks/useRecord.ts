/* eslint-disable no-undef */

import { useQuery } from 'react-query';
import { usePcfContext } from '../services/PcfContext';
import { useLookupViewFetchXml } from './useLookupViewFetchXml';
import { useMetadata } from './useMetadata';


export const useRecords = () => {

    const pcfcontext = usePcfContext()
    //console.log(pcfcontext);
    const { primaryname, primaryimage } = useMetadata(pcfcontext.lookupentityname)
    const { fetchxml } = useLookupViewFetchXml()



}

export const useRecordsAsOptions = () => {
    const pcfcontext = usePcfContext()

    const { primaryid, primaryname, primaryimage } = useMetadata(pcfcontext.lookupentityname)


}