import * as React from 'react';
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export const useItems = (dataset: DataSet) => {
    const [items, setItems] = React.useState<any[]>([]);

    React.useEffect(() => {

    });

}